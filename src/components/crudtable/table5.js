"use client";
import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import { Column } from 'primereact/column';
import 'primereact/resources/themes/saga-blue/theme.css';  
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

export default function DossierMedicalManagement() {
    let emptyRecord = {
        id: null,
        patientName: '',
        diagnosis: '',
        notes: '',
        files: []
    };

    const [records, setRecords] = useState([]);
    const [recordDialog, setRecordDialog] = useState(false);
    const [record, setRecord] = useState(emptyRecord);
    const [globalFilter, setGlobalFilter] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const toast = useRef(null);
    const dt = useRef(null);

    useEffect(() => {
        fetchMedicalRecords();
    }, []);

    const fetchMedicalRecords = async () => {
        try {
            const response = await fetch('/api/dossier');
            if (response.ok) {
                const data = await response.json();
                const formattedData = data.map(record => ({
                    id: record.id || 'N/A',
                    patientName: `${record.patient?.nom || 'Unknown'} ${record.patient?.prenom || 'Patient'}`,
                    diagnosis: record.diagnostic || 'No Diagnosis',
                    notes: record.notes || 'No Notes',
                    files: record.files.length > 0 ? record.files.join(', ') : 'No Files'
                }));
                setRecords(formattedData);
                console.log("Medical Records fetched:", formattedData);
            } else {
                console.error("Failed to fetch medical records:", response.statusText);
            }
        } catch (error) {
            console.error("Failed to fetch medical records:", error);
        }
    };

    const handleFileUpload = async (e, recordId) => {
        e.preventDefault();
        if (!selectedFile) {
            toast.current.show({ severity: 'warn', summary: 'No File Selected', detail: 'Please select a file to upload.' });
            return;
        }

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const response = await fetch(`/api/uploadfiles?dossierId=${recordId}`, {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                toast.current.show({ severity: 'success', summary: 'File Uploaded', detail: 'File has been uploaded successfully.' });
                fetchMedicalRecords(); // Refresh records after upload
            } else {
                const result = await response.json();
                toast.current.show({ severity: 'error', summary: 'Upload Failed', detail: result.error || 'Failed to upload file.' });
            }
        } catch (error) {
            console.error("Error uploading file:", error);
            toast.current.show({ severity: 'error', summary: 'Upload Error', detail: 'An error occurred while uploading the file.' });
        }
    };

    const openNew = () => {
        setRecord(emptyRecord);
        setRecordDialog(true);
        setIsEditMode(false);
    };

    const hideDialog = () => {
        setRecordDialog(false);
    };

    const downloadFiles = async (recordId, patientName) => {
        try {
            const response = await fetch(`/api/uploadfiles?dossierId=${recordId}`);
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${patientName}_files.zip`;
                document.body.appendChild(a);
                a.click();
                a.remove();
            } else {
                console.error("Failed to download files:", response.statusText);
            }
        } catch (error) {
            console.error("Error downloading files:", error);
        }
    };

    const saveRecord = async () => {
        try {
            const method = isEditMode ? 'PUT' : 'POST';
            const url = isEditMode ? `/api/dossier?dossierId=${record.id}` : '/api/dossier';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(record),
            });

            if (response.ok) {
                toast.current.show({ severity: 'success', summary: isEditMode ? 'Record Updated' : 'Record Created', detail: `Record has been ${isEditMode ? 'updated' : 'created'} successfully.` });
                fetchMedicalRecords(); // Refresh records after save
                hideDialog();
            } else {
                const result = await response.json();
                toast.current.show({ severity: 'error', summary: 'Save Failed', detail: result.error || 'Failed to save record.' });
            }
        } catch (error) {
            console.error("Error saving record:", error);
            toast.current.show({ severity: 'error', summary: 'Save Error', detail: 'An error occurred while saving the record.' });
        }
    };

    const editRecord = (record) => {
        setRecord({ ...record });
        setRecordDialog(true);
        setIsEditMode(true);
    };

    const deleteRecord = async (record) => {
        try {
            const response = await fetch(`/api/dossier?dossierId=${record.id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                toast.current.show({ severity: 'success', summary: 'Record Deleted', detail: 'Record has been deleted successfully.' });
                fetchMedicalRecords(); // Refresh records after deletion
            } else {
                const result = await response.json();
                toast.current.show({ severity: 'error', summary: 'Delete Failed', detail: result.error || 'Failed to delete record.' });
            }
        } catch (error) {
            console.error("Error deleting record:", error);
            toast.current.show({ severity: 'error', summary: 'Delete Error', detail: 'An error occurred while deleting the record.' });
        }
    };

    const formatDate = (date) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(date).toLocaleDateString(undefined, options);
    };

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center">
            <h4 className="mt-1">Gérer Dossier Medical</h4>
            <div className="p-input-icon-left">
                <InputText
                    type="search"
                    onInput={(e) => setGlobalFilter(e.target.value)}
                    placeholder="Search..." className="ml-3 mr-10 h-8 rounded-lg"
                />
            </div>
        </div>
    );

    const actionBodyTemplate = (rowData) => {
        return (
            <React.Fragment>
                <Button
                    icon="pi pi-pencil"
                    className="p-button-rounded p-button-text mr-2"
                    onClick={() => editRecord(rowData)}
                />
                <Button
                    icon="pi pi-trash"
                    className="p-button-rounded p-button-text"
                    onClick={() => deleteRecord(rowData)}
                />
                <Button
                    label="Download Files"
                    icon="pi pi-download"
                    className="p-button-rounded p-button-text"
                    onClick={() => downloadFiles(rowData.id, rowData.patientName)}
                />
                <input
                    type="file"
                    onChange={(e) => setSelectedFile(e.target.files[0])}
                    className="p-button-rounded p-button-text"
                />
                <Button
                    label="Upload File"
                    icon="pi pi-upload"
                    className="p-button-rounded p-button-text"
                    onClick={(e) => handleFileUpload(e, rowData.id)}
                />
            </React.Fragment>
        );
    };

    const recordDialogFooter = (
        <React.Fragment>
            <Button
                label="Cancel"
                icon="pi pi-times"
                className="bg-primary w-22 h-8 ml-2.5 pl-2 pr-4 text-white"
                outlined
                onClick={hideDialog}
            />
            <Button
                label="Save"
                icon="pi pi-check"
                className="bg-primary w-20 h-8 ml-2.5 pl-2 pr-3 text-white"
                onClick={saveRecord}
            />
        </React.Fragment>
    );

    return (
        <div>
            <Toast ref={toast} />
            <div className="card">
                <DataTable
                    ref={dt}
                    value={records}
                    dataKey="id"
                    paginator
                    rows={10}
                    rowsPerPageOptions={[5, 10, 25]}
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} records"
                    globalFilter={globalFilter}
                    header={header}
                    className="datatable-responsive"
                >
                    <Column field="patientName" header="Patient Name" />
                    <Column field="diagnosis" header="Diagnosis" />
                    <Column field="notes" header="Notes" />
                    <Column field="files" header="Files" />
                    <Column body={actionBodyTemplate} header="Actions" />
                </DataTable>

                <Dialog
                    visible={recordDialog}
                    style={{ width: '500px' }}
                    header={isEditMode ? 'Edit Record' : 'New Record'}
                    modal
                    footer={recordDialogFooter}
                    onHide={hideDialog}
                >
                    
                  
                    <div className="field">
                        <label htmlFor="diagnosis">Diagnosis</label>
                        <InputText
                            id="diagnosis"
                            value={record.diagnosis}
                            onChange={(e) => setRecord({ ...record, diagnosis: e.target.value })}
                        />
                    </div>
                    <div className="field">
                        <label htmlFor="notes">Notes</label>
                        <InputText
                            id="notes"
                            value={record.notes}
                            onChange={(e) => setRecord({ ...record, notes: e.target.value })}
                        />
                    </div>
                </Dialog>
            </div>
        </div>
    );
}
