import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import SidebarNav from '../page/rentaler/SidebarNav';
import Nav from '../page/rentaler/Nav';
import '../assets/css/app.css';

const RentalerLayout = ({ authenticated, role, currentUser, onLogout }) => {
  if (!authenticated) {
    return <Navigate to="/login-rentaler" />;
  }

  if (role !== 'ROLE_RENTALER' && role !== 'ROLE_ADMIN') {
    return <Navigate to="/" />;
  }

  return (
    <div className="wrapper">
      <nav id="sidebar" className="sidebar js-sidebar">
        <div className="sidebar-content js-simplebar">
          <a className="sidebar-brand" href="/rentaler">
            <span className="align-middle">RENTALER PRO</span>
          </a>
          <SidebarNav />
        </div>
      </nav>

      <div className="main">
        <Nav onLogout={onLogout} currentUser={currentUser} />
        <main style={{ margin: "20px" }}>
          <div className="container-fluid p-0">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default RentalerLayout;
