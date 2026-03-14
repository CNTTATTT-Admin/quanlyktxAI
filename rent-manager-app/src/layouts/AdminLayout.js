import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import SidebarNav from '../page/admin/SidebarNav';
import Nav from '../page/admin/Nav';
import '../assets/css/app.css';

const AdminLayout = ({ authenticated, role, currentUser, onLogout }) => {
  if (!authenticated) {
    return <Navigate to="/login-admin" />;
  }

  if (role !== 'ROLE_ADMIN') {
    return <Navigate to="/" />;
  }

  return (
    <div className="wrapper">
      <nav id="sidebar" className="sidebar js-sidebar">
        <div className="sidebar-content js-simplebar">
          <a className="sidebar-brand" href="/admin">
            <span className="align-middle">ADMIN PRO</span>
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

export default AdminLayout;
