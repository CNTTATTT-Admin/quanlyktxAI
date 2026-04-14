import { Navigate } from "react-router-dom";
import Nav from "./Nav";
import SidebarNav from "./SidebarNav";
import { useState } from "react";
import RoomService from "../../services/axios/RoomService";
import { toast } from "react-toastify";
import PlacesWithStandaloneSearchBox from "./map/StandaloneSearchBox";

function AddRoom(props) {
  const { authenticated, role, currentUser, location, onLogout } = props;

  const [roomData, setRoomData] = useState({
    title: "",
    description: "",
    price: "",
    latitude: 0.0,
    longitude: 0.0,
    address: "",
    locationId: "",
    categoryId: "",
    assets: [{ name: "", number: "" }],
    files: [],
    waterCost: "",
    publicElectricCost: "",
    internetCost: "",
    maxOccupancy: "",
    floor: "",
  });

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setRoomData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleRemoveAsset = (indexToRemove) => {
    setRoomData((prevState) => ({
      ...prevState,
      assets: prevState.assets.filter(
        (asset, index) => index !== indexToRemove,
      ),
    }));
  };

  const handleAssetChange = (event, index) => {
    const { name, value } = event.target;
    setRoomData((prevState) => ({
      ...prevState,
      assets: prevState.assets.map((asset, i) =>
        i === index ? { ...asset, [name]: value } : asset,
      ),
    }));
  };

  // ĐÃ SỬA: Chuyển đổi FileList thành mảng chuẩn và reset input để tránh lỗi kẹt file (nguyên nhân gây lỗi 500)
  const handleFileChange = (event) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      setRoomData((prevState) => ({
        ...prevState,
        files: [...prevState.files, ...newFiles],
      }));
      // Reset input để cho phép chọn lại cùng 1 file nếu cần
      event.target.value = null;
    }
  };

  // ĐÃ THÊM: Hàm xóa ảnh khỏi danh sách
  const handleRemoveImage = (indexToRemove) => {
    setRoomData((prevState) => ({
      ...prevState,
      files: prevState.files.filter((_, index) => index !== indexToRemove),
    }));
  };

  const setLatLong = (lat, long, address) => {
    setRoomData((prevRoomData) => ({
      ...prevRoomData,
      latitude: lat,
      longitude: long,
      address: address,
    }));
  };

  const validateForm = () => {
    if (!roomData.title.trim()) {
      toast.warning("Vui lòng nhập tiêu đề phòng.");
      return false;
    }

    if (!roomData.locationId) {
      toast.warning("Vui lòng chọn khu vực.");
      return false;
    }

    if (!roomData.categoryId) {
      toast.warning("Vui lòng chọn danh mục.");
      return false;
    }

    if (!roomData.address.trim()) {
      toast.warning("Vui lòng chọn địa chỉ trên bản đồ.");
      return false;
    }

    if (Number(roomData.price) <= 0) {
      toast.warning("Giá thuê phải lớn hơn 0.");
      return false;
    }

    if (Number(roomData.maxOccupancy) <= 0) {
      toast.warning("Sức chứa phải lớn hơn 0.");
      return false;
    }

    if (Number(roomData.floor) <= 0) {
      toast.warning("Tầng phải lớn hơn 0.");
      return false;
    }

    return true;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    const toNumberOrZero = (value) =>
      value === "" || value === null || value === undefined ? 0 : value;

    const formData = new FormData();
    formData.append("title", roomData.title);
    formData.append("description", roomData.description);
    formData.append("price", toNumberOrZero(roomData.price));
    formData.append("latitude", roomData.latitude);
    formData.append("longitude", roomData.longitude);
    formData.append("address", roomData.address);
    formData.append("locationId", toNumberOrZero(roomData.locationId));
    formData.append("categoryId", toNumberOrZero(roomData.categoryId));
    formData.append("asset", roomData.assets.length);
    formData.append("waterCost", toNumberOrZero(roomData.waterCost));
    formData.append(
      "publicElectricCost",
      toNumberOrZero(roomData.publicElectricCost),
    );
    formData.append("internetCost", toNumberOrZero(roomData.internetCost));
    formData.append("maxOccupancy", toNumberOrZero(roomData.maxOccupancy));
    formData.append("floor", toNumberOrZero(roomData.floor));
    roomData.assets.forEach((asset, index) => {
      formData.append(`assets[${index}][name]`, asset.name);
      formData.append(`assets[${index}][number]`, asset.number);
    });
    
    roomData.files.forEach((file) => {
      formData.append(`files`, file);
    });

    RoomService.addNewRoom(formData)
      .then((response) => {
        toast.success(response.message);
        toast.success("Đăng tin thành công!!");
      })
      .then((data) => {
        setRoomData({
          title: "",
          description: "",
          price: "",
          latitude: 0.0,
          longitude: 0.0,
          address: "",
          locationId: "",
          categoryId: "",
          assets: [{ name: "", number: "" }],
          files: [],
          waterCost: "",
          publicElectricCost: "",
          internetCost: "",
          maxOccupancy: "",
          floor: "",
        });
      })
      .catch((error) => {
        toast.error(
          (error && error.message) ||
            "Oops! Có điều gì đó xảy ra. Vui lòng thử lại!",
        );
      });
  };

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

  return (
    <>
      <style>{`
        .eco-bg { background-color: #F8FAFC; min-height: 100vh; font-family: 'Inter', sans-serif; }
        .text-emerald { color: #10B981 !important; }
        .bg-emerald { background-color: #10B981 !important; color: white !important; }
        
        .modern-card { border-radius: 16px; border: none; box-shadow: 0 4px 20px rgba(0,0,0,0.03); background: #fff; }
        
        .modern-input { border-radius: 8px; border: 1px solid #E2E8F0; padding: 10px 15px; font-size: 0.95rem; background-color: #F8FAFC; transition: all 0.3s; }
        .modern-input:focus { border-color: #10B981; box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1); background-color: #fff; outline: none; }
        .modern-label { font-weight: 600; color: #475569; font-size: 0.85rem; margin-bottom: 6px; }

        .btn-modern { border-radius: 8px; font-weight: 600; padding: 10px 20px; transition: all 0.3s; }
        .btn-modern:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2); }
        
        .gallery-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 12px; }
        .gallery-item { width: 100%; height: 100px; border-radius: 8px; object-fit: cover; border: 1px solid #E2E8F0; }
        
        .asset-row { background: #fff; border: 1px solid #E2E8F0; border-radius: 8px; padding: 10px; margin-bottom: 10px; display: flex; gap: 10px; align-items: center; }

        /* Nút xóa ảnh */
        .btn-remove-image { width: 22px; height: 22px; padding: 0; display: flex; align-items: center; justify-content: center; border-radius: 50%; top: -8px; right: -8px; z-index: 10; transition: all 0.2s; box-shadow: 0 2px 5px rgba(0,0,0,0.2); }
        .btn-remove-image:hover { transform: scale(1.1); background-color: #dc3545; }
      `}</style>

      <div className="container-fluid p-4 eco-bg">
        <div className="row mb-4">
          <div className="col-12">
            <h2 className="fw-bolder text-dark mb-1">Thêm phòng mới</h2>
            <p className="text-muted mb-0">Nhập thông tin chi tiết để đăng tin cho thuê phòng.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="row g-4">
            
            <div className="col-12 col-xl-5 col-lg-6 d-flex flex-column gap-4">
              
              <div className="modern-card p-4">
                <h5 className="fw-bold text-emerald mb-4 d-flex align-items-center">
                  <i className="bi bi-info-circle-fill me-2 fs-5"></i> Thông tin phòng
                </h5>

                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="modern-label" htmlFor="price">Giá thuê (VNĐ)</label>
                    <input type="number" min="1" required className="modern-input w-100" id="price" name="price" value={roomData.price} onChange={handleInputChange} placeholder="Ví dụ: 2500000" />
                  </div>
                  <div className="col-md-6">
                    <label className="modern-label" htmlFor="maxOccupancy">Sức chứa (Người)</label>
                    <input type="number" min="1" required className="modern-input w-100" id="maxOccupancy" name="maxOccupancy" value={roomData.maxOccupancy} onChange={handleInputChange} placeholder="Ví dụ: 4" />
                  </div>

                  <div className="col-md-6">
                    <label className="modern-label" htmlFor="floor">Tầng</label>
                    <input type="number" min="1" required className="modern-input w-100" id="floor" name="floor" value={roomData.floor} onChange={handleInputChange} placeholder="Ví dụ: 2" />
                  </div>
                  <div className="col-md-6">
                    <label className="modern-label" htmlFor="internetCost">Tiền mạng</label>
                    <input type="number" className="modern-input w-100" id="internetCost" name="internetCost" value={roomData.internetCost} onChange={handleInputChange} placeholder="Ví dụ: 100000" />
                  </div>

                  <div className="col-md-6">
                    <label className="modern-label" htmlFor="waterCost">Tiền nước (nếu giá cố định)</label>
                    <input type="number" className="modern-input w-100" id="waterCost" name="waterCost" value={roomData.waterCost} onChange={handleInputChange} placeholder="Ví dụ: 50000" />
                  </div>

                  <div className="col-md-6">
                    <label className="modern-label" htmlFor="publicElectricCost">Tiền điện (nếu giá cố định)</label>
                    <input type="number" className="modern-input w-100" id="publicElectricCost" name="publicElectricCost" value={roomData.publicElectricCost} onChange={handleInputChange} placeholder="Ví dụ: 70000" />
                  </div>

                  <div className="col-12">
                    <label className="modern-label" htmlFor="title">Tiêu đề phòng KTX</label>
                    <input type="text" required className="modern-input w-100" id="title" name="title" value={roomData.title} onChange={handleInputChange} placeholder="Ví dụ: Phòng mới full nội thất gần trung tâm" />
                  </div>
                  <div className="col-12">
                    <label className="modern-label" htmlFor="address">Địa Chỉ (Tìm kiếm vị trí)</label>
                    <div className="w-100">
                        <PlacesWithStandaloneSearchBox latLong={setLatLong} />
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label className="modern-label" htmlFor="locationId">Khu vực</label>
                    <select required className="modern-input w-100" id="locationId" name="locationId" value={roomData.locationId} onChange={handleInputChange}>
                      <option value="">Chọn...</option>
                      <option value={1}>Hà Nội</option>
                      <option value={2}>Tp.Hồ Chí Minh</option>
                      <option value={3}>Đà Nẵng</option>
                      <option value={4}>Hải Phòng</option>
                      <option value={5}>Cần Thơ</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="modern-label" htmlFor="categoryId">Danh mục</label>
                    <select required className="modern-input w-100" id="categoryId" name="categoryId" value={roomData.categoryId} onChange={handleInputChange}>
                      <option value="">Chọn...</option>
                      <option value={1}>Kí túc xá nam</option>
                      <option value={2}>Kí túc xá nữ</option>
                      <option value={3}>Kí túc xá dịch vụ</option>
                    </select>
                  </div>

                  <div className="col-12">
                    <label className="modern-label" htmlFor="description">Mô tả thêm</label>
                    <textarea className="modern-input w-100" id="description" name="description" value={roomData.description} onChange={handleInputChange} rows="3" placeholder="Mô tả tiện ích, nội quy, giờ giấc..." ></textarea>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-top">
                  <button type="submit" className="btn bg-emerald text-white btn-modern w-100 fs-5">
                    Đăng tin ngay
                  </button>
                </div>
              </div>

            </div>

            <div className="col-12 col-xl-7 col-lg-6 d-flex flex-column gap-4">
              
              <div className="modern-card p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="fw-bold text-emerald mb-0 d-flex align-items-center">
                    <i className="bi bi-images me-2 fs-5"></i> Lựa chọn ảnh
                  </h5>

                  <div>
                    <label htmlFor="file-upload" className="btn btn-outline-success btn-sm rounded-pill fw-bold px-3 py-2 cursor-pointer mb-0">
                      <i className="bi bi-plus-lg me-1"></i> Tải ảnh lên
                    </label>
                    <input id="file-upload" type="file" name="files" multiple onChange={handleFileChange} className="d-none" />
                  </div>
                </div>

                <div className="gallery-grid">
                  {roomData.files && roomData.files.length > 0 ? (
                    roomData.files.map((file, index) => (
                      <div key={`new-${index}`} className="position-relative">
                        <img src={URL.createObjectURL(file)} alt="upload-preview" className="gallery-item shadow-sm border-success" />
                        
                        <button 
                          type="button" 
                          className="btn btn-danger position-absolute btn-remove-image" 
                          onClick={() => handleRemoveImage(index)}
                          title="Xóa ảnh này"
                        >
                          <i className="bi bi-x" style={{ fontSize: '14px', fontWeight: 'bold' }}></i>
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-5 bg-light rounded-3 border border-dashed w-100" style={{ gridColumn: "1 / -1" }}>
                      <span className="text-muted font-italic">Bạn chưa chọn ảnh nào</span>
                    </div>
                  )}
                </div>
              </div>

              {/* KHỐI: NỘI THẤT & ĐỒ DÙNG */}
              <div className="modern-card p-4 flex-grow-1">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="fw-bold text-emerald mb-0 d-flex align-items-center">
                    <i className="bi bi-box-seam-fill me-2 fs-5"></i> Nội thất & Đồ dùng
                  </h5>
                  <button 
                    type="button" 
                    className="btn btn-outline-success btn-sm rounded-pill fw-bold px-3 py-2"
                    onClick={() => setRoomData((prevState) => ({ ...prevState, assets: [...prevState.assets, { name: "", number: "" }] }))}
                  >
                    <i className="bi bi-plus-lg me-1"></i> Thêm đồ dùng
                  </button>
                </div>

                <div className="assets-container">
                  <div className="row px-2 mb-2 d-none d-md-flex">
                    <div className="col-md-7"><small className="text-muted fw-bold text-uppercase">Tên đồ dùng</small></div>
                    <div className="col-md-3"><small className="text-muted fw-bold text-uppercase">Số lượng</small></div>
                    <div className="col-md-2 text-center"><small className="text-muted fw-bold text-uppercase">Xóa</small></div>
                  </div>

                  {roomData.assets?.map((asset, index) => (
                    <div key={index} className="asset-row shadow-sm">
                      <div className="col-12 col-md-7">
                        <input
                          type="text"
                          className="modern-input w-100 py-2 border-0 bg-light"
                          placeholder="Nhập tên tài sản..."
                          id={`assetName${index}`}
                          name="name"
                          value={asset.name}
                          onChange={(event) => handleAssetChange(event, index)}
                        />
                      </div>
                      <div className="col-8 col-md-3 mt-2 mt-md-0">
                        <input
                          type="number"
                          className="modern-input w-100 py-2 border-0 bg-light text-center"
                          placeholder="SL"
                          id={`assetNumber${index}`}
                          name="number"
                          value={asset.number}
                          onChange={(event) => handleAssetChange(event, index)}
                        />
                      </div>
                      <div className="col-4 col-md-2 mt-2 mt-md-0 text-end text-md-center">
                        <button type="button" className="btn btn-light text-danger border shadow-sm px-3 py-2 rounded-3" onClick={() => handleRemoveAsset(index)}>
                          <i className="bi bi-trash3-fill"></i>
                        </button>
                      </div>
                    </div>
                  ))}

                  {(!roomData.assets || roomData.assets.length === 0) && (
                    <div className="text-center py-4 bg-light rounded-3 border border-dashed mt-3">
                      <span className="text-muted font-italic">Chưa có nội thất nào được kê khai</span>
                    </div>
                  )}
                </div>
              </div>

            </div>

          </div>
        </form>
      </div>
    </>
  );
}

export default AddRoom;