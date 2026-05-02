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

        .eco-sidebar-brand {
          font-size: 1.5rem;
          font-weight: 900;
          color: #1E293B;
          padding-left: 15px;
          margin-bottom: 30px;
          display: flex;
          align-items: center;
        }
        
        .eco-sidebar-title {
          font-size: 0.9rem;
          color: #475569;
          font-weight: 700;
          margin-bottom: 18px;
          padding-left: 15px;
          display: flex;
          align-items: center;
        }

        .eco-sidebar-title::before {
          content: '';
          display: inline-block;
          width: 6px;
          height: 6px;
          background-color: #4F46E5;
          border-radius: 50%;
          margin-right: 10px;
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.15);
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

        .eco-nav-link:hover {
          background-color: #EEF2FF;
          color: #4F46E5; /* Chữ Indigo */
          transform: translateX(4px);
        }
        .eco-nav-link:hover i {
          color: #4F46E5; /* Icon Indigo */
        }

        .eco-nav-link.active {
          background-color: #4F46E5;
          color: #ffffff;
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
        }
        .eco-nav-link.active i {
          color: #ffffff;
        }
      `}</style>

      <div className="eco-sidebar-wrapper">
        <div className="eco-sidebar-brand">User Features</div>
        
        <div className="eco-sidebar-title">Quản lí chức năng</div>
        
        <ul className="eco-nav-list">
          <li>
            <NavLink to="/profile" className="eco-nav-link">
              <i className="bi bi-person-badge-fill"></i>
              <span>Hồ sơ cá nhân</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/room-hired" className="eco-nav-link">
              <i className="bi bi-door-open-fill"></i>
              <span>Lịch sử thuê ktx</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/check-in-out-history" className="eco-nav-link">
              <i className="bi bi-calendar-check-fill"></i>
              <span>Lịch sử điểm danh</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/register-parking-card" className="eco-nav-link">
              <i className="bi bi-car-front-fill"></i>
              <span>Đăng ký gửi xe</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/parking-card-history" className="eco-nav-link">
              <i className="bi bi-card-checklist"></i>
              <span>Lịch sử thẻ xe</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/follow-agents" className="eco-nav-link">
              <i className="bi bi-people-fill"></i>
              <span>Người theo dõi</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/save-blog" className="eco-nav-link">
              <i className="bi bi-journal-bookmark-fill"></i>
              <span>Lưu bài đăng</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/message" className="eco-nav-link">
              <i className="bi bi-chat-dots-fill"></i>
              <span>Tin nhắn</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/maintenance" className="eco-nav-link">
              <i className="bi bi-tools"></i>
              <span>Bảo trì</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/electric-water-user" className="eco-nav-link">
              <i className="bi bi-lightning-charge-fill"></i>
              <span>Hóa đơn điện nước</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/leave-request" className="eco-nav-link">
              <i className="bi bi-calendar-x-fill"></i>
              <span>Xin nghỉ</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/change-password" className="eco-nav-link">
              <i className="bi bi-shield-lock-fill"></i>
              <span>Đổi mật khẩu</span>
            </NavLink>
          </li>
        </ul>
      </div>
    </>
  );
};

export default SidebarNav;