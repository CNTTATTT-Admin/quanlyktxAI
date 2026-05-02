import { Navigate, useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Nav from "./Nav";
import SidebarNav from "./SidebarNav";
import {
  checkoutContract,
  getContract,
  getRequestById,
} from "../../services/fetch/ApiUtils";
import * as XLSX from "xlsx";

function ExportCheckoutRoom(props) {
  const { authenticated, role, currentUser, location, onLogout } = props;
  const { id } = useParams();
  const navigate = useNavigate();

  const [contractData, setContractData] = useState({
    nameBill: "",
    createdAt: "",
    price: 0,
    nameOfRent: "",
    nameRoom: "",
    room: "",
    priceRequest: "",
    waterCostRequest: "",
    electricCostRequest: "",
    internetCostRequest: "",
    deadlineContract: "",
  });

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setContractData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
  };

  useEffect(() => {
    getContract(id)
      .then((response) => {
        const contract = response;
        setContractData((prevState) => ({
          ...prevState,
          ...contract,
        }));
      })
      .catch((error) => {
        toast.error(
          (error && error.message) ||
            "Oops! Có điều gì đó xảy ra. Vui lòng thử lại!",
        );
      });
  }, [id]);

  const handleExport = (id) => {
    checkoutContract(id)
      .then((response) => {
        toast.success(response.message);
        exportToExcel(contractData);
      })
      .catch((error) => {
        toast.error(
          (error && error.message) ||
            "Oops! Có điều gì đó xảy ra. Vui lòng thử lại!",
        );
      });
    setContractData({
      nameBill: "",
      priceRequest: "",
    });
  };

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
        
        .modern-input:read-only, .modern-input:disabled { background-color: #E2E8F0; color: #64748B; cursor: not-allowed; border-color: #E2E8F0; }
        
        .section-title { font-size: 1rem; font-weight: 700; color: #0F172A; border-bottom: 2px solid #F1F5F9; padding-bottom: 10px; margin-bottom: 20px; margin-top: 10px; }
      `}</style>

      <div className="container-fluid p-4 eco-bg">
        
        {/* Header với nút Quay lại */}
        <div className="row mb-4">
          <div className="col-12 d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <h2 className="fw-bolder text-dark mb-1">Xuất hóa đơn trả phòng</h2>
              <p className="text-muted mb-0">Xác nhận thông tin, tính toán phụ phí và xuất hóa đơn Excel.</p>
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
                <i className="bi bi-receipt-cutoff me-2 fs-4"></i> Thông tin thanh toán
              </h5>
              
              <form onSubmit={handleSubmit}>
                <div className="row g-4">
                  
                  {/* --- KHU VỰC 1: THÔNG TIN CHUNG --- */}
                  <div className="col-12">
                    <label className="modern-label" htmlFor="nameBill">
                      Tên Hóa Đơn
                    </label>
                    <input
                      type="text"
                      className="form-control modern-input"
                      id="nameBill"
                      name="nameBill"
                      value={contractData.nameBill}
                      onChange={handleInputChange}
                      placeholder="VD: Hóa đơn thanh toán phòng 101 tháng 10"
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="modern-label" htmlFor="nameOfRent">
                      Người thuê
                    </label>
                    <input
                      type="text"
                      className="form-control modern-input"
                      id="nameOfRent"
                      name="nameOfRent"
                      value={contractData.nameOfRent}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="modern-label" htmlFor="nameRoom">
                      Tên Phòng
                    </label>
                    <input
                      type="text"
                      className="form-control modern-input fw-bold"
                      id="nameRoom"
                      name="nameRoom"
                      value={contractData.room && contractData.room.title}
                      onChange={handleInputChange}
                      disabled
                    />
                  </div>

                  {/* --- KHU VỰC 2: CHI PHÍ DỊCH VỤ --- */}
                  <div className="col-12"><div className="section-title text-emerald"><i className="bi bi-cash-coin me-2"></i>Chi Phí Thuê & Dịch Vụ</div></div>

                  <div className="col-md-6">
                    <label className="modern-label" htmlFor="price">
                      Giá Phòng (VNĐ)
                    </label>
                    <input
                      type="number"
                      className="form-control modern-input"
                      id="price"
                      name="price"
                      value={contractData.room && contractData.room.price}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="modern-label" htmlFor="waterCost">
                      Tiền nước (VNĐ)
                    </label>
                    <input
                      type="number"
                      className="form-control modern-input"
                      id="waterCost"
                      name="waterCost"
                      value={contractData.room && contractData.room.waterCost}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="modern-label" htmlFor="publicElectricCost">
                      Tiền điện chung (VNĐ)
                    </label>
                    <input
                      type="number"
                      className="form-control modern-input"
                      id="publicElectricCost"
                      name="publicElectricCost"
                      value={contractData.room && contractData.room.publicElectricCost}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="modern-label" htmlFor="internetCost">
                      Tiền mạng (VNĐ)
                    </label>
                    <input
                      type="number"
                      className="form-control modern-input"
                      id="internetCost"
                      name="internetCost"
                      value={contractData.room && contractData.room.internetCost}
                      onChange={handleInputChange}
                    />
                  </div>

                  {/* --- KHU VỰC 3: THỜI GIAN & PHỤ PHÍ --- */}
                  <div className="col-12"><div className="section-title text-emerald"><i className="bi bi-calendar-check me-2"></i>Thời gian & Phụ phí</div></div>

                  <div className="col-md-6">
                    <label className="modern-label" htmlFor="createAt">
                      Thời Gian Điểm Bắt Đầu Thuê
                    </label>
                    <input
                      type="datetime"
                      className="form-control modern-input text-muted"
                      id="createAt"
                      name="createAt"
                      value={contractData.createdAt}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="modern-label" htmlFor="deadlineContract">
                      Thời Hạn Hợp Đồng
                    </label>
                    <input
                      type="datetime"
                      className="form-control modern-input text-muted"
                      id="deadlineContract"
                      name="deadlineContract"
                      value={contractData.deadlineContract}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="col-12">
                    <label className="modern-label" htmlFor="priceRequest">
                      Chi phí phát sinh / Lắp đặt theo yêu cầu (VNĐ)
                    </label>
                    <input
                      type="number"
                      className="form-control modern-input border-warning"
                      id="priceRequest"
                      name="priceRequest"
                      value={contractData.priceRequest}
                      onChange={handleInputChange}
                      placeholder="Nhập chi phí phát sinh nếu có..."
                    />
                  </div>

                  {/* Nút Submit */}
                  <div className="col-12 mt-5 pt-3 border-top">
                    <button
                      type="button"
                      onClick={() => handleExport(contractData.id)}
                      className="btn bg-emerald text-white btn-modern w-100 fs-5 py-2 shadow-sm"
                    >
                      <i className="bi bi-file-earmark-excel-fill me-2"></i> Xuất hóa đơn & Trả phòng
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

function exportToExcel(contractData) {
  // Create an empty workbook
  const workbook = XLSX.utils.book_new();

  const formattedPrice = contractData.priceRequest
    ? formatCurrency(contractData.priceRequest)
    : "";

  const deadlineYear = parseInt(
    new Date(contractData.deadlineContract).getFullYear(),
  );
  const currentYear = parseInt(new Date().getFullYear());

  const deadlineMonth = parseInt(
    new Date(contractData.deadlineContract).getMonth(),
  );
  const currentMonth = parseInt(new Date().getMonth());

  const pricePerMonth = parseFloat(contractData.room.price);
  const priceRequest = parseFloat(contractData.priceRequest);
  const waterCostRequest = parseFloat(contractData.waterCostRequest);
  const electricCostRequest = parseFloat(contractData.electricCostRequest);
  const internetCostRequest = parseFloat(contractData.internetCostRequest);

  const result =
    ((deadlineYear - currentYear) * 12 + (deadlineMonth - currentMonth)) *
      pricePerMonth +
    priceRequest +
    waterCostRequest +
    electricCostRequest +
    internetCostRequest;
  // Add a worksheet to the workbook
  const worksheet = XLSX.utils.aoa_to_sheet([
    [
      "Tên Hóa Đơn",
      "Thời Gian Điểm Bắt Đầu Thuê",
      "Chi phí lặp đặt (Theo yêu cầu)",
      "Giá Phòng",
      "Tiền nước",
      "Tiền điện chung",
      "Tiền mạng",
      "Tên Phòng",
      "Thời Hạn",
      "Người thuê",
      "Tổng Tiền",
    ],
    [
      contractData.nameBill,
      contractData.createdAt,
      formattedPrice,
      contractData.room.price,
      contractData.room.waterCost,
      contractData.room.publicElectricCost,
      contractData.room.internetCost,
      contractData.room.title,
      contractData.deadlineContract,
      contractData.nameOfRent,
      result,
    ],
  ]);
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

  function formatCurrency(value) {
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) {
      return "0 VNĐ";
    }
    return `${numericValue.toLocaleString("vi-VN")} VNĐ`;
  }

  // Generate the Excel file data
  const excelBuffer = XLSX.write(workbook, { type: "array", bookType: "xlsx" });

  // Create a Blob from the Excel file data
  const blob = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  // Create a download link and trigger the download
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "hoa_don.xlsx";
  a.click();

  // Cleanup
  URL.revokeObjectURL(url);
}

export default ExportCheckoutRoom;