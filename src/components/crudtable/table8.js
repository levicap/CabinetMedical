"use client";
import React, { useState, useEffect, useRef } from "react";
import { classNames } from "primereact/utils";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { Toolbar } from "primereact/toolbar";
import { InputTextarea } from "primereact/inputtextarea";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import "./style.css";
import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import { z } from 'zod';


export default function MedecinDemo() {
    const emptyMedecin = {
        id: null,
        nom: "",
        prenom: "",
        specialite: "",
        email: "",
        telephone: "",
    };

    const [medecins, setMedecins] = useState([]);
    const [medecinDialog, setMedecinDialog] = useState(false);
    const [deleteMedecinDialog, setDeleteMedecinDialog] = useState(false);
    const [deleteMedecinsDialog, setDeleteMedecinsDialog] = useState(false);
    const [medecin, setMedecin] = useState(emptyMedecin);
    const [selectedMedecins, setSelectedMedecins] = useState([]);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState("");
    const toast = useRef(null);
    const dt = useRef(null);
    const [validationErrors, setValidationErrors] = useState({});

    const medecinSchema = z.object({
        nom: z.string().min(1, "Nom is required"),
        prenom: z.string().min(1, "Prenom is required"),
        adresse: z.string().optional(),
        specialite: z.string().min(1, { message: "Specialty is required" }),

        email: z.string().email("Invalid email format").optional(),
        telephone: z.string().regex(/^\+216\d{8}$/, "Phone number must be in the format +216 followed by 8 digits").optional()
    });

    useEffect(() => {
        fetchMedecins();
    }, []);

    const fetchMedecins = async () => {
        try {
            const response = await fetch('/api/medecin');
            if (response.ok) {
                const data = await response.json();
                setMedecins(data); // Ensure the data structure is correct
            } else {
                console.error("Failed to fetch medecins:", response.statusText);
            }
        } catch (error) {
            console.error("Failed to fetch medecins:", error);
        }
    };

    const openNew = () => {
        setMedecin(emptyMedecin);
        setSubmitted(false);
        setMedecinDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setMedecinDialog(false);
    };

    const hideDeleteMedecinDialog = () => {
        setDeleteMedecinDialog(false);
    };

    const hideDeleteMedecinsDialog = () => {
        setDeleteMedecinsDialog(false);
    };

    const saveMedecin = async () => {
        setSubmitted(true);
        try {
            // Validate medecin data
            medecinSchema.parse(medecin);
            setValidationErrors({}); // Clear any previous validation errors

            const response = medecin.id
                ? await fetch(`/api/medecin?id=${medecin.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(medecin)
                })
                : await fetch('/api/medecin', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(medecin)
                });

            if (!response.ok) {
                throw new Error('Failed to save medecin');
            }

            const savedMedecin = await response.json();
            let _medecins = [...medecins];
            if (medecin.id) {
                const index = findIndexById(medecin.id);
                _medecins[index] = savedMedecin;
                toast.current.show({ severity: "success", summary: "Successful", detail: "Medecin Updated", life: 3000 });
            } else {
                _medecins.push(savedMedecin);
                toast.current.show({ severity: "success", summary: "Successful", detail: "Medecin Created", life: 3000 });
            }

            setMedecins(_medecins);
            setMedecinDialog(false);
            setMedecin(emptyMedecin);
        } catch (error) {
            if (error instanceof z.ZodError) {
                // Set validation errors from Zod
                const errors = {};
                error.errors.forEach(e => {
                    errors[e.path[0]] = { _errors: [e.message] };
                });
                setValidationErrors(errors);
            } else {
                toast.current.show({ severity: "error", summary: "Error", detail: error.message || "Failed to save medecin", life: 3000 });
            }
        }
    };

    const editMedecin = (medecin) => {
        setMedecin({ ...medecin });
        setMedecinDialog(true);
    };

    const confirmDeleteMedecin = (medecin) => {
        setMedecin(medecin);
        setDeleteMedecinDialog(true);
    };

    const deleteMedecin = async () => {
        try {
            await fetch(`/api/medecin?id=${medecin.id}`, { method: 'DELETE' });

            const updatedMedecins = medecins.filter((val) => val.id !== medecin.id);
            setMedecins(updatedMedecins);
            setDeleteMedecinDialog(false);
            setMedecin(emptyMedecin);
            toast.current.show({ severity: "success", summary: "Successful", detail: "Medecin Deleted", life: 3000 });
        } catch (error) {
            console.error("Failed to delete medecin:", error);
        }
    };

    const findIndexById = (id) => {
        return medecins.findIndex(medecin => medecin.id === id);
    };

    const exportCSV = () => {
        dt.current.exportCSV();
    };

    const confirmDeleteSelected = () => {
        setDeleteMedecinsDialog(true);
    };

    const deleteSelectedMedecins = async () => {
        const deletePromises = selectedMedecins.map((medecin) =>
            fetch(`/api/medecin?id=${medecin.id}`, { method: 'DELETE' })
        );
    
        try {
            await Promise.all(deletePromises);
    
            // Remove deleted medecins from the client-side state
            let _medecins = medecins.filter((val) => !selectedMedecins.includes(val));
            setMedecins(_medecins);
            setDeleteMedecinsDialog(false);
            setSelectedMedecins([]);
            toast.current.show({ severity: "success", summary: "Successful", detail: "Medecins Deleted", life: 3000 });
        } catch (error) {
            console.error("Failed to delete medecins:", error);
            toast.current.show({ severity: "error", summary: "Error", detail: "Failed to delete medecins", life: 3000 });
        }
    };

    const onInputChange = (e, name) => {
        const val = (e.target && e.target.value) || "";
        setMedecin(prev => ({ ...prev, [name]: val }));
    };

    const leftToolbarTemplate = () => {
        return (
            <div className="flex flex-wrap gap-2">
                <Button label="New" icon="pi pi-plus" severity="success" onClick={openNew} />
                <Button label="Delete" icon="pi pi-trash" severity="danger" onClick={confirmDeleteSelected} disabled={!selectedMedecins.length} />
            </div>
        );
    };

    const rightToolbarTemplate = () => {
        return <Button label="Export" icon="pi pi-upload" className="p-button-help" onClick={exportCSV} />;
    };

    const actionBodyTemplate = (rowData) => {
        return (
            <React.Fragment>
                <Button icon="pi pi-pencil" rounded outlined className="mr-2" onClick={() => editMedecin(rowData)} />
                <Button icon="pi pi-trash" rounded outlined severity="danger" onClick={() => confirmDeleteMedecin(rowData)} />
            </React.Fragment>
        );
    };

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h4 className="mt-1">Manage Medecins</h4>
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

    const medecinDialogFooter = (
        <React.Fragment>
            <Button label="Cancel" icon="pi pi-times" className="bg-primary w-22 h-8 ml-2.5 pl-2 pr-4 text-white" outlined onClick={hideDialog} />
            <Button label="Save" icon="pi pi-check" className="bg-primary w-20 h-8 ml-2.5 pl-2 pr-3 text-white" onClick={saveMedecin} />
        </React.Fragment>
    );

    const deleteMedecinDialogFooter = (
        <React.Fragment>
            <Button label="No" className="bg-primary w-20 h-8 ml-2.5 pl-2 pr-3 text-white" icon="pi pi-times" outlined onClick={hideDeleteMedecinDialog} />
            <Button label="Yes" className="bg-primary w-20 h-8 ml-2.5 pl-2 pr-3 text-white" icon="pi pi-check" severity="danger" onClick={deleteMedecin} />
        </React.Fragment>
    );

    const deleteMedecinsDialogFooter = (
        <React.Fragment>
            <Button label="No" className="bg-primary w-20 h-8 ml-2.5 pl-2 pr-3 text-white" icon="pi pi-times" outlined onClick={hideDeleteMedecinsDialog} />
            <Button label="Yes" className="bg-primary w-20 h-8 ml-2.5 pl-2 pr-3 text-white" icon="pi pi-check" severity="danger" onClick={deleteSelectedMedecins} />
        </React.Fragment>
    );

    return (
        <div className="card">
            <Toast ref={toast} />
            <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate} />
            <DataTable
                ref={dt}
                value={medecins}
                selection={selectedMedecins}
                onSelectionChange={(e) => setSelectedMedecins(e.value)}
                dataKey="id"
                paginator
                rows={10}
                rowsPerPageOptions={[5, 10, 25]}
                globalFilter={globalFilter}
                header={header}
            >
                <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>
                <Column field="nom" header="Nom" sortable />
                <Column field="prenom" header="Prenom" sortable />
                <Column field="specialite" header="Specialite" sortable />
                <Column field="email" header="Email" sortable />
                <Column field="telephone" header="Telephone" sortable />
                <Column body={actionBodyTemplate} headerStyle={{ width: '8rem' }}></Column>
            </DataTable>

            <Dialog
                visible={medecinDialog}
                style={{ width: '450px' }}
                header="Medecin Details"
                modal
                className="p-fluid"
                footer={medecinDialogFooter}
                onHide={hideDialog}
            >
                <div className="field">
                    <label htmlFor="nom">Nom</label>
                    <InputText
                        id="nom"
                        value={medecin.nom}
                        onChange={(e) => onInputChange(e, 'nom')}
                        required
                        autoFocus
                        className={classNames({ 'p-invalid': submitted && !medecin.nom })}
                    />
{validationErrors.nom && (
            <small className="p-error">{validationErrors.nom._errors.join(", ")}</small>
        )}                </div>
                <div className="field">
                    <label htmlFor="prenom">Prenom</label>
                    <InputText
                        id="prenom"
                        value={medecin.prenom}
                        onChange={(e) => onInputChange(e, 'prenom')}
                        required
                        className={classNames({ 'p-invalid': submitted && !medecin.prenom })}
                    />
{validationErrors.prenom && (
            <small className="p-error">{validationErrors.prenom._errors.join(", ")}</small>
        )}                </div>
                <div className="field">
                    <label htmlFor="specialite">Specialite</label>
                    <InputText
                        id="specialite"
                        value={medecin.specialite}
                        onChange={(e) => onInputChange(e, 'specialite')}
                        required
                        className={classNames({ 'p-invalid': submitted && !medecin.specialite })}
                    />
{validationErrors.specialite && (
            <small className="p-error">{validationErrors.specialite._errors.join(", ")}</small>
        )}                </div>
                <div className="field">
                    <label htmlFor="email">Email</label>
                    <InputText
                        id="email"
                        value={medecin.email}
                        onChange={(e) => onInputChange(e, 'email')}
                        required
                        className={classNames({ 'p-invalid': submitted && !medecin.email })}
                    />
{validationErrors.email && (
            <small className="p-error">{validationErrors.email._errors.join(", ")}</small>
        )}                   </div>
                <div className="field">
                    <label htmlFor="telephone">Telephone</label>
                    <InputText
                        id="telephone"
                        value={medecin.telephone}
                        onChange={(e) => onInputChange(e, 'telephone')}
                        required
                        className={classNames({ 'p-invalid': submitted && !medecin.telephone })}
                    />
{validationErrors.telephone && (
            <small className="p-error">{validationErrors.telephone._errors.join(", ")}</small>
        )}                   </div>
            </Dialog>

            <Dialog
                visible={deleteMedecinDialog}
                style={{ width: '450px' }}
                header="Confirm"
                modal
                footer={deleteMedecinDialogFooter}
                onHide={hideDeleteMedecinDialog}
            >
                <div className="flex flex-column align-items-center">
                    <i className="pi pi-exclamation-triangle text-4xl" />
                    <h5>Are you sure you want to delete this medecin?</h5>
                </div>
            </Dialog>

            <Dialog
                visible={deleteMedecinsDialog}
                style={{ width: '450px' }}
                header="Confirm"
                modal
                footer={deleteMedecinsDialogFooter}
                onHide={hideDeleteMedecinsDialog}
            >
                <div className="flex flex-column align-items-center">
                    <i className="pi pi-exclamation-triangle text-4xl" />
                    <h5>Are you sure you want to delete the selected medecins?</h5>
                </div>
            </Dialog>
        </div>
    );
}
