"use client";
import React, { useState, useEffect, useRef } from 'react';
import { classNames } from 'primereact/utils';
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


export default function PrescriptionsDemo() {
    let emptyPrescription = {
        id: null,
        doctorName: '',
        date: '',
        medication: '',
        dosage: '',
        instructions: ''
    };

    const [prescriptions, setPrescriptions] = useState(null);
    const [viewDialog, setViewDialog] = useState(false);
    const [prescription, setPrescription] = useState(emptyPrescription);
    const [globalFilter, setGlobalFilter] = useState(null);
    const toast = useRef(null);
    const dt = useRef(null);
    const session =useSession(); 
  const user=session.data?.user

 

    // Fetch prescriptions data
    useEffect(() => {
        // Fetching prescription data

        const fetchPrescriptions = async () => {
            try {
                const id=session.data?.user?.patientId
                console.log(id)
                const response = await fetch(`/api/prescription?patientId=${id}`); ;
                if (!response.ok) {
                    throw new Error('Failed to fetch prescriptions');
                }
                const data = await response.json();
                setPrescriptions(data);
            } catch (error) {
                console.error("Error fetching prescriptions:", error);
                toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to fetch prescriptions', life: 3000 });
            }
        };

        fetchPrescriptions();
    }, [session]);

    const hideDialog = () => {
        setViewDialog(false);
    };

    const viewPrescription = (prescription) => {
        setPrescription({ ...prescription });
        setViewDialog(true);
    };

    const downloadPrescription = async (prescription) => {
        const patientId = session.data?.user?.patientId;
    
        try {
            const response = await fetch('/api/prescription', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prescriptionId: prescription.id, patientId: patientId })
            });
    
            if (!response.ok) {
                throw new Error('Failed to generate PDF');
            }
    
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `prescription-${prescription.id}.pdf`;
            link.click();
            URL.revokeObjectURL(url);
    
            toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Prescription PDF downloaded', life: 3000 });
        } catch (error) {
            console.error("Error downloading prescription PDF:", error);
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to download prescription PDF', life: 3000 });
        }
    };
    

    const formatDate = (date) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(date).toLocaleDateString(undefined, options);
    };

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h4 className="mt-1">Gérer Prescriptions</h4>
            <div className="p-input-icon-left">
                <InputText type="search" className="ml-3 h-8 rounded-lg" onInput={(e) => setGlobalFilter(e.target.value)} placeholder="Search..." />
            </div>
        </div>
    );

    const actionBodyTemplate = (rowData) => {
        return (
            <React.Fragment>
                <Button icon="pi pi-eye" className="p-button-rounded p-button-text mr-2" onClick={() => viewPrescription(rowData)} />
                <Button icon="pi pi-download" className="p-button-rounded p-button-text" onClick={() => downloadPrescription(rowData)} />
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
            <div className="w-1000 dark:bg-boxdark">
                <DataTable ref={dt} value={prescriptions} dataKey="id" paginator rows={10} rowsPerPageOptions={[5, 10, 25]}
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} prescriptions" globalFilter={globalFilter} header={header}>
                    <Column field="doctorName" header="Doctor Name" sortable style={{ minWidth: '16rem' }}></Column>
                    <Column field="date" header="Date"sortable style={{ minWidth: '12rem' }}></Column>
                    <Column field="medication" header="Medication" sortable style={{ minWidth: '20rem' }}></Column>
                    <Column field="instructions" header="Instructions" sortable style={{ minWidth: '20rem' }}></Column>
                    <Column body={actionBodyTemplate} exportable={false} style={{ minWidth: '8rem' }}></Column>
                </DataTable>
            </div>

            <Dialog visible={viewDialog} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Prescription Details" modal className="p-fluid" footer={viewDialogFooter} onHide={hideDialog}>
                <div className="field">
                    <label htmlFor="doctorName" className="mb-3 block text-sm font-medium text-black dark:text-white">Doctor Name</label>
                    <InputText id="doctorName" value={prescription.doctorName} readOnly />
                </div>
                <div className="field">
                    <label htmlFor="date" className="mb-3 block text-sm font-medium text-black dark:text-white">Date</label>
                    <InputText id="date" value={prescription.date} readOnly />
                </div>
                <div className="field">
                    <label htmlFor="medication" className="mb-3 block text-sm font-medium text-black dark:text-white">Medication</label>
                    <InputText id="medication" value={prescription.medication} readOnly />
                </div>
                
                <div className="field">
                    <label htmlFor="instructions" className="mb-3 block text-sm font-medium text-black dark:text-white">Instructions</label>
                    <InputText id="instructions" value={prescription.instructions} readOnly />
                </div>
            </Dialog>
        </div>
    );
}
