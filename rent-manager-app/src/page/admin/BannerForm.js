import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import SidebarNav from "./SidebarNav";
import Nav from "./Nav";
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
            <h1 className="h3 mb-3">
              {isEdit ? "Chỉnh sửa Banner" : "Thêm Banner Mới"}
            </h1>

            <div className="row">
              <div className="col-12 col-xl-6">
                <div className="card">
                  <div className="card-body">
                    <form onSubmit={handleSubmit}>
                      <div className="mb-3">
                        <label className="form-label">Tiêu đề (Heading)</label>
                        <input
                          type="text"
                          className="form-control"
                          name="title"
                          value={formData.title}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">
                          Phụ đề (Subheading)
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          name="subtitle"
                          value={formData.subtitle}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Đường dẫn URL</label>
                        <input
                          type="text"
                          className="form-control"
                          name="url"
                          value={formData.url || "/rental-home"}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">
                          Chữ trên nút (Button Text)
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          name="buttonText"
                          value={formData.buttonText}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="row">
                        <div className="mb-3 col-md-6">
                          <label className="form-label">Thứ tự hiển thị</label>
                          <input
                            type="number"
                            className="form-control"
                            name="orderIndex"
                            value={formData.orderIndex}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div className="mb-3 col-md-6 d-flex align-items-center mt-4">
                          <div className="form-check form-switch">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              name="isActive"
                              checked={formData.isActive}
                              onChange={handleInputChange}
                            />
                            <label className="form-check-label">
                              Kích hoạt
                            </label>
                          </div>
                        </div>
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Hình ảnh</label>
                        <input
                          className="form-control"
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          required={!isEdit}
                        />
                      </div>
                      <div className="mb-3">
                        <button type="submit" className="btn btn-primary">
                          Lưu thay đổi
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary ms-2"
                          onClick={() => navigate("/admin/banner-management")}
                        >
                          Hủy
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>

              <div className="col-12 col-xl-6">
                <div className="card">
                  <div className="card-header">
                    <h5 className="card-title">Xem trước (Preview)</h5>
                  </div>
                  <div className="card-body">
                    {preview ? (
                      <div
                        className="position-relative"
                        style={{ minHeight: "200px", background: "#eee" }}
                      >
                        <img
                          src={preview}
                          alt="Preview"
                          className="img-fluid rounded"
                          style={{
                            width: "100%",
                            height: "300px",
                            objectFit: "cover",
                          }}
                        />
                        <div
                          className="position-absolute top-50 start-50 translate-middle text-center w-100"
                          style={{
                            background: "rgba(0,0,0,0.4)",
                            color: "white",
                            padding: "20px",
                          }}
                        >
                          <p className="mb-0" style={{ fontSize: "14px" }}>
                            {formData.subtitle}
                          </p>
                          <h2 className="text-white mb-2">{formData.title}</h2>
                          <span className="btn btn-sm btn-primary">
                            {formData.buttonText}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center p-5 border rounded">
                        Chưa có ảnh nào được chọn
                      </div>
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

export default BannerForm;
