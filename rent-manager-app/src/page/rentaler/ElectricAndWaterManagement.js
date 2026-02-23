import React, { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import SidebarNav from "./SidebarNav";
import Nav from "./Nav";
import Pagination from "./Pagnation"; // Sửa lỗi tên import từ Pagnation thành Pagination
import { toast } from "react-toastify";
import { getAllElectricAndWaterOfRentaler } from "../../services/fetch/ApiUtils";

const ElectricAndWaterManagement = (props) => {
  const { authenticated, role, currentUser, location, onLogout } = props;
  const history = useNavigate();
  const [tableData, setTableData] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const calculateRemainingMonths = (deadlineContract) => {
    const currentDate = new Date();
    const contractDate = new Date(deadlineContract);

    const remainingMonths =
      (contractDate.getFullYear() - currentDate.getFullYear()) * 12 +
      (contractDate.getMonth() - currentDate.getMonth());

    return remainingMonths;
  };

  // Tất cả các hooks phải được gọi ở đây

  const fetchData = () => {
    getAllElectricAndWaterOfRentaler(currentPage, itemsPerPage, searchQuery)
      .then((response) => {
        console.log("dataTable", response);

        if (response && response.content) {
          setTableData(response.content);
          setTotalItems(response.totalElements);
        } else {
          setTableData([]);
          setTotalItems(0);
        }
      })
      .catch((error) => {
        toast.error(
          (error && error.message) ||
            "Oops! Có điều gì đó xảy ra. Vui lòng thử lại!"
        );
        setTableData([]);
        setTotalItems(0);
      });
  };
  useEffect(() => {
    fetchData();
  }, [currentPage, searchQuery]);
  console.log("tableData", tableData);
  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleEditElectric = (id) => {
    history(`/rentaler/electric_water/edit/${id}`);
  };

  const handleRedirectAddElectric = () => {
    history(`/rentaler/electric_water/add`);
  };

  const handleExportBill = (id) => {
    history(`/rentaler/electric_water-management/export-bill/${id}`);
  };

  if (!authenticated) {
    return <Navigate to="/login-rentaler" state={{ from: location }} />;
  }

  return (
    <div>
      <div className="wrapper">
        <nav id="sidebar" className="sidebar js-sidebar">
          <div className="sidebar-content js-simplebar">
            <a className="sidebar-brand" href="index.html">
              <span className="align-middle">RENTALER PRO</span>
            </a>
            <SidebarNav />
          </div>
        </nav>

        <div className="main">
          <Nav onLogout={onLogout} currentUser={currentUser} />
          <br />
          <div className="container-fluid p-0"></div>
          <div className="card">
            <div className="card-header">
              <h5 className="card-title">Quản lý tiền điện nước</h5>
              <h6 className="card-subtitle text-muted">
                Quản lý tiền điện nước của những người thuê trọ.
              </h6>
            </div>
            <div className="card-body">
              <div
                id="datatables-buttons_wrapper"
                className="dataTables_wrapper dt-bootstrap5 no-footer"
              >
                <div className="row">
                  <div className="col-sm-12 col-md-6">
                    <div className="dt-buttons btn-group flex-wrap">
                      <button
                        className="btn btn-secondary buttons-copy buttons-html5"
                        type="button"
                        onClick={handleRedirectAddElectric}
                      >
                        Thêm tiền điện nước
                      </button>
                    </div>
                  </div>
                  <div className="col-sm-12 col-md-6">
                    <div
                      id="datatables-buttons_filter"
                      className="dataTables_filter"
                    >
                      <label>
                        Search:
                        <input
                          type="search"
                          className="form-control form-control-sm"
                          placeholder=""
                          aria-controls="datatables-buttons"
                          value={searchQuery}
                          onChange={handleSearch}
                        />
                      </label>
                    </div>
                  </div>
                </div>
                <div className="row dt-row">
                  <div className="col-sm-12">
                    <table
                      id="datatables-buttons"
                      className="table table-striped dataTable no-footer dtr-inline"
                      style={{ width: "100%" }}
                      aria-describedby="datatables-buttons_info"
                    >
                      <thead>
                        <tr>
                          <th>Tên hóa đơn</th>
                          <th>Phòng</th>
                          <th>Tháng sử dụng</th>
                          <th>Số điện tháng trước</th>
                          <th>Số điện tháng này</th>
                          <th>Số khối tháng trước</th>
                          <th>Số khối tháng này</th>
                          <th>Tổng tiền điện</th>
                          <th>Tổng tiền nước</th>
                          <th>Trạng Thái</th>
                          <th>Chế độ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tableData.map((item) => (
                          <tr key={item.id} className="odd">
                            <td>{item.name}</td>
                            <td>
                                {item.room?.title}
                            </td>
                            <td className="dtr-control sorting_1">
                              Tháng {item.month}
                            </td>
                            <td>{item.lastMonthNumberOfElectric}</td>
                            <td>{item.thisMonthNumberOfElectric}</td>{" "}
                            <td>{item.lastMonthBlockOfWater}</td>
                            <td>{item.thisMonthBlockOfWater}</td>{" "}
                            {/* Sửa thành thisMonthBlock thay vì moneyEachBlock */}
                            <td>{item.totalMoneyOfElectric}
                              {item.totalMoney &&
                                item.totalMoney.toLocaleString("vi-VN", {
                                  style: "currency",
                                  currency: "VND",
                                })}
                            </td>

                            <td>{item.totalMoneyOfWater}
                              {item.totalMoney &&
                                item.totalMoney.toLocaleString("vi-VN", {
                                  style: "currency",
                                  currency: "VND",
                                })}
                            </td>

                            <td>
                              {item.paid ? "Đã thanh toán" : "Chưa thanh toán"}
                            </td>{" "}
                            <td>
                              <a
                                href=""
                                onClick={() => handleEditElectric(item.id)}
                                data-toggle="tooltip"
                                data-placement="bottom"
                                title="Sửa thông tin tiền điện nước"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="24"
                                  height="24"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  stroke-width="2"
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                  class="feather feather-edit-2 align-middle"
                                >
                                  <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                                </svg>
                              </a>
                              {/* &nbsp;&nbsp; */}
                            </td>
                          </tr>
                        ))}
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
      </div>
    </div>
  );
};

export default ElectricAndWaterManagement;
