"use client"
import React, { useState, useEffect, useRef } from 'react';
import { classNames } from 'primereact/utils';
import { DataTable } from 'primereact/datatable';
import { PrescriptionService } from '../tableso/data';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import { Column } from 'primereact/column';
import 'primereact/resources/themes/saga-blue/theme.css';  // or another theme
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';


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

    useEffect(() => {
        PrescriptionService.getPrescriptions().then((data) => setPrescriptions(data));
    }, []);

    const hideDialog = () => {
        setViewDialog(false);
    };

    const viewPrescription = (prescription) => {
        setPrescription({ ...prescription });
        setViewDialog(true);
    };

    const downloadPrescription = (prescription) => {
        // Implement the logic to download the prescription
        toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Prescription Downloaded', life: 3000 });
    };

    const formatDate = (date) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(date).toLocaleDateString(undefined, options);
    };

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h4 className="m-0">Manage Prescriptions</h4>
            <div className="p-input-icon-left">
                <i className="" />
                <InputText type="search" onInput={(e) => setGlobalFilter(e.target.value)} placeholder="Search..." />
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
            <div className="w-1000">
                <DataTable ref={dt} value={prescriptions} dataKey="id" paginator rows={10} rowsPerPageOptions={[5, 10, 25]}
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} prescriptions" globalFilter={globalFilter} header={header}>
                    <Column field="doctorName" header="Doctor Name" sortable style={{ minWidth: '16rem' }}></Column>
                    <Column field="date" header="Date" body={(rowData) => formatDate(rowData.date)} sortable style={{ minWidth: '12rem' }}></Column>
                    <Column field="medication" header="Medication" sortable style={{ minWidth: '20rem' }}></Column>
                    <Column field="dosage" header="Dosage" sortable style={{ minWidth: '10rem' }}></Column>
                    <Column field="instructions" header="Instructions" sortable style={{ minWidth: '20rem' }}></Column>
                    <Column body={actionBodyTemplate} exportable={false} style={{ minWidth: '8rem' }}></Column>
                </DataTable>
            </div>

            <Dialog visible={viewDialog} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Prescription Details" modal className="p-fluid" footer={viewDialogFooter} onHide={hideDialog}>
                
                <div className="field">
                    <label htmlFor="doctorName" className="font-bold">
                        Doctor Name
                    </label>
                    <InputText id="doctorName" value={prescription.doctorName} readOnly />
                </div>
                <div className="field">
                    <label htmlFor="date" className="font-bold">
                        Date
                    </label>
                    <InputText id="date" value={formatDate(prescription.date)} readOnly />
                </div>
                <div className="field">
                    <label htmlFor="medication" className="font-bold">
                        Medication
                    </label>
                    <InputText id="medication" value={prescription.medication} readOnly />
                </div>
                <div className="field">
                    <label htmlFor="dosage" className="font-bold">
                        Dosage
                    </label>
                    <InputText id="dosage" value={prescription.dosage} readOnly />
                </div>
                <div className="field">
                    <label htmlFor="instructions" className="font-bold">
                        Instructions
                    </label>
                    <InputText id="instructions" value={prescription.instructions} readOnly />
                </div>
            </Dialog>
        </div>
    );
}
