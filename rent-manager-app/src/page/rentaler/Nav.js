import React from "react"
import { Link } from "react-router-dom";

const Nav = (props) => {
  const { currentUser, onLogout } = props;
  console.log("User", currentUser)

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
        .eco-navbar { background-color: #ffffff; box-shadow: 0 4px 20px rgba(0,0,0,0.03); border-bottom: 1px solid #F1F5F9; padding: 0.5rem 1.5rem; min-height: 70px; }
        
        .eco-sidebar-toggle { cursor: pointer; width: 42px; height: 42px; display: flex; align-items: center; justify-content: center; border-radius: 12px; background-color: #F8FAFC; transition: all 0.2s; border: 1px solid transparent; color: #64748B; text-decoration: none; }
        .eco-sidebar-toggle:hover { background-color: #F0FDF4; border-color: #10B981; color: #10B981; }
        
        .eco-nav-icon { width: 42px; height: 42px; display: flex; align-items: center; justify-content: center; border-radius: 50%; background-color: #F8FAFC; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); position: relative; color: #64748B; border: 1px solid #F1F5F9; }
        .eco-nav-icon:hover { background-color: #F0FDF4; color: #10B981; border-color: #D1FAE5; transform: translateY(-3px); box-shadow: 0 4px 12px rgba(16, 185, 129, 0.15); }
        
        .eco-badge-indicator { position: absolute; top: -2px; right: -2px; width: 20px; height: 20px; background-color: #EF4444; color: white; font-size: 0.7rem; font-weight: bold; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 5px rgba(239, 68, 68, 0.3); }
        
        .eco-dropdown-menu { border: none; border-radius: 16px; box-shadow: 0 10px 40px rgba(0,0,0,0.08); padding: 12px; margin-top: 15px !important; min-width: 240px; animation: dropdownFade 0.2s ease; }
        @keyframes dropdownFade { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        
        .eco-dropdown-item { border-radius: 10px; padding: 10px 16px; font-weight: 500; transition: all 0.2s; color: #475569; display: flex; align-items: center; text-decoration: none; cursor: pointer; }
        .eco-dropdown-item:hover { background-color: #F8FAFC; color: #10B981; transform: translateX(4px); }
        .eco-dropdown-item.text-danger:hover { background-color: #FEF2F2; color: #EF4444 !important; }
        
        .eco-avatar { width: 44px; height: 44px; border-radius: 14px; object-fit: cover; border: 2px solid #E2E8F0; transition: all 0.3s ease; }
        .eco-avatar-wrapper:hover .eco-avatar { border-color: #10B981; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.2); transform: scale(1.05); }
        
        .text-emerald { color: #10B981 !important; }
        .hide-caret::after { display: none !important; }
      `}</style>

      <nav className="navbar navbar-expand eco-navbar">
        <a className="sidebar-toggle js-sidebar-toggle eco-sidebar-toggle" onClick={toggleSidebar}>
          <i className="hamburger align-self-center"></i>
        </a>

        <div className="navbar-collapse collapse">
          <ul className="navbar-nav navbar-align">
            
            {/* --- DROPDOWN TIN NHẮN --- */}
            <li className="nav-item dropdown">
              <a className="nav-icon dropdown-toggle hide-caret text-decoration-none d-inline-block mt-2 me-2" href="#" id="messagesDropdown" data-bs-toggle="dropdown">
                <div className="eco-nav-icon">
                  <i className="bi bi-chat-dots-fill fs-5"></i>
                  {/* <span className="eco-badge-indicator">4</span> */}
                </div>
              </a>
              <div className="dropdown-menu dropdown-menu-lg dropdown-menu-end eco-dropdown-menu" aria-labelledby="messagesDropdown">
                {/* <div className="dropdown-menu-header border-bottom pb-3 mb-2 text-center fw-bolder text-dark fs-6">
                  <i className="bi bi-bell-fill text-warning me-2"></i>
                  4 tin nhắn mới
                </div> */}
                <div className="dropdown-menu-footer px-2 pt-1">
                  <Link className="btn bg-light text-emerald fw-bold w-100 py-2 rounded-3 shadow-sm border" to={'/rentaler/chat'}>
                    Xem tất cả tin nhắn <i className="bi bi-arrow-right ms-1"></i>
                  </Link>
                </div>
              </div>
            </li>

            {/* --- DROPDOWN NGƯỜI DÙNG --- */}
            <li className="nav-item dropdown ms-2">
              <a className="nav-link dropdown-toggle hide-caret d-flex align-items-center eco-avatar-wrapper" href="#" data-bs-toggle="dropdown">
                
                <div className="position-relative">
                  {
                    currentUser && currentUser.imageUrl ? (
                      <img src={currentUser.imageUrl} className="eco-avatar" alt={currentUser.name} />
                    ) : (
                      <img src="../../assets/img/author-2.jpg" className="eco-avatar" alt="Default Avatar" />
                    )
                  }
                  <span 
                    className="position-absolute bottom-0 end-0 bg-success border border-2 border-white rounded-circle" 
                    style={{width: '14px', height: '14px', transform: 'translate(25%, 25%)'}}
                    title="Đang hoạt động"
                  ></span>
                </div>

                {/* Tên hiển thị */}
                <span className="text-dark fw-bold ms-3 d-none d-sm-inline-flex align-items-center">
                  {currentUser === null ? "Khách" : currentUser.name}
                  <i className="bi bi-chevron-down ms-2 text-muted" style={{fontSize: "0.8rem", strokeWidth: "2px"}}></i>
                </span>
              </a>

              {/* Menu bên trong */}
              <div className="dropdown-menu dropdown-menu-end eco-dropdown-menu">
                <div className="px-3 py-2 mb-2 border-bottom d-sm-none">
                  <span className="fw-bold text-dark">{currentUser === null ? "Khách" : currentUser.name}</span>
                </div>
                
                <Link className="dropdown-item eco-dropdown-item" to={'/rentaler/profile'}>
                  <i className="bi bi-person-badge fs-5 me-3 text-primary"></i> Trang cá nhân
                </Link>
                
                <Link className="dropdown-item eco-dropdown-item" to={'/rentaler/change-password'}>
                  <i className="bi bi-shield-lock fs-5 me-3 text-warning"></i> Đổi mật khẩu
                </Link>
                
                <div className="dropdown-divider my-2 opacity-25"></div>
                
                <a className="dropdown-item eco-dropdown-item text-danger fw-bold" onClick={onLogout}>
                  <i className="bi bi-box-arrow-right fs-5 me-3"></i> Đăng xuất
                </a>
              </div>
            </li>
          </ul>
        </div>
      </nav>
    </>
  )
}

export default Nav;