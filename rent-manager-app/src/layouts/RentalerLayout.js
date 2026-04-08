import React from 'react';
import { Outlet, Navigate, Link } from 'react-router-dom';
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
    <>
      <style>{`
        /* Ghi đè giao diện Sidebar mặc định */
        .eco-sidebar {
          background-color: #ffffff !important;
          border-right: 1px solid #E2E8F0;
          box-shadow: 4px 0 24px rgba(0, 0, 0, 0.02) !important;
        }
        
        /* Chỉnh lại Header/Brand của Sidebar */
        .eco-sidebar-brand {
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
        
        .eco-sidebar-brand:hover {
          color: #10B981 !important;
        }
        
        /* Icon Logo nổi bật */
        .eco-brand-icon {
          background: linear-gradient(135deg, #10B981 0%, #059669 100%);
          color: white;
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          margin-right: 12px;
          font-size: 1.2rem;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
          transition: transform 0.3s ease;
        }
        
        .eco-sidebar-brand:hover .eco-brand-icon {
          transform: scale(1.05) rotate(-5deg);
        }

        .eco-brand-text {
          background: linear-gradient(to right, #10B981, #059669);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .eco-main-wrapper {
          background-color: #F8FAFC !important;
          min-height: 100vh;
        }
      `}</style>

      <div className="wrapper">
        <nav id="sidebar" className="sidebar js-sidebar eco-sidebar">
          <div className="sidebar-content js-simplebar" style={{ backgroundColor: "#ffffff" }}>
            <Link className="eco-sidebar-brand" to="/rentaler">
              <div className="eco-brand-icon">
                <i className="bi bi-buildings-fill"></i>
              </div>
              <span className="align-middle">
                RENTALER <span className="eco-brand-text">PRO</span>
              </span>
            </Link>
            <SidebarNav />
          </div>
        </nav>

        <div className="main eco-main-wrapper">
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

export default RentalerLayout;