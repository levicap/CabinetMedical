"use client"
import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { DiagnosticService } from '../tableso/data1';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import { Column } from 'primereact/column';
import 'primereact/resources/themes/saga-blue/theme.css';  // or another theme
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

export default function DiagnosticsDemo() {
    let emptyDiagnostic = {
        id: null,
        doctorName: '',
        date: '',
        diagnosis: '',
        tests: '',
        notes: ''
    };

    const [diagnostics, setDiagnostics] = useState(null);
    const [viewDialog, setViewDialog] = useState(false);
    const [diagnostic, setDiagnostic] = useState(emptyDiagnostic);
    const [globalFilter, setGlobalFilter] = useState(null);
    const toast = useRef(null);
    const dt = useRef(null);

    useEffect(() => {
        DiagnosticService.getDiagnostics().then((data) => setDiagnostics(data));
    }, []);

    const hideDialog = () => {
        setViewDialog(false);
    };

    const viewDiagnostic = (diagnostic) => {
        setDiagnostic({ ...diagnostic });
        setViewDialog(true);
    };

    const downloadDiagnostic = (diagnostic) => {
        // Implement the logic to download the diagnostic
        toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Diagnostic Downloaded', life: 3000 });
    };

    const formatDate = (date) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(date).toLocaleDateString(undefined, options);
    };

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h4 className="m-0">Manage Diagnostics</h4>
            <div className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => setGlobalFilter(e.target.value)} placeholder="Search..." />
            </div>
        </div>
    );

    const actionBodyTemplate = (rowData) => {
        return (
            <React.Fragment>
                <Button icon="pi pi-eye" className="p-button-rounded p-button-text mr-2" onClick={() => viewDiagnostic(rowData)} />
                <Button icon="pi pi-download" className="p-button-rounded p-button-text" onClick={() => downloadDiagnostic(rowData)} />
            </React.Fragment>
        );
    };

    const viewDialogFooter = (
        <React.Fragment>
            <Button label="Close" icon="pi pi-times" onClick={hideDialog} />
        </React.Fragment>
    );

    return (
        <div>
            <Toast ref={toast} />
            <div className="w-1000">
                <DataTable ref={dt} value={diagnostics} dataKey="id" paginator rows={10} rowsPerPageOptions={[5, 10, 25]}
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} diagnostics" globalFilter={globalFilter} header={header}>
                    <Column field="doctorName" header="Doctor Name" sortable style={{ minWidth: '16rem' }}></Column>
                    <Column field="date" header="Date" body={(rowData) => formatDate(rowData.date)} sortable style={{ minWidth: '12rem' }}></Column>
                    <Column field="diagnosis" header="Diagnosis" sortable style={{ minWidth: '20rem' }}></Column>
                    <Column field="tests" header="Tests" sortable style={{ minWidth: '20rem' }}></Column>
                    <Column field="notes" header="Notes" sortable style={{ minWidth: '20rem' }}></Column>
                    <Column body={actionBodyTemplate} exportable={false} style={{ minWidth: '8rem' }}></Column>
                </DataTable>
            </div>

            <Dialog visible={viewDialog} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Diagnostic Details" modal className="p-fluid" footer={viewDialogFooter} onHide={hideDialog}>
                
                <div className="field">
                    <label htmlFor="doctorName" className="font-bold">
                        Doctor Name
                    </label>
                    <InputText id="doctorName" value={diagnostic.doctorName} readOnly />
                </div>
                <div className="field">
                    <label htmlFor="date" className="font-bold">
                        Date
                    </label>
                    <InputText id="date" value={formatDate(diagnostic.date)} readOnly />
                </div>
                <div className="field">
                    <label htmlFor="diagnosis" className="font-bold">
                        Diagnosis
                    </label>
                    <InputText id="diagnosis" value={diagnostic.diagnosis} readOnly />
                </div>
                <div className="field">
                    <label htmlFor="tests" className="font-bold">
                        Tests
                    </label>
                    <InputText id="tests" value={diagnostic.tests} readOnly />
                </div>
                <div className="field">
                    <label htmlFor="notes" className="font-bold">
                        Notes
                    </label>
                    <InputText id="notes" value={diagnostic.notes} readOnly />
                </div>
            </Dialog>
        </div>
    );
}
