import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import Modal from 'react-modal';

Modal.setAppElement('#root');

interface Event {
  id: string;
  title: string;
  start: string;
  color?: string;
  category: string;
}

const Calendar: React.FC = () => {
  const [events, setEvents] = useState<Event[]>(() => {
    const savedEvents = localStorage.getItem('calendarEvents');
    if (savedEvents) {
      return JSON.parse(savedEvents);
    }
    return [
      {
        id: '1',
        title: 'Team Meeting',
        start: new Date().toISOString().split('T')[0],
        color: '#3788d8',
        category: 'work'
      },
      {
        id: '2',
        title: 'Lunch with Sarah',
        start: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        color: '#41b883',
        category: 'personal'
      },
      {
        id: '3',
        title: 'Doctor Appointment',
        start: new Date(Date.now() + 172800000).toISOString().split('T')[0],
        color: '#e53e3e',
        category: 'health'
      }
    ];
  });

  const [filter, setFilter] = useState<string>('all');
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [newEventTitle, setNewEventTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('work');
  const [stats, setStats] = useState({ work: 0, personal: 0, health: 0 });

  // Save events to localStorage
  useEffect(() => {
    localStorage.setItem('calendarEvents', JSON.stringify(events));
  }, [events]);

  // Calculate statistics
  useEffect(() => {
    const work = events.filter(e => e.category === 'work').length;
    const personal = events.filter(e => e.category === 'personal').length;
    const health = events.filter(e => e.category === 'health').length;
    setStats({ work, personal, health });
  }, [events]);

  // Filter events based on selected category
  const getFilteredEvents = () => {
    if (filter === 'all') return events;
    return events.filter(e => e.category === filter);
  };

  // Category colors mapping
  const categoryColors = {
    work: '#3788d8',
    personal: '#41b883',
    health: '#e53e3e'
  };

  const handleDateClick = (arg: any) => {
    setSelectedDate(arg.dateStr);
    setNewEventTitle('');
    setSelectedCategory('work');
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
        color: categoryColors[selectedCategory as keyof typeof categoryColors],
        category: selectedCategory
      };
      setEvents([...events, newEvent]);
      setModalIsOpen(false);
      setNewEventTitle('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') addEvent();
  };

  const clearAllEvents = () => {
    if (window.confirm('Delete ALL events?')) {
      setEvents([]);
    }
  };

  return (
    <div>
      {/* Statistics Dashboard */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '15px',
        marginBottom: '20px',
        padding: '20px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '15px',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.work}</div>
          <div style={{ fontSize: '14px', opacity: 0.9 }}>Work Events</div>
          <div style={{ width: '50px', height: '4px', background: '#3788d8', margin: '5px auto', borderRadius: '2px' }} />
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.personal}</div>
          <div style={{ fontSize: '14px', opacity: 0.9 }}>Personal Events</div>
          <div style={{ width: '50px', height: '4px', background: '#41b883', margin: '5px auto', borderRadius: '2px' }} />
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.health}</div>
          <div style={{ fontSize: '14px', opacity: 0.9 }}>Health Events</div>
          <div style={{ width: '50px', height: '4px', background: '#e53e3e', margin: '5px auto', borderRadius: '2px' }} />
        </div>
      </div>

      {/* Filter Buttons */}
      <div style={{
        display: 'flex',
        gap: '10px',
        marginBottom: '20px',
        justifyContent: 'center'
      }}>
        <button
          onClick={() => setFilter('all')}
          style={{
            padding: '8px 20px',
            borderRadius: '25px',
            border: 'none',
            background: filter === 'all' ? '#667eea' : '#e0e0e0',
            color: filter === 'all' ? 'white' : '#333',
            cursor: 'pointer',
            fontWeight: 'bold',
            transition: 'all 0.3s'
          }}
        >
          All Events
        </button>
        <button
          onClick={() => setFilter('work')}
          style={{
            padding: '8px 20px',
            borderRadius: '25px',
            border: 'none',
            background: filter === 'work' ? '#3788d8' : '#e0e0e0',
            color: filter === 'work' ? 'white' : '#333',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Work 💼
        </button>
        <button
          onClick={() => setFilter('personal')}
          style={{
            padding: '8px 20px',
            borderRadius: '25px',
            border: 'none',
            background: filter === 'personal' ? '#41b883' : '#e0e0e0',
            color: filter === 'personal' ? 'white' : '#333',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Personal 🏠
        </button>
        <button
          onClick={() => setFilter('health')}
          style={{
            padding: '8px 20px',
            borderRadius: '25px',
            border: 'none',
            background: filter === 'health' ? '#e53e3e' : '#e0e0e0',
            color: filter === 'health' ? 'white' : '#333',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Health 🏥
        </button>
      </div>

      {/* Calendar */}
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
        events={getFilteredEvents()}
        dateClick={handleDateClick}
        eventClick={handleEventClick}
      />

      {/* Clear All Button */}
      <div style={{ marginTop: '20px', textAlign: 'right' }}>
        <button
          onClick={clearAllEvents}
          style={{
            padding: '8px 16px',
            backgroundColor: '#e53e3e',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Clear All Events
        </button>
      </div>

      {/* Add Event Modal */}
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
        <h2 style={{ marginTop: 0 }}>Add Event for {selectedDate}</h2>
        
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
            fontSize: '16px'
          }}
          autoFocus
        />
        
        <div style={{ margin: '15px 0' }}>
          <label style={{ display: 'block', marginBottom: '8px', color: '#666' }}>
            Category:
          </label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setSelectedCategory('work')}
              style={{
                flex: 1,
                padding: '10px',
                background: selectedCategory === 'work' ? '#3788d8' : '#f0f0f0',
                color: selectedCategory === 'work' ? 'white' : '#333',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Work 💼
            </button>
            <button
              onClick={() => setSelectedCategory('personal')}
              style={{
                flex: 1,
                padding: '10px',
                background: selectedCategory === 'personal' ? '#41b883' : '#f0f0f0',
                color: selectedCategory === 'personal' ? 'white' : '#333',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Personal 🏠
            </button>
            <button
              onClick={() => setSelectedCategory('health')}
              style={{
                flex: 1,
                padding: '10px',
                background: selectedCategory === 'health' ? '#e53e3e' : '#f0f0f0',
                color: selectedCategory === 'health' ? 'white' : '#333',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Health 🏥
            </button>
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
              backgroundColor: '#667eea',
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