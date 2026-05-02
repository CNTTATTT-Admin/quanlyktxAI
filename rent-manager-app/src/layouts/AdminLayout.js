import React from 'react';
import { Outlet, Navigate, Link } from 'react-router-dom';
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
    <>
      <style>{`
        /* Ghi đè giao diện Sidebar mặc định */
        .admin-sidebar {
          background-color: #ffffff !important;
          border-right: 1px solid #E2E8F0;
          box-shadow: 4px 0 24px rgba(0, 0, 0, 0.02) !important;
        }
        
        /* Chỉnh lại Header/Brand của Sidebar */
        .admin-sidebar-brand {
          display: flex;
          align-items: center;
          padding: 24px 20px;
          font-size: 1.25rem;
          font-weight: 800;
          color: #0F172A !important;
          text-decoration: none;
          letter-spacing: 0.5px;
          border-bottom: 1px solid #F1F5F9;
          transition: all 0.3s ease;
        }
        
        .admin-sidebar-brand:hover {
          color: #3B82F6 !important;
        }
        
        /* Icon Logo nổi bật */
        .admin-brand-icon {
          background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
          color: white;
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          margin-right: 12px;
          font-size: 1.2rem;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
          transition: transform 0.3s ease;
        }
        
        .admin-sidebar-brand:hover .admin-brand-icon {
          transform: scale(1.05) rotate(-5deg);
        }

        .admin-brand-text {
          background: linear-gradient(to right, #3B82F6, #2563EB);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .admin-main-wrapper {
          background-color: #F8FAFC !important;
          min-height: 100vh;
        }
      `}</style>

      <div className="wrapper">
        <nav id="sidebar" className="sidebar js-sidebar admin-sidebar">
          <div className="sidebar-content js-simplebar" style={{ backgroundColor: "#ffffff" }}>
            <Link className="admin-sidebar-brand" to="/admin">
              <div className="admin-brand-icon">
                <i className="bi bi-shield-check"></i>
              </div>
              <span className="align-middle">
                ADMIN <span className="admin-brand-text">PRO</span>
              </span>
            </Link>
            <SidebarNav />
          </div>
        </nav>

        <div className="main admin-main-wrapper">
          <Nav onLogout={onLogout} currentUser={currentUser} />
          <main style={{ margin: "20px" }}>
            <div className="container-fluid p-0">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default AdminLayout;
