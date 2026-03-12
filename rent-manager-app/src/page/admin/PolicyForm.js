import React, { useEffect, useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import SidebarNav from "./SidebarNav";
import Nav from "./Nav";
import { toast } from "react-toastify";
import {
  getPolicy,
  updatePolicy,
} from "../../services/fetch/ApiUtils";

function PolicyForm(props) {
  const { authenticated, role, currentUser, location, onLogout } = props;
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    content: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPolicy()
      .then((response) => {
        setFormData({
          title: response.title || "",
          content: response.content || "",
        });
        setLoading(false);
      })
      .catch((error) => {
        toast.error(
          (error && error.message) ||
            "Oops! Có điều gì đó xảy ra khi lấy dữ liệu. Vui lòng thử lại!",
        );
        setLoading(false);
      });
  }, []);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    updatePolicy(formData)
      .then((response) => {
        toast.success("Cập nhật nội quy thành công");
        navigate("/admin/policy-management");
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
          pathname: "/login-admin",
          state: { from: location },
        }}
      />
    );
  }

  return (
    <div className="wrapper">
      <nav id="sidebar" className="sidebar js-sidebar">
        <div className="sidebar-content js-simplebar">
          <a className="sidebar-brand" href="/">
            <span className="align-middle">ADMIN PRO</span>
          </a>
          <SidebarNav />
        </div>
      </nav>

      <div className="main">
        <Nav onLogout={onLogout} currentUser={currentUser} />

        <main className="content pt-4">
          <div className="container-fluid p-0">
            <h1 className="h3 mb-3">Cập nhật Nội quy chung</h1>

            <div className="row">
              <div className="col-12">
                <div className="card shadow-sm">
                  <div className="card-body p-4">
                    {loading ? (
                      <div className="text-center p-5">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Đang tải...</span>
                        </div>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                          <label className="form-label fw-bold">Tiêu đề nội quy</label>
                          <input
                            type="text"
                            className="form-control form-control-lg"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            required
                            placeholder="Ví dụ: NỘI QUY CHUNG CỦA KÍ TÚC XÁ"
                          />
                        </div>
                        
                        <div className="mb-4">
                          <label className="form-label fw-bold">Nội dung chi tiết</label>
                          <textarea
                            className="form-control"
                            name="content"
                            value={formData.content}
                            onChange={handleInputChange}
                            required
                            rows="20"
                            style={{fontSize: '1rem', lineHeight: '1.6'}}
                            placeholder="Nhập tất cả các điều khoản, nội quy ở đây..."
                          ></textarea>
                          <div className="form-text mt-2">
                             Mẹo: Sử dụng xuống dòng để phân tách các điều khoản rõ ràng hơn.
                          </div>
                        </div>

                        <div className="pt-3 border-top mt-4">
                          <button type="submit" className="btn btn-primary btn-lg px-5 shadow-sm">
                            Lưu cấu hình
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-secondary btn-lg ms-3 px-4"
                            onClick={() => navigate("/admin/policy-management")}
                          >
                            Quay lại
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default PolicyForm;
