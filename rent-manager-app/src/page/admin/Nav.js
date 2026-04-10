import React from "react";

const Nav = (props) => {
  const { currentUser, onLogout } = props;

  const toggleSidebar = (e) => {
    e.preventDefault();
    const sidebar = document.getElementById("sidebar") || document.querySelector(".sidebar");
    if (sidebar) {
      sidebar.classList.toggle("collapsed");
    }
  };

  return (
    <>
      <style>{`
        .admin-topbar {
          background: linear-gradient(90deg, #ffffff 0%, #f8fbff 100%) !important;
          border-bottom: 1px solid #e2e8f0;
          box-shadow: 0 4px 14px rgba(15, 23, 42, 0.04);
          min-height: 64px;
          padding: 0 10px;
        }

        .admin-topbar .sidebar-toggle {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: #1d4ed8;
          transition: all 0.2s ease;
          border: 1px solid transparent;
        }

        .admin-topbar .sidebar-toggle:hover {
          background: #eff6ff;
          border-color: #bfdbfe;
          transform: translateY(-1px);
        }

        .admin-topbar .nav-link {
          border-radius: 999px;
          padding: 6px 12px !important;
          border: 1px solid #dbeafe;
          background: #ffffff;
          box-shadow: 0 6px 14px rgba(37, 99, 235, 0.08);
          transition: all 0.2s ease;
          display: inline-flex !important;
          align-items: center;
          gap: 8px;
        }

        .admin-topbar .nav-link:hover {
          background: #eff6ff;
          border-color: #93c5fd;
        }

        .admin-topbar .avatar {
          width: 32px;
          height: 32px;
          object-fit: cover;
          border: 2px solid #dbeafe;
          box-shadow: 0 4px 10px rgba(37, 99, 235, 0.18);
        }

        .admin-topbar .user-name {
          color: #0f172a;
          font-weight: 700;
          font-size: 0.86rem;
          max-width: 180px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .admin-topbar .dropdown-menu {
          border: 1px solid #dbeafe;
          border-radius: 12px;
          box-shadow: 0 14px 24px rgba(15, 23, 42, 0.12);
          padding: 6px;
        }

        .admin-topbar .dropdown-item {
          border-radius: 8px;
          font-weight: 600;
          color: #334155;
          transition: all 0.2s ease;
          cursor: pointer;
        }

        .admin-topbar .dropdown-item:hover {
          background: #eff6ff;
          color: #1d4ed8;
        }
      `}</style>

      <nav className="navbar navbar-expand navbar-light navbar-bg admin-topbar">
        <a className="sidebar-toggle js-sidebar-toggle" onClick={toggleSidebar}>
          <i className="hamburger align-self-center"></i>
        </a>

        <div className="navbar-collapse collapse">
          <ul className="navbar-nav navbar-align">
            <li className="nav-item dropdown">
              <a
                className="nav-icon dropdown-toggle d-inline-block d-sm-none"
                href="#"
                data-bs-toggle="dropdown"
              >
                <i className="align-middle" data-feather="settings"></i>
              </a>

              <a
                className="nav-link dropdown-toggle d-none d-sm-inline-block"
                href="#"
                data-bs-toggle="dropdown"
              >
                {currentUser && currentUser.imageUrl ? (
                  <img
                    src={currentUser.imageUrl}
                    className="avatar img-fluid rounded me-1"
                    alt={currentUser.name}
                  />
                ) : (
                  <img
                    src="../../assets/img/author-2.jpg"
                    className="avatar img-fluid rounded me-1"
                    alt="Charles Hall"
                  />
                )}

                <span className="user-name">
                  {currentUser === null ? "" : currentUser.name}
                </span>
              </a>
              <div className="dropdown-menu dropdown-menu-end">
                <div className="dropdown-divider"></div>
                <a className="dropdown-item" onClick={onLogout}>
                  Đăng xuất
                </a>
              </div>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
};

export default Nav;
