"use client";
import React, { useState, useEffect, useRef } from "react";
import { classNames } from "primereact/utils";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { Toolbar } from "primereact/toolbar";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Dialog } from "primereact/dialog";
import "./style.css";
import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import { z } from 'zod';

export default function ConsultationsDemo() {
    const emptyConsultation = {
        id: null,
        nomPatient: "",
        prenomPatient: "",
        date: "",
        diagnostic: "",
        notes: "",
        medication: "",
        instructions: ""
    };

    const consultationSchema = z.object({
        nomPatient: z.string().min(1, "Nom Patient is required"),
        prenomPatient: z.string().min(1, "Prenom Patient is required"),
        date: z.string().min(1, "Date is required"),
        diagnostic: z.string().optional(),
        notes: z.string().optional(),
        medication: z.string().optional(),
        instructions: z.string().optional()
    });

    const [consultations, setConsultations] = useState([]);
    const [consultationDialog, setConsultationDialog] = useState(false);
    const [deleteConsultationDialog, setDeleteConsultationDialog] = useState(false);
    const [deleteConsultationsDialog, setDeleteConsultationsDialog] = useState(false);
    const [consultation, setConsultation] = useState(emptyConsultation);
    const [selectedConsultations, setSelectedConsultations] = useState([]);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState("");
    const toast = useRef(null);
    const dt = useRef(null);
    const [validationErrors, setValidationErrors] = useState({});

    useEffect(() => {
        fetchConsultations();
    }, []);
    
    const fetchConsultations = async () => {
        try {
            const response = await fetch('/api/consultations');
            if (response.ok) {
                const data = await response.json();
                const formattedData = data.map(consultation => ({
                    id: consultation.id, // Use the id field from the API
                    date: consultation.consultationDetails.date,
                    nomPatient: consultation.patientName.split(' ')[0] || '', // Ensure default values
                    prenomPatient: consultation.patientName.split(' ')[1] || '', // Ensure default values
                    diagnostic: consultation.consultationDetails.diagnosis,
                    notes: consultation.consultationDetails.notes,
                    medication: consultation.prescriptions.map(p => p.medication).join(', '), // Combine medications if multiple
                    instructions: consultation.prescriptions.map(p => p.instructions).join(', ') // Combine instructions if multiple
                }));
                setConsultations(formattedData);
                console.log("Consultations fetched:", formattedData);
            } else {
                console.error("Failed to fetch consultations:", response.statusText);
            }
        } catch (error) {
            console.error("Failed to fetch consultations:", error);
        }
    };

    const openNew = () => {
        setConsultation(emptyConsultation);
        setSubmitted(false);
        setConsultationDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setConsultationDialog(false);
    };

    const hideDeleteConsultationDialog = () => {
        setDeleteConsultationDialog(false);
    };

    const hideDeleteConsultationsDialog = () => {
        setDeleteConsultationsDialog(false);
    };

    const saveConsultation = async () => {
        setSubmitted(true);

        try {
            consultationSchema.parse(consultation); // Validate with zod
            setValidationErrors({}); // Clear previous validation errors
            
            const response = consultation.id
                ? await fetch(`/api/consultations?consultationId=${consultation.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({nom: consultation.nomPatient,
                        prenom: consultation.prenomPatient,
                        date: consultation.date,
                        diagnosis: consultation.diagnostic,
                        notes: consultation.notes,
                        medication: consultation.medication,
                        instructions: consultation.instructions,})
                })
                : await fetch('/api/consultations', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        nom: consultation.nomPatient,
                        prenom: consultation.prenomPatient,
                        date: consultation.date,
                        diagnostic: consultation.diagnostic,
                        notes: consultation.notes,
                        medication: consultation.medication,
                        instructions: consultation.instructions,
                      })
                });

            if (!response.ok) {
                throw new Error('Failed to save consultation');
            }

            const savedConsultation = await response.json();
            let _consultations = [...consultations];
            if (consultation.id) {
                const index = findIndexById(consultation.id);
                if (index >= 0) {
                    _consultations[index] = savedConsultation;
                    toast.current.show({ severity: "success", summary: "Successful", detail: "Consultation Updated", life: 3000 });
                } else {
                    throw new Error('Consultation not found in local state');
                }
            } else {
                _consultations.push(savedConsultation);
                toast.current.show({ severity: "success", summary: "Successful", detail: "Consultation Created", life: 3000 });
            }

            setConsultations(_consultations);
            setConsultationDialog(false);
            setConsultation(emptyConsultation);
        } catch (error) {
            if (error instanceof z.ZodError) {
                setValidationErrors(error.format());
            } else {
                console.error("Failed to save consultation:", error);
                toast.current.show({ severity: "error", summary: "Error", detail: "patient n existe pas", life: 3000 });
            }
        }
    };

    const editConsultation = (consultation) => {
        setConsultation({ ...consultation });
        setConsultationDialog(true);
    };

    const confirmDeleteConsultation = (consultation) => {
        setConsultation(consultation);
        setDeleteConsultationDialog(true);
    };

    const deleteConsultation = async () => {
        try {
            await fetch(`/api/consultations?consultationId=${consultation.id}`, { method: 'DELETE' });

            const updatedConsultations = consultations.filter((val) => val.id !== consultation.id);
            setConsultations(updatedConsultations);
            setDeleteConsultationDialog(false);
            setConsultation(emptyConsultation);
            toast.current.show({ severity: "success", summary: "Successful", detail: "Consultation Deleted", life: 3000 });
        } catch (error) {
            console.error("Failed to delete consultation:", error);
        }
    };

    const findIndexById = (id) => {
        return consultations.findIndex(consultation => consultation.id === id);
    };

    const exportCSV = () => {
        dt.current.exportCSV();
    };

    const confirmDeleteSelected = () => {
        setDeleteConsultationsDialog(true);
    };

    const deleteSelectedConsultations = async () => {
        const deletePromises = selectedConsultations.map((consultation) =>
            fetch(`/api/consultations?id=${consultation.id}`, { method: 'DELETE' })
        );

        try {
            await Promise.all(deletePromises);

            let _consultations = consultations.filter((val) => !selectedConsultations.includes(val));
            setConsultations(_consultations);
            setDeleteConsultationsDialog(false);
            setSelectedConsultations([]);
            toast.current.show({ severity: "success", summary: "Successful", detail: "Consultations Deleted", life: 3000 });
        } catch (error) {
            console.error("Failed to delete consultations:", error);
            toast.current.show({ severity: "error", summary: "Error", detail: "Failed to delete consultations", life: 3000 });
        }
    };

    const onInputChange = (e, name) => {
        const val = (e.target && e.target.value) || "";
        setConsultation(prev => ({ ...prev, [name]: val }));
    };

    const leftToolbarTemplate = () => {
        return (
            <div className="flex flex-wrap gap-2">
                <Button label="New" icon="pi pi-plus" severity="success" onClick={openNew} />
                <Button label="Delete" icon="pi pi-trash" severity="danger" onClick={confirmDeleteSelected} disabled={!selectedConsultations.length} />
            </div>
        );
    };

    const rightToolbarTemplate = () => {
        return <Button label="Export" icon="pi pi-upload" className="p-button-help" onClick={exportCSV} />;
    };

    const actionBodyTemplate = (rowData) => {
        return (
            <React.Fragment>
                <Button icon="pi pi-pencil" rounded outlined className="mr-2" onClick={() => editConsultation(rowData)} />
                <Button icon="pi pi-trash" rounded outlined severity="danger" onClick={() => confirmDeleteConsultation(rowData)} />
            </React.Fragment>
        );
    };

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h4 className="m-0">Consultations</h4>
            <span className="p-input-icon-right">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => setGlobalFilter(e.target.value)} placeholder="Search..." />
            </span>
        </div>
    );

    return (
        <div className="datatable-crud-demo">
            <Toast ref={toast} />
            <div className="card">
                <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate} />
                <DataTable
                    ref={dt}
                    value={consultations}
                    selection={selectedConsultations}
                    onSelectionChange={(e) => setSelectedConsultations(e.value)}
                    dataKey="id"
                    paginator
                    rows={10}
                    rowsPerPageOptions={[5, 10, 25]}
                    className="datatable-responsive"
                    globalFilter={globalFilter}
                    header={header}
                >
                    <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>
                    <Column field="nomPatient" header="Nom Patient" sortable />
                    <Column field="prenomPatient" header="Prenom Patient" sortable />
                    <Column field="date" header="Date" sortable />
                    <Column field="diagnostic" header="Diagnostic" sortable />
                    <Column field="notes" header="Notes" sortable />
                    <Column field="medication" header="Medication" sortable />
                    <Column field="instructions" header="Instructions" sortable />
                    <Column body={actionBodyTemplate} headerStyle={{ width: '8rem' }} />
                </DataTable>
            </div>
            <Dialog
      visible={consultationDialog}
      style={{ width: '450px' }}
      header="Consultation Details"
      modal
      className="p-fluid"
      footer={
        <div>
          <Button label="Cancel" icon="pi pi-times" className="p-button-text" onClick={hideDialog} />
          <Button label="Save" icon="pi pi-check" onClick={saveConsultation} />
        </div>
      }
      onHide={hideDialog}
    >
      <div className="field">
        <label htmlFor="nomPatient">Nom Patient</label>
        <InputText
          id="nomPatient"
          type="text"
          value={consultation.nomPatient}
          onChange={(e) => onInputChange(e, 'nomPatient')}
          className={classNames({ 'p-invalid': validationErrors.nomPatient })}
        />
        {validationErrors.nomPatient && <small className="p-error">{validationErrors.nomPatient}</small>}
      </div>
      <div className="field">
        <label htmlFor="prenomPatient">Prenom Patient</label>
        <InputText
          id="prenomPatient"
          type="text"
          value={consultation.prenomPatient}
          onChange={(e) => onInputChange(e, 'prenomPatient')}
          className={classNames({ 'p-invalid': validationErrors.prenomPatient })}
        />
        {validationErrors.prenomPatient && <small className="p-error">{validationErrors.prenomPatient}</small>}
      </div>
      <div className="field">
        <label htmlFor="date">Date</label>
        <InputText
          id="date"
          type="text"
          value={consultation.date}
          onChange={(e) => onInputChange(e, 'date')}
          className={classNames({ 'p-invalid': validationErrors.date })}
        />
        {validationErrors.date && <small className="p-error">{validationErrors.date}</small>}
      </div>
      <div className="field">
        <label htmlFor="diagnostic">Diagnostic</label>
        <InputTextarea
          id="diagnostic"
          value={consultation.diagnostic}
          onChange={(e) => onInputChange(e, 'diagnostic')}
          rows={3}
        />
      </div>
      <div className="field">
        <label htmlFor="notes">Notes</label>
        <InputTextarea
          id="notes"
          value={consultation.notes}
          onChange={(e) => onInputChange(e, 'notes')}
          rows={3}
        />
      </div>
      <div className="field">
        <label htmlFor="medication">Medication</label>
        <InputTextarea
          id="medication"
          value={consultation.medication}
          onChange={(e) => onInputChange(e, 'medication')}
          rows={3}
        />
      </div>
      <div className="field">
        <label htmlFor="instructions">Instructions</label>
        <InputTextarea
          id="instructions"
          value={consultation.instructions}
          onChange={(e) => onInputChange(e, 'instructions')}
          rows={3}
        />
      </div>
    </Dialog>
            <Dialog visible={deleteConsultationDialog} style={{ width: '450px' }} header="Confirm" modal footer={
                <div>
                    <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteConsultationDialog} />
                    <Button label="Yes" icon="pi pi-check" severity="danger" onClick={deleteConsultation} />
                </div>
            } onHide={hideDeleteConsultationDialog}>
                <p>Are you sure you want to delete this consultation?</p>
            </Dialog>
            <Dialog visible={deleteConsultationsDialog} style={{ width: '450px' }} header="Confirm" modal footer={
                <div>
                    <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteConsultationsDialog} />
                    <Button label="Yes" icon="pi pi-check" severity="danger" onClick={deleteSelectedConsultations} />
                </div>
            } onHide={hideDeleteConsultationsDialog}>
                <p>Are you sure you want to delete the selected consultations?</p>
            </Dialog>
        </div>
    );
}
