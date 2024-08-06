"use client";
import React, { useState, useEffect, useRef } from 'react';
import { classNames } from 'primereact/utils';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { UserService } from '../crudtable/data4'; // Update this import to your user service
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import './style.css';
import 'primereact/resources/themes/saga-blue/theme.css';  // or another theme
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

export default function UsersDemo() {
    let emptyUser = {
        id: null,
        email: '',
        username: '',
        password: '',
        role: ''
    };

    const [users, setUsers] = useState(null);
    const [userDialog, setUserDialog] = useState(false);
    const [deleteUserDialog, setDeleteUserDialog] = useState(false);
    const [deleteUsersDialog, setDeleteUsersDialog] = useState(false);
    const [user, setUser] = useState(emptyUser);
    const [selectedUsers, setSelectedUsers] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState(null);
    const toast = useRef(null);
    const dt = useRef(null);

    useEffect(() => {
        UserService.getUsers().then((data) => setUsers(data));
    }, []);

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

    const saveUser = () => {
        setSubmitted(true);

        if (user.email.trim() && user.username.trim() && user.password.trim() && user.role.trim()) {
            let _users = [...users];
            let _user = { ...user };

            if (user.id) {
                const index = findIndexById(user.id);
                _users[index] = _user;
                toast.current.show({ severity: 'success', summary: 'Successful', detail: 'User Updated', life: 3000 });
            } else {
                _user.id = createId();
                _users.push(_user);
                toast.current.show({ severity: 'success', summary: 'User Created', detail: 'User Created', life: 3000 });
            }

            setUsers(_users);
            setUserDialog(false);
            setUser(emptyUser);
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

    const deleteUser = () => {
        let _users = users.filter((val) => val.id !== user.id);
        setUsers(_users);
        setDeleteUserDialog(false);
        setUser(emptyUser);
        toast.current.show({ severity: 'success', summary: 'Successful', detail: 'User Deleted', life: 3000 });
    };

    const findIndexById = (id) => {
        let index = -1;
        for (let i = 0; i < users.length; i++) {
            if (users[i].id === id) {
                index = i;
                break;
            }
        }
        return index;
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

    const confirmDeleteSelected = () => {
        setDeleteUsersDialog(true);
    };

    const deleteSelectedUsers = () => {
        let _users = users.filter((val) => !selectedUsers.includes(val));
        setUsers(_users);
        setDeleteUsersDialog(false);
        setSelectedUsers(null);
        toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Users Deleted', life: 3000 });
    };

    const onInputChange = (e, name) => {
        const val = (e.target && e.target.value) || '';
        let _user = { ...user };
        _user[`${name}`] = val;
        setUser(_user);
    };

    const sendCredentials = (user) => {
        // Implement your logic to send credentials via email
        toast.current.show({ severity: 'success', summary: 'Credentials Sent', detail: `Credentials sent to ${user.email}`, life: 3000 });
    };

    const leftToolbarTemplate = () => {
        return (
            <div className="flex flex-wrap gap-2">
                <Button label="New" icon="pi pi-plus" severity="success" onClick={openNew} />
                <Button label="Delete" icon="pi pi-trash" severity="danger" onClick={confirmDeleteSelected} disabled={!selectedUsers || !selectedUsers.length} />
            </div>
        );
    };

    const rightToolbarTemplate = () => {
        return <Button label="Export" icon="pi pi-upload" className="p-button-help" onClick={exportCSV} />;
    };

    const actionBodyTemplate = (rowData) => {
        return (
            <React.Fragment>
                <Button icon="pi pi-pencil" rounded outlined className="mr-2" onClick={() => editUser(rowData)} />
                <Button icon="pi pi-trash" rounded outlined severity="danger" onClick={() => confirmDeleteUser(rowData)} />
                <Button icon="pi pi-envelope" rounded outlined severity="info" onClick={() => sendCredentials(rowData)} />
            </React.Fragment>
        );
    };

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h4 className="m-0">Manage Users</h4>
            <div className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => setGlobalFilter(e.target.value)} placeholder="Search..." />
            </div>
        </div>
    );

    const userDialogFooter = (
        <React.Fragment>
            <Button label="Cancel" icon="pi pi-times" outlined onClick={hideDialog} />
            <Button label="Save" icon="pi pi-check" onClick={saveUser} />
        </React.Fragment>
    );

    const deleteUserDialogFooter = (
        <React.Fragment>
            <Button label="No" icon="pi pi-times" outlined onClick={hideDeleteUserDialog} />
            <Button label="Yes" icon="pi pi-check" severity="danger" onClick={deleteUser} />
        </React.Fragment>
    );

    const deleteUsersDialogFooter = (
        <React.Fragment>
            <Button label="No" icon="pi pi-times" outlined onClick={hideDeleteUsersDialog} />
            <Button label="Yes" icon="pi pi-check" severity="danger" onClick={deleteSelectedUsers} />
        </React.Fragment>
    );

    return (
        <div>
            <Toast ref={toast} />
            <div className="card">
                <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>

                <DataTable ref={dt} value={users} selection={selectedUsers} onSelectionChange={(e) => setSelectedUsers(e.value)}
                        dataKey="id" paginator rows={10} rowsPerPageOptions={[5, 10, 25]}
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} users" globalFilter={globalFilter} header={header}>
                    <Column selectionMode="multiple" exportable={false}></Column>
                    <Column field="email" header="Email" sortable style={{ minWidth: '16rem' }}></Column>
                    <Column field="username" header="Username" sortable style={{ minWidth: '12rem' }}></Column>
                    <Column field="role" header="Role" sortable style={{ minWidth: '10rem' }}></Column>
                    <Column body={actionBodyTemplate} exportable={false} style={{ minWidth: '12rem' }}></Column>
                </DataTable>
            </div>

            <Dialog visible={userDialog} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="User Details" modal className="p-fluid" footer={userDialogFooter} onHide={hideDialog}>
                <div className="field">
                    <label htmlFor="email" className="mb-3 block text-sm font-medium text-black dark:text-white">Email</label>
                    <InputText id="email" value={user.email} onChange={(e) => onInputChange(e, 'email')} required autoFocus className={classNames({ 'p-invalid': submitted && !user.email })} />
                    {submitted && !user.email && <small className="p-error">Email is required.</small>}
                </div>
                <div className="field">
                    <label htmlFor="username" className="mb-3 block text-sm font-medium text-black dark:text-white">Username</label>
                    <InputText id="username" value={user.username} onChange={(e) => onInputChange(e, 'username')} required className={classNames({ 'p-invalid': submitted && !user.username })} />
                    {submitted && !user.username && <small className="p-error">Username is required.</small>}
                </div>
                <div className="field">
                    <label htmlFor="password" className="mb-3 block text-sm font-medium text-black dark:text-white">Password</label>
                    <InputText id="password" value={user.password} onChange={(e) => onInputChange(e, 'password')} required className={classNames({ 'p-invalid': submitted && !user.password })} />
                    {submitted && !user.password && <small className="p-error">Password is required.</small>}
                </div>
                <div className="field">
                    <label htmlFor="role" className="mb-3 block text-sm font-medium text-black dark:text-white">Role</label>
                    <InputText id="role" value={user.role} onChange={(e) => onInputChange(e, 'role')} required className={classNames({ 'p-invalid': submitted && !user.role })} />
                    {submitted && !user.role && <small className="p-error">Role is required.</small>}
                </div>
            </Dialog>

            <Dialog visible={deleteUserDialog} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Confirm" modal footer={deleteUserDialogFooter} onHide={hideDeleteUserDialog}>
                <div className="confirmation-content">
                    <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                    {user && (
                        <span>
                            Are you sure you want to delete <b>{user.username}</b>?
                        </span>
                    )}
                </div>
            </Dialog>

            <Dialog visible={deleteUsersDialog} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Confirm" modal footer={deleteUsersDialogFooter} onHide={hideDeleteUsersDialog}>
                <div className="confirmation-content">
                    <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                    {user && <span>Are you sure you want to delete the selected users?</span>}
                </div>
            </Dialog>
        </div>
    );
}
