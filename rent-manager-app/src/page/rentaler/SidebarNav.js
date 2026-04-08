import React from "react";
import { NavLink } from "react-router-dom";

const SidebarNav = () => {
  return (
    <>
      <style>{`
        .eco-sidebar-wrapper {
          padding: 20px 15px;
          background-color: #ffffff;
        }
        
        .eco-sidebar-title {
          font-size: 0.75rem;
          text-transform: uppercase;
          color: #94A3B8;
          font-weight: 800;
          letter-spacing: 1px;
          margin-bottom: 15px;
          padding-left: 15px;
        }

        .eco-nav-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .eco-nav-link {
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

        .eco-nav-link i {
          font-size: 1.15rem;
          margin-right: 14px;
          color: #94A3B8;
          transition: all 0.3s ease;
        }

        /* Hiệu ứng khi lướt chuột */
        .eco-nav-link:hover {
          background-color: #F0FDF4;
          color: #10B981;
          transform: translateX(4px);
        }
        .eco-nav-link:hover i {
          color: #10B981;
        }

        /* Hiệu ứng khi đang ở trang hiện tại (Active) */
        .eco-nav-link.active {
          background-color: #10B981;
          color: #ffffff;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }
        .eco-nav-link.active i {
          color: #ffffff;
        }
      `}</style>

      <div className="eco-sidebar-wrapper">
        <div className="eco-sidebar-title">Quản lý chức năng</div>
        <ul className="eco-nav-list">
          <li>
            <NavLink to="/rentaler" end className="eco-nav-link">
              <i className="bi bi-pie-chart-fill"></i>
              <span>Thống kê</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/rentaler/room-management" className="eco-nav-link">
              <i className="bi bi-door-open-fill"></i>
              <span>Quản lý phòng KTX</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/rentaler/maintenance-management" className="eco-nav-link">
              <i className="bi bi-tools"></i>
              <span>Quản lý bảo trì</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/rentaler/contract-management" className="eco-nav-link">
              <i className="bi bi-file-earmark-text-fill"></i>
              <span>Quản lý hợp đồng</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/rentaler/request-management" className="eco-nav-link">
              <i className="bi bi-chat-left-dots-fill"></i>
              <span>Quản lý yêu cầu</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/rentaler/electric_water-management" className="eco-nav-link">
              <i className="bi bi-lightning-charge-fill"></i>
              <span>Quản lý điện nước</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/rentaler/leave-management" className="eco-nav-link">
              <i className="bi bi-calendar-x-fill"></i>
              <span>Quản lý đơn nghỉ</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/rentaler/checkout-request-management" className="eco-nav-link">
              <i className="bi bi-box-arrow-right"></i>
              <span>Quản lý trả phòng</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/rentaler/check-in-out-management" className="eco-nav-link">
              <i className="bi bi-person-check-fill"></i>
              <span>Quản lý điểm danh</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/rentaler/parking-card-management" className="eco-nav-link">
              <i className="bi bi-car-front-fill"></i>
              <span>Quản lý thẻ xe</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/rentaler/invoice-management" className="eco-nav-link">
              <i className="bi bi-receipt"></i>
              <span>Quản lý hóa đơn</span>
            </NavLink>
          </li>
        </ul>
      </div>
    </>
  );
};

export default SidebarNav;