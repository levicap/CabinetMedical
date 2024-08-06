"use client"
import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { MedicalRecordService } from '../crudtable/data2';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import { Column } from 'primereact/column';
import { FileUpload } from 'primereact/fileupload';
import 'primereact/resources/themes/saga-blue/theme.css';  // or another theme
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

export default function DossierMedicalManagement() {
    let emptyRecord = {
        id: null,
        patientName: '',
        date: '',
       
        diagnosis: '',
        notes: ''
    };

    const [records, setRecords] = useState(null);
    const [recordDialog, setRecordDialog] = useState(false);
    const [record, setRecord] = useState(emptyRecord);
    const [globalFilter, setGlobalFilter] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const toast = useRef(null);
    const dt = useRef(null);

    useEffect(() => {
        MedicalRecordService.getRecords().then((data) => setRecords(data));
    }, []);

    const openNew = () => {
        setRecord(emptyRecord);
        setRecordDialog(true);
        setIsEditMode(false);
    };

    const hideDialog = () => {
        setRecordDialog(false);
    };

    const saveRecord = () => {
        if (isEditMode) {
            MedicalRecordService.updateRecord(record).then(() => {
                toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Record Updated', life: 3000 });
                setRecords(records.map(r => (r.id === record.id ? record : r)));
            });
        } else {
            MedicalRecordService.createRecord(record).then(newRecord => {
                toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Record Created', life: 3000 });
                setRecords([...records, newRecord]);
            });
        }
        setRecordDialog(false);
        setRecord(emptyRecord);
    };

    const editRecord = (record) => {
        setRecord({ ...record });
        setRecordDialog(true);
        setIsEditMode(true);
    };

    const deleteRecord = (record) => {
        MedicalRecordService.deleteRecord(record.id).then(() => {
            setRecords(records.filter(r => r.id !== record.id));
            toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Record Deleted', life: 3000 });
        });
    };

    const formatDate = (date) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(date).toLocaleDateString(undefined, options);
    };

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h4 className="m-0">Manage Medical Records</h4>
            <div className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => setGlobalFilter(e.target.value)} placeholder="Search..." />
            </div>
            <Button label="New Record" icon="pi pi-plus" onClick={openNew} />
        </div>
    );

    const actionBodyTemplate = (rowData) => {
        return (
            <React.Fragment>
                <Button icon="pi pi-pencil" className="p-button-rounded p-button-text mr-2" onClick={() => editRecord(rowData)} />
                <Button icon="pi pi-trash" className="p-button-rounded p-button-text" onClick={() => deleteRecord(rowData)} />
                <FileUpload mode="basic" name="file" url="./upload" accept="*" className="p-button-rounded p-button-text" auto />
            </React.Fragment>
        );
    };

    const recordDialogFooter = (
        <React.Fragment>
            <Button label="Cancel" icon="pi pi-times" onClick={hideDialog} />
            <Button label="Save" icon="pi pi-check" onClick={saveRecord} />
        </React.Fragment>
    );

    return (
        <div>
            <Toast ref={toast} />
            <div className="card">
                <DataTable ref={dt} value={records} dataKey="id" paginator rows={10} rowsPerPageOptions={[5, 10, 25]}
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} records" globalFilter={globalFilter} header={header}>
                    <Column field="patientName" header="Patient Name" sortable style={{ minWidth: '16rem' }}></Column>
                    <Column field="date" header="Date" body={(rowData) => formatDate(rowData.date)} sortable style={{ minWidth: '12rem' }}></Column>
                    <Column field="diagnosis" header="Diagnosis" sortable style={{ minWidth: '20rem' }}></Column>
                    <Column field="notes" header="Notes" sortable style={{ minWidth: '20rem' }}></Column>
                    <Column body={actionBodyTemplate} exportable={false} style={{ minWidth: '8rem' }}></Column>
                </DataTable>
            </div>

            <Dialog visible={recordDialog} className="w-500" header="Record Details" modal footer={recordDialogFooter} onHide={hideDialog}>
                <div className="field">
                    <label htmlFor="patientName" className="font-bold">Patient Name</label>
                    <InputText id="patientName" value={record.patientName} onChange={(e) => setRecord({ ...record, patientName: e.target.value })} />
                </div>
                <div className="field">
                    <label htmlFor="date" className="font-bold">Date</label>
                    <InputText id="date" value={record.date} onChange={(e) => setRecord({ ...record, date: e.target.value })} />
                </div>
               
                <div className="field">
                    <label htmlFor="diagnosis" className="font-bold">Diagnosis</label>
                    <InputText id="diagnosis" value={record.diagnosis} onChange={(e) => setRecord({ ...record, diagnosis: e.target.value })} />
                </div>
                <div className="field">
                    <label htmlFor="notes" className="font-bold">Notes</label>
                    <InputText id="notes" value={record.notes} onChange={(e) => setRecord({ ...record, notes: e.target.value })} />
                </div>
            </Dialog>
        </div>
    );
}
