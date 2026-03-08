import React from 'react';
import Calendar from './components/Calendar';

function App() {
  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6' }}>
      <header style={{ background: 'white', padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#111827' }}>
          Smart Calendar
        </h1>
      </header>
      <main>
        <Calendar />
      </main>
    </div>
  );
}

export default App;