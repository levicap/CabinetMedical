"use client";
import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import 'primereact/resources/themes/saga-blue/theme.css';  // or another theme
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

const DoctorScheduler = () => {
  const [events, setEvents] = useState([
    { id: 1, title: 'Consultation avec Dr. Smith', start: '2024-08-01T09:00:00', end: '2024-08-01T09:30:00', doctor: 'Dr. Smith' },
    { id: 2, title: 'Consultation avec Dr. Brown', start: '2024-08-02T14:00:00', end: '2024-08-02T14:30:00', doctor: 'Dr. Brown' }
  ]);

  const [dialogVisible, setDialogVisible] = useState(false);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [currentEvent, setCurrentEvent] = useState({ id: null, title: '', doctor: '', start: '', end: '' });
  const [isEditMode, setIsEditMode] = useState(false);

  const openDialog = (event, isEdit = false) => {
    if (isEdit) {
      setIsEditMode(true);
      setCurrentEvent(event);
    } else {
      setIsEditMode(false);
      const startTime = event.dateStr;
      const endTime = new Date(new Date(startTime).getTime() + 30 * 60 * 1000).toISOString(); // 30 minutes later
      setCurrentEvent({ id: null, title: '', doctor: '', start: startTime, end: endTime });
    }
    setDialogVisible(true);
  };

  const closeDialog = () => {
    setDialogVisible(false);
    setCurrentEvent({ id: null, title: '', doctor: '', start: '', end: '' });
  };

  const handleSave = () => {
    if (isEditMode) {
      setEvents(events.map(e => (e.id === currentEvent.id ? currentEvent : e)));
    } else {
      const newEvent = { ...currentEvent, id: events.length + 1 };
      setEvents([...events, newEvent]);
    }
    closeDialog();
  };

  const handleDateClick = (arg) => {
    openDialog(arg);
  };

  const handleEventClick = (info) => {
    const event = {
      id: parseInt(info.event.id),
      title: info.event.title,
      doctor: info.event.extendedProps.doctor,
      start: info.event.start.toISOString(),
      end: info.event.end ? info.event.end.toISOString() : ''
    };
    openDialog(event, true);
  };

  const handleEventRemove = (info) => {
    setCurrentEvent({
      id: parseInt(info.event.id),
      title: info.event.title,
      doctor: info.event.extendedProps.doctor,
      start: info.event.start.toISOString(),
      end: info.event.end ? info.event.end.toISOString() : ''
    });
    setDeleteConfirmVisible(true);
  };

  const confirmDelete = () => {
    setEvents(events.filter(e => e.id !== currentEvent.id));
    closeDeleteConfirm();
  };

  const closeDeleteConfirm = () => {
    setDeleteConfirmVisible(false);
    setCurrentEvent({ id: null, title: '', doctor: '', start: '', end: '' });
  };

  return (
    <div>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        events={events}
        dateClick={handleDateClick}
        eventClick={handleEventClick}
        eventRemove={handleEventRemove}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        }}
      />

      <Dialog
        header={isEditMode ? 'Edit Event' : 'Add Event'}
        visible={dialogVisible}
        onHide={closeDialog}
        footer={
          <div>
            <Button label="Save" icon="pi pi-check" onClick={handleSave} />
            <Button label="Cancel" icon="pi pi-times" onClick={closeDialog} className="p-button-secondary" />
          </div>
        }
      >
        <div className="p-field">
          <label htmlFor="title">Title:</label>
          <input
            id="title"
            type="text"
            value={currentEvent.title}
            onChange={(e) => setCurrentEvent({ ...currentEvent, title: e.target.value })}
            className="p-inputtext p-component"
          />
        </div>
        <div className="p-field">
          <label htmlFor="doctor">Doctor:</label>
          <input
            id="doctor"
            type="text"
            value={currentEvent.doctor}
            onChange={(e) => setCurrentEvent({ ...currentEvent, doctor: e.target.value })}
            className="p-inputtext p-component"
          />
        </div>
      </Dialog>

      <Dialog
        header="Confirm Deletion"
        visible={deleteConfirmVisible}
        onHide={closeDeleteConfirm}
        footer={
          <div>
            <Button label="Yes" icon="pi pi-check" onClick={confirmDelete} />
            <Button label="No" icon="pi pi-times" onClick={closeDeleteConfirm} className="p-button-secondary" />
          </div>
        }
      >
        <p>Êtes-vous sûr de vouloir supprimer l'événement '{currentEvent.title}' ?</p>
      </Dialog>
    </div>
  );
};

export default DoctorScheduler;
