"use client"
import React, { useState, useEffect, useRef } from 'react';
import { classNames } from 'primereact/utils';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { RendezvousService } from '../crudtable/data1'; // Adjust the import
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import './style.css'
import 'primereact/resources/themes/saga-blue/theme.css';  // or another theme
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

export default function RendezvousDemo() {
    const emptyRendezvous = {
        id: null,
        dateRendezVous: '',
        timeRendezVous: '',
        nomPatient: '',
        prenomPatient: '',
        etat: ''
    };

    const [rendezvous, setRendezvous] = useState([]);
    const [rendezvousDialog, setRendezvousDialog] = useState(false);
    const [deleteRendezvousDialog, setDeleteRendezvousDialog] = useState(false);
    const [rendezvousToEdit, setRendezvousToEdit] = useState(emptyRendezvous);
    const [selectedRendezvous, setSelectedRendezvous] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState(null);
    const toast = useRef(null);
    const dt = useRef(null);

    useEffect(() => {
        RendezvousService.getRendezvous().then((data) => setRendezvous(data));
    }, []);

    const openNew = () => {
        setRendezvousToEdit(emptyRendezvous);
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

    const saveRendezvous = () => {
        setSubmitted(true);

        if (rendezvousToEdit.nomPatient.trim() && rendezvousToEdit.prenomPatient.trim()) {
            let _rendezvous = [...rendezvous];
            let _rendezvousItem = { ...rendezvousToEdit };

            if (rendezvousToEdit.id) {
                const index = _rendezvous.findIndex(item => item.id === rendezvousToEdit.id);

                _rendezvous[index] = _rendezvousItem;
                toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Rendezvous Updated', life: 3000 });
            } else {
                _rendezvousItem.id = createId();
                _rendezvous.push(_rendezvousItem);
                toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Rendezvous Created', life: 3000 });
            }

            setRendezvous(_rendezvous);
            setRendezvousDialog(false);
            setRendezvousToEdit(emptyRendezvous);
        }
    };

    const editRendezvous = (rendezvousItem) => {
        setRendezvousToEdit({ ...rendezvousItem });
        setRendezvousDialog(true);
    };

    const confirmDeleteRendezvous = (rendezvousItem) => {
        setSelectedRendezvous(rendezvousItem); // Ensure selectedRendezvous is set
        setDeleteRendezvousDialog(true);
    };

    const deleteRendezvous = () => {
        let _rendezvous = rendezvous.filter((item) => item.id !== selectedRendezvous.id);

        setRendezvous(_rendezvous);
        setDeleteRendezvousDialog(false);
        setSelectedRendezvous(null);
        toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Rendezvous Deleted', life: 3000 });
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

    const notifyRendezvous = (rendezvousItem) => {
        toast.current.show({ severity: 'info', summary: 'Notification', detail: `${rendezvousItem.nomPatient} ${rendezvousItem.prenomPatient} Notifié au Rendez-vous  `, life: 3000 });
    };

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h4 className="m-0">Manage Rendezvous</h4>
            <InputText type="search" onInput={(e) => setGlobalFilter(e.target.value)} placeholder="Search..." />
        </div>
    );

    const rendezvousDialogFooter = (
        <React.Fragment>
            <Button className="bg-primary w-29 h-10 text-white rounded-lg mr-2.5"label="Cancel" icon="pi pi-times" outlined onClick={hideDialog} />
            <Button className="bg-primary w-29 h-10 text-white rounded-lg  "label="Save" icon="pi pi-check" onClick={saveRendezvous} />
        </React.Fragment>
    );

    const deleteRendezvousDialogFooter = (
        <React.Fragment>
            <Button label="No" icon="pi pi-times" outlined onClick={hideDeleteRendezvousDialog} />
            <Button label="Yes" icon="pi pi-check" severity="danger" onClick={deleteRendezvous} />
        </React.Fragment>
    );

    const dateRendezVousBodyTemplate = (rowData) => {
        return new Date(rowData.dateRendezVous).toLocaleDateString();
    };

    const timeRendezVousBodyTemplate = (rowData) => {
        return rowData.timeRendezVous;
    };

    const actionBodyTemplate = (rowData) => {
        return (
            <React.Fragment>
                <Button icon="pi pi-pencil" rounded outlined className="mr-2" onClick={() => editRendezvous(rowData)} />
                <Button icon="pi pi-trash" rounded outlined severity="danger" onClick={() => confirmDeleteRendezvous(rowData)} />
                <Button icon="pi pi-bell" rounded outlined severity="info" className="ml-2" onClick={() => notifyRendezvous(rowData)} />
            </React.Fragment>
        );
    };

    return (
        <div>
            <Toast ref={toast} />
            <div className="card">
                <DataTable ref={dt} value={rendezvous} selection={selectedRendezvous} onSelectionChange={(e) => setSelectedRendezvous(e.value)}
                        dataKey="id" paginator rows={10} rowsPerPageOptions={[5, 10, 25]}
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} rendezvous" globalFilter={globalFilter} header={header}>
                    <Column selectionMode="multiple" exportable={false}></Column>
                    <Column field="dateRendezVous" header="Date" body={dateRendezVousBodyTemplate} sortable style={{ minWidth: '12rem' }}></Column>
                    <Column field="timeRendezVous" header="Time" body={timeRendezVousBodyTemplate} sortable style={{ minWidth: '8rem' }}></Column>
                    <Column field="nomPatient" header="Nom Patient" sortable style={{ minWidth: '12rem' }}></Column>
                    <Column field="prenomPatient" header="Prenom Patient" sortable style={{ minWidth: '12rem' }}></Column>
                    <Column field="etat" header="Etat" sortable style={{ minWidth: '12rem' }}></Column>
                    <Column body={actionBodyTemplate} exportable={false} style={{ minWidth: '12rem' }}></Column>
                </DataTable>
            </div>

            <Dialog visible={rendezvousDialog} style={{ width: '450px' }} header="Rendez-vous Details" modal className="p-fluid" footer={rendezvousDialogFooter} onHide={hideDialog}>
                <div className="field">
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white"htmlFor="dateRendezVous">Date</label>
                    <InputText className="w-80 rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"id="dateRendezVous" value={rendezvousToEdit.dateRendezVous} onChange={(e) => setRendezvousToEdit({ ...rendezvousToEdit, dateRendezVous: e.target.value })} />
                </div>
                <div className="field">
                    <label className="mb-3 mt-2.5 block text-sm font-medium text-black dark:text-white"htmlFor="timeRendezVous">Time</label>
                    <InputText className="w-80 rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"id="timeRendezVous" value={rendezvousToEdit.timeRendezVous} onChange={(e) => setRendezvousToEdit({ ...rendezvousToEdit, timeRendezVous: e.target.value })} />
                </div>
                <div className="field">
                    <label className="mb-3 block mt-2.5 text-sm font-medium text-black dark:text-white"htmlFor="nomPatient">Nom Patient</label>
                    <InputText className="w-80 rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"id="nomPatient" value={rendezvousToEdit.nomPatient} onChange={(e) => setRendezvousToEdit({ ...rendezvousToEdit, nomPatient: e.target.value })} />
                </div>
                <div className="field">
                    <label className="mb-3 mt-2.5 block text-sm font-medium text-black dark:text-white"htmlFor="prenomPatient">Prenom Patient</label>
                    <InputText className="w-80 rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"id="prenomPatient" value={rendezvousToEdit.prenomPatient} onChange={(e) => setRendezvousToEdit({ ...rendezvousToEdit, prenomPatient: e.target.value })} />
                </div>
                <div className="field">
                    <label className="mb-3 mt-2.5 block text-sm font-medium text-black dark:text-white"htmlFor="etat">Etat</label>
                    <InputText className="w-80 rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary" id="etat" value={rendezvousToEdit.etat} onChange={(e) => setRendezvousToEdit({ ...rendezvousToEdit, etat: e.target.value })} />
                </div>
            </Dialog>

            <Dialog visible={deleteRendezvousDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteRendezvousDialogFooter} onHide={hideDeleteRendezvousDialog}>
                <div className="confirmation-content">
                    <i className="pi pi-exclamation-triangle p-3" style={{ fontSize: '2rem' }} />
                    {selectedRendezvous && (
                        <span>Are you sure you want to delete <b>{selectedRendezvous.nomPatient} {selectedRendezvous.prenomPatient}</b>?</span>
                    )}
                </div>
            </Dialog>
        </div>
    );
}
