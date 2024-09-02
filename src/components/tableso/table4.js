"use client";
import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import { Column } from 'primereact/column';
import 'primereact/resources/themes/saga-blue/theme.css';  // or another theme
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import { useSession } from "next-auth/react";


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
    const session =useSession(); 

    useEffect(() => {
        const fetchDiagnostics = async () => {
            try {
                const id=session.data?.user?.patientId
                console.log(id) // Replace with actual patient ID if dynamic
                const response = await fetch(`/api/diagnostic?patientId=${id}`); ;// Adjust the endpoint if necessary
                if (!response.ok) {
                    throw new Error('Failed to fetch diagnostics');
                }
                const data = await response.json();
                setDiagnostics(data); // Update state with the fetched data
            } catch (error) {
                console.error("Error fetching diagnostics:", error);
                toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to fetch diagnostics', life: 3000 });
            }
        };

        fetchDiagnostics();
    }, [session]);

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
            <h4 className="mt-1">Gérer Diagnostics</h4>
            <div className="p-input-icon-left">
                <InputText type="search" className="ml-3 h-8 rounded-lg" onInput={(e) => setGlobalFilter(e.target.value)} placeholder="Search..." />
            </div>
        </div>
    );

    const actionBodyTemplate = (rowData) => {
        return (
            <React.Fragment>
                <Button icon="pi pi-eye" className="p-button-rounded p-button-text mr-2" onClick={() => viewDiagnostic(rowData)} />
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
                    <Column field="date" header="Date"  sortable style={{ minWidth: '12rem' }}></Column>
                    <Column field="diagnosis" header="Diagnosis" sortable style={{ minWidth: '20rem' }}></Column>
                    <Column field="notes" header="Notes" sortable style={{ minWidth: '20rem' }}></Column>
                    <Column body={actionBodyTemplate} exportable={false} style={{ minWidth: '8rem' }}></Column>
                </DataTable>
            </div>

            <Dialog visible={viewDialog} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Diagnostic Details" modal className="p-fluid" footer={viewDialogFooter} onHide={hideDialog}>
                <div className="field">
                    <label htmlFor="doctorName" className="mb-3 block text-sm font-medium text-black dark:text-white">Doctor Name</label>
                    <InputText id="doctorName" value={diagnostic.doctorName} readOnly />
                </div>
                <div className="field">
                    <label htmlFor="date" className="mb-3 block text-sm font-medium text-black dark:text-white">Date</label>
                    <InputText id="date" value={diagnostic.date} readOnly />
                </div>
                <div className="field">
                    <label htmlFor="diagnosis" className="mb-3 block text-sm font-medium text-black dark:text-white">Diagnosis</label>
                    <InputText id="diagnosis" value={diagnostic.diagnosis} readOnly />
                </div>
               
                <div className="field">
                    <label htmlFor="notes" className="mb-3 block text-sm font-medium text-black dark:text-white">Notes</label>
                    <InputText id="notes" value={diagnostic.notes} readOnly />
                </div>
            </Dialog>
        </div>
    );
}
