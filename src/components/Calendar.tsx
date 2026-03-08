import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

const Calendar: React.FC = () => {
  const events = [
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

  return (
    <div style={{ padding: '20px' }}>
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
      />
    </div>
  );
};

export default Calendar;