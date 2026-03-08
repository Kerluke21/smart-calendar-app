import React, { useState, useEffect } from 'react';
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
  // Load events from localStorage on startup
  const [events, setEvents] = useState<Event[]>(() => {
    const savedEvents = localStorage.getItem('calendarEvents');
    if (savedEvents) {
      return JSON.parse(savedEvents);
    }
    // Default events if nothing saved
    return [
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
    ];
  });

  // Save events to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('calendarEvents', JSON.stringify(events));
    console.log('Events saved to localStorage'); // For debugging
  }, [events]);

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [newEventTitle, setNewEventTitle] = useState('');
  const [selectedColor, setSelectedColor] = useState('#3788d8');

  // Focus input when modal opens
  useEffect(() => {
    if (modalIsOpen) {
      setTimeout(() => {
        const input = document.getElementById('eventTitleInput');
        if (input) input.focus();
      }, 100);
    }
  }, [modalIsOpen]);

  const handleDateClick = (arg: any) => {
    setSelectedDate(arg.dateStr);
    setNewEventTitle('');
    setSelectedColor('#3788d8');
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addEvent();
    }
  };

  // Clear all events (for testing)
  const clearAllEvents = () => {
    if (window.confirm('Delete ALL events?')) {
      setEvents([]);
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
      <div style={{ marginBottom: '10px', textAlign: 'right' }}>
        <button
          onClick={clearAllEvents}
          style={{
            padding: '5px 10px',
            backgroundColor: '#e53e3e',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          Clear All Events
        </button>
      </div>

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
            minWidth: '400px',
            zIndex: 1000
          },
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999
          }
        }}
      >
        <h2 style={{ marginTop: 0, color: '#333' }}>Add Event for {selectedDate}</h2>
        
        <input
          id="eventTitleInput"
          type="text"
          placeholder="Event title..."
          value={newEventTitle}
          onChange={(e) => setNewEventTitle(e.target.value)}
          onKeyPress={handleKeyPress}
          style={{
            width: '100%',
            padding: '12px',
            margin: '10px 0',
            border: '2px solid #e0e0e0',
            borderRadius: '8px',
            fontSize: '16px',
            outline: 'none'
          }}
          autoFocus
        />
        
        <div style={{ margin: '15px 0' }}>
          <label style={{ display: 'block', marginBottom: '8px', color: '#666' }}>
            Choose color:
          </label>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {colors.map(color => (
              <button
                key={color.value}
                onClick={() => setSelectedColor(color.value)}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: color.value,
                  border: selectedColor === color.value ? '3px solid #333' : '2px solid white',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  cursor: 'pointer',
                  transition: 'transform 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
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
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
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
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
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