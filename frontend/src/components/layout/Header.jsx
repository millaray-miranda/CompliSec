import React from 'react';

const Header = () => {
  return (
    <header className="app-header">
      <div className="logo-container">
        <h1>CompliSec</h1>
        <span className="badge">ISO 27001</span>
      </div>
      <nav className="main-nav">
        <ul>
          <li><a href="#dashboard">Dashboard</a></li>
          <li><a href="#controls">Controls</a></li>
          <li><a href="#assets">Assets</a></li>
          <li><a href="#reports">Reports</a></li>
        </ul>
      </nav>
      <div className="user-profile">
        <span>Admin User</span>
        <div className="avatar">A</div>
      </div>
    </header>
  );
};

export default Header;
