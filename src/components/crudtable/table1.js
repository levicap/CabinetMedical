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


export default function PatientsDemo() {
    const emptyPatient = {
        id: null,
        nom: "",
        prenom: "",
        adresse: "",
        email: "",
        telephone: "",
    };
    const patientSchema = z.object({
        nom: z.string().min(1, "Nom is required"),
        prenom: z.string().min(1, "Prenom is required"),
        adresse: z.string().optional(),
        email: z.string().email("Invalid email format").optional(),
        telephone: z.string().regex(/^\+216\d{8}$/, "Phone number must be in the format +216 followed by 8 digits").optional()
    });

    const [patients, setPatients] = useState([]);
    const [patientDialog, setPatientDialog] = useState(false);
    const [deletePatientDialog, setDeletePatientDialog] = useState(false);
    const [deletePatientsDialog, setDeletePatientsDialog] = useState(false);
    const [patient, setPatient] = useState(emptyPatient);
    const [selectedPatients, setSelectedPatients] = useState([]);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState("");
    const toast = useRef(null);
    const dt = useRef(null);
    const [validationErrors, setValidationErrors] = useState({});


    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        try {
            const response = await fetch('/api/patients');
            if (response.ok) {
                const data = await response.json();
                setPatients(data); // Ensure the data structure is correct
            } else {
                console.error("Failed to fetch patients:", response.statusText);
            }
        } catch (error) {
            console.error("Failed to fetch patients:", error);
        }
    };

    const openNew = () => {
        setPatient(emptyPatient);
        setSubmitted(false);
        setPatientDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setPatientDialog(false);
    };

    const hideDeletePatientDialog = () => {
        setDeletePatientDialog(false);
    };

    const hideDeletePatientsDialog = () => {
        setDeletePatientsDialog(false);
    };
    const savePatient = async () => {
        setSubmitted(true);
    
        // Existing validation check
        if (!patient.nom.trim() || !patient.prenom.trim()) {
            toast.current.show({ severity: "error", summary: "Validation Error", detail: "Nom and Prenom are required", life: 3000 });
            return;
        }
    
        try {
            // Zod validation
            patientSchema.parse(patient);
            setValidationErrors({}); // Clear previous validation errors
    
            // Proceed with the API request
            const response = patient.id
                ? await fetch(`/api/patients?id=${patient.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(patient)
                })
                : await fetch('/api/patients', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(patient)
                });
    
            if (!response.ok) {
                throw new Error('Failed to save patient');
            }
    
            const savedPatient = await response.json();
    
            let _patients = [...patients];
            if (patient.id) {
                const index = findIndexById(patient.id);
                _patients[index] = savedPatient;
                toast.current.show({ severity: "success", summary: "Successful", detail: "Patient Updated", life: 3000 });
            } else {
                _patients.push(savedPatient);
                toast.current.show({ severity: "success", summary: "Successful", detail: "Patient Created", life: 3000 });
            }
    
            setPatients(_patients);
            setPatientDialog(false);
            setPatient(emptyPatient);
        } catch (error) {
            if (error instanceof z.ZodError) {
                // Handle Zod validation errors
                setValidationErrors(error.format());
            } else {
                console.error("Failed to save patient:", error);
                toast.current.show({ severity: "error", summary: "Error", detail: "Failed to save patient", life: 3000 });
            }
        }
    };

    const editPatient = (patient) => {
        setPatient({ ...patient });
        setPatientDialog(true);
    };

    const confirmDeletePatient = (patient) => {
        setPatient(patient);
        setDeletePatientDialog(true);
    };

    const deletePatient = async () => {
        try {
            await fetch(`/api/patients?id=${patient.id}`, { method: 'DELETE' });

            const updatedPatients = patients.filter((val) => val.id !== patient.id);
            setPatients(updatedPatients);
            setDeletePatientDialog(false);
            setPatient(emptyPatient);
            toast.current.show({ severity: "success", summary: "Successful", detail: "Patient Deleted", life: 3000 });
        } catch (error) {
            console.error("Failed to delete patient:", error);
        }
    };

    const findIndexById = (id) => {
        return patients.findIndex(patient => patient.id === id);
    };

    const exportCSV = () => {
        dt.current.exportCSV();
    };

    const confirmDeleteSelected = () => {
        setDeletePatientsDialog(true);
    };

    const deleteSelectedPatients = async () => {
        const deletePromises = selectedPatients.map((patient) =>
            fetch(`/api/patients?id=${patient.id}`, { method: 'DELETE' })
        );
    
        try {
            await Promise.all(deletePromises);
    
            // Remove deleted patients from the client-side state
            let _patients = patients.filter((val) => !selectedPatients.includes(val));
            setPatients(_patients);
            setDeletePatientsDialog(false);
            setSelectedPatients([]);
            toast.current.show({ severity: "success", summary: "Successful", detail: "Patients Deleted", life: 3000 });
        } catch (error) {
            console.error("Failed to delete patients:", error);
            toast.current.show({ severity: "error", summary: "Error", detail: "Failed to delete patients", life: 3000 });
        }
    };
    
    const onInputChange = (e, name) => {
        const val = (e.target && e.target.value) || "";
        setPatient(prev => ({ ...prev, [name]: val }));
    };

    const leftToolbarTemplate = () => {
        return (
            <div className="flex flex-wrap gap-2">
                <Button label="New" icon="pi pi-plus" severity="success" onClick={openNew} />
                <Button label="Delete" icon="pi pi-trash" severity="danger" onClick={confirmDeleteSelected} disabled={!selectedPatients.length} />
            </div>
        );
    };

    const rightToolbarTemplate = () => {
        return <Button label="Export" icon="pi pi-upload" className="p-button-help" onClick={exportCSV} />;
    };

    const actionBodyTemplate = (rowData) => {
        return (
            <React.Fragment>
                <Button icon="pi pi-pencil" rounded outlined className="mr-2" onClick={() => editPatient(rowData)} />
                <Button icon="pi pi-trash" rounded outlined severity="danger" onClick={() => confirmDeletePatient(rowData)} />
            </React.Fragment>
        );
    };

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h4 className="mt-1">Manage Patients</h4>
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

    const patientDialogFooter = (
        <React.Fragment>
            <Button label="Cancel" icon="pi pi-times" className="bg-primary w-22 h-8 ml-2.5 pl-2 pr-4 text-white" outlined onClick={hideDialog} />
            <Button label="Save" icon="pi pi-check" className="bg-primary w-20 h-8 ml-2.5 pl-2 pr-3 text-white" onClick={savePatient} />
        </React.Fragment>
    );

    const deletePatientDialogFooter = (
        <React.Fragment>
            <Button label="No" className="bg-primary w-20 h-8 ml-2.5 pl-2 pr-3 text-white" icon="pi pi-times" outlined onClick={hideDeletePatientDialog} />
            <Button label="Yes" className="bg-primary w-20 h-8 ml-2.5 pl-2 pr-3 text-white" icon="pi pi-check" severity="danger" onClick={deletePatient} />
        </React.Fragment>
    );

    const deletePatientsDialogFooter = (
        <React.Fragment>
            <Button label="No" icon="pi pi-times" outlined onClick={hideDeletePatientsDialog} />
            <Button label="Yes" icon="pi pi-check" severity="danger" onClick={deleteSelectedPatients} />
        </React.Fragment>
    );

    return (
        <div className="datatable-crud-demo">
            <Toast ref={toast} />
            <div className="card">
                <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate} />
                <DataTable
                    ref={dt}
                    value={patients}
                    selection={selectedPatients}
                    onSelectionChange={(e) => setSelectedPatients(e.value)}
                    dataKey="id"
                    paginator
                    rows={10}
                    rowsPerPageOptions={[5, 10, 25]}
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} patients"
                    globalFilter={globalFilter}
                    header={header}
                    className="datatable-responsive"
                >
                    <Column field="nom" header="Nom" sortable />
                    <Column field="prenom" header="Prenom" sortable />
                    <Column field="adresse" header="Adresse" sortable />
                    <Column field="email" header="Email" sortable />
                    <Column field="telephone" header="Telephone" sortable />
                    <Column body={actionBodyTemplate} exportable={false} />
                </DataTable>
            </div>

            <Dialog visible={patientDialog} style={{ width: '450px' }} header="Patient Details" modal className="p-fluid" footer={patientDialogFooter} onHide={hideDialog}>
    <div className="field">
        <label htmlFor="nom">Nom</label>
        <InputText id="nom" value={patient.nom} onChange={(e) => onInputChange(e, 'nom')} required autoFocus />
        {validationErrors.nom && (
            <small className="p-error">{validationErrors.nom._errors.join(", ")}</small>
        )}
    </div>
    <div className="field">
        <label htmlFor="prenom">Prenom</label>
        <InputText id="prenom" value={patient.prenom} onChange={(e) => onInputChange(e, 'prenom')} required />
        {validationErrors.prenom && (
            <small className="p-error">{validationErrors.prenom._errors.join(", ")}</small>
        )}
    </div>
    <div className="field">
        <label htmlFor="adresse">Adresse</label>
        <InputTextarea id="adresse" value={patient.adresse} onChange={(e) => onInputChange(e, 'adresse')} rows={3} />
    </div>
    <div className="field">
        <label htmlFor="email">Email</label>
        <InputText id="email" value={patient.email} onChange={(e) => onInputChange(e, 'email')} />
        {validationErrors.email && (
            <small className="p-error">{validationErrors.email._errors.join(", ")}</small>
        )}
    </div>
    <div className="field">
        <label htmlFor="telephone">Telephone</label>
        <InputText id="telephone" value={patient.telephone} onChange={(e) => onInputChange(e, 'telephone')} />
        {validationErrors.telephone && (
            <small className="p-error">{validationErrors.telephone._errors.join(", ")}</small>
        )}
    </div>
</Dialog>


            <Dialog visible={deletePatientDialog} style={{ width: '450px' }} header="Confirm" modal footer={deletePatientDialogFooter} onHide={hideDeletePatientDialog}>
                <div className="confirmation-content">
                    <i className="pi pi-exclamation-triangle p-mr-3" style={{ fontSize: '2rem' }} />
                    {patient && <span>Are you sure you want to delete <b>{patient.nom}</b>?</span>}
                </div>
            </Dialog>

            <Dialog visible={deletePatientsDialog} style={{ width: '450px' }} header="Confirm" modal footer={deletePatientsDialogFooter} onHide={hideDeletePatientsDialog}>
                <div className="confirmation-content">
                    <i className="pi pi-exclamation-triangle p-mr-3" style={{ fontSize: '2rem' }} />
                    {selectedPatients.length > 0 && <span>Are you sure you want to delete the selected patients?</span>}
                </div>
            </Dialog>
        </div>
    );
}
