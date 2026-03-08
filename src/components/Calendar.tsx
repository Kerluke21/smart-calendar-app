import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import Modal from 'react-modal';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { saveAs } from 'file-saver';
import axios from 'axios';

Modal.setAppElement('#root');

interface Event {
  id: string;
  title: string;
  start: string;
  end?: string;
  color?: string;
  category: string;
  description?: string;
  location?: string;
  weather?: {
    temp: number;
    condition: string;
    icon: string;
  };
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
        category: 'work',
        description: 'Weekly sync with engineering team',
        location: 'Zoom'
      },
      {
        id: '2',
        title: 'Lunch with Sarah',
        start: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        color: '#41b883',
        category: 'personal',
        description: 'Catch up over coffee',
        location: 'Starbucks'
      }
    ];
  });

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });

  const [filter, setFilter] = useState<string>('all');
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDescription, setNewEventDescription] = useState('');
  const [newEventLocation, setNewEventLocation] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('work');
  const [stats, setStats] = useState({ work: 0, personal: 0, health: 0 });
  const [weatherApiKey] = useState<string>('87efb5887e7ee17e71bc4c8c0c1f5bc8');
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);

  // Save events to localStorage
  useEffect(() => {
    localStorage.setItem('calendarEvents', JSON.stringify(events));
  }, [events]);

  // Save dark mode preference
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.body.style.backgroundColor = '#1a1a1a';
    } else {
      document.body.style.backgroundColor = '#f3f4f6';
    }
  }, [darkMode]);

  // Calculate statistics
  useEffect(() => {
    const work = events.filter(e => e.category === 'work').length;
    const personal = events.filter(e => e.category === 'personal').length;
    const health = events.filter(e => e.category === 'health').length;
    setStats({ work, personal, health });
  }, [events]);

  // Filter events
  const getFilteredEvents = () => {
    if (filter === 'all') return events;
    return events.filter(e => e.category === filter);
  };

  const categoryColors = {
    work: '#3788d8',
    personal: '#41b883',
    health: '#e53e3e'
  };

  // Dark mode styles
  const darkStyles = darkMode ? {
    background: '#2d2d2d',
    color: '#ffffff',
    secondaryBackground: '#3d3d3d',
    border: '#4d4d4d',
    text: '#ffffff',
    mutedText: '#aaaaaa'
  } : {
    background: '#ffffff',
    color: '#333333',
    secondaryBackground: '#f5f5f5',
    border: '#e0e0e0',
    text: '#333333',
    mutedText: '#666666'
  };

  // Fetch weather for a location
    const fetchWeather = async (location: string, date: string) => {
    if (!location || location === 'Zoom' || location === 'Starbucks') return null;
    
    setIsLoadingWeather(true);
    try {
      console.log('Fetching weather for:', location);
      
      // Use HTTPS URLs
      const geoResponse = await axios.get(
        `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(location)}&limit=1&appid=${weatherApiKey}`
      );
      
      console.log('Geo response:', geoResponse.data);
      
      if (geoResponse.data.length === 0) {
        console.log('No location found');
        return null;
      }
      
      const { lat, lon } = geoResponse.data[0];
      console.log('Coordinates:', lat, lon);
      
      // Get weather forecast
      const weatherResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${weatherApiKey}`
      );
      
      console.log('Weather response:', weatherResponse.data);
      
      // Find forecast for the specific date
      const targetDate = new Date(date).toISOString().split('T')[0];
      console.log('Looking for date:', targetDate);
      
      // Look for any forecast on that day
      const forecast = weatherResponse.data.list.find((item: any) => 
        item.dt_txt.includes(targetDate)
      );
      
      if (forecast) {
        console.log('Found forecast:', forecast);
        return {
          temp: Math.round(forecast.main.temp),
          condition: forecast.weather[0].description,
          icon: forecast.weather[0].icon
        };
      } else {
        console.log('No forecast for that date');
        // Return first available forecast as fallback
        if (weatherResponse.data.list.length > 0) {
          const first = weatherResponse.data.list[0];
          return {
            temp: Math.round(first.main.temp),
            condition: first.weather[0].description,
            icon: first.weather[0].icon
          };
        }
      }
    } catch (error) {
      console.error('Error fetching weather:', error);
      if (axios.isAxiosError(error)) {
        console.log('API Error details:', error.response?.data);
      }
    } finally {
      setIsLoadingWeather(false);
    }
    return null;
  };

  const handleDateClick = (arg: any) => {
    setSelectedDate(arg.dateStr);
    setSelectedEvent(null);
    setNewEventTitle('');
    setNewEventDescription('');
    setNewEventLocation('');
    setSelectedCategory('work');
    setModalIsOpen(true);
  };

  const handleEventClick = (arg: any) => {
    const event = events.find(e => e.id === arg.event.id);
    if (event) {
      setSelectedEvent(event);
      setSelectedDate(event.start);
      setNewEventTitle(event.title);
      setNewEventDescription(event.description || '');
      setNewEventLocation(event.location || '');
      setSelectedCategory(event.category);
      setModalIsOpen(true);
    }
  };

  const handleEventDrop = async (arg: any) => {
    const event = events.find(e => e.id === arg.event.id);
    let weather = event?.weather;
    
    // Fetch new weather if location exists and is valid
    if (event?.location && !['Zoom', 'Starbucks'].includes(event.location)) {
      weather = await fetchWeather(event.location, arg.event.startStr.split('T')[0]) || undefined;
    }
    
    const updatedEvents = events.map(event => {
      if (event.id === arg.event.id) {
        return {
          ...event,
          start: arg.event.startStr.split('T')[0],
          end: arg.event.endStr ? arg.event.endStr.split('T')[0] : undefined,
          weather: weather
        };
      }
      return event;
    });
    setEvents(updatedEvents);
  };

  const handleEventResize = (arg: any) => {
    const updatedEvents = events.map(event => {
      if (event.id === arg.event.id) {
        return {
          ...event,
          start: arg.event.startStr.split('T')[0],
          end: arg.event.endStr.split('T')[0]
        };
      }
      return event;
    });
    setEvents(updatedEvents);
  };

  const saveEvent = async () => {
    if (newEventTitle.trim()) {
      let weather: { temp: number; condition: string; icon: string; } | undefined = undefined;
      
      // Fetch weather if location is provided and not a placeholder
      if (newEventLocation && !['Zoom', 'Starbucks'].includes(newEventLocation)) {
        weather = await fetchWeather(newEventLocation, selectedDate) || undefined;
      }
      
      if (selectedEvent) {
        const updatedEvents = events.map(event => {
          if (event.id === selectedEvent.id) {
            return {
              ...event,
              title: newEventTitle,
              description: newEventDescription,
              location: newEventLocation,
              category: selectedCategory,
              color: categoryColors[selectedCategory as keyof typeof categoryColors],
              weather: weather
            };
          }
          return event;
        });
        setEvents(updatedEvents);
      } else {
        const newEvent = {
          id: Date.now().toString(),
          title: newEventTitle,
          start: selectedDate,
          description: newEventDescription,
          location: newEventLocation,
          color: categoryColors[selectedCategory as keyof typeof categoryColors],
          category: selectedCategory,
          weather: weather
        };
        setEvents([...events, newEvent]);
      }
      setModalIsOpen(false);
      setNewEventTitle('');
      setNewEventDescription('');
      setNewEventLocation('');
    }
  };

  const deleteEvent = () => {
    if (selectedEvent && window.confirm(`Delete "${selectedEvent.title}"?`)) {
      const updatedEvents = events.filter(e => e.id !== selectedEvent.id);
      setEvents(updatedEvents);
      setModalIsOpen(false);
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(20);
    doc.text('Smart Calendar - Events Report', 14, 22);
    
    // Date
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 30);
    
    // Summary
    doc.setFontSize(12);
    doc.text('Summary:', 14, 40);
    doc.setFontSize(10);
    doc.text(`Total Events: ${events.length}`, 14, 48);
    doc.text(`Work: ${stats.work} | Personal: ${stats.personal} | Health: ${stats.health}`, 14, 56);
    
    // Events Table with Weather
    const tableData = events.map(event => [
      event.title,
      event.start,
      event.category,
      event.location || '-',
      event.weather ? `${event.weather.temp}°C ${event.weather.condition}` : '-',
      event.description || '-'
    ]);
    
    autoTable(doc, {
      head: [['Title', 'Date', 'Category', 'Location', 'Weather', 'Description']],
      body: tableData,
      startY: 65,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [102, 126, 234] }
    });
    
    doc.save('calendar-events.pdf');
  };

  const exportToCSV = () => {
    const headers = ['Title', 'Date', 'Category', 'Location', 'Weather', 'Description'];
    
    const rows = events.map(event => [
      event.title,
      event.start,
      event.category,
      event.location || '',
      event.weather ? `${event.weather.temp}°C ${event.weather.condition}` : '',
      event.description || ''
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, `calendar-events-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const exportToICal = () => {
    let icalContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Smart Calendar//EN',
      'CALSCALE:GREGORIAN'
    ];
    
    events.forEach(event => {
      const dateStr = event.start.replace(/-/g, '');
      const eventLines = [
        'BEGIN:VEVENT',
        `UID:${event.id}@smart-calendar`,
        `DTSTART:${dateStr}`,
        `SUMMARY:${event.title}${event.weather ? ` (${event.weather.temp}°C)` : ''}`,
        event.location ? `LOCATION:${event.location}` : '',
        event.description ? `DESCRIPTION:${event.description}` : '',
        `CATEGORIES:${event.category}`,
        'END:VEVENT'
      ].filter(line => line !== '');
      
      icalContent = icalContent.concat(eventLines);
    });
    
    icalContent.push('END:VCALENDAR');
    
    const blob = new Blob([icalContent.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    saveAs(blob, `calendar-${new Date().toISOString().split('T')[0]}.ics`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      saveEvent();
    }
  };

  // Weather icon mapping
  const getWeatherIcon = (iconCode: string) => {
    return `https://openweathermap.org/img/wn/${iconCode}.png`;
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      background: darkMode ? '#1a1a1a' : '#f3f4f6',
      padding: '20px',
      transition: 'all 0.3s ease'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        maxWidth: '1200px',
        margin: '0 auto 20px auto'
      }}>
        <div>
          <h1 style={{ 
            fontSize: '36px', 
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: 0
          }}>
            Smart Calendar
          </h1>
          <p style={{ color: darkMode ? '#aaaaaa' : '#666666', marginTop: '5px' }}>
            Your intelligent scheduling assistant with weather
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={exportToCSV}
            style={{
              padding: '10px 20px',
              background: '#41b883',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
            title="Export as CSV (Excel)"
          >
            📊 CSV
          </button>
          
          <button
            onClick={exportToICal}
            style={{
              padding: '10px 20px',
              background: '#e53e3e',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
            title="Export as iCal (Google/Apple Calendar)"
          >
            📅 iCal
          </button>
          
          <button
            onClick={exportToPDF}
            style={{
              padding: '10px 20px',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            📄 PDF
          </button>
          
          <button
            onClick={() => setDarkMode(!darkMode)}
            style={{
              padding: '10px 20px',
              background: darkMode ? '#ffd700' : '#333333',
              color: darkMode ? '#333333' : 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            {darkMode ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>
      </div>

      {/* Statistics Dashboard */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '15px',
        marginBottom: '20px',
        padding: '20px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '15px',
        color: 'white',
        maxWidth: '1200px',
        margin: '0 auto 20px auto'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.work}</div>
          <div style={{ fontSize: '14px', opacity: 0.9 }}>Work Events</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.personal}</div>
          <div style={{ fontSize: '14px', opacity: 0.9 }}>Personal Events</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.health}</div>
          <div style={{ fontSize: '14px', opacity: 0.9 }}>Health Events</div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div style={{
        display: 'flex',
        gap: '10px',
        marginBottom: '20px',
        justifyContent: 'center',
        flexWrap: 'wrap',
        maxWidth: '1200px',
        margin: '0 auto 20px auto'
      }}>
        <button
          onClick={() => setFilter('all')}
          style={{
            padding: '8px 20px',
            borderRadius: '25px',
            border: 'none',
            background: filter === 'all' ? '#667eea' : (darkMode ? '#3d3d3d' : '#e0e0e0'),
            color: filter === 'all' ? 'white' : (darkMode ? '#ffffff' : '#333'),
            cursor: 'pointer',
            fontWeight: 'bold'
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
            background: filter === 'work' ? '#3788d8' : (darkMode ? '#3d3d3d' : '#e0e0e0'),
            color: filter === 'work' ? 'white' : (darkMode ? '#ffffff' : '#333'),
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
            background: filter === 'personal' ? '#41b883' : (darkMode ? '#3d3d3d' : '#e0e0e0'),
            color: filter === 'personal' ? 'white' : (darkMode ? '#ffffff' : '#333'),
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
            background: filter === 'health' ? '#e53e3e' : (darkMode ? '#3d3d3d' : '#e0e0e0'),
            color: filter === 'health' ? 'white' : (darkMode ? '#ffffff' : '#333'),
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Health 🏥
        </button>
      </div>

      {/* Calendar Container with Weather Icons */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        background: darkStyles.background,
        borderRadius: '15px',
        padding: '20px',
        boxShadow: darkMode ? '0 10px 40px rgba(0,0,0,0.3)' : '0 10px 40px rgba(0,0,0,0.1)',
        color: darkStyles.text,
        transition: 'all 0.3s ease'
      }}>
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
          events={getFilteredEvents().map(event => ({
            ...event,
            title: event.weather 
              ? `${event.title} (${event.weather.temp}°C)` 
              : event.title
          }))}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          eventDrop={handleEventDrop}
          eventResize={handleEventResize}
          droppable={true}
          height="auto"
          eventContent={(arg) => {
            const event = events.find(e => e.id === arg.event.id);
            return (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '2px' }}>
                {event?.weather && (
                  <img 
                    src={getWeatherIcon(event.weather.icon)} 
                    alt={event.weather.condition}
                    style={{ width: '18px', height: '18px' }}
                  />
                )}
                <span style={{ fontSize: '12px' }}>{arg.event.title}</span>
              </div>
            );
          }}
        />
      </div>

      {/* Add/Edit Event Modal */}
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
            minWidth: '500px',
            maxWidth: '90%',
            background: darkStyles.background,
            color: darkStyles.text,
            border: `1px solid ${darkStyles.border}`
          },
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            zIndex: 1000
          }
        }}
      >
        <h2 style={{ marginTop: 0, color: darkStyles.text }}>
          {selectedEvent ? 'Edit Event' : `Add Event for ${selectedDate}`}
        </h2>
        
        <input
          type="text"
          placeholder="Event title *"
          value={newEventTitle}
          onChange={(e) => setNewEventTitle(e.target.value)}
          onKeyPress={handleKeyPress}
          style={{
            width: '100%',
            padding: '12px',
            margin: '10px 0',
            border: `2px solid ${darkStyles.border}`,
            borderRadius: '8px',
            fontSize: '16px',
            background: darkStyles.secondaryBackground,
            color: darkStyles.text
          }}
          autoFocus
        />
        
        <input
          type="text"
          placeholder="City for weather (e.g., Vancouver, London, Tokyo)"
          value={newEventLocation}
          onChange={(e) => setNewEventLocation(e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            margin: '10px 0',
            border: `2px solid ${darkStyles.border}`,
            borderRadius: '8px',
            fontSize: '16px',
            background: darkStyles.secondaryBackground,
            color: darkStyles.text
          }}
        />
        
        {isLoadingWeather && (
          <div style={{ 
            textAlign: 'center', 
            padding: '10px', 
            color: darkStyles.mutedText,
            fontSize: '14px'
          }}>
            Loading weather...
          </div>
        )}
        
        <textarea
          placeholder="Description (optional)"
          value={newEventDescription}
          onChange={(e) => setNewEventDescription(e.target.value)}
          rows={3}
          style={{
            width: '100%',
            padding: '12px',
            margin: '10px 0',
            border: `2px solid ${darkStyles.border}`,
            borderRadius: '8px',
            fontSize: '16px',
            fontFamily: 'inherit',
            background: darkStyles.secondaryBackground,
            color: darkStyles.text
          }}
        />
        
        <div style={{ margin: '15px 0' }}>
          <label style={{ display: 'block', marginBottom: '8px', color: darkStyles.mutedText }}>
            Category:
          </label>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setSelectedCategory('work')}
              style={{
                flex: 1,
                padding: '10px',
                background: selectedCategory === 'work' ? '#3788d8' : darkStyles.secondaryBackground,
                color: selectedCategory === 'work' ? 'white' : darkStyles.text,
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                minWidth: '80px'
              }}
            >
              Work 💼
            </button>
            <button
              onClick={() => setSelectedCategory('personal')}
              style={{
                flex: 1,
                padding: '10px',
                background: selectedCategory === 'personal' ? '#41b883' : darkStyles.secondaryBackground,
                color: selectedCategory === 'personal' ? 'white' : darkStyles.text,
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                minWidth: '80px'
              }}
            >
              Personal 🏠
            </button>
            <button
              onClick={() => setSelectedCategory('health')}
              style={{
                flex: 1,
                padding: '10px',
                background: selectedCategory === 'health' ? '#e53e3e' : darkStyles.secondaryBackground,
                color: selectedCategory === 'health' ? 'white' : darkStyles.text,
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                minWidth: '80px'
              }}
            >
              Health 🏥
            </button>
          </div>
        </div>

        {selectedEvent?.weather && (
          <div style={{
            padding: '15px',
            background: darkStyles.secondaryBackground,
            borderRadius: '8px',
            margin: '15px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '15px'
          }}>
            <img 
              src={getWeatherIcon(selectedEvent.weather.icon)} 
              alt={selectedEvent.weather.condition}
              style={{ width: '40px', height: '40px' }}
            />
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '18px' }}>
                {selectedEvent.weather.temp}°C
              </div>
              <div style={{ color: darkStyles.mutedText, textTransform: 'capitalize' }}>
                {selectedEvent.weather.condition}
              </div>
            </div>
          </div>
        )}
        
        <div style={{ 
          display: 'flex', 
          gap: '10px', 
          justifyContent: 'flex-end', 
          marginTop: '20px',
          borderTop: `1px solid ${darkStyles.border}`,
          paddingTop: '20px'
        }}>
          {selectedEvent && (
            <button
              onClick={deleteEvent}
              style={{
                padding: '10px 20px',
                backgroundColor: '#e53e3e',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                marginRight: 'auto'
              }}
            >
              Delete
            </button>
          )}
          <button
            onClick={() => setModalIsOpen(false)}
            style={{
              padding: '10px 20px',
              backgroundColor: darkStyles.secondaryBackground,
              color: darkStyles.text,
              border: `1px solid ${darkStyles.border}`,
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            onClick={saveEvent}
            style={{
              padding: '10px 20px',
              backgroundColor: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            {selectedEvent ? 'Update' : 'Add'} Event
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Calendar;