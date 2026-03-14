import { Navigate, useParams } from "react-router-dom";
import {
  getAccountById,
  setAuthorization,
} from "../../services/fetch/ApiUtils";
import { useEffect, useState } from "react";
import SidebarNav from "./SidebarNav";
import Nav from "./Nav";
import { toast } from "react-toastify";

const Authorization = (props) => {
  const { authenticated, role, currentUser, location, onLogout } = props;
  const { userId } = useParams();

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [roleId, setRoleId] = useState(1);
  const [imageUrl, setImageUrl] = useState();
  const [roleName, setRoleName] = useState();

  const handleSubmit = (event) => {
    event.preventDefault();
    let roleRequest = "";
    if (roleId === 1) {
      roleRequest = { roleName: "USER" };
    } else {
      roleRequest = { roleName: "RENTALER" };
    }

    setAuthorization(userId, roleRequest)
      .then((response) => {
        toast.success(response.message);
      })
      .catch((error) => {
        toast.error(
          (error && error.message) ||
            "Oops! Có điều gì đó xảy ra. Vui lòng thử lại!",
        );
      });
  };

  useEffect(() => {
    getAccountById(userId)
      .then((response) => {
        setEmail(response.email);
        setName(response.name);
        setAddress(response.address);
        setImageUrl(response.imageUrl);
        setPhone(response.phone);
        setRoleName(response.roles[0].name);
        console.log(response);
      })
      .catch((error) => {
        toast.error(
          (error && error.message) ||
            "Oops! Có điều gì đó xảy ra. Vui lòng thử lại!",
        );
      });
  }, [userId]);

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

  console.log("ID", userId);

  return (
    <>
      <div className="profile-info">
        <div className="profile-avatar">
          {imageUrl ? (
            <img src={imageUrl} alt={currentUser.name} />
          ) : (
            <div className="text-avatar">
              <span>{name[0]}</span>
            </div>
          )}
        </div>
        <div className="profile-name">
          <h2>{name}</h2>
          <p className="profile-email">{email}</p>
        </div>
      </div>

      <div class="card">
        <div class="card-body">
          <form onSubmit={handleSubmit}>
            <div class="row">
              <div class="mb-3 col-md-6">
                <label class="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  name="email"
                  id="inputEmail4"
                  placeholder="Email"
                  disabled
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div class="mb-3 col-md-6">
                <label class="form-label">Số điện thoại</label>
                <input
                  type="text"
                  className="form-control"
                  name="phone"
                  id="inputPassword4"
                  placeholder="Số điện thoại"
                  disabled
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>
            <div class="mb-3">
              <label class="form-label" for="inputAddress">
                Họ và Tên
              </label>
              <input
                type="text"
                className="form-control"
                name="name"
                id="inputAddress"
                placeholder="Peter Parker"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled
              />
            </div>
            <div class="mb-3">
              <label class="form-label" for="inputAddress">
                Địa chỉ
              </label>
              <input
                type="text"
                className="form-control"
                name="address"
                id="inputAddress"
                placeholder="Peter Parker"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                disabled
              />
            </div>
            <div class="mb-3">
              <label class="form-label" for="inputAddress">
                Quyền
              </label>
              <input
                type="text"
                className="form-control"
                name="address"
                id="inputAddress"
                placeholder="Peter Parker"
                value={
                  roleName === "ROLE_RENTALER"
                    ? "Người cho thuê"
                    : roleName === "ROLE_ADMIN"
                      ? "Quản trị viên"
                      : "Khách hàng"
                }
                disabled
              />
            </div>

            {roleName === "ROLE_ADMIN" ? (
              <div className="alert alert-warning" role="alert">
                Tài khoản Quản trị viên không thể thay đổi quyền.
              </div>
            ) : (
              <div className="mb-3">
                <label className="form-label" htmlFor="locationId">
                  Quyền
                </label>
                <select
                  className="form-select"
                  id="locationId"
                  name="roleId"
                  value={roleId}
                  onChange={(e) => setRoleId(Number(e.target.value))}
                >
                  <option value={1}>Khách hàng</option>
                  <option value={3}>Người cho thuê</option>
                </select>
              </div>
            )}

            {roleName !== "ROLE_ADMIN" && (
              <button type="submit" class="btn btn-primary">
                Submit
              </button>
            )}
          </form>
        </div>
      </div>
    </>
  );
};

export default Authorization;
