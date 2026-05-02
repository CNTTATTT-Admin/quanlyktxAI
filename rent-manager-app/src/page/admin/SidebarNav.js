import React from "react";
import { NavLink } from "react-router-dom";

const SidebarNav = () => {
  return (
    <>
      <style>{`
        .admin-sidebar-wrapper {
          padding: 20px 15px;
          background-color: #ffffff;
        }
        
        .admin-sidebar-title {
          font-size: 0.9rem;
          color: #475569;
          font-weight: 700;
          margin-bottom: 18px;
          padding-left: 15px;
          display: flex;
          align-items: center;
        }

        .admin-sidebar-title::before {
          content: '';
          display: inline-block;
          width: 6px;
          height: 6px;
          background-color: #3B82F6;
          border-radius: 50%;
          margin-right: 10px;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
        }

        .admin-nav-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .admin-nav-link {
          display: flex;
          align-items: center;
          padding: 12px 18px;
          border-radius: 12px;
          color: #475569;
          text-decoration: none;
          font-weight: 600;
          font-size: 0.9rem;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .admin-nav-link i {
          font-size: 1.15rem;
          margin-right: 14px;
          color: #94A3B8;
          transition: all 0.3s ease;
        }

        /* Hiệu ứng khi lướt chuột */
        .admin-nav-link:hover {
          background-color: #EFF6FF;
          color: #3B82F6;
          transform: translateX(4px);
        }
        .admin-nav-link:hover i {
          color: #3B82F6;
        }

        /* Hiệu ứng khi đang ở trang hiện tại (Active) */
        .admin-nav-link.active {
          background-color: #3B82F6;
          color: #ffffff;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }
        .admin-nav-link.active i {
          color: #ffffff;
        }
      `}</style>

      <div className="admin-sidebar-wrapper">
        <div className="admin-sidebar-title">Quản lý chức năng</div>
        <ul className="admin-nav-list">
          <li>
            <NavLink to="/admin" end className="admin-nav-link">
              <i className="bi bi-pie-chart-fill"></i>
              <span>Thống kê</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/account-management" className="admin-nav-link">
              <i className="bi bi-person-gear"></i>
              <span>Quản lý tài khoản</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/room-management" className="admin-nav-link">
              <i className="bi bi-door-open-fill"></i>
              <span>Quản lý phòng ktx</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/banner-management" className="admin-nav-link">
              <i className="bi bi-image-fill"></i>
              <span>Quản lý Banner</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/policy-management" className="admin-nav-link">
              <i className="bi bi-file-text-fill"></i>
              <span>Nội quy chung</span>
            </NavLink>
          </li>
        </ul>
      </div>
    </>
  );
};

export default SidebarNav;
