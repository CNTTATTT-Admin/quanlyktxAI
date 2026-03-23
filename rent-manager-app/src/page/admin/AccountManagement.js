import React, { useEffect, useState } from "react";
import SidebarNav from "./SidebarNav";
import Nav from "./Nav";
import Pagination from "./Pagnation";
import { toast } from "react-toastify";
import { Navigate, useNavigate } from "react-router-dom";
import {
  disableRoom,
  getAllAccpuntOfAdmin,
  lockedAccount,
  unlockAccount,
  deleteMultipleAccounts,
} from "../../services/fetch/ApiUtils";

function AccountManagement(props) {
  const { authenticated, role, currentUser, location, onLogout } = props;
  const history = useNavigate();

  const [tableData, setTableData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);

  // Fetch data from the API
  useEffect(() => {
    fetchData();
  }, [currentPage, searchQuery]);

  const fetchData = () => {
    getAllAccpuntOfAdmin(currentPage, itemsPerPage, searchQuery)
      .then((response) => {
        setTableData(response.content);
        setTotalItems(response.totalElements);
        setSelectedIds([]);
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

  const handleAuthorization = (userId) => {
    history("/admin/authorization/" + userId);
  };

  const handleLockedAccount = (userId, isLocked) => {
    if (isLocked) {
      unlockAccount(userId)
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
    } else {
      lockedAccount(userId)
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
    }
  };

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const allIds = tableData.map((item) => item.id);
      setSelectedIds(allIds);
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (event, id) => {
    if (event.target.checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter((itemId) => itemId !== id));
    }
  };

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) {
      toast.warning("Vui lòng chọn ít nhất một tài khoản để xóa.");
      return;
    }

    if (window.confirm(`Bạn có chắc chắn muốn xóa ${selectedIds.length} tài khoản đã chọn không?`)) {
      deleteMultipleAccounts(selectedIds)
        .then(() => {
          toast.success("Xóa tài khoản thành công!");
          fetchData();
        })
        .catch((error) => {
          toast.error(
            (error && error.message) || "Không thể xóa tài khoản. Vui lòng thử lại!"
          );
        });
    }
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
      <div className="container-fluid p-0">

          <br />
          <div className="container-fluid p-0"></div>
          <div className="card">
            <div className="card-header">
              <h5 className="card-title">Quản lý tài khoản</h5>
              <h6 className="card-subtitle text-muted">
                {" "}
                Quản lý tài khoản có các chức năng phân quyền và khóa tài khoản.
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
                        className="btn btn-danger" 
                        onClick={handleDeleteSelected}
                        disabled={selectedIds.length === 0}
                      >
                        <i className="align-middle" data-feather="trash-2"></i> 🗑️ Xóa đã chọn ({selectedIds.length})
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
                          <th style={{ width: "40px", textAlign: "center" }}>
                            <input 
                              type="checkbox" 
                              onChange={handleSelectAll}
                              checked={selectedIds.length === tableData.length && tableData.length > 0} 
                            />
                          </th>
                          <th
                            className="sorting sorting_asc"
                            tabindex="0"
                            aria-controls="datatables-buttons"
                            rowspan="1"
                            colspan="1"
                            style={{ width: "224px" }}
                          >
                            Họ và tên
                          </th>
                          <th
                            className="sorting"
                            tabindex="0"
                            aria-controls="datatables-buttons"
                            rowspan="1"
                            colspan="1"
                            style={{ width: "290px" }}
                          >
                            Email
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
                            style={{ width: "142px" }}
                          >
                            Trạng Thái
                          </th>
                          <th
                            className="sorting"
                            tabindex="0"
                            aria-controls="datatables-buttons"
                            rowspan="1"
                            colspan="1"
                            style={{ width: "134px" }}
                          >
                            Chế độ
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {tableData.map((item) => (
                          <tr key={item.id} className={selectedIds.includes(item.id) ? "table-active" : "odd"}>
                            <td style={{ textAlign: "center" }}>
                              <input 
                                type="checkbox" 
                                checked={selectedIds.includes(item.id)}
                                onChange={(e) => handleSelectOne(e, item.id)}
                              />
                            </td>
                            <td className="dtr-control sorting_1" tabindex="0">
                              {item.name}
                            </td>
                            <td>{item.email}</td>
                            <td>{item.phone}</td>

                            <td style={{ color: "green", textAlign: "center" }}>
                              <button
                                type="button"
                                class="btn btn-outline-success"
                                onClick={() =>
                                  handleLockedAccount(item.id, item.isLocked)
                                }
                              >
                                {item.isLocked === true ? "Mở" : "Khóa"}
                              </button>
                            </td>
                            <td>
                              <button
                                type="button"
                                class="btn btn-success"
                                onClick={() => handleAuthorization(item.id)}
                              >
                                Phân quyền
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
    </>
  );
}

export default AccountManagement;
