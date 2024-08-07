import React from 'react';
import CryptoDashboard from './CryptoDashboard';

const HomePage = () => {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem', color: '#333' }}>
        Cryptocurrency Dashboard
      </h1>
      <div style={{ backgroundColor: 'white', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', borderRadius: '8px', padding: '20px', marginBottom: '1rem' }}>
        <p style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>
          Welcome to your cryptocurrency dashboard. Here you can view the latest
          information on various cryptocurrencies and their performance over the last 24 hours.
        </p>
        <CryptoDashboard />
      </div>
      <div style={{ fontSize: '0.875rem', color: '#666' }}>
        Data is updated every 5 minutes. Last updated: {new Date().toLocaleString()}
      </div>
    </div>
  );
};

export default HomePage;