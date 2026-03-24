import React, { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Pagination from "./Pagnation";
import { toast } from "react-toastify";
import { FiCheckCircle, FiXCircle, FiClock } from "react-icons/fi";
import { getAllInvoices, updateInvoiceStatus } from "../../services/fetch/ApiUtils";

const InvoiceManagement = (props) => {
  const { authenticated, location } = props;
  const history = useNavigate();

  const [tableData, setTableData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (authenticated) {
      fetchData();
    }
  }, [currentPage, searchQuery, authenticated]);

  const fetchData = () => {
    getAllInvoices(currentPage - 1, itemsPerPage, searchQuery)
      .then((response) => {
        setTableData(response.content || []);
        setTotalItems(response.totalElements || 0);
      })
      .catch((error) => {
        toast.error((error && error.message) || "Không thể tải danh sách hóa đơn.");
      });
  };

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1);
  };

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Hàm xác nhận thu tiền mặt (Chuyển từ PENDING -> PAID)
  const handleMarkAsPaid = (id) => {
    if (window.confirm("Xác nhận người thuê đã thanh toán tiền mặt cho hóa đơn này?")) {
      updateInvoiceStatus(id, "PAID")
        .then(() => {
          toast.success("Đã xác nhận thu tiền thành công!");
          fetchData();
        })
        .catch((error) => toast.error(error.message || "Lỗi khi cập nhật hóa đơn."));
    }
  };

  // Hàm hủy hóa đơn (Chuyển từ PENDING -> CANCELLED)
  const handleCancelInvoice = (id) => {
    if (window.confirm("Bạn có chắc chắn muốn hủy hóa đơn này không?")) {
      updateInvoiceStatus(id, "CANCELLED")
        .then(() => {
          toast.success("Đã hủy hóa đơn!");
          fetchData();
        })
        .catch((error) => toast.error(error.message || "Lỗi khi hủy hóa đơn."));
    }
  };

  if (!authenticated) {
    return <Navigate to={{ pathname: "/login-rentaler", state: { from: location } }} />;
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "PENDING": return <span className="badge bg-warning text-dark"><FiClock className="me-1"/> Chờ thanh toán</span>;
      case "PAID": return <span className="badge bg-success"><FiCheckCircle className="me-1"/> Đã thu</span>;
      case "FAILED": return <span className="badge bg-danger"><FiXCircle className="me-1"/> Thất bại</span>;
      case "CANCELLED": return <span className="badge bg-secondary">Đã hủy</span>;
      default: return <span className="badge bg-light text-dark">{status}</span>;
    }
  };

  return (
    <div className="container-fluid p-0">
      <div className="card">
        <div className="card-header">
          <h5 className="card-title">Quản lý Hóa Đơn Bãi Xe</h5>
          <h6 className="card-subtitle text-muted">
            Theo dõi dòng tiền, xác nhận thu tiền cước gửi xe của người thuê.
          </h6>
        </div>
        <div className="card-body">
          <div className="dataTables_wrapper dt-bootstrap5 no-footer">
            <div className="row mb-3">
              <div className="col-sm-12 col-md-6"></div>
              <div className="col-sm-12 col-md-6 text-end">
                <label>
                  Tìm tên / Biển số:
                  <input
                    type="search"
                    className="form-control form-control-sm d-inline-block w-auto ms-2"
                    value={searchQuery}
                    onChange={handleSearch}
                  />
                </label>
              </div>
            </div>
            
            <div className="row dt-row">
              <div className="col-sm-12 table-responsive">
                <table className="table table-striped dataTable no-footer" style={{ width: "100%" }}>
                  <thead>
                    <tr>
                      <th>Mã GD</th>
                      <th>Người thanh toán</th>
                      <th>Chi tiết Thẻ xe</th>
                      <th>Số tiền</th>
                      <th>Ngày thu</th>
                      <th>Phương thức</th>
                      <th>Trạng thái</th>
                      <th className="text-center">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.length === 0 ? (
                      <tr><td colSpan="8" className="text-center">Không có dữ liệu hóa đơn.</td></tr>
                    ) : (
                      tableData.map((item) => (
                        <tr key={item.id}>
                          <td><small className="text-muted">{item.transactionId || `#INV-${item.id}`}</small></td>
                          <td>
                            <strong>{item.user?.name}</strong><br/>
                            <small className="text-muted">{item.user?.phone}</small>
                          </td>
                          <td>
                            <span className="badge bg-dark">{item.parkingCard?.licensePlate}</span><br/>
                            <small>{item.parkingCard?.packageInfo?.name}</small>
                          </td>
                          <td className="text-danger fw-bold">
                            {item.amount?.toLocaleString('vi-VN', {style : 'currency', currency : 'VND'}) || "0 ₫"}
                          </td>
                          <td>
                            {item.paidAt ? new Date(item.paidAt).toLocaleString("vi-VN") : "-"}
                          </td>
                          <td>
                            <span className="badge bg-light text-dark border">
                              {item.paymentMethod || "Tiền mặt / Chuyển khoản"}
                            </span>
                          </td>
                          <td>{getStatusBadge(item.status)}</td>
                          <td className="text-center">
                            {item.status === "PENDING" && (
                              <div className="btn-group">
                                <button
                                  className="btn btn-sm btn-success"
                                  onClick={() => handleMarkAsPaid(item.id)}
                                  title="Xác nhận đã thu tiền mặt"
                                >
                                  Thu tiền
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => handleCancelInvoice(item.id)}
                                  title="Hủy hóa đơn này"
                                >
                                  Hủy
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <Pagination
              itemsPerPage={itemsPerPage}
              totalItems={totalItems}
              currentPage={currentPage}
              paginate={paginate}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceManagement;