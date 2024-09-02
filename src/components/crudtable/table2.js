"use client";
import React, { useState, useEffect, useRef } from "react";
import { classNames } from "primereact/utils";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { Toolbar } from "primereact/toolbar";
import { InputText } from "primereact/inputtext";
import { Dialog } from "primereact/dialog";
import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import { z } from 'zod';
import { parse, isValid, isAfter, startOfDay, isEqual} from "date-fns";


import "./style.css";

export default function RendezvousDemo() {
    const emptyRendezvous = {
        id: null,
        date: "",
        time: "",
        nomPatient: "",
        prenomPatient: "",
        etat: ""
    };

    const [rendezvous, setRendezvous] = useState([]);
    const [rendezvousDialog, setRendezvousDialog] = useState(false);
    const [deleteRendezvousDialog, setDeleteRendezvousDialog] = useState(false);
    const [deleteRendezvoussDialog, setDeleteRendezvoussDialog] = useState(false);
    const [rendezvousData, setRendezvousData] = useState(emptyRendezvous);
    const [selectedRendezvous, setSelectedRendezvous] = useState([]);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState("");
    const toast = useRef(null);
    const dt = useRef(null);
    const [validationErrors, setValidationErrors] = useState({});
    const now = startOfDay(new Date());
    const isWithinWorkingHours = (hour, minute) => {
        const workingStart = 8 * 60; // 08:00 in minutes
        const workingEnd = 17 * 60; // 17:00 in minutes
        const selectedTimeInMinutes = hour * 60 + minute;
        return selectedTimeInMinutes >= workingStart && selectedTimeInMinutes <= workingEnd;
    };
    
    // Helper function to get current time in minutes
    const getCurrentTimeInMinutes = () => {
        const now = new Date();
        return now.getHours() * 60 + now.getMinutes();
    };

    
    const rendezvousSchema = z.object({
        date: z.string()
        .refine(value => {
            const [day, month, year] = value.split('-').map(Number);
            const inputDate = new Date(year, month - 1, day);
            return isValid(inputDate) && (isAfter(inputDate, now) || isEqual(inputDate, now));
        }, { message: "Invalid date. Date must be today or a future date in the format 'day-month-year'." }),
        
        time: z.string()
            .refine(value => {
                const [hour, minute] = value.split(':').map(Number);
                const inputTimeInMinutes = hour * 60 + minute;
                const currentTimeInMinutes = getCurrentTimeInMinutes();
                return isEqual(now, new Date(now.getFullYear(), now.getMonth(), now.getDate()))
                    ? inputTimeInMinutes >= currentTimeInMinutes
                    : isWithinWorkingHours(hour, minute);
            }, { message: "Invalid time format or time is before the current time." }),
   
        nomPatient: z.string().min(1, "Nom Patient is required"),
        prenomPatient: z.string().min(1, "Prenom Patient is required"),
        etat: z.enum(["confirmed", "pending", "declined"], "Invalid status").optional()
    });

    useEffect(() => {
        fetchRendezvous();
    }, []);

    const fetchRendezvous = async () => {
        try {
            const response = await fetch('/api/rendezvous');
            if (response.ok) {
                const data = await response.json();
                setRendezvous(data); // Ensure the data structure is correct
            } else {
                console.error("Failed to fetch rendezvous:", response.statusText);
            }
        } catch (error) {
            console.error("Failed to fetch rendezvous:", error);
        }
    };

    const openNew = () => {
        setRendezvousData(emptyRendezvous);
        setSubmitted(false);
        setRendezvousDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setRendezvousDialog(false);
    };

    const hideDeleteRendezvousDialog = () => {
        setDeleteRendezvousDialog(false);
    };

    const hideDeleteRendezvoussDialog = () => {
        setDeleteRendezvoussDialog(false);
    };

    const saveRendezvous = async () => {
        setSubmitted(true);

        try {
            // Zod validation
            rendezvousSchema.parse(rendezvousData);
            setValidationErrors({}); // Clear previous validation errors

            // Proceed with the API request
            const response = rendezvousData.id
                ? await fetch(`/api/rendezvous?id=${rendezvousData.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(rendezvousData)
                })
                : await fetch('/api/rendezvous', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(rendezvousData)
                });

            if (response.status === 404) {
                toast.current.show({
                    severity: "warn",
                    summary: "Attention",
                    detail: "Patient n'existe pas, vous devez l'ajouter",
                    life: 3000
                });
                return;
            }

            const savedRendezvous = await response.json();

            let _rendezvous = [...rendezvous];
            if (rendezvousData.id) {
                const index = findIndexById(rendezvousData.id);
                _rendezvous[index] = savedRendezvous;
                toast.current.show({ severity: "success", summary: "Successful", detail: "Rendezvous Updated", life: 3000 });
            } else {
                _rendezvous.push(savedRendezvous);
                toast.current.show({ severity: "success", summary: "Successful", detail: "Rendezvous Created", life: 3000 });
            }

            setRendezvous(_rendezvous);
            setRendezvousDialog(false);
            setRendezvousData(emptyRendezvous);
        } catch (error) {
            if (error instanceof z.ZodError) {
                // Handle Zod validation errors
                setValidationErrors(error.format());
            } else {
                console.error("Failed to save rendezvous:", error);
                toast.current.show({ severity: "error", summary: "Error", detail: "Failed to save rendezvous", life: 3000 });
            }
        }
    };


    const editRendezvous = (rendezvous) => {
        setRendezvousData({ ...rendezvous });
        setRendezvousDialog(true);
    };

    const confirmDeleteRendezvous = (rendezvous) => {
        setRendezvousData(rendezvous);
        setDeleteRendezvousDialog(true);
    };

    const deleteRendezvous = async () => {
        try {
            await fetch(`/api/rendezvous?id=${rendezvousData.id}`, { method: 'DELETE' });

            const updatedRendezvous = rendezvous.filter((val) => val.id !== rendezvousData.id);
            setRendezvous(updatedRendezvous);
            setDeleteRendezvousDialog(false);
            setRendezvousData(emptyRendezvous);
            toast.current.show({ severity: "success", summary: "Successful", detail: "Rendezvous Deleted", life: 3000 });
        } catch (error) {
            console.error("Failed to delete rendezvous:", error);
        }
    };

    const findIndexById = (id) => {
        return rendezvous.findIndex(rendezvous => rendezvous.id === id);
    };

    const exportCSV = () => {
        dt.current.exportCSV();
    };

    const confirmDeleteSelected = () => {
        setDeleteRendezvoussDialog(true);
    };

    const deleteSelectedRendezvouss = async () => {
        const deletePromises = selectedRendezvous.map((rendezvous) =>
            fetch(`/api/rendezvous?id=${rendezvous.id}`, { method: 'DELETE' })
        );
    
        try {
            await Promise.all(deletePromises);
    
            // Remove deleted rendezvous from the client-side state
            let _rendezvous = rendezvous.filter((val) => !selectedRendezvous.includes(val));
            setRendezvous(_rendezvous);
            setDeleteRendezvoussDialog(false);
            setSelectedRendezvous([]);
            toast.current.show({ severity: "success", summary: "Successful", detail: "Rendezvous Deleted", life: 3000 });
        } catch (error) {
            console.error("Failed to delete rendezvous:", error);
            toast.current.show({ severity: "error", summary: "Error", detail: "Failed to delete rendezvous", life: 3000 });
        }
    };

    const onInputChange = (e, name) => {
        const val = (e.target && e.target.value) || "";
        setRendezvousData(prev => ({ ...prev, [name]: val }));
    };

    const leftToolbarTemplate = () => {
        return (
            <div className="flex flex-wrap gap-2">
                <Button label="New" icon="pi pi-plus" severity="success" onClick={openNew} />
                <Button label="Delete" icon="pi pi-trash" severity="danger" onClick={confirmDeleteSelected} disabled={!selectedRendezvous.length} />
            </div>
        );
    };

    const rightToolbarTemplate = () => {
        return <Button label="Export" icon="pi pi-upload" className="p-button-help" onClick={exportCSV} />;
    };

    const actionBodyTemplate = (rowData) => {
        return (
            <React.Fragment>
                <Button icon="pi pi-bell" rounded outlined className="mr-2" onClick={() => notify(rowData)} />
                <Button icon="pi pi-pencil" rounded outlined className="mr-2" onClick={() => editRendezvous(rowData)} />
                <Button icon="pi pi-trash" rounded outlined severity="danger" onClick={() => confirmDeleteRendezvous(rowData)} />
            </React.Fragment>
        );
    };

    const notify = async (rendezvous) => {
        const message = `Reminder: votre rendez vous chez docteur ahmed ben yahia sera le ${rendezvous.date} a ${rendezvous.time}.`;
        
        try {
            // Fetch patient phone number
            const phoneNumberResponse = await fetch(`/api/getpatient?nomPatient=${rendezvous.nomPatient}&prenomPatient=${rendezvous.prenomPatient}`);
            const phoneNumberData = await phoneNumberResponse.json();
        
            if (!phoneNumberResponse.ok) {
                throw new Error(phoneNumberData.error || 'Failed to fetch phone number');
            }
        
            const phoneNumber = phoneNumberData.phoneNumber;
        
            if (phoneNumber) {
                // Send SMS
                const smsResponse = await fetch('/api/sendsms', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ phoneNumber, message })
                });
        
                const smsData = await smsResponse.json();
        
                if (smsResponse.ok) {
                    toast.current.show({ severity: 'success', summary: 'SMS Sent', detail: `Message SID: ${smsData.messageSid}`, life: 3000 });
                } else {
                    toast.current.show({ severity: 'error', summary: 'Error', detail: smsData.error, life: 3000 });
                }
            } else {
                toast.current.show({ severity: 'error', summary: 'Error', detail: 'Patient phone number not found', life: 3000 });
            }
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: error.message || 'Failed to send SMS', life: 3000 });
        }
    };
    
    
    

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h4 className="mt-1">Manage Rendezvous</h4>
            <div className="p-input-icon-left">
                <InputText
                    type="search"
                    className="ml-3 h-8 rounded-lg"
                    onInput={(e) => setGlobalFilter(e.target.value)}
                    placeholder="Search..."
                />
            </div>
        </div>
    );

    const rendezvousDialogFooter = (
        <React.Fragment>
            <Button label="Cancel" icon="pi pi-times" className="bg-primary w-22 h-8 ml-2.5 pl-2 pr-4 text-white" outlined onClick={hideDialog} />
            <Button label="Save" icon="pi pi-check" className="bg-primary w-20 h-8 ml-2.5 pl-2 pr-3 text-white" onClick={saveRendezvous} />
        </React.Fragment>
    );

    const deleteRendezvousDialogFooter = (
        <React.Fragment>
            <Button label="No" className="bg-primary w-20 h-8 ml-2.5 pl-2 pr-3 text-white" icon="pi pi-times" outlined onClick={hideDeleteRendezvousDialog} />
            <Button label="Yes" className="bg-primary w-20 h-8 ml-2.5 pl-2 pr-3 text-white" icon="pi pi-check" onClick={deleteRendezvous} />
        </React.Fragment>
    );

    const deleteRendezvoussDialogFooter = (
        <React.Fragment>
            <Button label="No" className="bg-primary w-20 h-8 ml-2.5 pl-2 pr-3 text-white" icon="pi pi-times" outlined onClick={hideDeleteRendezvoussDialog} />
            <Button label="Yes" className="bg-primary w-20 h-8 ml-2.5 pl-2 pr-3 text-white" icon="pi pi-check" onClick={deleteSelectedRendezvouss} />
        </React.Fragment>
    );

    return (
        <div className="card">
            <Toast ref={toast} />
            <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate} />

            <DataTable
                ref={dt}
                value={rendezvous}
                selection={selectedRendezvous}
                onSelectionChange={(e) => setSelectedRendezvous(e.value)}
                dataKey="id"
                paginator
                rows={10}
                rowsPerPageOptions={[5, 10, 25]}
                className="datatable-responsive"
                globalFilter={globalFilter}
                header={header}
            >
                <Column field="date" header="Date" sortable></Column>
                <Column field="time" header="Time" sortable></Column>
                <Column field="nomPatient" header="Nom Patient" sortable></Column>
                <Column field="prenomPatient" header="Prenom Patient" sortable></Column>
                <Column field="etat" header="Etat" sortable></Column>
                <Column body={actionBodyTemplate} header="Actions" exportable={false}></Column>
            </DataTable>

            <Dialog
                visible={rendezvousDialog}
                style={{ width: '450px' }}
                header="Rendezvous Details"
                modal
                className="p-fluid"
                footer={rendezvousDialogFooter}
                onHide={hideDialog}
            >
                <div className="field">
                    <label htmlFor="date">Date</label>
                    <InputText id="date" value={rendezvousData.date} onChange={(e) => onInputChange(e, 'date')} />
                    {validationErrors.date && (
            <small className="p-error">{validationErrors.date._errors.join(", ")}</small>)}                    
            
                </div>
                <div className="field">
                    <label htmlFor="time">Time</label>
                    <InputText id="time" value={rendezvousData.time} onChange={(e) => onInputChange(e, 'time')} />
                    {validationErrors.time && (
            <small className="p-error">{validationErrors.time._errors.join(", ")}</small>)}
                </div>
                <div className="field">
                    <label htmlFor="nomPatient">Nom Patient</label>
                    <InputText id="nomPatient" value={rendezvousData.nomPatient} onChange={(e) => onInputChange(e, 'nomPatient')} />
                    {validationErrors.nomPatient && (
            <small className="p-error">{validationErrors.nomPatient._errors.join(", ")}</small>)}
                </div>
                <div className="field">
                    <label htmlFor="prenomPatient">Prenom Patient</label>
                    <InputText id="prenomPatient" value={rendezvousData.prenomPatient} onChange={(e) => onInputChange(e, 'prenomPatient')} />
                    {validationErrors.prenomPatient && (
            <small className="p-error">{validationErrors.prenomPatient._errors.join(", ")}</small>)}
                </div>
                <div className="field">
                    <label htmlFor="etat">Etat</label>
                    <InputText id="etat" value={rendezvousData.etat} onChange={(e) => onInputChange(e, 'etat')} />
                    {validationErrors.prenomPatient && (
            <small className="p-error">{validationErrors.prenomPatient._errors.join(", ")}</small>)}
                </div>
            </Dialog>

            <Dialog
                visible={deleteRendezvousDialog}
                style={{ width: '450px' }}
                header="Confirm"
                modal
                footer={deleteRendezvousDialogFooter}
                onHide={hideDeleteRendezvousDialog}
            >
                <div className="confirmation-content">
                    <i className="pi pi-exclamation-triangle p-mr-3" style={{ fontSize: '2rem' }} />
                    {rendezvousData && (
                        <span>
                            Are you sure you want to delete <b>{rendezvousData.nomPatient}</b>?
                        </span>
                    )}
                </div>
            </Dialog>

            <Dialog
                visible={deleteRendezvoussDialog}
                style={{ width: '450px' }}
                header="Confirm"
                modal
                footer={deleteRendezvoussDialogFooter}
                onHide={hideDeleteRendezvoussDialog}
            >
                <div className="confirmation-content">
                    <i className="pi pi-exclamation-triangle p-mr-3" style={{ fontSize: '2rem' }} />
                    {selectedRendezvous.length > 0 && (
                        <span>
                            Are you sure you want to delete the selected rendezvous?
                        </span>
                    )}
                </div>
            </Dialog>
        </div>
    );
}
