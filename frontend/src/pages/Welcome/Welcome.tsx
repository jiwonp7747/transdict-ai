import React from 'react';
import './Welcome.scss';

const Welcome: React.FC = () => {
  return (
    <div className="welcome-page">
      <header className="welcome-header">
        <h1 className="welcome-title">AI Dictionary</h1>
        <p className="welcome-subtitle">Powered by Artificial Intelligence</p>
      </header>

      <main className="welcome-main">
        <div className="welcome-container">
          <h2>Welcome to AI Dictionary</h2>
          <p>Search for any word to get AI-powered definitions, examples, and more!</p>
        </div>
      </main>

      <footer className="welcome-footer">
        <p>&copy; 2024 AI Dictionary Interface. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Welcome;
