"use client";
import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import axios from 'axios';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

const DoctorScheduler = () => {
  const [events, setEvents] = useState([]);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [currentEvent, setCurrentEvent] = useState({ id: '', title: '', doctor: '', start: '', end: '' });
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    // Fetch events when the component mounts
    const fetchEvents = async () => {
      try {
        const response = await axios.get('/api/events');
        setEvents(response.data);
      } catch (error) {
        console.error('Failed to fetch events:', error);
      }
    };
    fetchEvents();
  }, []);

  const openDialog = (event, isEdit = false) => {
    setIsEditMode(isEdit);
    setCurrentEvent(event);
    setDialogVisible(true);
  };

  const closeDialog = () => {
    setDialogVisible(false);
    setCurrentEvent({ id: '', title: '', doctor: '', start: '', end: '' });
  };

  const handleSave = async () => {
    try {
      if (isEditMode) {
        await axios.put(`/api/events?id=${currentEvent.id}`, currentEvent);
        setEvents(events.map(e => (e.id === currentEvent.id ? currentEvent : e)));
      } else {
        const response = await axios.post('/api/events', currentEvent);
        setEvents([...events, response.data]);
      }
      closeDialog();
    } catch (error) {
      console.error('Failed to save event:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/events?id=${currentEvent.id}`);
      setEvents(events.filter(e => e.id !== currentEvent.id));
      closeDialog();
    } catch (error) {
      console.error('Failed to delete event:', error);
    }
  };

  const handleDateClick = (arg) => {
    openDialog({
      id: '', // empty ID for new event
      title: '',
      doctor: '',
      start: arg.dateStr,
      end: new Date(new Date(arg.dateStr).getTime() + 30 * 60 * 1000).toISOString(), // 30 minutes later
    }, false);
  };

  const handleEventClick = (info) => {
    const event = {
      id: info.event.id,
      title: info.event.title,
      doctor: info.event.extendedProps.doctor || '',
      start: info.event.start.toISOString(),
      end: info.event.end ? info.event.end.toISOString() : ''
    };
    openDialog(event, true);
  };

  const handleEventRemove = (info) => {
    setCurrentEvent({
      id: info.event.id,
      title: info.event.title,
      doctor: info.event.extendedProps.doctor || '',
      start: info.event.start.toISOString(),
      end: info.event.end ? info.event.end.toISOString() : ''
    });
    setDeleteConfirmVisible(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`/api/events?id=${currentEvent.id}`);
      setEvents(events.filter(e => e.id !== currentEvent.id));
    } catch (error) {
      console.error('Failed to delete event:', error);
    }
    closeDeleteConfirm();
  };

  const closeDeleteConfirm = () => {
    setDeleteConfirmVisible(false);
    setCurrentEvent({ id: '', title: '', doctor: '', start: '', end: '' });
  };

  const eventContent = (eventInfo) => {
    return (
      <div>
        <div>{eventInfo.event.title}</div>
        {eventInfo.event.extendedProps.doctor && (
          <div style={{ fontSize: '0.75em', color: '#666' }}>
            ({eventInfo.event.extendedProps.doctor})
          </div>
        )}
      </div>
    );
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
        views={{
          timeGridDay: {
            visibleRange: {
              start: '08:00:00',
              end: '17:00:00'
            }
          }
        }}
        slotMinTime="08:00:00" // Sets the minimum time visible on the time grid
        slotMaxTime="17:00:00" // Sets the maximum time visible on the time grid
        eventContent={eventContent} // Use the custom event content renderer
      />

      <Dialog
        header={isEditMode ? 'Edit Event' : 'Add Event'}
        visible={dialogVisible}
        onHide={closeDialog}
        footer={
          <div>
            {isEditMode && (
              <Button label="Delete" icon="pi pi-trash" onClick={handleDelete} className="p-button-danger" />
            )}
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
        <div className="p-field">
          <label htmlFor="start">Start Date and Time:</label>
          <input
            id="start"
            type="datetime-local"
            value={currentEvent.start.slice(0, 16)}
            onChange={(e) => setCurrentEvent({ ...currentEvent, start: e.target.value })}
            className="p-inputtext p-component"
          />
        </div>
        <div className="p-field">
          <label htmlFor="end">End Date and Time:</label>
          <input
            id="end"
            type="datetime-local"
            value={currentEvent.end.slice(0, 16)}
            onChange={(e) => setCurrentEvent({ ...currentEvent, end: e.target.value })}
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
        <p>Are you sure you want to delete the event '{currentEvent.title}'?</p>
      </Dialog>
    </div>
  );
};

export default DoctorScheduler;
