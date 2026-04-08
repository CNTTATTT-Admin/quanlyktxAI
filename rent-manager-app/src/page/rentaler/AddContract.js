import { Navigate, useNavigate } from "react-router-dom";
import Nav from "./Nav";
import SidebarNav from "./SidebarNav";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getRentOfHome, getRoom } from "../../services/fetch/ApiUtils";
import ContractService from "../../services/axios/ContractService";

function AddContract(props) {
  const { authenticated, role, currentUser, location, onLogout } = props;
  const navigate = useNavigate();

  const [roomOptions, setRoomOptions] = useState([]);

  const [residents, setResidents] = useState([]);

  const [contractData, setContractData] = useState({
    name: "",
    roomId: "",
    nameRentHome: "",
    phone: "",
    deadline: null,
    files: [],
  });

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setContractData((prevState) => ({
      ...prevState,
      [name]: value,
    }));

    if (name === "roomId") {
      const selectedRoom = roomOptions.find((r) => r.id === parseInt(value));
      setResidents(selectedRoom ? selectedRoom.residents || [] : []);
      // Reset name and phone when room changes
      setContractData((prev) => ({ ...prev, nameRentHome: "", phone: "" }));
    }

    if (name === "residentId") {
      const selectedResident = residents.find((r) => r.id === parseInt(value));
      if (selectedResident) {
        setContractData((prev) => ({
          ...prev,
          nameRentHome: selectedResident.name,
          phone: selectedResident.phone,
        }));
      }
    }
  };

  const handleFileChange = (event) => {
    setContractData((prevState) => ({
      ...prevState,
      files: [...prevState.files, ...event.target.files],
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append("name", contractData.name);
    formData.append("roomId", contractData.roomId);
    formData.append("nameOfRent", contractData.nameRentHome);
    formData.append("numOfPeople", 1); // Default to 1 for per-tenant model
    formData.append("phone", contractData.phone);
    formData.append("deadlineContract", contractData.deadline);
    contractData.files.forEach((file, index) => {
      formData.append(`files`, file);
    });
    console.log(formData.getAll);
    ContractService.addNewContract(formData)
      .then((response) => {
        toast.success(response.message);
        toast.success("Hợp đồng lưu thành công!!");
      })
      .then((data) => {
        console.log(data);
        // Do something with the response data here
        setContractData({
          name: "",
          roomId: "",
          nameRentHome: "",
          phone: "",
          deadline: null,
          files: [],
        });
        setResidents([]);
      })
      .catch((error) => {
        const message =
          error?.response?.data?.message ||
          error?.message ||
          "Oops! Có điều gì đó xảy ra. Vui lòng thử lại!";
        toast.error(message);
      });

    console.log(contractData);
  };

  useEffect(() => {
    getRentOfHome()
      .then((response) => {
        const room = response.content || response;
        setRoomOptions(Array.isArray(room) ? room : []);
      })
      .catch((error) => {
        toast.error(
          (error && error.message) ||
            "Oops! Có điều gì đó xảy ra. Vui lòng thử lại!",
        );
      });
  }, []);

  console.log("Add room", authenticated);
  if (!authenticated) {
    return (
      <Navigate
        to={{
          pathname: "/login-rentaler",
          state: { from: location },
        }}
      />
    );
  }

  return (
    <>
      <style>{`
        .eco-bg { background-color: #F8FAFC; min-height: 100vh; font-family: 'Inter', sans-serif; }
        .text-emerald { color: #10B981 !important; }
        .bg-emerald { background-color: #10B981 !important; color: white !important; }
        
        .modern-card { border-radius: 16px; border: none; box-shadow: 0 4px 20px rgba(0,0,0,0.03); background: #fff; }
        
        .modern-input { border-radius: 8px; border: 1px solid #E2E8F0; padding: 10px 15px; font-size: 0.95rem; background-color: #F8FAFC; transition: all 0.3s; }
        .modern-input:focus { border-color: #10B981; box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1); background-color: #fff; outline: none; }
        .modern-label { font-weight: 600; color: #475569; font-size: 0.85rem; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; }

        .btn-modern { border-radius: 8px; font-weight: 600; padding: 10px 20px; transition: all 0.3s; }
        .btn-modern:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2); }
        
        .upload-box { border: 2px dashed #CBD5E1; border-radius: 12px; transition: all 0.3s; }
        .upload-box:hover { border-color: #10B981; background-color: #F0FDF4 !important; }

        .modern-input:read-only { background-color: #E2E8F0; color: #64748B; cursor: not-allowed; }
      `}</style>

      <div className="container-fluid p-4 eco-bg">
        
        {/* Header với nút Quay lại */}
        <div className="row mb-4">
          <div className="col-12 d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <h2 className="fw-bolder text-dark mb-1">Thêm hợp đồng mới</h2>
              <p className="text-muted mb-0">Thiết lập hợp đồng và ghi nhận thông tin người thuê trọ.</p>
            </div>
            <button 
              type="button"
              className="btn btn-light bg-white border shadow-sm btn-modern text-secondary rounded-pill" 
              onClick={() => navigate('/rentaler/contract-management')}
            >
              <i className="bi bi-arrow-left me-2"></i> Quay lại danh sách
            </button>
          </div>
        </div>

        {/* Form nhập liệu (Căn giữa) */}
        <div className="row justify-content-center">
          <div className="col-12 col-xl-8 col-lg-10">
            <div className="modern-card p-4 p-md-5">
              <h5 className="fw-bold text-emerald mb-4 pb-3 border-bottom d-flex align-items-center">
                <i className="bi bi-file-earmark-text-fill me-2 fs-4"></i> Thông tin hợp đồng
              </h5>
              
              <form onSubmit={handleSubmit}>
                <div className="row g-4">
                  
                  <div className="col-md-6">
                    <label className="modern-label" htmlFor="locationId">
                      Chọn phòng
                    </label>
                    <select
                      className="form-select modern-input"
                      id="locationId"
                      name="roomId"
                      value={contractData.roomId}
                      onChange={handleInputChange}
                    >
                      <option value="">-- Chọn phòng --</option>
                      {roomOptions.map((roomOption) => (
                        <option key={roomOption.id} value={roomOption.id}>
                          {roomOption.title} (Chỗ: {roomOption.currentOccupancy}/{roomOption.maxOccupancy})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="col-md-6">
                    <label className="modern-label" htmlFor="title">
                      Tên hợp đồng
                    </label>
                    <input
                      type="text"
                      className="form-control modern-input"
                      id="title"
                      name="name"
                      value={contractData.name}
                      onChange={handleInputChange}
                      placeholder="VD: Hợp đồng thuê phòng 101 - Nguyễn Văn A"
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="modern-label" htmlFor="residentSelect">
                      Người thuê (Từ danh sách chờ)
                    </label>
                    <select
                      className="form-select modern-input"
                      id="residentSelect"
                      name="residentId"
                      onChange={handleInputChange}
                      disabled={!contractData.roomId}
                    >
                      <option value="">-- Chọn người thuê --</option>
                      {residents.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name} ({r.phone})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="col-md-6">
                    <label className="modern-label" htmlFor="phoneInfo">
                      Số điện thoại
                    </label>
                    <input
                      type="text"
                      className="form-control modern-input"
                      id="phoneInfo"
                      name="phone"
                      value={contractData.phone}
                      readOnly
                      placeholder="Chọn người thuê để tự điền..."
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="modern-label" htmlFor="price">
                      Thời Hạn Hợp Đồng
                    </label>
                    <input
                      type="datetime-local"
                      className="form-control modern-input"
                      id="price"
                      name="deadline"
                      onChange={handleInputChange}
                    />
                  </div>

                  {/* Vùng File Upload (Full width) */}
                  <div className="col-12 mt-4">
                    <label className="modern-label d-flex justify-content-between align-items-center">
                      <span>Tải File Hợp Đồng</span>
                      <a 
                        href="https://image.luatvietnam.vn/uploaded/Others/2021/04/08/hop-dong-thue-nha-o_2810144434_2011152916_0804150405.doc"
                        className="text-decoration-none fw-bold text-emerald small"
                      >
                        <i className="bi bi-cloud-arrow-down-fill me-1"></i> Tải Mẫu (.doc)
                      </a>
                    </label>
                    <div className="upload-box p-4 text-center bg-light">
                      <i className="bi bi-file-earmark-pdf-fill text-danger mb-2 d-block" style={{ fontSize: "2.5rem" }}></i>
                      <h6 className="fw-bold text-dark mb-2">Kéo thả hoặc chọn file (.pdf) để tải lên</h6>
                      <p className="text-muted small mb-4">
                        Tải mẫu hợp đồng, điền thông tin người thuê, xuất sang định dạng PDF và upload lên hệ thống.
                      </p>
                      <input
                        className="form-control modern-input w-75 mx-auto"
                        type="file"
                        accept=".pdf"
                        name="files"
                        multiple
                        onChange={handleFileChange}
                      />
                    </div>
                  </div>

                  {/* Nút Submit */}
                  <div className="col-12 mt-5 pt-3 border-top">
                    <button type="submit" className="btn bg-emerald text-white btn-modern w-100 fs-5 py-2 shadow-sm">
                      <i className="bi bi-check2-circle me-2"></i> Thiết lập hợp đồng
                    </button>
                  </div>

                </div>
              </form>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}

export default AddContract;