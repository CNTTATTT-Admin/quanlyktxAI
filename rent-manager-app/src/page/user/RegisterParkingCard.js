import React, { useState, useEffect } from "react";
import SidebarNav from "./SidebarNav";
import { 
  registerParkingCard, 
  getAllAccountRentalerForCustomer, 
  getParkingPackagesByRentaler
} from "../../services/fetch/ApiUtils";
import { toast } from "react-toastify";
import { Navigate, useNavigate } from "react-router-dom";
import Header from "../../common/Header";
import Footer from "../../common/Footer";

function RegisterParkingCard(props) {
  const { authenticated, currentUser, location, onLogout } = props;
  const navigate = useNavigate();

  const [rentalers, setRentalers] = useState([]);
  const [packages, setPackages] = useState([]);

  const [selectedRentaler, setSelectedRentaler] = useState("");
  const [formData, setFormData] = useState({
    licensePlate: "",
    brandModel: "",
    color: "",
    vehicleType: "", // Sẽ tự động gán theo Gói cước
    packageId: "",
  });

  const [registrationImage, setRegistrationImage] = useState(null);
  const [vehicleImages, setVehicleImages] = useState([]); // Khôi phục State lưu nhiều ảnh xe
  const [isLoading, setIsLoading] = useState(false);

  // 1. Lấy danh sách Chủ trọ
  useEffect(() => {
    if (authenticated) {
      getAllAccountRentalerForCustomer(0, 100, "")
        .then((response) => {
          setRentalers(response.content || []);
        })
        .catch((error) => console.log("Lỗi tải chủ trọ:", error));
    }
  }, [authenticated]);

  // 2. Lấy Gói cước khi đổi Chủ trọ
  useEffect(() => {
    if (selectedRentaler) {
      getParkingPackagesByRentaler(selectedRentaler)
        .then((response) => {
          const packageList = response.content || response || [];
          setPackages(packageList);
          
          if (packageList.length > 0) {
            // Tự động chọn gói đầu tiên và LẤY LUÔN LOẠI XE của gói đó
            setFormData(prev => ({ 
                ...prev, 
                packageId: packageList[0].id.toString(),
                vehicleType: packageList[0].vehicleType 
            }));
          } else {
            setFormData(prev => ({ ...prev, packageId: "", vehicleType: "" }));
          }
        })
        .catch((error) => {
          console.log("Lỗi tải gói cước:", error);
          setPackages([]);
        });
    } else {
      setPackages([]);
    }
  }, [selectedRentaler]);

  // Xử lý khi chọn Gói cước hoặc gõ Text
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // NẾU người dùng đổi Gói cước -> Tự động tìm Loại xe tương ứng để đổi theo
    if (name === "packageId") {
        const selectedPkg = packages.find(p => p.id.toString() === value);
        setFormData(prev => ({ 
            ...prev, 
            packageId: value,
            vehicleType: selectedPkg ? selectedPkg.vehicleType : ""
        }));
    } else {
        setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleRentalerChange = (e) => {
    setSelectedRentaler(e.target.value);
  };

  // Khôi phục 2 hàm xử lý file riêng biệt
  const handleRegImageChange = (e) => {
    setRegistrationImage(e.target.files[0]);
  };

  const handleVehImagesChange = (e) => {
    setVehicleImages(e.target.files);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedRentaler || !formData.packageId) {
      toast.warning("Vui lòng chọn Chủ trọ và Gói gửi xe!");
      return;
    }

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
    
    // Nối mảng ảnh phụ (Ảnh xe) vào form data
    if (vehicleImages && vehicleImages.length > 0) {
        Array.from(vehicleImages).forEach((file) => {
          data.append("vehicleImages", file);
        });
    }

    registerParkingCard(data)
      .then((response) => {
        toast.success(response.message || "Đăng ký thẻ xe thành công!");
        
        // Reset form
        setFormData({ ...formData, licensePlate: "", brandModel: "", color: "" });
        setRegistrationImage(null);
        setVehicleImages([]);
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
    return <Navigate to={{ pathname: "/login", state: { from: location } }} />;
  }

  return (
    <>
      <style>{`
        .eco-page-bg {
          background-color: #F8FAFC;
          min-height: calc(100vh - 70px);
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
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

        .main { flex-grow: 1; min-width: 0; }

        .eco-main-wrapper { padding: 30px; width: 100%; max-width: 1100px; margin: 0 auto;}

        .eco-card-form {
          background: #ffffff; border-radius: 16px; box-shadow: 0 4px 20px rgba(79, 70, 229, 0.05);
          border: 1px solid #EEF2FF; overflow: hidden;
        }

        .eco-card-header {
          background-color: #ffffff; padding: 25px 30px 20px 30px; border-bottom: 1px solid #EEF2FF;
        }

        .eco-title-icon { color: #4F46E5; margin-right: 10px; font-size: 1.3rem; }

        .eco-form-label {
          font-size: 0.85rem; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; display: block;
        }

        .eco-input-field {
          background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; padding: 12px 16px; font-size: 0.95rem; color: #1E293B; transition: all 0.3s; width: 100%;
        }

        .eco-input-field:focus {
          background-color: #ffffff; border-color: #4F46E5; box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1); outline: none;
        }

        .eco-input-field:disabled {
          background-color: #F1F5F9; color: #94A3B8; cursor: not-allowed;
        }

        .eco-file-upload::-webkit-file-upload-button {
          background-color: #EEF2FF; color: #4F46E5; border: none; border-radius: 8px; padding: 8px 16px; font-weight: 600; margin-right: 15px; cursor: pointer; transition: all 0.2s;
        }
        .eco-file-upload::-webkit-file-upload-button:hover {
          background-color: #E0E7FF;
        }

        .eco-btn-submit {
          background: linear-gradient(135deg, #4F46E5 0%, #4338CA 100%); color: #ffffff; font-weight: 600; font-size: 1rem;
          padding: 12px 35px; border-radius: 10px; border: none; box-shadow: 0 4px 15px rgba(79, 70, 229, 0.25);
          transition: all 0.3s ease; display: inline-flex; align-items: center; justify-content: center; gap: 8px;
        }
        .eco-btn-submit:hover:not(:disabled) {
          transform: translateY(-2px); box-shadow: 0 8px 20px rgba(79, 70, 229, 0.35); color: #ffffff;
        }
        .eco-btn-submit:disabled {
          opacity: 0.7; cursor: not-allowed;
        }
      `}</style>

      <Header authenticated={authenticated} currentUser={currentUser} onLogout={onLogout} />
      <div style={{ marginTop: "90px" }}></div>
      
      <main id="main" className="eco-page-bg">
        <div className="wrapper">
          <nav id="sidebar" className="sidebar js-sidebar">
            <div className="sidebar-content js-simplebar">
              <SidebarNav />
            </div>
          </nav>

          <div className="main">
            <div className="eco-main-wrapper">
              
              <div className="eco-card-form">
                <div className="eco-card-header d-flex justify-content-between align-items-center">
                  <div>
                    <h4 className="fw-bold text-dark mb-1">
                      <i className="bi bi-car-front-fill eco-title-icon"></i>
                      Đăng ký thẻ gửi xe
                    </h4>
                    <h6 className="text-muted mb-0" style={{fontSize: "0.95rem"}}>
                      Vui lòng chọn chủ trọ và điền đầy đủ thông tin để cấp thẻ.
                    </h6>
                  </div>
                  {/* thừa */}
                  {/* <div className="text-muted opacity-50 d-none d-sm-block" style={{fontSize: "2.5rem"}}>
                    <i className="bi bi-p-circle"></i>
                  </div> */}
                </div>
                
                <div className="card-body p-4 p-md-5">
                  <form onSubmit={handleSubmit}>
                    
                    {/* HÀNG 1: CHỦ TRỌ & GÓI CƯỚC */}
                    <div className="row g-4 mb-4">
                      <div className="col-md-6">
                        <label className="eco-form-label text-indigo">Người cho thuê (Chủ trọ) <span className="text-danger">*</span></label>
                        <select className="eco-input-field form-select" value={selectedRentaler} onChange={handleRentalerChange} required>
                          <option value="">-- Chọn Chủ Trọ --</option>
                          {rentalers.map((rentaler) => (
                            <option key={rentaler.id} value={rentaler.id}>
                              {rentaler.name} ({rentaler.phone})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="eco-form-label text-indigo">Gói gửi xe <span className="text-danger">*</span></label>
                        <select className="eco-input-field form-select" name="packageId" value={formData.packageId} onChange={handleInputChange} disabled={!selectedRentaler} required>
                          <option value="">{selectedRentaler ? "-- Chọn Gói Cước --" : "Vui lòng chọn Chủ trọ trước"}</option>
                          {packages.map((pkg) => (
                            <option key={pkg.id} value={pkg.id}>
                              {pkg.name} - {pkg.price?.toLocaleString('vi-VN')} đ / {pkg.durationMonths} tháng
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* HÀNG 2: THÔNG TIN PHƯƠNG TIỆN */}
                    <div className="row g-4 mb-4">
                      <div className="col-md-3">
                        <label className="eco-form-label">Loại xe <span className="text-danger">*</span></label>
                        {/* THAY ĐỔI: Khóa (disabled) không cho User sửa, hiển thị theo Gói cước */}
                        <select className="eco-input-field form-select" name="vehicleType" value={formData.vehicleType} disabled>
                          <option value="">-- Tự động --</option>
                          <option value="MOTORBIKE">Xe Máy</option>
                          <option value="CAR">Ô Tô</option>
                        </select>
                      </div>
                      <div className="col-md-3">
                        <label className="eco-form-label">Biển số <span className="text-danger">*</span></label>
                        <input type="text" className="eco-input-field" name="licensePlate" placeholder="VD: 29A-123.45" value={formData.licensePlate} onChange={handleInputChange} required />
                      </div>
                      <div className="col-md-3">
                        <label className="eco-form-label">Dòng xe <span className="text-danger">*</span></label>
                        <input type="text" className="eco-input-field" name="brandModel" placeholder="VD: Honda Vision" value={formData.brandModel} onChange={handleInputChange} required />
                      </div>
                      <div className="col-md-3">
                        <label className="eco-form-label">Màu sắc <span className="text-danger">*</span></label>
                        <input type="text" className="eco-input-field" name="color" placeholder="VD: Đỏ đen" value={formData.color} onChange={handleInputChange} required />
                      </div>
                    </div>

                    <hr className="my-5 text-muted" style={{opacity: 0.15}} />

                    {/* HÀNG 3: TẢI ẢNH */}
                    <div className="row g-4 mb-5">
                      <div className="col-md-6">
                        <label className="eco-form-label">
                          <i className="bi bi-file-earmark-image me-1"></i> Ảnh giấy đăng ký xe (Cà vẹt) <span className="text-danger">*</span>
                        </label>
                        <input id="regImageInput" type="file" className="eco-input-field eco-file-upload p-2" accept="image/*" onChange={handleRegImageChange} required />
                        <small className="text-muted d-block mt-2" style={{fontSize: "0.85rem"}}>
                          Bắt buộc. Dùng để đối chiếu và chứng minh quyền sở hữu phương tiện.
                        </small>
                      </div>
                      <div className="col-md-6">
                        <label className="eco-form-label">
                          <i className="bi bi-camera me-1"></i> Ảnh chụp phương tiện (Tùy chọn)
                        </label>
                        <input id="vehImagesInput" type="file" className="eco-input-field eco-file-upload p-2" accept="image/*" multiple onChange={handleVehImagesChange} />
                        <small className="text-muted d-block mt-2" style={{fontSize: "0.85rem"}}>
                          Nhấn giữ <code>Ctrl</code> (hoặc <code>Cmd</code>) để tải lên nhiều ảnh (Đầu xe, đuôi xe...).
                        </small>
                      </div>
                    </div>

                    <div className="d-flex justify-content-end">
                      <button type="submit" className="eco-btn-submit" disabled={isLoading}>
                        {isLoading ? (
                          <>
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                            Đang xử lý...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-send-fill"></i> Gửi Yêu Cầu Đăng Ký
                          </>
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