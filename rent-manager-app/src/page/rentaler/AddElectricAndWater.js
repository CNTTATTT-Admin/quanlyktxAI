import { Navigate } from "react-router-dom";
import Nav from "./Nav";
import SidebarNav from "./SidebarNav";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { getRentOfHome } from "../../services/fetch/ApiUtils";
import { ACCESS_TOKEN } from "../../constants/Connect";

const AddElectric = (props) => {
  const { authenticated, role, currentUser, location, onLogout } = props;

  const [roomOptions, setRoomOptions] = useState([]);

  const [electricData, setElectricData] = useState({
    name: "",
    month: "",
    lastMonthNumberOfElectric: "",
    thisMonthNumberOfElectric: "",
    lastMonthBlockOfWater: "",
    thisMonthBlockOfWater: "",
    moneyEachNumberOfElectric: "",
    moneyEachBlockOfWater: "",
    roomId: '',
  });

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setElectricData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
      const data = {
        name: electricData.name,
        month: electricData.month,
        lastMonthNumberOfElectric: electricData.lastMonthNumberOfElectric,
        thisMonthNumberOfElectric: electricData.thisMonthNumberOfElectric,
        lastMonthBlockOfWater: electricData.lastMonthBlockOfWater,
        thisMonthBlockOfWater: electricData.thisMonthBlockOfWater,
        moneyEachNumberOfElectric: electricData.moneyEachNumberOfElectric,
        moneyEachBlockOfWater: electricData.moneyEachBlockOfWater,
        room: {
            id: electricData.roomId
        }
      };
    await axios
      .post("http://localhost:8080/electric-water/create", data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`,
        },
      })
      .then(toast.success("Thêm mới thành công"));
  };

  useEffect(() => {
    getRentOfHome()
      .then((response) => {
        const room = response.content;
        setRoomOptions(room);
      })
      .catch((error) => {
        toast.error(
          (error && error.message) ||
            "Oops! Có điều gì đó xảy ra. Vui lòng thử lại!"
        );
      });
  }, []);

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

  console.log("electricData", electricData);
  console.log("roomOptions", roomOptions);
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
          <div className="container-fluid p-0">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title">Tiền điện nước</h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <label className="form-label" htmlFor="name">
                    Tên hóa đơn
                  </label>
                  <div className="row mx-1 mb-3">
                    <input
                      type="text"
                      className="form-control"
                      id="name"
                      name="name"
                      value={electricData.name}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="row">
                    <div className="mb-3 col-md-6">
                      <label className="form-label" htmlFor="lastMonthBlock">
                        Tháng sử dụng
                      </label>
                      <select
                        className="form-control"
                        id="lastMonthBlock"
                        name="month"
                        value={electricData.month}
                        onChange={handleInputChange}
                      >
                        {Array.from({ length: 12 }, (_, i) => (
                          <option key={i + 1} value={i + 1}>
                            Tháng {i + 1}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-3 col-md-6">
                      <label className="form-label" htmlFor="lastMonthNumberOfElectric">
                        Số điện tháng trước
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="lastMonthNumberOfElectric"
                        name="lastMonthNumberOfElectric"
                        value={electricData.lastMonthNumberOfElectric}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="mb-3 col-md-6">
                      <label className="form-label" htmlFor="thisMonthNumberOfElectric">
                        Số điện tháng này
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="thisMonthNumberOfElectric"
                        name="thisMonthNumberOfElectric"
                        value={electricData.thisMonthNumberOfElectric}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="mb-3 col-md-6">
                      <label className="form-label" htmlFor="moneyEachNumberOfElectric">
                        Số tiền mỗi số
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="moneyEachNumberOfElectric"
                        name="moneyEachNumberOfElectric"
                        value={electricData.moneyEachNumberOfElectric}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="mb-3 col-md-6">
                        <label className="form-label" htmlFor="lastMonthBlockOfWater">
                          Số khối tháng trước
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="lastMonthBlockOfWater"
                          name="lastMonthBlockOfWater"
                          value={electricData.lastMonthBlockOfWater}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div className="mb-3 col-md-6">
                        <label className="form-label" htmlFor="thisMonthBlockOfWater">
                          Số khối tháng này
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="thisMonthBlockOfWater"
                          name="thisMonthBlockOfWater"
                          value={electricData.thisMonthBlockOfWater}
                          onChange={handleInputChange}
                        />
                      </div>
                  </div>

                  <div className="row">
                      <div className="mb-3 col-md-6">
                        <label className="form-label" htmlFor="moneyEachBlockOfWater">
                          Số tiền mỗi khối
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="moneyEachBlockOfWater"
                          name="moneyEachBlockOfWater"
                          value={electricData.moneyEachBlockOfWater}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="mb-3 col-md-6">
                      <label className="form-label" htmlFor="roomId">
                        Chọn phòng
                      </label>
                      <select
                        className="form-select"
                        id="roomId"
                        name="roomId"
                        value={electricData.roomId}
                        onChange={handleInputChange}
                      >
                      <option value="">Chọn...</option>
                      {roomOptions.map((roomOption) => (
                        <option key={roomOption.id} value={roomOption.id}>
                          {roomOption.title}
                        </option>
                      ))}
                    </select>
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary">
                    Submit
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddElectric;
