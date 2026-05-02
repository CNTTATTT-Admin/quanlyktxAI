import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  getBannerById,
  createBanner,
  updateBanner,
} from "../../services/fetch/ApiUtils";
import { API_BASE_URL } from "../../constants/Connect";

function BannerForm(props) {
  
  const { authenticated, role, currentUser, location, onLogout } = props;
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    url: "",
    buttonText: "NGAY ĐÂY!",
    orderIndex: 0,
    isActive: true,
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");

  useEffect(() => {
    if (isEdit) {
      getBannerById(id)
        .then((response) => {
          setFormData({
            title: response.title || "",
            subtitle: response.subtitle || "",
            url: response.url || "",
            buttonText: response.buttonText || "",
            orderIndex: response.orderIndex || 0,
            isActive: response.isActive || false,
          });
          setPreview(
            response.imageUrl
              ? API_BASE_URL + "/document/" + response.imageUrl
              : "",
          );
        })
        .catch((error) => {
          toast.error(
            (error && error.message) ||
              "Oops! Có điều gì đó xảy ra. Vui lòng thử lại!",
          );
        });
    }
  }, [id, isEdit]);

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      if (!selectedFile.type.startsWith("image/")) {
        toast.error(
          "Vui lòng chỉ chọn các định dạng hình ảnh (jpg, png, jpeg,...)!",
        );
        event.target.value = null;
        return;
      }
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const data = new FormData();
    data.append("title", formData.title);
    data.append("subtitle", formData.subtitle);
    data.append("url", formData.url);
    data.append("buttonText", formData.buttonText);
    data.append("orderIndex", formData.orderIndex);
    data.append("isActive", formData.isActive);
    if (file) {
      data.append("file", file);
    }

    const action = isEdit ? updateBanner(id, data) : createBanner(data);

    action
      .then((response) => {
        toast.success(
          isEdit ? "Cập nhật banner thành công" : "Thêm banner thành công",
        );
        navigate("/admin/banner-management");
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
        .eco-card {
          background: #ffffff; border-radius: 16px; box-shadow: 0 4px 20px rgba(79, 70, 229, 0.05);
          border: 1px solid #EEF2FF; overflow: hidden; margin-bottom: 24px;
        }

        .eco-card-header {
          background-color: #ffffff; padding: 20px 24px; border-bottom: 1px solid #EEF2FF;
        }

        .eco-form-label {
          font-size: 0.85rem; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; display: block;
        }

        .eco-input-field {
          background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; padding: 12px 16px; font-size: 0.95rem; color: #1E293B; transition: all 0.3s; width: 100%;
        }

        .eco-input-field:focus {
          background-color: #ffffff; border-color: #3B82F6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); outline: none;
        }

        .eco-file-upload::-webkit-file-upload-button {
          background-color: #EEF2FF; color: #3B82F6; border: none; border-radius: 8px; padding: 8px 16px; font-weight: 600; margin-right: 15px; cursor: pointer; transition: all 0.2s;
        }
        .eco-file-upload::-webkit-file-upload-button:hover { background-color: #E0E7FF; }

        /* Tùy chỉnh Nút Bật/Tắt (Switch) */
        .eco-switch .form-check-input {
          width: 3em; height: 1.5em; cursor: pointer; border-color: #CBD5E1; background-color: #E2E8F0;
        }
        .eco-switch .form-check-input:checked {
          background-color: #3B82F6; border-color: #3B82F6; box-shadow: 0 0 0 0.25rem rgba(59, 130, 246, 0.25);
        }
        .eco-switch .form-check-label {
          margin-top: 4px; margin-left: 10px; font-weight: 600; cursor: pointer; color: #1E293B;
        }

        .eco-btn-primary {
          background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%); color: #ffffff; font-weight: 600; font-size: 0.95rem;
          padding: 10px 24px; border-radius: 10px; border: none; box-shadow: 0 4px 15px rgba(59, 130, 246, 0.25);
          transition: all 0.3s ease; display: inline-flex; align-items: center; justify-content: center; gap: 8px;
        }
        .eco-btn-primary:hover {
          transform: translateY(-2px); box-shadow: 0 8px 20px rgba(59, 130, 246, 0.35); color: #ffffff;
        }

        .eco-btn-secondary {
          background: #F1F5F9; color: #475569; font-weight: 600; font-size: 0.95rem;
          padding: 10px 24px; border-radius: 10px; border: 1px solid #E2E8F0;
          transition: all 0.3s ease; display: inline-flex; align-items: center; justify-content: center; gap: 8px;
        }
        .eco-btn-secondary:hover {
          background: #E2E8F0; color: #1E293B;
        }
      `}</style>

      <div className="container-fluid p-0">
        <h1 className="h3 mb-4 fw-bold text-dark d-flex align-items-center">
          <i className="bi bi-images text-indigo me-2" style={{color: "#3B82F6"}}></i>
          {isEdit ? "Chỉnh sửa Banner" : "Thêm Banner Mới"}
        </h1>

        <div className="row g-4">
          {/* CỘT TRÁI: FORM NHẬP LIỆU */}
          <div className="col-12 col-xl-6">
            <div className="eco-card">
              <div className="eco-card-header">
                <h5 className="fw-bold text-dark mb-0">Thông tin cấu hình</h5>
              </div>
              <div className="card-body p-4">
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="eco-form-label">Tiêu đề (Heading) <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className="eco-input-field"
                      name="title"
                      placeholder="Nhập tiêu đề chính..."
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="eco-form-label">Phụ đề (Subheading) <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className="eco-input-field"
                      name="subtitle"
                      placeholder="Nhập phụ đề ngắn gọn..."
                      value={formData.subtitle}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="eco-form-label">Đường dẫn URL</label>
                    <input
                      type="text"
                      className="eco-input-field"
                      name="url"
                      placeholder="VD: /rental-home"
                      value={formData.url || "/rental-home"}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="eco-form-label">Chữ trên nút (Button Text) <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className="eco-input-field"
                      name="buttonText"
                      placeholder="VD: Xem ngay"
                      value={formData.buttonText}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="row">
                    <div className="mb-4 col-md-6">
                      <label className="eco-form-label">Thứ tự hiển thị <span className="text-danger">*</span></label>
                      <input
                        type="number"
                        className="eco-input-field"
                        name="orderIndex"
                        value={formData.orderIndex}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="mb-4 col-md-6 d-flex align-items-center pt-4">
                      <div className="form-check form-switch eco-switch ms-2">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="activeSwitch"
                          name="isActive"
                          checked={formData.isActive}
                          onChange={handleInputChange}
                        />
                        <label className="form-check-label" htmlFor="activeSwitch">
                          Kích hoạt hiển thị
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-5">
                    <label className="eco-form-label">
                      <i className="bi bi-image me-1"></i> Hình ảnh tải lên {isEdit ? "" : <span className="text-danger">*</span>}
                    </label>
                    <input
                      className="eco-input-field eco-file-upload p-2"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      required={!isEdit}
                    />
                  </div>
                  
                  <div className="d-flex justify-content-end gap-2 pt-2 border-top pt-4">
                    <button
                      type="button"
                      className="eco-btn-secondary"
                      onClick={() => navigate("/admin/banner-management")}
                    >
                      <i className="bi bi-x-circle"></i> Hủy
                    </button>
                    <button type="submit" className="eco-btn-primary">
                      <i className="bi bi-cloud-arrow-up-fill"></i> Lưu thay đổi
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: XEM TRƯỚC (PREVIEW) */}
          <div className="col-12 col-xl-6">
            <div className="eco-card h-100">
              <div className="eco-card-header">
                <h5 className="fw-bold text-dark mb-0">
                  <i className="bi bi-eye-fill text-muted me-2"></i>Xem trước (Preview)
                </h5>
              </div>
              <div className="card-body p-4 d-flex align-items-center justify-content-center bg-light">
                {preview ? (
                  <div
                    className="position-relative shadow-sm w-100 rounded-4 overflow-hidden"
                    style={{ minHeight: "250px", background: "#eee" }}
                  >
                    <img
                      src={preview}
                      alt="Preview"
                      className="img-fluid w-100"
                      style={{
                        height: "350px",
                        objectFit: "cover",
                      }}
                    />
                    <div
                      className="position-absolute top-50 start-50 translate-middle text-center w-100 h-100 d-flex flex-column justify-content-center align-items-center"
                      style={{
                        background: "linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.6))",
                        color: "white",
                        padding: "20px",
                      }}
                    >
                      <p className="mb-2 fw-semibold" style={{ fontSize: "1.1rem", letterSpacing: "1px", textTransform: "uppercase", color: "#E2E8F0" }}>
                        {formData.subtitle}
                      </p>
                      <h2 className="text-white mb-4 fw-bold" style={{ fontSize: "2.5rem" }}>{formData.title}</h2>
                      <span className="btn btn-primary px-4 py-2 fw-bold" style={{ borderRadius: "50px", background: "#3B82F6", border: "none" }}>
                        {formData.buttonText}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-5 w-100 text-muted rounded-4" style={{ border: "2px dashed #CBD5E1", background: "#F8FAFC" }}>
                    <i className="bi bi-image fs-1 d-block mb-3 opacity-50"></i>
                    <p className="fw-semibold mb-0">Chưa có ảnh nào được chọn</p>
                    <small>Vui lòng tải ảnh lên để xem trước giao diện.</small>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

export default BannerForm;