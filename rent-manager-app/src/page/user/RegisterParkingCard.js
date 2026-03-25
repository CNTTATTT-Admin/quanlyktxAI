import React, { useState } from "react";
import SidebarNav from "./SidebarNav";
import { registerParkingCard } from "../../services/fetch/ApiUtils";
import { toast } from "react-toastify";
import { Navigate, useNavigate } from "react-router-dom";
import Header from "../../common/Header";
import Footer from "../../common/Footer";

function RegisterParkingCard(props) {
  const { authenticated, currentUser, location, onLogout } = props;
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    licensePlate: "",
    brandModel: "",
    color: "",
    vehicleType: "MOTORBIKE",
    packageId: "7",
  });

  const [registrationImage, setRegistrationImage] = useState(null);
  const [vehicleImages, setVehicleImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };
      if (name === "vehicleType") {
        newData.packageId = value === "MOTORBIKE" ? "7" : "8";
      }
      return newData;
    });
  };

  // Xử lý file: Ảnh cà vẹt (1 ảnh)
  const handleRegImageChange = (e) => {
    setRegistrationImage(e.target.files[0]);
  };

  // Xử lý file: Ảnh xe (Nhiều ảnh)
  const handleVehImagesChange = (e) => {
    setVehicleImages(e.target.files);
  };

  // Gửi Form
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!registrationImage) {
      toast.warning("Vui lòng tải lên ảnh Giấy đăng ký xe (Cà vẹt)!");
      return;
    }

    setIsLoading(true);

    const data = new FormData();
    data.append("licensePlate", formData.licensePlate);
    data.append("brandModel", formData.brandModel);
    data.append("color", formData.color);
    data.append("vehicleType", formData.vehicleType);
    data.append("packageId", formData.packageId);
    data.append("registrationImage", registrationImage);

    // Lặp qua mảng ảnh xe để append nhiều file
    if (vehicleImages && vehicleImages.length > 0) {
      Array.from(vehicleImages).forEach((file) => {
        data.append("vehicleImages", file);
      });
    }

    // Gọi API
    registerParkingCard(data)
      .then((response) => {
        toast.success(response.message || "Đăng ký thẻ xe thành công!");
        // Chuyển hướng người dùng về trang danh sách thẻ xe (nếu bạn đã tạo trang đó)
        // navigate("/user/parking-cards");
        
        // Reset form
        setFormData({ ...formData, licensePlate: "", brandModel: "", color: "" });
        setRegistrationImage(null);
        setVehicleImages([]);
        // Reset input file (cách đơn giản)
        document.getElementById("regImageInput").value = "";
        document.getElementById("vehImagesInput").value = "";
      })
      .catch((error) => {
        toast.error((error && error.message) || "Đăng ký thất bại. Vui lòng thử lại!");
      })
      .finally(() => {
        setIsLoading(false);
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
      <Header
        authenticated={authenticated}
        currentUser={currentUser}
        onLogout={onLogout}
      />
      <div style={{ marginTop: "140px" }}></div>
      <main id="main">
        <div className="wrapper">
          <nav id="sidebar" className="sidebar js-sidebar">
            <div className="sidebar-content js-simplebar">
              <span className="sidebar-brand">
                <span className="align-middle">RENTALER PRO</span>
              </span>
              <SidebarNav />
            </div>
          </nav>

          <div className="main">
            <br />
            <div className="container-fluid p-0">
              <div className="card shadow-sm">
                <div className="card-header">
                  <h5 className="card-title mb-0">🚗 Đăng ký thẻ gửi xe</h5>
                  <h6 className="card-subtitle text-muted mt-1">
                    Điền thông tin và tải lên hình ảnh để chủ trọ đối chiếu và phê duyệt.
                  </h6>
                </div>
                <div className="card-body">
                  <form onSubmit={handleSubmit}>
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label className="form-label fw-bold">Loại phương tiện</label>
                        <select className="form-select form-control" name="vehicleType" value={formData.vehicleType} onChange={handleInputChange}>
                          <option value="MOTORBIKE">Xe Máy</option>
                          <option value="CAR">Ô Tô</option>
                        </select>
                      </div>
                      <div className="col-md-6 mt-3 mt-md-0">
                        <label className="form-label fw-bold">Gói gửi xe</label>
                        <select className="form-select form-control bg-light" name="packageId" value={formData.packageId} disabled>
                          <option value="7">Gói Xe Máy (Theo tháng)</option>
                          <option value="8">Gói Ô Tô (Theo tháng)</option>
                        </select>
                      </div>
                    </div>

                    {/* Hàng 2 */}
                    <div className="row mb-4">
                      <div className="col-md-4">
                        <label className="form-label fw-bold">Biển số xe <span className="text-danger">*</span></label>
                        <input type="text" className="form-control" name="licensePlate" placeholder="VD: 29A-123.45" value={formData.licensePlate} onChange={handleInputChange} required />
                      </div>
                      <div className="col-md-4 mt-3 mt-md-0">
                        <label className="form-label fw-bold">Dòng xe <span className="text-danger">*</span></label>
                        <input type="text" className="form-control" name="brandModel" placeholder="VD: Honda Vision" value={formData.brandModel} onChange={handleInputChange} required />
                      </div>
                      <div className="col-md-4 mt-3 mt-md-0">
                        <label className="form-label fw-bold">Màu sắc <span className="text-danger">*</span></label>
                        <input type="text" className="form-control" name="color" placeholder="VD: Đỏ đen" value={formData.color} onChange={handleInputChange} required />
                      </div>
                    </div>

                    <hr className="mb-4" />

                    {/* Hàng 3: Upload Ảnh */}
                    <div className="row mb-4">
                      <div className="col-md-6">
                        <label className="form-label fw-bold">
                          Ảnh giấy đăng ký xe (Cà vẹt) <span className="text-danger">*</span>
                        </label>
                        <input id="regImageInput" type="file" className="form-control" accept="image/*" onChange={handleRegImageChange} required />
                        <small className="text-muted d-block mt-1">
                          Bắt buộc. Dùng để chứng minh quyền sở hữu phương tiện.
                        </small>
                      </div>
                      <div className="col-md-6 mt-3 mt-md-0">
                        <label className="form-label fw-bold">Ảnh chụp phương tiện</label>
                        <input id="vehImagesInput" type="file" className="form-control" accept="image/*" multiple onChange={handleVehImagesChange} />
                        <small className="text-muted d-block mt-1">
                          Tùy chọn. Nhấn giữ Ctrl (hoặc Cmd) để chọn nhiều ảnh (Đầu xe, đuôi xe...).
                        </small>
                      </div>
                    </div>

                    <div className="d-flex justify-content-end">
                      <button type="submit" className="btn btn-primary" disabled={isLoading}>
                        {isLoading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Đang gửi...
                          </>
                        ) : (
                          "Gửi yêu cầu đăng ký"
                        )}
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
}

export default RegisterParkingCard;