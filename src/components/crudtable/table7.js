"use client";
import React, { useState, useEffect, useRef } from "react";
import { classNames } from "primereact/utils";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { Toolbar } from "primereact/toolbar";
import { InputText } from "primereact/inputtext";
import { Dialog } from "primereact/dialog";
import "./style.css";
import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import { z } from 'zod';


export default function UserDemo() {
    const emptyUser = {
        id: null,
        name: "",
        email: "",
        username: "",
        password: "",
        role: "",
    };

    const [users, setUsers] = useState([]);
    const [userDialog, setUserDialog] = useState(false);
    const [deleteUserDialog, setDeleteUserDialog] = useState(false);
    const [deleteUsersDialog, setDeleteUsersDialog] = useState(false);
    const [user, setUser] = useState(emptyUser);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState("");
    const toast = useRef(null);
    const dt = useRef(null);
    const [validationErrors, setValidationErrors] = useState({});


    useEffect(() => {
        fetchUsers();
    }, []);
  const userSchema = z.object({
        name: z.string().min(1, { message: "Name is required" }),
        email: z.string().email({ message: "Invalid email address" }),
        username: z.string().min(1, { message: "Username is required" }),
        password: z.string().min(8, { message: "Password must be at least 8 characters long" }),
        role: z.enum(['ADMIN', 'medecin', 'secretaire'], { message: "Role must be one of: ADMIN, medecin, secretaire" }),
    });

    const fetchUsers = async () => {
        try {
            const response = await fetch('/api/user');
            if (response.ok) {
                const data = await response.json();
                setUsers(data); // Ensure the data structure is correct
            } else {
                console.error("Failed to fetch users:", response.statusText);
            }
        } catch (error) {
            console.error("Failed to fetch users:", error);
        }
    };

    const openNew = () => {
        setUser(emptyUser);
        setSubmitted(false);
        setUserDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setUserDialog(false);
    };

    const hideDeleteUserDialog = () => {
        setDeleteUserDialog(false);
    };

    const hideDeleteUsersDialog = () => {
        setDeleteUsersDialog(false);
    };

    const saveUser = async () => {
        setSubmitted(true);
        try {
            // Validate user data
            userSchema.parse(user);
            setValidationErrors({}); // Clear any previous validation errors
    
            const response = user.id
                ? await fetch(`/api/user?id=${user.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(user)
                })
                : await fetch('/api/user', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(user)
                });
    
            if (!response.ok) {
                throw new Error('Failed to save user');
            }
    
            const savedUser = await response.json();
            let _users = [...users];
            if (user.id) {
                const index = findIndexById(user.id);
                _users[index] = savedUser;
                toast.current.show({ severity: "success", summary: "Successful", detail: "User Updated", life: 3000 });
            } else {
                _users.push(savedUser);
                toast.current.show({ severity: "success", summary: "Successful", detail: "User Created", life: 3000 });
            }
    
            setUsers(_users);
            setUserDialog(false);
            setUser(emptyUser);
        } catch (error) {
            if (error instanceof z.ZodError) {
                // Set validation errors from Zod
                const errors = {};
                error.errors.forEach(e => {
                    errors[e.path[0]] = { _errors: [e.message] };
                });
                setValidationErrors(errors);
            } else {
                toast.current.show({ severity: "error", summary: "Error", detail: error.message || "Failed to save user", life: 3000 });
            }
        }
    };
    

    const editUser = (user) => {
        setUser({ ...user });
        setUserDialog(true);
    };

    const confirmDeleteUser = (user) => {
        setUser(user);
        setDeleteUserDialog(true);
    };

    const deleteUser = async () => {
        try {
            await fetch(`/api/user?id=${user.id}`, { method: 'DELETE' });

            const updatedUsers = users.filter((val) => val.id !== user.id);
            setUsers(updatedUsers);
            setDeleteUserDialog(false);
            setUser(emptyUser);
            toast.current.show({ severity: "success", summary: "Successful", detail: "User Deleted", life: 3000 });
        } catch (error) {
            console.error("Failed to delete user:", error);
        }
    };

    const findIndexById = (id) => {
        return users.findIndex(user => user.id === id);
    };

    const exportCSV = () => {
        dt.current.exportCSV();
    };

    const confirmDeleteSelected = () => {
        setDeleteUsersDialog(true);
    };

    const deleteSelectedUsers = async () => {
        const deletePromises = selectedUsers.map((user) =>
            fetch(`/api/user?id=${user.id}`, { method: 'DELETE' })
        );
    
        try {
            await Promise.all(deletePromises);
    
            // Remove deleted users from the client-side state
            let _users = users.filter((val) => !selectedUsers.includes(val));
            setUsers(_users);
            setDeleteUsersDialog(false);
            setSelectedUsers([]);
            toast.current.show({ severity: "success", summary: "Successful", detail: "Users Deleted", life: 3000 });
        } catch (error) {
            console.error("Failed to delete users:", error);
            toast.current.show({ severity: "error", summary: "Error", detail: "Failed to delete users", life: 3000 });
        }
    };

    const onInputChange = (e, name) => {
        const val = (e.target && e.target.value) || "";
        setUser(prev => ({ ...prev, [name]: val }));
    };

    const leftToolbarTemplate = () => {
        return (
            <div className="flex flex-wrap gap-2">
                <Button label="New" icon="pi pi-plus" severity="success" onClick={openNew} />
                <Button label="Delete" icon="pi pi-trash" severity="danger" onClick={confirmDeleteSelected} disabled={!selectedUsers.length} />
            </div>
        );
    };

    const rightToolbarTemplate = () => {
        return <Button label="Export" icon="pi pi-upload" className="p-button-help" onClick={exportCSV} />;
    };
    const sendCredentials = async (email, username, password) => {
        try {
            const response = await fetch('/api/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, username, password }),
            });
    
            if (response.ok) {
                const result = await response.json(); // Optionally handle the response if needed
                toast.current.show({ severity: "success", summary: "Successful", detail: `Credentials sent to ${email}`, life: 3000 });
            } else {
                const error = await response.json(); // Extract and log server-side error details
                throw new Error(error.message || 'Failed to send credentials');
            }
        } catch (error) {
            console.error('Error sending credentials:', error);
            toast.current.show({ severity: "error", summary: "Error", detail: error.message || "Failed to send credentials", life: 3000 });
        }
    };
    

    

    const actionBodyTemplate = (rowData) => {
        return (
            <React.Fragment>
                <Button icon="pi pi-pencil" rounded outlined className="mr-2" onClick={() => editUser(rowData)} />
                <Button icon="pi pi-trash" rounded outlined severity="danger" onClick={() => confirmDeleteUser(rowData)} />
                <Button icon="pi pi-envelope" rounded outlined className="mr-2" onClick={() => sendCredentials(rowData.email, rowData.username, rowData.password)} />

            </React.Fragment>
        );
    };
    const notify = (user) => {
        // Implement your notification logic here
        toast.current.show({ severity: "info", summary: "Notification", detail: `Notified about crendetils on ${user.email} `, life: 3000 });
    };

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h4 className="mt-1">Manage Users</h4>
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

    const userDialogFooter = (
        <React.Fragment>
            <Button label="Cancel" icon="pi pi-times" className="bg-primary w-22 h-8 ml-2.5 pl-2 pr-4 text-white" outlined onClick={hideDialog} />
            <Button label="Save" icon="pi pi-check" className="bg-primary w-20 h-8 ml-2.5 pl-2 pr-3 text-white" onClick={saveUser} />
        </React.Fragment>
    );

    const deleteUserDialogFooter = (
        <React.Fragment>
            <Button label="No" className="bg-primary w-20 h-8 ml-2.5 pl-2 pr-3 text-white" icon="pi pi-times" outlined onClick={hideDeleteUserDialog} />
            <Button label="Yes" className="bg-primary w-20 h-8 ml-2.5 pl-2 pr-3 text-white" icon="pi pi-check" severity="danger" onClick={deleteUser} />
        </React.Fragment>
    );

    const deleteUsersDialogFooter = (
        <React.Fragment>
            <Button label="No" className="bg-primary w-20 h-8 ml-2.5 pl-2 pr-3 text-white" icon="pi pi-times" outlined onClick={hideDeleteUsersDialog} />
            <Button label="Yes" className="bg-primary w-20 h-8 ml-2.5 pl-2 pr-3 text-white" icon="pi pi-check" severity="danger" onClick={deleteSelectedUsers} />
        </React.Fragment>
    );

    return (
        <div className="card">
            <Toast ref={toast} />
            <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate} />
            <DataTable
                ref={dt}
                value={users}
                selection={selectedUsers}
                onSelectionChange={(e) => setSelectedUsers(e.value)}
                dataKey="id"
                paginator
                rows={10}
                rowsPerPageOptions={[5, 10, 25]}
                className="datatable-responsive"
                header={header}
                globalFilter={globalFilter}
                emptyMessage="No users found."
            >
                <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>
                <Column field="name" header="Nom et prenom" sortable></Column>

                <Column field="email" header="Email" sortable></Column>
                <Column field="username" header="Username" sortable></Column>
                <Column field="role" header="Role" sortable></Column>
                <Column body={actionBodyTemplate} header="Actions" headerStyle={{ width: '13rem' }}></Column>
            </DataTable>

            <Dialog visible={userDialog} style={{ width: '450px' }} header="User Details" modal className="p-fluid" footer={userDialogFooter} onHide={hideDialog}>
            <div className="field">
                    <label htmlFor="name">Nom et prenom</label>
                    <InputText id="name" value={user.name} onChange={(e) => onInputChange(e, 'name')} required autoFocus className={classNames({ 'p-invalid': submitted && !user.name })} />
                    {validationErrors.name && (
            <small className="p-error">{validationErrors.name_errors.join(", ")}</small>
        )}                </div>
                <div className="field">
                    <label htmlFor="email">Email</label>
                    <InputText id="email" value={user.email} onChange={(e) => onInputChange(e, 'email')} required autoFocus className={classNames({ 'p-invalid': submitted && !user.email })} />
                    {validationErrors.email && (
            <small className="p-error">{validationErrors.email._errors.join(", ")}</small>
        )}                </div>
                <div className="field">
                    <label htmlFor="username">Username</label>
                    <InputText id="username" value={user.username} onChange={(e) => onInputChange(e, 'username')} required className={classNames({ 'p-invalid': submitted && !user.username })} />
                    {validationErrors.username && (
            <small className="p-error">{validationErrors.username._errors.join(", ")}</small>
        )}                </div>
                <div className="field">
                    <label htmlFor="password">Password</label>
                    <InputText id="password" type="password" value={user.password} onChange={(e) => onInputChange(e, 'password')} required className={classNames({ 'p-invalid': submitted && !user.password })} />
                    {validationErrors.password&& (
            <small className="p-error">{validationErrors.password._errors.join(", ")}</small>
        )}                </div>
                <div className="field">
                    <label htmlFor="role">Role</label>
                    <InputText id="role" value={user.role} onChange={(e) => onInputChange(e, 'role')} required className={classNames({ 'p-invalid': submitted && !user.role })} />
                    {validationErrors.role && (
            <small className="p-error">{validationErrors.role._errors.join(", ")}</small>
        )}                </div>
            </Dialog>

            <Dialog visible={deleteUserDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteUserDialogFooter} onHide={hideDeleteUserDialog}>
                <div className="confirmation-content">
                    <i className="pi pi-exclamation-triangle p-mr-3" style={{ fontSize: '2rem' }} />
                    {user && (
                        <span>Are you sure you want to delete <b>{user.username}</b>?</span>
                    )}
                </div>
            </Dialog>

            <Dialog visible={deleteUsersDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteUsersDialogFooter} onHide={hideDeleteUsersDialog}>
                <div className="confirmation-content">
                    <i className="pi pi-exclamation-triangle p-mr-3" style={{ fontSize: '2rem' }} />
                    {selectedUsers.length > 0 && (
                        <span>Are you sure you want to delete the selected users?</span>
                    )}
                </div>
            </Dialog>
        </div>
    );
}
