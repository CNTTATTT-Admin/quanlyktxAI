import React, { useEffect, useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
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
    <>
      <style>{`
        /* Kế thừa phong cách EcoHome Theme cho Admin (Tone Blue #3B82F6) */
        .eco-card {
          background: #ffffff; border-radius: 16px; box-shadow: 0 4px 20px rgba(59, 130, 246, 0.05);
          border: 1px solid #EFF6FF; overflow: hidden; margin-bottom: 24px;
        }

        .eco-card-header {
          background-color: #ffffff; padding: 20px 30px; border-bottom: 1px solid #EFF6FF;
        }

        .eco-form-label {
          font-size: 0.9rem; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px; display: block;
        }

        .eco-input-field {
          background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 14px 18px; font-size: 1.05rem; color: #1E293B; transition: all 0.3s; width: 100%;
        }

        .eco-input-field:focus {
          background-color: #ffffff; border-color: #3B82F6; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1); outline: none;
        }

        /* Buttons */
        .eco-btn-primary {
          background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%); color: #ffffff; font-weight: 600; font-size: 1rem;
          padding: 12px 30px; border-radius: 10px; border: none; box-shadow: 0 4px 15px rgba(59, 130, 246, 0.25);
          transition: all 0.3s ease; display: inline-flex; align-items: center; justify-content: center; gap: 8px;
        }
        .eco-btn-primary:hover {
          transform: translateY(-2px); box-shadow: 0 8px 20px rgba(59, 130, 246, 0.35); color: #ffffff;
        }

        .eco-btn-secondary {
          background: #F8FAFC; color: #475569; font-weight: 600; font-size: 1rem;
          padding: 12px 30px; border-radius: 10px; border: 1px solid #E2E8F0;
          transition: all 0.3s ease; display: inline-flex; align-items: center; justify-content: center; gap: 8px;
        }
        .eco-btn-secondary:hover {
          background: #E2E8F0; color: #1E293B;
        }

        /* Helper text */
        .eco-form-text {
          font-size: 0.85rem; color: #64748B; margin-top: 8px; display: flex; align-items: center;
        }
      `}</style>

      <div className="container-fluid p-0">
        <h1 className="h3 mb-4 fw-bold text-dark d-flex align-items-center">
          <i className="bi bi-file-earmark-ruled me-2" style={{color: "#3B82F6", fontSize: "1.8rem"}}></i>
          Cập nhật Nội quy chung
        </h1>

        <div className="row">
          <div className="col-12 col-xl-10">
            <div className="eco-card">
              <div className="eco-card-header">
                <h5 className="fw-bold text-dark mb-0">Nội dung văn bản</h5>
              </div>
              <div className="card-body p-4 p-md-5">
                {loading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border" style={{color: "#3B82F6", width: "3rem", height: "3rem"}} role="status">
                      <span className="visually-hidden">Đang tải...</span>
                    </div>
                    <p className="text-muted mt-3 fw-semibold">Đang tải dữ liệu nội quy...</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <div className="mb-4 pb-2">
                      <label className="eco-form-label">Tiêu đề nội quy <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className="eco-input-field fw-bold"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                        placeholder="Ví dụ: NỘI QUY CHUNG CỦA KÍ TÚC XÁ"
                        style={{color: "#3B82F6"}}
                      />
                    </div>

                    <div className="mb-4">
                      <label className="eco-form-label">Nội dung chi tiết <span className="text-danger">*</span></label>
                      <textarea
                        className="eco-input-field"
                        name="content"
                        value={formData.content}
                        onChange={handleInputChange}
                        required
                        rows="20"
                        style={{ lineHeight: "1.7", resize: "vertical" }}
                        placeholder="Nhập tất cả các điều khoản, nội quy ở đây..."
                      ></textarea>
                      <div className="eco-form-text">
                        <i className="bi bi-lightbulb-fill text-warning me-2 fs-6"></i>
                        Mẹo: Sử dụng phím Enter để xuống dòng, giúp phân tách các điều khoản rõ ràng và dễ đọc hơn cho người dùng.
                      </div>
                    </div>

                    <div className="d-flex align-items-center gap-3 pt-4 mt-2 border-top" style={{borderColor: "#EFF6FF"}}>
                      <button type="submit" className="eco-btn-primary">
                        <i className="bi bi-save2-fill"></i> Lưu cấu hình
                      </button>
                      <button
                        type="button"
                        className="eco-btn-secondary"
                        onClick={() => navigate("/admin/policy-management")}
                      >
                        <i className="bi bi-arrow-left-circle"></i> Quay lại
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default PolicyForm;