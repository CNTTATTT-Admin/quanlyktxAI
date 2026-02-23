import React, { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom'
import Nav from './Nav';
import SidebarNav from './SidebarNav';
import '../../assets/css/app.css';
import { approveRoomOfAdmin, getAllRoomApprovingOfAdmin, getNumberOfAdmin, removeRoomOfAdmin } from '../../services/fetch/ApiUtils';
import Pagination from './Pagnation';
import { toast } from 'react-toastify';
import ModalRoomDetails from './modal/ModalRoomDetail';

const DashboardAdmin = (props) => {
  const { authenticated, roleName, location, currentUser, onLogout } = props;

  const history = useNavigate();
  const [roomId, setRoomId] = useState(4);
  const [showModal, setShowModal] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  const [number, setNumber] = useState({
    numberOfAccount: '',
    numberOfApprove: '',
    numberOfApproving: '',
    numberOfAccountLocked: '',
  });

  useEffect(() => {
    fetchData();
  }, [currentPage]);

  const fetchData = () => {
    getAllRoomApprovingOfAdmin(currentPage, itemsPerPage, false).then(response => {
      setTableData(response.content);
      setTotalItems(response.totalElements);
    }).catch(
      error => {
        toast.error((error && error.message) || 'Oops! Có điều gì đó xảy ra. Vui lòng thử lại!');
      }
    )
  }

  const handleSetRoomId = (id) => {
    setRoomId(id);
    setShowModal(true);
  }

  const handleSendEmail = (userId) => {
    history('/admin/send-email/' + userId)
  }

  const handleIsApprove = (id) => {
    approveRoomOfAdmin(id).then(response => {
      toast.success(response.message)
      fetchData();
    }).catch(
      error => {
        toast.error((error && error.message) || 'Oops! Có điều gì đó xảy ra. Vui lòng thử lại!');
      }
    )
  }

  const handleIsRemove = (id) => {
    removeRoomOfAdmin(id).then(response => {
      toast.success(response.message)
      fetchData();
    }).catch(
      error => {
        toast.error((error && error.message) || 'Oops! Có điều gì đó xảy ra. Vui lòng thử lại!');
      }
    )
  }

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  useEffect(() => {
    getNumberOfAdmin()
      .then(response => {
        const number = response;
        setNumber(prevState => ({
          ...prevState,
          ...number
        }));
      })
      .catch(error => {
        console.log(error)
      });

  }, []);

  if (!authenticated) {
    return <Navigate
      to={{
        pathname: "/login-admin",
        state: { from: location }
      }} />;
  }

  return (
    <div className="wrapper">
      <nav id="sidebar" className="sidebar js-sidebar">
        <div className="sidebar-content js-simplebar">
          <a className="sidebar-brand" href="index.html">
            <span className="align-middle">ADMIN PRO</span>
          </a>
          <SidebarNav />
        </div>
      </nav>

      <div className="main">
        <Nav onLogout={onLogout} currentUser={currentUser} />

        <main style={{ margin: "20px 20px 20px 20px" }}>
          <div className="container-fluid p-0">
            <div class="row mb-2 mb-xl-3">
              <div class="col-auto d-none d-sm-block">
                <h3><strong>✨</strong> Thông kê</h3>
              </div>
            </div>
            <div class="row">
              <div class="col-sm-6 col-xl-3">
                <div class="card">
                  <div class="card-body">
                    <div class="row">
                      <div class="col mt-0">
                        <h5 class="card-title">Tài khoản</h5>
                      </div>

                      <div class="col-auto">
                        <div class="stat text-primary">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-dollar-sign align-middle"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                        </div>
                      </div>
                    </div>
                    <h1 class="mt-1 mb-3">{number.numberOfAccount}</h1>
                    <div class="mb-0">
                      <span class="badge badge-success-light"> <i class="mdi mdi-arrow-bottom-right"></i> 3.65% </span>

                    </div>
                  </div>
                </div>
              </div>
              <div class="col-sm-6 col-xl-3">
                <div class="card">
                  <div class="card-body">
                    <div class="row">
                      <div class="col mt-0">
                        <h5 class="card-title">Tin duyệt</h5>
                      </div>

                      <div class="col-auto">
                        <div class="stat text-primary">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-shopping-bag align-middle"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                        </div>
                      </div>
                    </div>
                    <h1 class="mt-1 mb-3">{number.numberOfApprove}</h1>
                    <div class="mb-0">
                      <span class="badge badge-danger-light"> <i class="mdi mdi-arrow-bottom-right"></i> -5.25% </span>

                    </div>
                  </div>
                </div>
              </div>
              <div class="col-sm-6 col-xl-3">
                <div class="card">
                  <div class="card-body">
                    <div class="row">
                      <div class="col mt-0">
                        <h5 class="card-title">Tin chưa duyệt</h5>
                      </div>

                      <div class="col-auto">
                        <div class="stat text-primary">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-activity align-middle"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                        </div>
                      </div>
                    </div>
                    <h1 class="mt-1 mb-3">{number.numberOfApproving}</h1>
                    <div class="mb-0">
                      <span class="badge badge-success-light"> <i class="mdi mdi-arrow-bottom-right"></i> 4.65% </span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-sm-6 col-xl-3">
                <div class="card">
                  <div class="card-body">
                    <div class="row">
                      <div class="col mt-0">
                        <h5 class="card-title">Tổng tin</h5>
                      </div>

                      <div class="col-auto">
                        <div class="stat text-primary">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-shopping-cart align-middle"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                        </div>
                      </div>
                    </div>
                    <h1 class="mt-1 mb-3">{number.numberOfAccountLocked}</h1>
                    <div class="mb-0">
                      <span class="badge badge-success-light"> <i class="mdi mdi-arrow-bottom-right"></i> 2.35% </span>

                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h5 className="card-title">Bài đăng và phòng trọ chưa duyệt</h5>
                <h6 className="card-subtitle text-muted"> Quản lý thật tốt các chức năng của phòng trọ và bài đăng.</h6>
              </div>
              <div className="card-body">
                <div id="datatables-buttons_wrapper" className="dataTables_wrapper dt-bootstrap5 no-footer"><div className="row"><div className="col-sm-12 col-md-6"><div className="dt-buttons btn-group flex-wrap">
                </div></div>
                  <div className="col-sm-12 col-md-6"><div id="datatables-buttons_filter" className="dataTables_filter">
                  </div></div></div><div className="row dt-row"><div className="col-sm-12"><table id="datatables-buttons" className="table table-striped dataTable no-footer dtr-inline" style={{ width: "100%" }} aria-describedby="datatables-buttons_info">
                    <thead>
                      <tr>
                        <th className="sorting sorting_asc" tabindex="0" aria-controls="datatables-buttons" rowspan="1" colspan="1" style={{ width: "224px" }}  >Tên Phòng</th>
                        <th className="sorting" tabindex="0" aria-controls="datatables-buttons" rowspan="1" colspan="1" style={{ width: "290px" }} >Mô Tả</th>
                        <th className="sorting" tabindex="0" aria-controls="datatables-buttons" rowspan="1" colspan="1" style={{ width: "156px" }} >Địa Chỉ</th>
                        <th className="sorting" tabindex="0" aria-controls="datatables-buttons" rowspan="1" colspan="1" style={{ width: "75px" }} >Giá</th>
                        <th className="sorting" tabindex="0" aria-controls="datatables-buttons" rowspan="1" colspan="1" style={{ width: "142px" }} >Trạng Thái</th>
                        <th className="sorting" tabindex="0" aria-controls="datatables-buttons" rowspan="1" colspan="1" style={{ width: "110px" }} >Phê duyệt</th>
                        <th className="sorting" tabindex="0" aria-controls="datatables-buttons" rowspan="1" colspan="1" style={{ width: "134px" }} >Gỡ tin</th>
                        <th className="sorting" tabindex="0" aria-controls="datatables-buttons" rowspan="1" colspan="1" style={{ width: "54px" }} ></th></tr>
                    </thead>
                    <tbody>
                      {tableData.map((item) => (
                        <tr className="odd">
                          <td className="dtr-control sorting_1" tabindex="0">{item.title}</td>
                          <td>{item.description}</td>
                          <td>{item.address}</td>
                          <td>{item.price && item.price.toLocaleString('vi-VN', {
                            style: 'currency',
                            currency: 'VND',
                          })}</td>
                          <td style={{ color: "green" }}>{item.status === "ROOM_RENT" || item.status === "CHECKED_OUT" ? "Chưa thuê" : "Đã thuê"}</td>
                          <td style={{ color: "green" }}>
                            <button type="button" class="btn btn-outline-success" onClick={() => handleIsApprove(item.id)}>
                              {item.isApprove === false ? "Duyệt" : "Đã duyệt"}
                            </button>
                          </td>
                          <td style={{ color: "green" }}>
                            <button type="button" class="btn btn-outline-danger" onClick={() => handleIsRemove(item.id)}>
                              {item.isRemove === false ? "Gỡ" : "Đã gỡ"}
                            </button>
                          </td>
                          <td>
                            <a href="#" onClick={() => handleSendEmail(item.user.id)} data-toggle="tooltip" data-placement="bottom" title="Gửi email"><svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512"><path d="M64 112c-8.8 0-16 7.2-16 16v22.1L220.5 291.7c20.7 17 50.4 17 71.1 0L464 150.1V128c0-8.8-7.2-16-16-16H64zM48 212.2V384c0 8.8 7.2 16 16 16H448c8.8 0 16-7.2 16-16V212.2L322 328.8c-38.4 31.5-93.7 31.5-132 0L48 212.2zM0 128C0 92.7 28.7 64 64 64H448c35.3 0 64 28.7 64 64V384c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V128z" /></svg></a>

                            &nbsp;
                            <a onClick={() => handleSetRoomId(item.id)} data-bs-toggle="modal" data-bs-target="#exampleModal" data-toggle="tooltip" data-placement="bottom" title="Xem chi tiết" >
                              <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512"><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM216 336h24V272H216c-13.3 0-24-10.7-24-24s10.7-24 24-24h48c13.3 0 24 10.7 24 24v88h8c13.3 0 24 10.7 24 24s-10.7 24-24 24H216c-13.3 0-24-10.7-24-24s10.7-24 24-24zm40-208a32 32 0 1 1 0 64 32 32 0 1 1 0-64z" /></svg> </a>

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
            {showModal && <ModalRoomDetails roomId={roomId} />}
          </div>
        </main>
      </div>
    </div>
  )
}

export default DashboardAdmin;