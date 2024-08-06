"use client";
import React, { useState, useEffect, useRef } from 'react';
import { classNames } from 'primereact/utils';
import { DataTable } from 'primereact/datatable';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import { Column } from 'primereact/column';
import { Toolbar } from 'primereact/toolbar';
import { DiagnosisService } from './data3';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

export default function DiagnosisTable() {
    let emptyDiagnosis = {
        id: null,
        patientName: '',
        date: '',
        diagnosis: '',
        notes: ''
    };

    const [diagnoses, setDiagnoses] = useState(null);
    const [diagnosisDialog, setDiagnosisDialog] = useState(false);
    const [deleteDiagnosisDialog, setDeleteDiagnosisDialog] = useState(false);
    const [diagnosis, setDiagnosis] = useState(emptyDiagnosis);
    const [globalFilter, setGlobalFilter] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const toast = useRef(null);
    const dt = useRef(null);

    useEffect(() => {
        DiagnosisService.getDiagnosis().then((data) => setDiagnoses(data));
    }, []);

    const openNew = () => {
        setDiagnosis(emptyDiagnosis);
        setSubmitted(false);
        setDiagnosisDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setDiagnosisDialog(false);
    };

    const hideDeleteDiagnosisDialog = () => {
        setDeleteDiagnosisDialog(false);
    };

    const saveDiagnosis = () => {
        setSubmitted(true);

        if (diagnosis.patientName.trim()) {
            let _diagnoses = [...diagnoses];
            let _diagnosis = { ...diagnosis };

            if (diagnosis.id) {
                DiagnosisService.updateDiagnosis(_diagnosis).then(() => {
                    const index = findIndexById(diagnosis.id);
                    _diagnoses[index] = _diagnosis;
                    toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Diagnosis Updated', life: 3000 });
                });
            } else {
                DiagnosisService.createDiagnosis(_diagnosis).then((data) => {
                    _diagnoses.push(data);
                    toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Diagnosis Created', life: 3000 });
                });
            }

            setDiagnoses(_diagnoses);
            setDiagnosisDialog(false);
            setDiagnosis(emptyDiagnosis);
        }
    };

    const editDiagnosis = (diagnosis) => {
        setDiagnosis({ ...diagnosis });
        setDiagnosisDialog(true);
    };

    const confirmDeleteDiagnosis = (diagnosis) => {
        setDiagnosis(diagnosis);
        setDeleteDiagnosisDialog(true);
    };

    const deleteDiagnosis = () => {
        DiagnosisService.deleteDiagnosis(diagnosis.id).then(() => {
            let _diagnoses = diagnoses.filter((val) => val.id !== diagnosis.id);
            setDiagnoses(_diagnoses);
            setDeleteDiagnosisDialog(false);
            setDiagnosis(emptyDiagnosis);
            toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Diagnosis Deleted', life: 3000 });
        });
    };

    const findIndexById = (id) => {
        let index = -1;
        for (let i = 0; i < diagnoses.length; i++) {
            if (diagnoses[i].id === id) {
                index = i;
                break;
            }
        }
        return index;
    };

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h4 className="m-0">Manage Diagnoses</h4>
            <div className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => setGlobalFilter(e.target.value)} placeholder="Search..." />
            </div>
        </div>
    );

    const leftToolbarTemplate = () => {
        return (
            <div className="flex flex-wrap gap-2">
                <Button label="New" icon="pi pi-plus" severity="success" onClick={openNew} />
            </div>
        );
    };

    const rightToolbarTemplate = () => {
        return (
            <Button label="Export" icon="pi pi-upload" className="p-button-help" onClick={exportCSV} />
        );
    };

    const exportCSV = () => {
        dt.current.exportCSV();
    };

    const actionBodyTemplate = (rowData) => {
        return (
            <React.Fragment>
                <Button icon="pi pi-pencil" className="p-button-rounded p-button-text mr-2" onClick={() => editDiagnosis(rowData)} />
                <Button icon="pi pi-trash" className="p-button-rounded p-button-text" onClick={() => confirmDeleteDiagnosis(rowData)} />
                <Button icon="pi pi-paperclip" className="p-button-rounded p-button-text" onClick={() => attachFile(rowData)} />
            </React.Fragment>
        );
    };

    const diagnosisDialogFooter = (
        <React.Fragment>
            <Button label="Cancel" icon="pi pi-times" onClick={hideDialog} />
            <Button label="Save" icon="pi pi-check" onClick={saveDiagnosis} />
        </React.Fragment>
    );

    const deleteDiagnosisDialogFooter = (
        <React.Fragment>
            <Button label="No" icon="pi pi-times" onClick={hideDeleteDiagnosisDialog} />
            <Button label="Yes" icon="pi pi-check" severity="danger" onClick={deleteDiagnosis} />
        </React.Fragment>
    );

    const attachFile = (diagnosis) => {
        // Implement the logic to attach files to the diagnosis
        toast.current.show({ severity: 'success', summary: 'Successful', detail: 'File Attached', life: 3000 });
    };

    return (
        <div>
            <Toast ref={toast} />
            <div className="card">
                <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>

                <DataTable ref={dt} value={diagnoses} dataKey="id" paginator rows={10} rowsPerPageOptions={[5, 10, 25]}
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} diagnoses" globalFilter={globalFilter} header={header}>
                    <Column field="patientName" header="Patient Name" sortable style={{ minWidth: '16rem' }}></Column>
                    <Column field="date" header="Date" sortable style={{ minWidth: '12rem' }}></Column>
                    <Column field="diagnosis" header="Diagnosis" sortable style={{ minWidth: '20rem' }}></Column>
                    <Column field="notes" header="Notes" sortable style={{ minWidth: '20rem' }}></Column>
                    <Column body={actionBodyTemplate} exportable={false} style={{ minWidth: '12rem' }}></Column>
                </DataTable>
            </div>

            <Dialog visible={diagnosisDialog} style={{ width: '500px' }} header="Diagnosis Details" modal className="p-fluid" footer={diagnosisDialogFooter} onHide={hideDialog}>
                <div className="field">
                    <label htmlFor="patientName" className="font-bold">Patient Name</label>
                    <InputText id="patientName" value={diagnosis.patientName} onChange={(e) => setDiagnosis({ ...diagnosis, patientName: e.target.value })} required autoFocus className={classNames({ 'p-invalid': submitted && !diagnosis.patientName })} />
                    {submitted && !diagnosis.patientName && <small className="p-error">Patient Name is required.</small>}
                </div>
                <div className="field">
                    <label htmlFor="date" className="font-bold">Date</label>
                    <InputText id="date" type="date" value={diagnosis.date} onChange={(e) => setDiagnosis({ ...diagnosis, date: e.target.value })} required className={classNames({ 'p-invalid': submitted && !diagnosis.date })} />
                    {submitted && !diagnosis.date && <small className="p-error">Date is required.</small>}
                </div>
                <div className="field">
                    <label htmlFor="diagnosis" className="font-bold">Diagnosis</label>
                    <InputText id="diagnosis" value={diagnosis.diagnosis} onChange={(e) => setDiagnosis({ ...diagnosis, diagnosis: e.target.value })} required className={classNames({ 'p-invalid': submitted && !diagnosis.diagnosis })} />
                    {submitted && !diagnosis.diagnosis && <small className="p-error">Diagnosis is required.</small>}
                </div>
                <div className="field">
                    <label htmlFor="notes" className="font-bold">Notes</label>
                    <InputText id="notes" value={diagnosis.notes} onChange={(e) => setDiagnosis({ ...diagnosis, notes: e.target.value })} required className={classNames({ 'p-invalid': submitted && !diagnosis.notes })} />
                    {submitted && !diagnosis.notes && <small className="p-error">Notes are required.</small>}
                </div>
            </Dialog>

            <Dialog visible={deleteDiagnosisDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteDiagnosisDialogFooter} onHide={hideDeleteDiagnosisDialog}>
                <div className="confirmation-content">
                    <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                    {diagnosis && <span>Are you sure you want to delete <b>{diagnosis.patientName}</b>?</span>}
                </div>
            </Dialog>
        </div>
    );
}
