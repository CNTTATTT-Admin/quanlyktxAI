import React, { useState, useEffect } from "react";
import Footer from "../../common/Footer";
import SidebarNav from "./SidebarNav";
import Header from "../../common/Header";
import { Navigate } from "react-router-dom";
import { toast } from "react-toastify";
import AuthService from "../../services/axios/AuthService";

const UserProfile = (props) => {

  const {
    authenticated,
    role,
    loadCurrentUser,
    currentUser,
    location,
    onLogout,
  } = props;

  const [imageFile, setImageFile] = useState(null);
  const [address, setAddress] = useState(currentUser?.address || "");
  const [phone, setPhone] = useState(currentUser?.phone || "");

  const handleAddressChange = (event) => {
    setAddress(event.target.value);
  };

  const onFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const allowedTypes = ["image/jpeg", "image/png"];
      const maxFileSize = 10 * 1024 * 1024; // 10MB

      if (!allowedTypes.includes(file.type)) {
        toast.error("Only JPEG and PNG images are allowed.");
        return;
      }
      if (file.size > maxFileSize) {
        toast.error("File size exceeds the maximum limit of 10MB.");
        return;
      }
      setImageFile(file);
    }
  };

  const handleSubmit = (event) => {
    const formData = new FormData();
    formData.append("file", imageFile);
    formData.append("address", address);
    formData.append("phone", phone);

    event.preventDefault();

    AuthService.uploadProfile(formData)
      .then((response) => {
        toast.success(response.message);
        toast.success("Cập nhật thông tin cá nhân thành công.");
        loadCurrentUser();
      })
      .catch((error) => {
        toast.error(
          (error && error.message) ||
            "Oops! Có điều gì đó xảy ra. Vui lòng thử lại!",
        );
      });
  };

  if (!authenticated) {
    return (
      <Navigate
        to={{
          pathname: "/login",
          state: { from: location },
        }}
      />
    );
  }

  return (
    <>
      <style>{`
        .eco-profile-page-bg {
          background-color: #F8FAFC;
          min-height: calc(100vh - 70px);
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          -webkit-font-smoothing: antialiased;
          display: flex;
          flex-direction: column;
        }

        .wrapper {
          display: flex;
          align-items: stretch;
          width: 100%;
          flex-grow: 1;
        }
        
        #sidebar.sidebar {
          background-color: #ffffff !important;
          position: relative !important; 
          align-self: stretch !important;
          min-height: 100% !important; 
          width: 260px !important;
          min-width: 260px !important;
          max-width: 260px !important;
          border-right: 1px solid #EEF2FF;
          z-index: 1000;
          top: auto !important; bottom: auto !important; height: auto !important; margin: 0 !important; transform: none !important;
        }

        .sidebar-content {
          position: sticky !important;
          top: 70px !important;
          height: calc(100vh - 70px) !important;
          overflow-y: auto !important;
          background-color: #ffffff !important;
          display: flex;
          flex-direction: column;
        }
        
        .sidebar-content::-webkit-scrollbar { width: 4px; }
        .sidebar-content::-webkit-scrollbar-thumb { background-color: #CBD5E1; border-radius: 4px; }

        .main {
          flex-grow: 1;
          min-width: 0;
        }

        /* UI Profile */
        .eco-profile-wrapper { padding: 40px; width: 100%; }

        .eco-profile-card {
          background: #ffffff;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(79, 70, 229, 0.05);
          border: 1px solid #EEF2FF;
          overflow: hidden;
        }

        .eco-profile-avatar-zone {
          display: flex; flex-direction: row; align-items: center; padding: 40px 50px;
          border-bottom: 1px solid #EEF2FF; background: #ffffff;
        }

        .eco-avatar-container { margin-right: 35px; flex-shrink: 0; }

        .eco-avatar-img {
          width: 140px; height: 140px; border-radius: 50%; border: 1px solid #E2E8F0;
          box-shadow: 0 8px 20px rgba(0,0,0,0.06); object-fit: cover; background-color: #ffffff;
        }

        .eco-avatar-text {
          width: 140px; height: 140px; border-radius: 50%; box-shadow: 0 8px 20px rgba(79, 70, 229, 0.15);
          background: linear-gradient(135deg, #4F46E5 0%, #4338CA 100%); color: #ffffff;
          display: flex; align-items: center; justify-content: center; font-size: 3rem; font-weight: 800;
        }

        .eco-profile-name-title { font-size: 2rem; font-weight: 800; color: #1E293B; margin-bottom: 10px; }
        .eco-profile-email-subtitle { color: #64748B; font-weight: 500; font-size: 1.1rem; display: flex; align-items: center; gap: 10px; }

        .eco-form-label { font-size: 0.9rem; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px; display: block; }
        .eco-input-field { background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; padding: 14px 18px; font-size: 1rem; color: #1E293B; transition: all 0.3s; width: 100%; }
        .eco-input-field:focus { background-color: #ffffff; border-color: #4F46E5; box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1); outline: none; }
        .eco-input-field:disabled { background-color: #F1F5F9; color: #94A3B8; cursor: not-allowed; }

        .eco-file-upload::-webkit-file-upload-button { background-color: #EEF2FF; color: #4F46E5; border: none; border-radius: 8px; padding: 8px 16px; font-weight: 600; margin-right: 15px; cursor: pointer; transition: all 0.2s; }
        .eco-file-upload::-webkit-file-upload-button:hover { background-color: #E0E7FF; }

        .eco-btn-submit {
          background: linear-gradient(135deg, #4F46E5 0%, #4338CA 100%); color: #ffffff; font-weight: 600; font-size: 1.05rem;
          padding: 14px 40px; border-radius: 12px; border: none; box-shadow: 0 4px 15px rgba(79, 70, 229, 0.25);
          transition: all 0.3s ease; display: inline-flex; align-items: center; gap: 10px;
        }
        .eco-btn-submit:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(79, 70, 229, 0.35); color: #ffffff; }
      `}</style>

      <Header
        authenticated={authenticated}
        currentUser={currentUser}
        onLogout={onLogout}
      />
      
      <div style={{ marginTop: "90px" }}></div>
      
      <main id="main" className="eco-profile-page-bg">
        <div className="wrapper">
          
          <nav id="sidebar" className="sidebar js-sidebar">
            <div className="sidebar-content js-simplebar">
              <SidebarNav />
            </div>
          </nav>

          <div className="main">
            <div className="eco-profile-wrapper">
              
              <div className="eco-profile-card mb-4">
                
                <div className="eco-profile-avatar-zone">
                  <div className="eco-avatar-container">
                    {currentUser && currentUser.imageUrl ? (
                      <img
                        src={currentUser.imageUrl}
                        alt={currentUser.name}
                        className="eco-avatar-img"
                      />
                    ) : (
                      <div className="eco-avatar-text">
                        <span>{currentUser && currentUser.name && currentUser.name[0].toUpperCase()}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-grow-1">
                    <h2 className="eco-profile-name-title">{currentUser && currentUser.name}</h2>
                    <p className="eco-profile-email-subtitle mb-0">
                      <i className="bi bi-envelope-at-fill text-indigo"></i>
                      {currentUser && currentUser.email}
                    </p>
                  </div>
                </div>

                <div className="card-body p-4 p-md-5">
                  <form onSubmit={handleSubmit}>
                    
                    <div className="row g-5 mb-4">
                      <div className="col-md-6">
                        <label className="eco-form-label">Email đăng nhập</label>
                        <input
                          type="email"
                          className="eco-input-field"
                          name="email"
                          value={currentUser && currentUser.email}
                          placeholder="Email"
                          disabled
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="eco-form-label">Số điện thoại liên hệ</label>
                        <input
                          type="text"
                          className="eco-input-field"
                          name="phone"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="Nhập số điện thoại"
                        />
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <label className="eco-form-label">Họ và Tên</label>
                      <input
                        type="text"
                        className="eco-input-field"
                        name="name"
                        value={currentUser && currentUser.name}
                        placeholder="Họ và tên"
                        disabled
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="eco-form-label">Địa chỉ hiện tại</label>
                      <input
                        type="text"
                        className="eco-input-field"
                        name="address"
                        value={address}
                        onChange={handleAddressChange}
                        placeholder="Nhập địa chỉ của bạn"
                      />
                    </div>
                    
                    <div className="mb-5">
                      <label className="eco-form-label">Cập nhật ảnh đại diện mới (Tối đa 10MB)</label>
                      <input
                        className="eco-input-field eco-file-upload p-2"
                        accept=".png, .jpeg, .jpg, image/jpeg, image/png"
                        type="file"
                        onChange={onFileChange}
                      />
                    </div>
                    
                    <hr className="mb-4 text-muted" style={{opacity: 0.1}}/>
                    
                    <div className="text-end mt-4">
                      <button type="submit" className="eco-btn-submit">
                        <i className="bi bi-cloud-arrow-up-fill me-2 fs-5"></i> Lưu thông tin hồ sơ
                      </button>
                    </div>
                  </form>
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default UserProfile;