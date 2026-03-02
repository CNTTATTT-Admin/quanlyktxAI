import React, { useEffect, useState } from "react";
import SidebarNav from "./SidebarNav";
import Nav from "./Nav";
import {
  approveRequest,
  changeStatusOfRequest,
  deleteMaintenance,
  getAllMaintenceOfRentaler,
  getAllRequireOfRentaler,
} from "../../services/fetch/ApiUtils";
import Pagination from "./Pagnation";
import { toast } from "react-toastify";
import { Navigate, useNavigate } from "react-router-dom";

function RequierManagement(props) {
  const { authenticated, role, currentUser, location, onLogout } = props;
  const history = useNavigate();

  const [tableData, setTableData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch data from the API
  useEffect(() => {
    fetchData();
  }, [currentPage, searchQuery]);

  const fetchData = () => {
    getAllRequireOfRentaler(currentPage, itemsPerPage, searchQuery)
      .then((response) => {
        setTableData(response.content);
        setTotalItems(response.totalElements);
      })
      .catch((error) => {
        toast.error(
          (error && error.message) ||
            "Oops! Có điều gì đó xảy ra. Vui lòng thử lại!",
        );
      });
  };

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleExportBill = (id) => {
    history("/rentaler/export-bill/" + id);
  };

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleChangeStatus = (id) => {
    changeStatusOfRequest(id)
      .then((response) => {
        console.log(response.message);
        toast.success("Yêu cầu đã được xử lý");
        fetchData();
      })
      .catch((error) => {
        toast.error(
          (error && error.message) ||
            "Oops! Có điều gì đó xảy ra. Vui lòng thử lại!",
        );
      });
  };
  const handleApprove = (id) => {
    approveRequest(id)
      .then((response) => {
        toast.success(response.message);
        fetchData();
      })
      .catch((error) => {
        toast.error(
          (error && error.message) ||
            "Oops! Có điều gì đó xảy ra. Vui lòng thử lại!",
        );
      });
  };

  if (!props.authenticated) {
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
              <h5 className="card-title">Quản lý yêu cầu của người thuê</h5>
              <h6 className="card-subtitle text-muted">
                {" "}
                Quản lý các yêu cầu người thuê của phòng trọ.
              </h6>
            </div>
            <div className="card-body">
              <div
                id="datatables-buttons_wrapper"
                className="dataTables_wrapper dt-bootstrap5 no-footer"
              >
                <div className="row">
                  <div className="col-sm-12 col-md-6">
                    <div className="dt-buttons btn-group flex-wrap"></div>
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
                          <th
                            className="sorting sorting_asc"
                            tabindex="0"
                            aria-controls="datatables-buttons"
                            rowspan="1"
                            colspan="1"
                            style={{ width: "224px" }}
                          >
                            Tên Phòng
                          </th>
                          <th
                            className="sorting"
                            tabindex="0"
                            aria-controls="datatables-buttons"
                            rowspan="1"
                            colspan="1"
                            style={{ width: "180px" }}
                          >
                            Tên Người Thuê
                          </th>
                          <th
                            className="sorting"
                            tabindex="0"
                            aria-controls="datatables-buttons"
                            rowspan="1"
                            colspan="1"
                            style={{ width: "166px" }}
                          >
                            Số điện thoại
                          </th>
                          <th
                            className="sorting"
                            tabindex="0"
                            aria-controls="datatables-buttons"
                            rowspan="1"
                            colspan="1"
                            style={{ width: "130px" }}
                          >
                            Mô tả yêu cầu
                          </th>
                          <th
                            className="sorting"
                            tabindex="0"
                            aria-controls="datatables-buttons"
                            rowspan="1"
                            colspan="1"
                            style={{ width: "142px" }}
                          >
                            Trạng thái
                          </th>
                          <th
                            className="sorting"
                            tabindex="0"
                            aria-controls="datatables-buttons"
                            rowspan="1"
                            colspan="1"
                            style={{ width: "100px", textAlign: "center" }}
                          >
                            Chế độ
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {tableData.map((item) => (
                          <tr className="odd">
                            <td className="dtr-control sorting_1" tabindex="0">
                              {item.room.title}
                            </td>
                            <td>{item.name}</td>
                            <td>{item.phoneNumber}</td>
                            <td>{item.description}</td>
                            <td>
                              {item.isAnswer === true ? (
                                <span className="badge rounded-pill bg-success">
                                  Đã xử lý
                                </span>
                              ) : (
                                <span className="badge rounded-pill bg-warning">
                                  Chưa xử lý
                                </span>
                              )}
                            </td>
                            <td style={{ textAlign: "center" }}>
                              {item.isAnswer === false && (
                                <>
                                  <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={() => handleApprove(item.id)}
                                    disabled={
                                      item.room.currentOccupancy >=
                                      item.room.maxOccupancy
                                    }
                                  >
                                    Duyệt vào phòng (
                                    {item.room.currentOccupancy}/
                                    {item.room.maxOccupancy})
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-outline-info ms-2"
                                    onClick={() => handleChangeStatus(item.id)}
                                    title="Đánh dấu đã xử lý (không duyệt)"
                                  >
                                    Đánh dấu đã xử lý (không duyệt)
                                  </button>
                                </>
                              )}
                              <button
                                type="button"
                                className="btn btn-outline-danger ms-2"
                                onClick={() => handleExportBill(item.id)}
                              >
                                Xem chi tiết
                              </button>
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
    </>
  );
}

export default RequierManagement;
