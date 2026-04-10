import { Navigate, useParams } from "react-router-dom";
import {
  getAccountById,
  setAuthorization,
} from "../../services/fetch/ApiUtils";
import { useEffect, useState } from "react";
import SidebarNav from "./SidebarNav";
import Nav from "./Nav";
import { toast } from "react-toastify";

const Authorization = (props) => {

  const { authenticated, role, currentUser, location, onLogout } = props;
  const { userId } = useParams();

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [roleId, setRoleId] = useState(1);
  const [imageUrl, setImageUrl] = useState();
  const [roleName, setRoleName] = useState();

  const handleSubmit = (event) => {
    event.preventDefault();
    let roleRequest = "";
    if (roleId === 1) {
      roleRequest = { roleName: "USER" };
    } else {
      roleRequest = { roleName: "RENTALER" };
    }

    setAuthorization(userId, roleRequest)
      .then((response) => {
        toast.success(response.message);
      })
      .catch((error) => {
        toast.error(
          (error && error.message) ||
            "Oops! Có điều gì đó xảy ra. Vui lòng thử lại!",
        );
      });
  };

  useEffect(() => {
    getAccountById(userId)
      .then((response) => {
        setEmail(response.email);
        setName(response.name);
        setAddress(response.address);
        setImageUrl(response.imageUrl);
        setPhone(response.phone);
        setRoleName(response.roles[0].name);
        console.log(response);
      })
      .catch((error) => {
        toast.error(
          (error && error.message) ||
            "Oops! Có điều gì đó xảy ra. Vui lòng thử lại!",
        );
      });
  }, [userId]);

  if (!authenticated) {
    return (
      <Navigate
        to={{
          pathname: "/login-admin",
          state: { from: location },
        }}
      />
    );
  }

  console.log("ID", userId);

  return (
    <>
      <style>{`
        .eco-card {
          background: #ffffff; border-radius: 16px; box-shadow: 0 4px 20px rgba(59, 130, 246, 0.05);
          border: 1px solid #EFF6FF; overflow: hidden; margin-bottom: 24px;
        }

        .eco-card-header {
          background-color: #ffffff; padding: 20px 30px 15px 30px; border-bottom: 1px solid #EFF6FF;
        }

        .eco-form-label {
          font-size: 0.85rem; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; display: block;
        }

        .eco-input-field {
          background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; padding: 12px 16px; font-size: 0.95rem; color: #1E293B; transition: all 0.3s; width: 100%;
        }

        .eco-input-field:disabled {
          background-color: #F1F5F9; color: #94A3B8; cursor: not-allowed; border-color: #E2E8F0;
        }

        .eco-input-field:focus:not(:disabled) {
          background-color: #ffffff; border-color: #3B82F6; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1); outline: none;
        }

        .eco-btn-primary {
          background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%); color: #ffffff; font-weight: 600; font-size: 1rem;
          padding: 12px 30px; border-radius: 10px; border: none; box-shadow: 0 4px 15px rgba(59, 130, 246, 0.25);
          transition: all 0.3s ease; display: inline-flex; align-items: center; justify-content: center; gap: 8px;
        }
        .eco-btn-primary:hover {
          transform: translateY(-2px); box-shadow: 0 8px 20px rgba(59, 130, 246, 0.35); color: #ffffff;
        }

        .eco-avatar-container {
          width: 140px; height: 140px; border-radius: 50%; border: 4px solid #EFF6FF; 
          overflow: hidden; margin: 0 auto 20px auto; box-shadow: 0 4px 15px rgba(59, 130, 246, 0.15);
          background-color: #F8FAFC;
        }
        .eco-avatar-img {
          width: 100%; height: 100%; object-fit: cover;
        }
        .eco-text-avatar {
          width: 100%; height: 100%; background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%); 
          color: white; display: flex; align-items: center; justify-content: center; 
          font-size: 3.5rem; font-weight: bold; text-transform: uppercase;
        }

        .eco-role-badge {
          display: inline-block; padding: 6px 16px; border-radius: 50px; font-size: 0.85rem; font-weight: 700;
          background-color: #EFF6FF; color: #3B82F6; border: 1px solid #BFDBFE;
        }
        .eco-role-admin { background-color: #FFF1F2; color: #E11D48; border-color: #FECDD3; }
        .eco-role-rentaler { background-color: #FEF3C7; color: #D97706; border-color: #FDE68A; }
      `}</style>

      <div className="container-fluid p-0">
        <h1 className="h3 mb-4 fw-bold text-dark d-flex align-items-center">
          <i className="bi bi-person-gear me-2" style={{ color: "#3B82F6", fontSize: "1.8rem" }}></i>
          Phân quyền tài khoản
        </h1>

        <div className="row">
          {/* CỘT TRÁI: THÔNG TIN PROFILE NGẮN GỌN */}
          <div className="col-12 col-xl-4 mb-4 mb-xl-0">
            <div className="eco-card h-100 text-center py-5">
              <div className="eco-avatar-container">
                {imageUrl ? (
                  <img src={imageUrl} alt={currentUser?.name || "Avatar"} className="eco-avatar-img" />
                ) : (
                  <div className="eco-text-avatar">
                    <span>{name ? name[0] : "?"}</span>
                  </div>
                )}
              </div>
              <h4 className="fw-bold text-dark mb-1">{name || "Đang tải..."}</h4>
              <p className="text-muted mb-3">{email || "..."}</p>
              
              <div className={`eco-role-badge ${roleName === "ROLE_ADMIN" ? "eco-role-admin" : roleName === "ROLE_RENTALER" ? "eco-role-rentaler" : ""}`}>
                {roleName === "ROLE_RENTALER"
                  ? "Người cho thuê"
                  : roleName === "ROLE_ADMIN"
                  ? "Quản trị viên"
                  : "Khách hàng"}
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: FORM CHỈNH SỬA & PHÂN QUYỀN */}
          <div className="col-12 col-xl-8">
            <div className="eco-card">
              <div className="eco-card-header">
                <h5 className="fw-bold text-dark mb-0">Thiết lập quyền hạn</h5>
              </div>
              <div className="card-body p-4 p-md-5">
                <form onSubmit={handleSubmit}>
                  
                  <div className="row g-4 mb-4">
                    <div className="col-md-6">
                      <label className="eco-form-label">Email</label>
                      <input
                        type="email"
                        className="eco-input-field"
                        name="email"
                        placeholder="Email"
                        disabled
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="eco-form-label">Số điện thoại</label>
                      <input
                        type="text"
                        className="eco-input-field"
                        name="phone"
                        placeholder="Số điện thoại"
                        disabled
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="eco-form-label">Họ và Tên</label>
                    <input
                      type="text"
                      className="eco-input-field"
                      name="name"
                      placeholder="Họ và Tên"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled
                    />
                  </div>

                  <div className="mb-4">
                    <label className="eco-form-label">Địa chỉ</label>
                    <input
                      type="text"
                      className="eco-input-field"
                      name="address"
                      placeholder="Địa chỉ"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      disabled
                    />
                  </div>

                  <hr className="my-4" style={{borderColor: "#EFF6FF"}} />

                  {roleName === "ROLE_ADMIN" ? (
                    <div className="alert alert-warning border-0 rounded-4 d-flex align-items-center p-4" style={{backgroundColor: "#FEF3C7", color: "#B45309"}}>
                      <i className="bi bi-exclamation-triangle-fill fs-3 me-3"></i>
                      <div>
                        <strong>Lưu ý:</strong> Tài khoản Quản trị viên (Admin) là cấp quyền cao nhất và không thể bị thay đổi quyền qua form này.
                      </div>
                    </div>
                  ) : (
                    <div className="mb-4">
                      <label className="eco-form-label text-primary" style={{color: "#3B82F6"}}>Quyền Hạn Mới</label>
                      <select
                        className="eco-input-field form-select"
                        name="roleId"
                        value={roleId}
                        onChange={(e) => setRoleId(Number(e.target.value))}
                      >
                        <option value={1}>Khách hàng (User)</option>
                        <option value={3}>Người cho thuê (Rentaler)</option>
                      </select>
                    </div>
                  )}

                  {roleName !== "ROLE_ADMIN" && (
                    <div className="pt-2">
                      <button type="submit" className="eco-btn-primary w-100 mt-2">
                        <i className="bi bi-shield-check me-2"></i> Lưu Cấu Hình Phân Quyền
                      </button>
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Authorization;