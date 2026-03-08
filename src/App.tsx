import React from 'react';
import Calendar from './components/Calendar';

function App() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <header style={{ 
        background: 'white', 
        padding: '20px 30px',
        borderRadius: '15px 15px 0 0',
        maxWidth: '1200px',
        margin: '0 auto',
        boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
      }}>
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
        <p style={{ color: '#666', marginTop: '5px' }}>
          Your intelligent scheduling assistant
        </p>
      </header>
      <main style={{
        maxWidth: '1200px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '0 0 15px 15px',
        padding: '20px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
      }}>
        <Calendar />
      </main>
    </div>
  );
}

export default App;