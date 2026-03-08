import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import Modal from 'react-modal';

// Set modal root
Modal.setAppElement('#root');

interface Event {
  id: string;
  title: string;
  start: string;
  color?: string;
}

const Calendar: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([
    {
      id: '1',
      title: 'Team Meeting',
      start: new Date().toISOString().split('T')[0],
      color: '#3788d8'
    },
    {
      id: '2',
      title: 'Lunch with Sarah',
      start: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      color: '#41b883'
    }
  ]);

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [newEventTitle, setNewEventTitle] = useState('');
  const [selectedColor, setSelectedColor] = useState('#3788d8');

  const handleDateClick = (arg: any) => {
    setSelectedDate(arg.dateStr);
    setModalIsOpen(true);
  };

  const handleEventClick = (arg: any) => {
    if (window.confirm(`Delete event "${arg.event.title}"?`)) {
      const updatedEvents = events.filter(e => e.id !== arg.event.id);
      setEvents(updatedEvents);
    }
  };

  const addEvent = () => {
    if (newEventTitle.trim()) {
      const newEvent = {
        id: Date.now().toString(),
        title: newEventTitle,
        start: selectedDate,
        color: selectedColor
      };
      setEvents([...events, newEvent]);
      setModalIsOpen(false);
      setNewEventTitle('');
    }
  };

  const colors = [
    { name: 'Blue', value: '#3788d8' },
    { name: 'Green', value: '#41b883' },
    { name: 'Red', value: '#e53e3e' },
    { name: 'Purple', value: '#9b59b6' },
    { name: 'Orange', value: '#f39c12' }
  ];

  return (
    <div>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        }}
        initialView="dayGridMonth"
        editable={true}
        selectable={true}
        events={events}
        dateClick={handleDateClick}
        eventClick={handleEventClick}
      />

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        style={{
          content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            padding: '30px',
            borderRadius: '15px',
            minWidth: '400px'
          }
        }}
      >
        <h2 style={{ marginTop: 0, color: '#333' }}>Add Event for {selectedDate}</h2>
        
        <input
          type="text"
          placeholder="Event title..."
          value={newEventTitle}
          onChange={(e) => setNewEventTitle(e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            margin: '10px 0',
            border: '2px solid #e0e0e0',
            borderRadius: '8px',
            fontSize: '16px'
          }}
        />
        
        <div style={{ margin: '15px 0' }}>
          <label style={{ display: 'block', marginBottom: '8px', color: '#666' }}>
            Choose color:
          </label>
          <div style={{ display: 'flex', gap: '10px' }}>
            {colors.map(color => (
              <button
                key={color.value}
                onClick={() => setSelectedColor(color.value)}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: color.value,
                  border: selectedColor === color.value ? '3px solid #333' : 'none',
                  cursor: 'pointer'
                }}
              />
            ))}
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
          <button
            onClick={() => setModalIsOpen(false)}
            style={{
              padding: '10px 20px',
              backgroundColor: '#e0e0e0',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            onClick={addEvent}
            style={{
              padding: '10px 20px',
              backgroundColor: '#3788d8',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Add Event
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Calendar;