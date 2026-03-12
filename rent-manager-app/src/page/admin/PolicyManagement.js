import React, { useEffect, useState } from "react";
import SidebarNav from "./SidebarNav";
import Nav from "./Nav";
import { toast } from "react-toastify";
import { Navigate, useNavigate } from "react-router-dom";
import { getPolicy } from "../../services/fetch/ApiUtils";

function PolicyManagement(props) {
  const { authenticated, role, currentUser, location, onLogout } = props;
  const navigate = useNavigate();

  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    setLoading(true);
    getPolicy()
      .then((response) => {
        setPolicy(response);
        setLoading(false);
      })
      .catch((error) => {
        toast.error(
          (error && error.message) ||
            "Oops! Có điều gì đó xảy ra. Vui lòng thử lại!",
        );
        setLoading(false);
      });
  };

  const handleEdit = () => {
    navigate(`/admin/policy-management/edit`);
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
      <div className="wrapper">
        <nav id="sidebar" className="sidebar js-sidebar">
          <div className="sidebar-content js-simplebar">
            <a className="sidebar-brand" href="/">
              <span className="align-middle">ADMIN PRO</span>
            </a>
            <SidebarNav />
          </div>
        </nav>

        <div className="main">
          <Nav onLogout={onLogout} currentUser={currentUser} />

          <br />
          <div className="container-fluid p-0">
            <div className="card shadow-sm">
              <div className="card-header bg-white py-3">
                <div className="row align-items-center">
                  <div className="col-sm-12 col-md-6">
                    <h5 className="card-title mb-0">Nội quy chung của Kí túc xá</h5>
                    <p className="card-subtitle text-muted small mt-1">
                      Xem và quản lý nội quy chính thức của cơ sở.
                    </p>
                  </div>
                  <div className="col-sm-12 col-md-6 text-end">
                    <button
                      className="btn btn-primary btn-md shadow-sm"
                      onClick={handleEdit}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="me-2"
                      >
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                      Cập nhật Nội quy
                    </button>
                  </div>
                </div>
              </div>
              <div className="card-body bg-light bg-opacity-10 p-4">
                {loading ? (
                  <div className="text-center p-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Đang tải...</span>
                    </div>
                  </div>
                ) : policy ? (
                  <div className="policy-content bg-white p-5 rounded border shadow-sm mx-auto" style={{maxWidth: '900px'}}>
                    <h2 className="text-center text-primary mb-4 border-bottom pb-3">{policy.title}</h2>
                    <div 
                      className="content-body" 
                      style={{
                        whiteSpace: 'pre-line', 
                        lineHeight: '1.8', 
                        fontSize: '1.1rem',
                        color: '#333'
                      }}
                    >
                      {policy.content}
                    </div>
                    <div className="mt-5 pt-4 border-top text-end text-muted small italic">
                      Cập nhật lần cuối: {new Date(policy.updatedAt).toLocaleString('vi-VN')}
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-5 text-muted">
                    Chưa có nội dung nội quy nào được thiết lập.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default PolicyManagement;
