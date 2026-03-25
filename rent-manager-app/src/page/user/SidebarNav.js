import { NavLink } from "react-router-dom";

const SidebarNav = () => {
  return (
    <ul className="sidebar-nav">
      <li className="sidebar-header">Quản lí chức năng</li>
      <li className="sidebar-item">
        <NavLink to="/profile" className="sidebar-link">
          <i className="align-middle" data-feather="sliders"></i>{" "}
          <span className="align-middle">Hồ sơ cá nhân</span>
        </NavLink>
      </li>
      <li className="sidebar-item">
        <NavLink to="/room-hired" className="sidebar-link">
          <i className="align-middle" data-feather="sliders"></i>{" "}
          <span className="align-middle">Lịch sử thuê ktx</span>
        </NavLink>
      </li>
      <li className="sidebar-item">
        <NavLink to="/check-in-out-history" className="sidebar-link">
          <i className="align-middle" data-feather="sliders"></i>{" "}
          <span className="align-middle">Lịch sử điểm danh</span>
        </NavLink>
      </li>
      <li className="sidebar-item">
        <NavLink to="/register-parking-card" className="sidebar-link">
          <i className="align-middle" data-feather="sliders"></i>{" "}
          <span className="align-middle">Đăng ký gửi xe</span>
        </NavLink>
      </li>
      <li className="sidebar-item">
        <NavLink to="/parking-card-history" className="sidebar-link">
          <i className="align-middle" data-feather="list"></i>{" "}
          <span className="align-middle">Lịch sử thẻ xe</span>
        </NavLink>
      </li>
      <li className="sidebar-item">
        <NavLink to="/follow-agents" className="sidebar-link">
          <i className="align-middle" data-feather="sliders"></i>{" "}
          <span className="align-middle">Người theo dõi</span>
        </NavLink>
      </li>
      <li className="sidebar-item">
        <NavLink to="/save-blog" className="sidebar-link">
          <i className="align-middle" data-feather="sliders"></i>{" "}
          <span className="align-middle">Lưu bài đăng</span>
        </NavLink>
      </li>
      <li className="sidebar-item">
        <NavLink to="/message" className="sidebar-link">
          <i className="align-middle" data-feather="sliders"></i>{" "}
          <span className="align-middle">Tin nhắn</span>
        </NavLink>
      </li>
      <li className="sidebar-item">
        <NavLink to="/maintenance" className="sidebar-link">
          <i className="align-middle" data-feather="sliders"></i>{" "}
          <span className="align-middle">Bảo trì</span>
        </NavLink>
      </li>
      <li className="sidebar-item">
        <NavLink to="/electric-water-user" className="sidebar-link">
          <i className="align-middle" data-feather="sliders"></i>{" "}
          <span className="align-middle">Hóa đơn điện nước</span>
        </NavLink>
      </li>
      <li className="sidebar-item">
        <NavLink to="/leave-request" className="sidebar-link">
          <i className="align-middle" data-feather="sliders"></i>{" "}
          <span className="align-middle">Xin nghỉ</span>
        </NavLink>
      </li>
      <li className="sidebar-item">
        <NavLink to="/change-password" className="sidebar-link">
          <i className="align-middle" data-feather="sliders"></i>{" "}
          <span className="align-middle">Đổi mật khẩu</span>
        </NavLink>
      </li>
    </ul>
  );
};

export default SidebarNav;
