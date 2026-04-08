import { Navigate, useParams, useNavigate } from "react-router-dom";
import Nav from "./Nav";
import SidebarNav from "./SidebarNav";
import { useEffect, useState } from "react";
import RoomService from "../../services/axios/RoomService";
import { toast } from "react-toastify";
import { getRoom } from "../../services/fetch/ApiUtils";
import { API_BASE_URL } from "../../constants/Connect";
import PlacesWithStandaloneSearchBox from "./map/StandaloneSearchBox";

function EditRoom(props) {
  const { authenticated, role, currentUser, location, onLogout } = props;
  const { id } = useParams();
  const navigate = useNavigate();

  const [roomData, setRoomData] = useState({
    title: "",
    description: "",
    price: 0,
    latitude: 0.0,
    longitude: 0.0,
    address: "",
    locationId: 0,
    categoryId: 0,
    assets: [{ name: "", number: "" }],
    files: [],
    waterCost: 0,
    publicElectricCost: 0,
    internetCost: 0,
    maxOccupancy: 0,
    floor: 0,
    roomMedia: [],
  });

  const [selectedImages, setSelectedImages] = useState([]);

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
      assets: prevState.assets?.map((asset, i) =>
        i === index ? { ...asset, [name]: value } : asset,
      ),
    }));
  };

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    setRoomData((prevState) => ({
      ...prevState,
      files: [...prevState.files, ...files],
    }));

    const filePreviews = files.map((file) => URL.createObjectURL(file));
    setSelectedImages((prevImages) => [...prevImages, ...filePreviews]);
  };

  useEffect(() => {
    if (!id || id === "undefined") return;

    getRoom(id)
      .then((response) => {
        const room = response;
        console.log("room", room);
        setRoomData((prevState) => ({
          ...prevState,
          ...room,
          locationId: room.location ? room.location.id : 0,
          categoryId: room.category ? room.category.id : 0,
        }));
      })
      .catch((error) => {
        toast.error(
          (error && error.message) ||
            "Oops! Có điều gì đó xảy ra. Vui lòng thử lại!",
        );
      });
  }, [id]);

  const setLatLong = (lat, long, address) => {
    console.log("lat", lat);
    setRoomData((prevRoomData) => ({
      ...prevRoomData,
      latitude: lat,
      longitude: long,
      address: address,
    }));
  };

  const handleRemoveResident = (residentId) => {
    if (
      window.confirm(
        "Bạn có chắc chắn muốn xóa người này ra khỏi phòng không? Hệ thống sẽ gửi email thông báo cho họ.",
      )
    ) {
      RoomService.removeResident(id, residentId)
        .then((response) => {
          toast.success("Xóa người dùng ra khỏi phòng thành công");
          // Refresh room data
          getRoom(id).then((response) => {
            setRoomData((prevState) => ({
              ...prevState,
              ...response,
              locationId: response.location
                ? response.location.id
                : prevState.locationId,
              categoryId: response.category
                ? response.category.id
                : prevState.categoryId,
            }));
          });
        })
        .catch((error) => {
          toast.error(
            (error && error.data && error.data.message) ||
              "Oops! Có điều gì đó xảy ra. Vui lòng thử lại!",
          );
        });
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log("SUBMIT");

    const formData = new FormData();
    formData.append("title", roomData.title);
    formData.append("description", roomData.description);
    formData.append("price", roomData.price);
    formData.append("latitude", roomData.latitude);
    formData.append("longitude", roomData.longitude);
    formData.append("address", roomData.address);
    formData.append("locationId", roomData.locationId);
    formData.append("categoryId", roomData.categoryId);
    formData.append("asset", roomData.assets.length);
    formData.append("waterCost", roomData.waterCost);
    formData.append("publicElectricCost", roomData.publicElectricCost);
    formData.append("internetCost", roomData.internetCost);
    formData.append("maxOccupancy", roomData.maxOccupancy);
    formData.append("floor", roomData.floor);
    roomData.assets.forEach((asset, index) => {
      formData.append(`assets[${index}][name]`, asset.name);
      formData.append(`assets[${index}][number]`, asset.number);
    });
    roomData.files.forEach((file, index) => {
      formData.append(`files`, file);
    });
    RoomService.updateRoom(id, formData)
      .then((response) => {
        toast.success(response.message);
        toast.success("Cập nhật thông tin phòng thành công.");
      })
      .catch((error) => {
        toast.error(
          (error && error.message) ||
            "Oops! Có điều gì đó xảy ra. Vui lòng thử lại!",
        );
      });

    console.log(roomData);
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
        .border-emerald { border-color: #10B981 !important; }
        
        .modern-card { border-radius: 16px; border: none; box-shadow: 0 4px 20px rgba(0,0,0,0.03); background: #fff; }
        
        .modern-input { border-radius: 8px; border: 1px solid #E2E8F0; padding: 10px 15px; font-size: 0.95rem; background-color: #F8FAFC; transition: all 0.3s; }
        .modern-input:focus { border-color: #10B981; box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1); background-color: #fff; outline: none; }
        .modern-label { font-weight: 600; color: #475569; font-size: 0.85rem; margin-bottom: 6px; }

        .btn-modern { border-radius: 8px; font-weight: 600; padding: 10px 20px; transition: all 0.3s; }
        .btn-modern:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2); }
        
        .image-preview-wrapper { width: 100%; height: 250px; border-radius: 12px; overflow: hidden; margin-bottom: 20px; border: 1px solid #E2E8F0; }
        .image-preview-wrapper img { width: 100%; height: 100%; object-fit: cover; }
        
        .gallery-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 10px; }
        .gallery-item { width: 100%; height: 100px; border-radius: 8px; object-fit: cover; border: 1px solid #E2E8F0; }
        
        .resident-item { border: 1px solid #E2E8F0; border-radius: 12px; padding: 12px; display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; transition: all 0.3s; }
        .resident-item:hover { border-color: #10B981; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.05); }

        .asset-row { background: #fff; border: 1px solid #E2E8F0; border-radius: 8px; padding: 10px; margin-bottom: 10px; display: flex; gap: 10px; align-items: center; }
      `}</style>

      <div className="container-fluid p-4 eco-bg">
        
        {/* TIÊU ĐỀ VÀ NÚT QUAY LẠI */}
        <div className="row mb-4">
          <div className="col-12 d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <h2 className="fw-bolder text-dark mb-1">Chỉnh sửa phòng</h2>
              <p className="text-muted mb-0">Cập nhật thông tin chi tiết của phòng KTX.</p>
            </div>
            <button 
              className="btn btn-light bg-white border shadow-sm btn-modern text-secondary" 
              onClick={() => navigate('/rentaler/room-management')}
            >
              <i className="bi bi-arrow-left me-2"></i> Quay lại
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="row g-4">
            
            <div className="col-12 col-xl-5 col-lg-6 d-flex flex-column gap-4">
              
              {/* KHỐI 1: THÔNG TIN PHÒNG */}
              <div className="modern-card p-4">
                <h5 className="fw-bold text-emerald mb-4 d-flex align-items-center">
                  <i className="bi bi-info-circle-fill me-2 fs-5"></i> Thông tin phòng
                </h5>

                {/* Ảnh cover (Lấy ảnh đầu tiên hoặc ảnh mặc định) */}
                <div className="image-preview-wrapper">
                  <img 
                    src={roomData.roomMedia && roomData.roomMedia[0] ? `${API_BASE_URL}/document/${roomData.roomMedia[0].files}` : "/assets/img/property-1.jpg"} 
                    alt="Cover" 
                  />
                </div>

                <div className="row g-3">
                  {/* Giá thuê & Sức chứa */}
                  <div className="col-md-6">
                    <label className="modern-label">Giá thuê (VNĐ)</label>
                    <input type="number" className="modern-input w-100" name="price" value={roomData.price} onChange={handleInputChange} />
                  </div>
                  <div className="col-md-6">
                    <label className="modern-label">Sức chứa (Người)</label>
                    <input type="number" className="modern-input w-100" name="maxOccupancy" value={roomData.maxOccupancy} onChange={handleInputChange} />
                  </div>

                  {/* Tầng & Tiền mạng */}
                  <div className="col-md-6">
                    <label className="modern-label">Tầng</label>
                    <input type="number" className="modern-input w-100" name="floor" value={roomData.floor} onChange={handleInputChange} />
                  </div>
                  <div className="col-md-6">
                    <label className="modern-label">Dịch vụ / Tiền mạng</label>
                    <input type="number" className="modern-input w-100" name="internetCost" value={roomData.internetCost} onChange={handleInputChange} />
                  </div>

                  {/* Tiêu đề & Địa chỉ */}
                  <div className="col-12">
                    <label className="modern-label">Tiêu đề phòng</label>
                    <input type="text" className="modern-input w-100" name="title" value={roomData.title} onChange={handleInputChange} />
                  </div>
                  <div className="col-12">
                    <label className="modern-label">Địa chỉ chi tiết</label>
                    <input type="text" className="modern-input w-100" name="address" value={roomData.address} onChange={handleInputChange} />
                  </div>

                  {/* Khu vực & Danh mục */}
                  <div className="col-md-6">
                    <label className="modern-label">Khu vực</label>
                    <select className="modern-input w-100" name="locationId" value={roomData.locationId} onChange={handleInputChange}>
                      <option value={0}>Chọn...</option>
                      <option value={1}>Hà Nội</option>
                      <option value={2}>Tp.Hồ Chí Minh</option>
                      <option value={3}>Đà Nẵng</option>
                      <option value={4}>Hải Phòng</option>
                      <option value={5}>Cần Thơ</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="modern-label">Danh mục</label>
                    <select className="modern-input w-100" name="categoryId" value={roomData.categoryId} onChange={handleInputChange}>
                      <option value={0}>Chọn...</option>
                      <option value={1}>Kí túc xá nam</option>
                      <option value={2}>Kí túc xá nữ</option>
                      <option value={3}>Kí túc xá dịch vụ</option>
                    </select>
                  </div>

                  {/* Mô tả */}
                  <div className="col-12">
                    <label className="modern-label">Mô tả thêm</label>
                    <textarea className="modern-input w-100" name="description" value={roomData.description} onChange={handleInputChange} rows="3"></textarea>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-top">
                  <button type="submit" className="btn bg-emerald text-white btn-modern w-100 fs-5">
                    Lưu thay đổi
                  </button>
                </div>
              </div>

              {/* KHỐI 2: THÀNH VIÊN */}
              <div className="modern-card p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="fw-bold text-emerald mb-0 d-flex align-items-center">
                    <i className="bi bi-people-fill me-2 fs-5"></i> Thành viên
                  </h5>
                  <span className="badge bg-danger rounded-pill px-3 py-2 fs-6">
                    {roomData.residents?.length || 0}/{roomData.maxOccupancy}
                  </span>
                </div>

                <div className="resident-list">
                  {roomData.residents?.map((resident, index) => (
                    <div key={index} className="resident-item bg-white">
                      <div className="d-flex align-items-center">
                        <div className="bg-light rounded-circle d-flex align-items-center justify-content-center border" style={{ width: '40px', height: '40px' }}>
                          <i className="bi bi-person text-emerald fs-4"></i>
                        </div>
                        <div className="ms-3">
                          <h6 className="fw-bold text-dark mb-0">{resident.name}</h6>
                          <small className="text-muted">{resident.phone}</small>
                        </div>
                      </div>
                      <div className="d-flex gap-2">
                        <button type="button" className="btn btn-light btn-sm text-danger border shadow-sm" onClick={() => handleRemoveResident(resident.id)} title="Xóa khỏi phòng">
                          <i className="bi bi-trash3"></i>
                        </button>
                      </div>
                    </div>
                  ))}

                  {(!roomData.residents || roomData.residents.length === 0) && (
                    <div className="text-center py-4 bg-light rounded-3 border border-dashed">
                      <span className="text-muted font-italic">Chưa có người ở</span>
                    </div>
                  )}
                </div>
              </div>

            </div>

            <div className="col-12 col-xl-7 col-lg-6 d-flex flex-column gap-4">
              
              {/* KHỐI 3: THƯ VIỆN ẢNH */}
              <div className="modern-card p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="fw-bold text-emerald mb-0 d-flex align-items-center">
                    <i className="bi bi-images me-2 fs-5"></i> Thư viện ảnh
                  </h5>
                  
                  {/* Nút thêm ảnh (ẩn input file mặc định) */}
                  <div>
                    <label htmlFor="file-upload" className="btn btn-outline-success btn-sm rounded-pill fw-bold px-3 py-2 cursor-pointer mb-0">
                      <i className="bi bi-plus-lg me-1"></i> Chỉnh sửa ảnh
                    </label>
                    <input id="file-upload" type="file" name="files" multiple onChange={handleFileChange} className="d-none" />
                  </div>
                </div>

                <div className="gallery-grid">
                  {/* Ảnh cũ từ Database */}
                  {roomData.roomMedia?.map((media, index) => (
                    <img key={`old-${index}`} src={`${API_BASE_URL}/document/${media.files}`} alt="room" className="gallery-item shadow-sm" />
                  ))}
                  
                  {/* Ảnh mới vừa chọn */}
                  {selectedImages.map((image, index) => (
                    <div key={`new-${index}`} className="position-relative">
                      <img src={image} alt="new-upload" className="gallery-item shadow-sm border-success" />
                      <span className="badge bg-success position-absolute top-0 end-0 m-1" style={{fontSize: "0.6rem"}}>Mới</span>
                    </div>
                  ))}
                </div>

                {(!roomData.roomMedia?.length && selectedImages.length === 0) && (
                  <div className="text-center py-5 bg-light rounded-3 border border-dashed">
                    <span className="text-muted font-italic">Chưa có ảnh nào</span>
                  </div>
                )}
              </div>

              {/* KHỐI 4: NỘI THẤT & ĐỒ DÙNG */}
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
                  {/* Tiêu đề cột */}
                  <div className="row px-2 mb-2 d-none d-md-flex">
                    <div className="col-md-7"><small className="text-muted fw-bold text-uppercase">Tên đồ dùng</small></div>
                    <div className="col-md-3"><small className="text-muted fw-bold text-uppercase">Số lượng</small></div>
                    <div className="col-md-2 text-center"><small className="text-muted fw-bold text-uppercase">Xóa</small></div>
                  </div>

                  {/* Danh sách nhập liệu */}
                  {roomData.assets?.map((asset, index) => (
                    <div key={index} className="asset-row shadow-sm">
                      <div className="col-12 col-md-7">
                        <input
                          type="text"
                          className="modern-input w-100 py-2 border-0 bg-light"
                          placeholder="Nhập tên nội thất..."
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

export default EditRoom;