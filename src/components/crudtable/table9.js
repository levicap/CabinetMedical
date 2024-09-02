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


export default function PersonelDemo() {
    const emptyPersonel = {
        id: null,
        nom: "",
        prenom: "",
        adresse: "",
        telephone: "",
    };

    const [personel, setPersonel] = useState([]);
    const [personelDialog, setPersonelDialog] = useState(false);
    const [deletePersonelDialog, setDeletePersonelDialog] = useState(false);
    const [deletePersonelsDialog, setDeletePersonelsDialog] = useState(false);
    const [person, setPerson] = useState(emptyPersonel);
    const [selectedPersonel, setSelectedPersonel] = useState([]);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState("");
    const toast = useRef(null);
    const dt = useRef(null);
    const [validationErrors, setValidationErrors] = useState({});
    const personSchema = z.object({
        nom: z.string().min(1, "Nom is required"),
        prenom: z.string().min(1, "Prenom is required"),
        adresse: z.string().optional(),
        telephone: z.string().regex(/^\+216\d{8}$/, "Phone number must be in the format +216 followed by 8 digits").optional()
    });


    useEffect(() => {
        fetchPersonel();
    }, []);

    const fetchPersonel = async () => {
        try {
            const response = await fetch('/api/personel'); // Adjust the endpoint as needed
            if (response.ok) {
                const data = await response.json();
                setPersonel(data);
            } else {
                console.error("Failed to fetch personel:", response.statusText);
            }
        } catch (error) {
            console.error("Failed to fetch personel:", error);
        }
    };

    const openNew = () => {
        setPerson(emptyPersonel);
        setSubmitted(false);
        setPersonelDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setPersonelDialog(false);
    };

    const hideDeletePersonelDialog = () => {
        setDeletePersonelDialog(false);
    };

    const hideDeletePersonelsDialog = () => {
        setDeletePersonelsDialog(false);
    };

    const savePersonel = async () => {
        setSubmitted(true);
    
        
    
        try {
            // Zod validation
            personSchema.parse(person);
            setValidationErrors({}); // Clear previous validation errors
    
            // Proceed with the API request
            const response = person.id
                ? await fetch(`/api/personel?id=${person.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(person)
                })
                : await fetch('/api/personel', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(person)
                });
    
            if (!response.ok) {
                throw new Error('Failed to save personel');
            }
    
            const savedPersonel = await response.json();
    
            let _personel = [...personel];
            if (person.id) {
                const index = findIndexById(person.id);
                _personel[index] = savedPersonel;
                toast.current.show({ severity: "success", summary: "Successful", detail: "Personel Updated", life: 3000 });
            } else {
                _personel.push(savedPersonel);
                toast.current.show({ severity: "success", summary: "Successful", detail: "Personel Created", life: 3000 });
            }
    
            setPersonel(_personel);
            setPersonelDialog(false);
            setPerson(emptyPersonel);
        } catch (error) {
            if (error instanceof z.ZodError) {
                // Handle Zod validation errors
                setValidationErrors(error.format());
            } else {
                console.error("Failed to save personel:", error);
                toast.current.show({ severity: "error", summary: "Error", detail: "Failed to save personel", life: 3000 });
            }
        }
    };
    

    const editPersonel = (person) => {
        setPerson({ ...person });
        setPersonelDialog(true);
    };

    const confirmDeletePersonel = (person) => {
        setPerson(person);
        setDeletePersonelDialog(true);
    };

    const deletePersonel = async () => {
        try {
            await fetch(`/api/personel?id=${person.id}`, { method: 'DELETE' });

            const updatedPersonel = personel.filter((val) => val.id !== person.id);
            setPersonel(updatedPersonel);
            setDeletePersonelDialog(false);
            setPerson(emptyPersonel);
            toast.current.show({ severity: "success", summary: "Successful", detail: "Personel Deleted", life: 3000 });
        } catch (error) {
            console.error("Failed to delete personel:", error);
        }
    };

    const findIndexById = (id) => {
        return personel.findIndex(person => person.id === id);
    };

    const exportCSV = () => {
        dt.current.exportCSV();
    };

    const confirmDeleteSelected = () => {
        setDeletePersonelsDialog(true);
    };

    const deleteSelectedPersonel = async () => {
        const deletePromises = selectedPersonel.map((person) =>
            fetch(`/api/personel?id=${person.id}`, { method: 'DELETE' })
        );
    
        try {
            await Promise.all(deletePromises);
    
            let _personel = personel.filter((val) => !selectedPersonel.includes(val));
            setPersonel(_personel);
            setDeletePersonelsDialog(false);
            setSelectedPersonel([]);
            toast.current.show({ severity: "success", summary: "Successful", detail: "Personel Deleted", life: 3000 });
        } catch (error) {
            console.error("Failed to delete personel:", error);
            toast.current.show({ severity: "error", summary: "Error", detail: "Failed to delete personel", life: 3000 });
        }
    };
    
    const onInputChange = (e, name) => {
        const val = (e.target && e.target.value) || "";
        setPerson(prev => ({ ...prev, [name]: val }));
    };

    const leftToolbarTemplate = () => {
        return (
            <div className="flex flex-wrap gap-2">
                <Button label="New" icon="pi pi-plus" severity="success" onClick={openNew} />
                <Button label="Delete" icon="pi pi-trash" severity="danger" onClick={confirmDeleteSelected} disabled={!selectedPersonel.length} />
            </div>
        );
    };

    const rightToolbarTemplate = () => {
        return <Button label="Export" icon="pi pi-upload" className="p-button-help" onClick={exportCSV} />;
    };

    const actionBodyTemplate = (rowData) => {
        return (
            <React.Fragment>
                <Button icon="pi pi-pencil" rounded outlined className="mr-2" onClick={() => editPersonel(rowData)} />
                <Button icon="pi pi-trash" rounded outlined severity="danger" onClick={() => confirmDeletePersonel(rowData)} />
            </React.Fragment>
        );
    };

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h4 className="mt-1">Manage Personel</h4>
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

    const personelDialogFooter = (
        <React.Fragment>
            <Button label="Cancel" icon="pi pi-times" className="bg-primary w-22 h-8 ml-2.5 pl-2 pr-4 text-white" outlined onClick={hideDialog} />
            <Button label="Save" icon="pi pi-check" className="bg-primary w-20 h-8 ml-2.5 pl-2 pr-3 text-white" onClick={savePersonel} />
        </React.Fragment>
    );

    const deletePersonelDialogFooter = (
        <React.Fragment>
            <Button label="No" className="bg-primary w-20 h-8 ml-2.5 pl-2 pr-3 text-white" icon="pi pi-times" outlined onClick={hideDeletePersonelDialog} />
            <Button label="Yes" className="bg-primary w-20 h-8 ml-2.5 pl-2 pr-3 text-white" icon="pi pi-check" severity="danger" onClick={deletePersonel} />
        </React.Fragment>
    );

    const deletePersonelsDialogFooter = (
        <React.Fragment>
            <Button label="No" icon="pi pi-times" outlined onClick={hideDeletePersonelsDialog} />
            <Button label="Yes" icon="pi pi-check" severity="danger" onClick={deleteSelectedPersonel} />
        </React.Fragment>
    );

    return (
        <div className="datatable-crud-demo">
            <Toast ref={toast} />
            <div className="card">
                <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate} />
                <DataTable
                    ref={dt}
                    value={personel}
                    selection={selectedPersonel}
                    onSelectionChange={(e) => setSelectedPersonel(e.value)}
                    dataKey="id"
                    paginator
                    rows={10}
                    rowsPerPageOptions={[5, 10, 25]}
                    globalFilter={globalFilter}
                    header={header}
                    className="datatable-responsive"
                >
                    <Column selectionMode="multiple" headerStyle={{ width: '3rem' }} />
                    <Column field="nom" header="Nom" sortable />
                    <Column field="prenom" header="Prenom" sortable />
                    <Column field="adresse" header="Adresse" sortable />
                    <Column field="telephone" header="Telephone" sortable />
                    <Column body={actionBodyTemplate} headerStyle={{ width: '8rem' }} />
                </DataTable>

                <Dialog
                    visible={personelDialog}
                    style={{ width: '450px' }}
                    header="Personel Details"
                    modal
                    className="p-fluid"
                    footer={personelDialogFooter}
                    onHide={hideDialog}
                >
                    <div className="field">
                        <label htmlFor="nom">Nom</label>
                        <InputText
                            id="nom"
                            value={person.nom}
                            onChange={(e) => onInputChange(e, 'nom')}
                            required
                            autoFocus
                            className={classNames({ 'p-invalid': submitted && !person.nom })}
                        />
{validationErrors.nom && (
            <small className="p-error">{validationErrors.nom._errors.join(", ")}</small>
        )}                    </div>
                    <div className="field">
                        <label htmlFor="prenom">Prenom</label>
                        <InputText
                            id="prenom"
                            value={person.prenom}
                            onChange={(e) => onInputChange(e, 'prenom')}
                            required
                            className={classNames({ 'p-invalid': submitted && !person.prenom })}
                        />
{validationErrors.prenom && (
            <small className="p-error">{validationErrors.prenom._errors.join(", ")}</small>
        )}                    </div>
                    <div className="field">
                        <label htmlFor="adresse">Adresse</label>
                        <InputTextarea
                            id="adresse"
                            value={person.adresse}
                            onChange={(e) => onInputChange(e, 'adresse')}
                            required
                            rows={3}
                            cols={20}
                            className={classNames({ 'p-invalid': submitted && !person.adresse })}
                        />
{validationErrors.adresse && (
            <small className="p-error">{validationErrors.adresse._errors.join(", ")}</small>
        )}                    </div>
                    <div className="field">
                        <label htmlFor="telephone">Telephone</label>
                        <InputText
                            id="telephone"
                            value={person.telephone}
                            onChange={(e) => onInputChange(e, 'telephone')}
                            required
                            className={classNames({ 'p-invalid': submitted && !person.telephone })}
                        />
{validationErrors.telephone && (
            <small className="p-error">{validationErrors.telephone._errors.join(", ")}</small>
        )}                    </div>
                </Dialog>

                <Dialog
                    visible={deletePersonelDialog}
                    style={{ width: '450px' }}
                    header="Confirm"
                    modal
                    footer={deletePersonelDialogFooter}
                    onHide={hideDeletePersonelDialog}
                >
                    <div className="flex align-items-center">
                        <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                        {person && (
                            <span>
                                Are you sure you want to delete <b>{person.nom}</b>?
                            </span>
                        )}
                    </div>
                </Dialog>

                <Dialog
                    visible={deletePersonelsDialog}
                    style={{ width: '450px' }}
                    header="Confirm"
                    modal
                    footer={deletePersonelsDialogFooter}
                    onHide={hideDeletePersonelsDialog}
                >
                    <div className="flex align-items-center">
                        <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                        {selectedPersonel.length > 1
                            ? `Are you sure you want to delete the selected personels?`
                            : `Are you sure you want to delete ${selectedPersonel[0]?.nom}?`}
                    </div>
                </Dialog>
            </div>
        </div>
    );
}
