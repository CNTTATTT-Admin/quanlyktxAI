import React, { useEffect, useState } from "react";
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
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap');

        .admin-policy-scope,
        .admin-policy-scope * {
          font-family: 'Be Vietnam Pro', 'Plus Jakarta Sans', sans-serif;
        }

        .admin-policy-card {
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          background: #fff;
          box-shadow: 0 8px 20px rgba(15, 23, 42, 0.05);
          overflow: hidden;
        }

        .admin-policy-card .card-header {
          background: linear-gradient(90deg, #eff6ff 0%, #f8fbff 100%);
          border-bottom: 1px solid #e2e8f0;
          padding: 18px 22px;
        }

        .admin-policy-card .card-title {
          margin: 0;
          font-weight: 800;
          color: #0f172a;
        }

        .admin-policy-card .card-subtitle {
          margin-top: 6px;
          color: #64748b;
        }

        .admin-policy-edit-btn {
          border-radius: 999px;
          font-weight: 700;
          padding: 8px 16px;
          font-size: 0.84rem;
          box-shadow: 0 8px 18px rgba(37, 99, 235, 0.26);
          transition: all 0.2s ease;
        }

        .admin-policy-edit-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 12px 22px rgba(37, 99, 235, 0.33);
        }

        .admin-policy-card .card-body {
          padding: 22px;
          background: #f8fafc;
        }

        .admin-policy-loading,
        .admin-policy-empty {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 56px 20px;
          text-align: center;
          color: #64748b;
        }

        .admin-policy-content {
          background: #fff;
          border: 1px solid #dbeafe;
          border-radius: 16px;
          padding: 30px;
          max-width: 980px;
          margin: 0 auto;
          box-shadow: 0 12px 26px rgba(37, 99, 235, 0.08);
          position: relative;
          overflow: hidden;
        }

        .admin-policy-content::before {
          content: "";
          position: absolute;
          width: 180px;
          height: 180px;
          border-radius: 50%;
          background: rgba(59, 130, 246, 0.08);
          right: -70px;
          top: -70px;
          pointer-events: none;
        }

        .admin-policy-title {
          text-align: center;
          color: #1d4ed8;
          margin-bottom: 18px;
          padding-bottom: 12px;
          border-bottom: 1px solid #dbeafe;
          font-size: 1.5rem;
          font-weight: 800;
          letter-spacing: -0.2px;
          position: relative;
          z-index: 1;
        }

        .admin-policy-body {
          white-space: pre-line;
          line-height: 1.85;
          font-size: 1.02rem;
          color: #334155;
          position: relative;
          z-index: 1;
        }

        .admin-policy-updated {
          margin-top: 26px;
          padding-top: 16px;
          border-top: 1px dashed #dbeafe;
          text-align: right;
          color: #64748b;
          font-size: 0.82rem;
          font-style: italic;
          position: relative;
          z-index: 1;
        }
      `}</style>

      <div className="container-fluid p-0 admin-policy-scope">
        <div className="card admin-policy-card">
          <div className="card-header">
            <div className="row align-items-center g-3">
              <div className="col-sm-12 col-md-7">
                <h5 className="card-title mb-0">Nội quy chung của Kí túc xá</h5>
                <p className="card-subtitle small">Xem và quản lý nội quy chính thức của cơ sở.</p>
              </div>
              <div className="col-sm-12 col-md-5 text-md-end">
                <button
                  className="btn btn-primary admin-policy-edit-btn"
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

          <div className="card-body">
            {loading ? (
              <div className="admin-policy-loading">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Đang tải...</span>
                </div>
              </div>
            ) : policy ? (
              <div className="admin-policy-content">
                <h2 className="admin-policy-title">{policy.title}</h2>
                <div className="admin-policy-body">{policy.content}</div>
                <div className="admin-policy-updated">
                  Cập nhật lần cuối: {new Date(policy.updatedAt).toLocaleString("vi-VN")}
                </div>
              </div>
            ) : (
              <div className="admin-policy-empty">
                Chưa có nội dung nội quy nào được thiết lập.
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default PolicyManagement;
