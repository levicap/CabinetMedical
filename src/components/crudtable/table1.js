"use client"
import React, { useState, useEffect, useRef } from 'react';
import { classNames } from 'primereact/utils';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { PatientService } from '../crudtable/data'; // Update this import to your patient service
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import './style.css'
import 'primereact/resources/themes/saga-blue/theme.css';  // or another theme
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

export default function PatientsDemo() {
    let emptyPatient = {
        id: null,
        nom: '',
        prenom: '',
        adresse: '',
        email: '',
        telephone: ''
    };

    const [patients, setPatients] = useState(null);
    const [patientDialog, setPatientDialog] = useState(false);
    const [deletePatientDialog, setDeletePatientDialog] = useState(false);
    const [deletePatientsDialog, setDeletePatientsDialog] = useState(false);
    const [patient, setPatient] = useState(emptyPatient);
    const [selectedPatients, setSelectedPatients] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState(null);
    const toast = useRef(null);
    const dt = useRef(null);

    useEffect(() => {
        PatientService.getPatients().then((data) => setPatients(data));
    }, []);

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

    const savePatient = () => {
        setSubmitted(true);

        if (patient.nom.trim() && patient.prenom.trim()) {
            let _patients = [...patients];
            let _patient = { ...patient };

            if (patient.id) {
                const index = findIndexById(patient.id);

                _patients[index] = _patient;
                toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Patient Updated', life: 3000 });
            } else {
                _patient.id = createId();
                _patients.push(_patient);
                toast.current.show({ severity: 'success', summary: 'Patient Created', detail: 'Patient Created', life: 3000 });
            }

            setPatients(_patients);
            setPatientDialog(false);
            setPatient(emptyPatient);
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

    const deletePatient = () => {
        let _patients = patients.filter((val) => val.id !== patient.id);

        setPatients(_patients);
        setDeletePatientDialog(false);
        setPatient(emptyPatient);
        toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Patient Deleted', life: 3000 });
    };

    const findIndexById = (id) => {
        let index = -1;

        for (let i = 0; i < patients.length; i++) {
            if (patients[i].id === id) {
                index = i;
                break;
            }
        }

        return index;
    };

    const createId = () => {
        let id = '';
        let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

        for (let i = 0; i < 5; i++) {
            id += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        return id;
    };

    const exportCSV = () => {
        dt.current.exportCSV();
    };

    const confirmDeleteSelected = () => {
        setDeletePatientsDialog(true);
    };

    const deleteSelectedPatients = () => {
        let _patients = patients.filter((val) => !selectedPatients.includes(val));

        setPatients(_patients);
        setDeletePatientsDialog(false);
        setSelectedPatients(null);
        toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Patients Deleted', life: 3000 });
    };

    const onInputChange = (e, name) => {
        const val = (e.target && e.target.value) || '';
        let _patient = { ...patient };

        _patient[`${name}`] = val;

        setPatient(_patient);
    };

    const leftToolbarTemplate = () => {
        return (
            <div className="flex flex-wrap gap-2">
                <Button label="New" icon="pi pi-plus" severity="success" onClick={openNew} />
                <Button label="Delete" icon="pi pi-trash" severity="danger" onClick={confirmDeleteSelected} disabled={!selectedPatients || !selectedPatients.length} />
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
            <h4 className="m-0">Manage Patients</h4>
            <div className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => setGlobalFilter(e.target.value)} placeholder="Search..." />
            </div>
        </div>
    );

    const patientDialogFooter = (
        <React.Fragment>
            <Button label="Cancel" icon="pi pi-times" outlined onClick={hideDialog} />
            <Button label="Save" icon="pi pi-check" onClick={savePatient} />
        </React.Fragment>
    );

    const deletePatientDialogFooter = (
        <React.Fragment>
            <Button label="No" icon="pi pi-times" outlined onClick={hideDeletePatientDialog} />
            <Button label="Yes" icon="pi pi-check" severity="danger" onClick={deletePatient} />
        </React.Fragment>
    );

    const deletePatientsDialogFooter = (
        <React.Fragment>
            <Button label="No" icon="pi pi-times" outlined onClick={hideDeletePatientsDialog} />
            <Button label="Yes" icon="pi pi-check" severity="danger" onClick={deleteSelectedPatients} />
        </React.Fragment>
    );

    return (
        <div>
            <Toast ref={toast} />
            <div className="card">
                <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>

                <DataTable ref={dt} value={patients} selection={selectedPatients} onSelectionChange={(e) => setSelectedPatients(e.value)}
                        dataKey="id"  paginator rows={10} rowsPerPageOptions={[5, 10, 25]}
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} patients" globalFilter={globalFilter} header={header}>
                    <Column selectionMode="multiple" exportable={false}></Column>
                    <Column field="nom" header="Nom" sortable style={{ minWidth: '12rem' }}></Column>
                    <Column field="prenom" header="Prenom" sortable style={{ minWidth: '16rem' }}></Column>
                    <Column field="adresse" header="Adresse" sortable style={{ minWidth: '16rem' }}></Column>
                    <Column field="email" header="Email" sortable style={{ minWidth: '20rem' }}></Column>
                    <Column field="telephone" header="Telephone" sortable style={{ minWidth: '12rem' }}></Column>
                    <Column body={actionBodyTemplate} exportable={false} style={{ minWidth: '12rem' }}></Column>
                </DataTable>
            </div>

            <Dialog visible={patientDialog} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Patient Details" modal className="p-fluid" footer={patientDialogFooter} onHide={hideDialog}>
                <div className="field">
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white"htmlFor="nom" >Nom</label>
                    <InputText  id="nom" value={patient.nom} onChange={(e) => onInputChange(e, 'nom')} required autoFocus className={classNames({ 'p-invalid': submitted && !patient.nom })} />
                    {submitted && !patient.nom && <small className="p-error">Nom is required.</small>}
                </div>
                <div className="field">
                    <label htmlFor="prenom" className="mb-3 block text-sm font-medium text-black dark:text-white">Prenom</label>
                    <InputText id="prenom" value={patient.prenom} onChange={(e) => onInputChange(e, 'prenom')} required autoFocus className={classNames({ 'p-invalid': submitted && !patient.prenom })} />
                    {submitted && !patient.prenom && <small className="p-error">Prenom is required.</small>}
                </div>
                <div className="field">
                    <label htmlFor="adresse" className="mb-3 block text-sm font-medium text-black dark:text-white">Adresse</label>
                    <InputTextarea id="adresse" value={patient.adresse} onChange={(e) => onInputChange(e, 'adresse')} required rows={3} cols={20} />
                </div>
                <div className="field">
                    <label htmlFor="email" className="mb-3 block text-sm font-medium text-black dark:text-white">Email</label>
                    <InputText id="email" value={patient.email} onChange={(e) => onInputChange(e, 'email')} required rows={3} cols={20} />
                </div>
                <div className="field">
                    <label htmlFor="telephone" className="mb-3 block text-sm font-medium text-black dark:text-white">Telephone</label>
                    <InputText id="telephone" value={patient.telephone} onChange={(e) => onInputChange(e, 'telephone')} required rows={3} cols={20} />
                </div>
            </Dialog>

            <Dialog visible={deletePatientDialog} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Confirm" modal footer={deletePatientDialogFooter} onHide={hideDeletePatientDialog}>
                <div className="confirmation-content">
                    <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                    {patient && (
                        <span>
                            Are you sure you want to delete <b>{patient.nom}</b>?
                        </span>
                    )}
                </div>
            </Dialog>

            <Dialog visible={deletePatientsDialog} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Confirm" modal footer={deletePatientsDialogFooter} onHide={hideDeletePatientsDialog}>
                <div className="confirmation-content">
                    <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                    {patient && <span>Are you sure you want to delete the selected patients?</span>}
                </div>
            </Dialog>
        </div>
    );
}
