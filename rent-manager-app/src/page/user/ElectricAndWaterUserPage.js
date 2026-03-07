import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { toast } from "react-toastify";
import SidebarNav from "./SidebarNav";
import {
  getElectricByRoomUser,
  payElectricBill,
} from "../../services/fetch/ApiUtils";
import Header from "../../common/Header";
import Footer from "../../common/Footer";
import Pagination from "./Pagnation";

function ElectricAndWaterUserPage(props) {
  const { authenticated, currentUser, location, onLogout } = props;

  const [tableData, setTableData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    if (authenticated && currentUser?.allocatedRoomId) {
      fetchElectricBills();
    }
  }, [currentPage, authenticated, currentUser]);

  const fetchElectricBills = () => {
    if (!currentUser?.allocatedRoomId) return;

    getElectricByRoomUser(currentUser.allocatedRoomId)
      .then((response) => {
        // Since backend returns a direct array for this endpoint currently, check if it's an array
        const data = Array.isArray(response)
          ? response
          : response.content || [];

        // Paginate manually since backend might return a direct array without pagination metadata
        // for this new endpoint `getElectricByRoomUser`
        const total = Array.isArray(response)
          ? response.length
          : response.totalElements || data.length;

        // sort by month or ID
        data.sort((a, b) => b.id - a.id);

        const indexOfLastItem = currentPage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;
        const currentItems = Array.isArray(response)
          ? data.slice(indexOfFirstItem, indexOfLastItem)
          : data;

        setTableData(currentItems);
        setTotalItems(total);
      })
      .catch((error) => {
        toast.error(
          (error && error.message) || "Không thể tải hóa đơn điện nước.",
        );
      });
  };

  const handlePay = (id) => {
    if (window.confirm("Bạn có chắc chắn muốn thanh toán hóa đơn này không?")) {
      payElectricBill(id)
        .then((response) => {
          toast.success(response?.message || "Thanh toán thành công");
          fetchElectricBills();
        })
        .catch((error) => {
          toast.error((error && error.message) || "Thanh toán thất bại.");
        });
    }
  };

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  if (!authenticated) {
    return <Navigate to={{ pathname: "/login", state: { from: location } }} />;
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
              <SidebarNav />
            </div>
          </nav>

          <div className="main">
            <div className="container-fluid p-0">
              <div className="row">
                <div className="col-12">
                  <div className="card">
                    <div className="card-header">
                      <h5 className="card-title">Hóa đơn điện nước</h5>
                    </div>
                    <div className="card-body">
                      {!currentUser?.allocatedRoomId ? (
                        <div className="alert alert-warning">
                          Bạn chưa được phân phòng, không có hóa đơn điện nước.
                        </div>
                      ) : (
                        <>
                          <table
                            className="table table-striped"
                            style={{ width: "100%" }}
                          >
                            <thead>
                              <tr>
                                <th>Tên hóa đơn</th>
                                <th>Tháng</th>
                                <th>Số điện</th>
                                <th>Số khối nước</th>
                                <th>Tiền Điện (Chưa chia)</th>
                                <th>Tiền Nước (Chưa chia)</th>
                                <th>Cần Đóng</th>
                                <th>Trạng thái</th>
                                <th>Hành động</th>
                              </tr>
                            </thead>
                            <tbody>
                              {tableData.length === 0 ? (
                                <tr>
                                  <td colSpan="9" className="text-center">
                                    Chưa có hóa đơn nào.
                                  </td>
                                </tr>
                              ) : (
                                tableData.map((item) => (
                                  <tr key={item.id}>
                                    <td>{item.name}</td>
                                    <td>Tháng {item.month}</td>
                                    <td>
                                      {item.thisMonthNumberOfElectric -
                                        item.lastMonthNumberOfElectric}
                                    </td>
                                    <td>
                                      {item.thisMonthBlockOfWater -
                                        item.lastMonthBlockOfWater}
                                    </td>
                                    <td>
                                      {item.totalMoneyOfElectric?.toLocaleString(
                                        "vi-VN",
                                        {
                                          style: "currency",
                                          currency: "VND",
                                        },
                                      )}
                                    </td>
                                    <td>
                                      {item.totalMoneyOfWater?.toLocaleString(
                                        "vi-VN",
                                        {
                                          style: "currency",
                                          currency: "VND",
                                        },
                                      )}
                                    </td>
                                    <td>
                                      <strong className="text-danger">
                                        {(
                                          (item.perPersonElectric || 0) +
                                          (item.perPersonWater || 0)
                                        ).toLocaleString("vi-VN", {
                                          style: "currency",
                                          currency: "VND",
                                        })}
                                      </strong>
                                      <br />
                                      <small className="text-muted">
                                        (Điện:{" "}
                                        {item.perPersonElectric?.toLocaleString(
                                          "vi-VN",
                                          {
                                            style: "currency",
                                            currency: "VND",
                                          },
                                        )}{" "}
                                        / Nước:{" "}
                                        {item.perPersonWater?.toLocaleString(
                                          "vi-VN",
                                          {
                                            style: "currency",
                                            currency: "VND",
                                          },
                                        )}
                                        )
                                      </small>
                                    </td>
                                    <td>
                                      {item.paid ? (
                                        <span className="badge bg-success">
                                          Đã thanh toán
                                        </span>
                                      ) : (
                                        <span className="badge bg-warning text-dark">
                                          Chưa thanh toán
                                        </span>
                                      )}
                                    </td>
                                    <td>
                                      {!item.paid && (
                                        <button
                                          className="btn btn-sm btn-primary"
                                          onClick={() => handlePay(item.id)}
                                        >
                                          Thanh toán
                                        </button>
                                      )}
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                          <Pagination
                            itemsPerPage={itemsPerPage}
                            totalItems={totalItems}
                            paginate={paginate}
                            currentPage={currentPage}
                          />
                        </>
                      )}
                    </div>
                  </div>
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

export default ElectricAndWaterUserPage;
