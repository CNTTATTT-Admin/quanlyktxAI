import { Navigate, useNavigate } from 'react-router-dom';
import Nav from './Nav';
import SidebarNav from './SidebarNav';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { getAllRoomOfRentaler } from '../../services/fetch/ApiUtils';
import MaintenanceService from '../../services/axios/MaintenanceService';

function AddMaintence(props) {
    const { authenticated, role, currentUser, location, onLogout } = props;
    const navigate = useNavigate();

    const [roomOptions, setRoomOptions] = useState([]);

    const [contractData, setContractData] = useState({
        maintenanceDate: '',
        roomId: '',
        price: '',
        files: []
    });

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setContractData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleFileChange = (event) => {
        setContractData(prevState => ({
            ...prevState,
            files: [...prevState.files, ...event.target.files]
        }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        const formData = new FormData();
        formData.append('maintenanceDate', contractData.maintenanceDate);
        formData.append('roomId', contractData.roomId);
        formData.append('price', contractData.price);
        contractData.files.forEach((file, index) => {
            formData.append(`files`, file);
        });
        console.log(formData.getAll)
        MaintenanceService.addNewMaintenance(formData)
            .then(response => {
                toast.success(response.message);
                toast.success("Phiếu bảo trì lưu thành công!!")

            })
            .then(data => {
                console.log(data);
                // Do something with the response data here
                setContractData({
                    maintenanceDate: '',
                    roomId: '',
                    price: '',
                    files: []
                });
            })
            .catch(error => {
                toast.error((error && error.message) || 'Oops! Có điều gì đó xảy ra. Vui lòng thử lại!');
            });

        console.log(contractData);
    };

    useEffect(() => {
        getAllRoomOfRentaler(1,1000,'')
            .then(response => {
                const room = response.content;
                setRoomOptions(room);
            })
            .catch(error => {
                toast.error((error && error.message) || 'Oops! Có điều gì đó xảy ra. Vui lòng thử lại!');
            });
    }, []);

    if (!authenticated) {
        return <Navigate
            to={{
                pathname: "/login-rentaler",
                state: { from: location }
            }} />;
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
                .modern-label { font-weight: 600; color: #475569; font-size: 0.85rem; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; }

                .btn-modern { border-radius: 8px; font-weight: 600; padding: 10px 20px; transition: all 0.3s; }
                .btn-modern:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2); }
                
                .upload-box { border: 2px dashed #CBD5E1; border-radius: 12px; transition: all 0.3s; }
                .upload-box:hover { border-color: #10B981; background-color: #F0FDF4 !important; }
            `}</style>

            <div className="container-fluid p-4 eco-bg">
                
                <div className="row mb-4">
                    <div className="col-12 d-flex justify-content-between align-items-center flex-wrap gap-3">
                        <div>
                            <h2 className="fw-bolder text-dark mb-1">Thêm phiếu bảo trì</h2>
                            <p className="text-muted mb-0">Tạo mới hồ sơ ghi nhận sửa chữa, bảo trì thiết bị cho phòng trọ.</p>
                        </div>
                        <button 
                            type="button"
                            className="btn btn-light bg-white border shadow-sm btn-modern text-secondary rounded-pill" 
                            onClick={() => navigate('/rentaler/maintenance-management')}
                        >
                            <i className="bi bi-arrow-left me-2"></i> Quay lại danh sách
                        </button>
                    </div>
                </div>

                <div className="row justify-content-center">
                    <div className="col-12 col-xl-8 col-lg-10">
                        <div className="modern-card p-4 p-md-5">
                            <h5 className="fw-bold text-emerald mb-4 pb-3 border-bottom d-flex align-items-center">
                                <i className="bi bi-tools me-2 fs-4"></i> Thông tin phiếu bảo trì
                            </h5>
                            
                            <form onSubmit={handleSubmit}>
                                <div className="row g-4">
                                    
                                    <div className="col-12">
                                        <label className="modern-label" htmlFor="locationId">Chọn phòng KTX cần bảo trì</label>
                                        <select 
                                            className="form-select modern-input" 
                                            id="locationId" 
                                            name="roomId" 
                                            value={contractData.roomId} 
                                            onChange={handleInputChange}
                                        >
                                            <option value="">-- Chọn phòng từ danh sách --</option>
                                            {roomOptions.map(roomOption => (
                                                <option key={roomOption.id} value={roomOption.id}>
                                                    {roomOption.title}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="col-md-6">
                                        <label className="modern-label" htmlFor="price">Chi Phí Bảo Trì Dự Kiến (VNĐ)</label>
                                        <input 
                                            type="number" 
                                            className="form-control modern-input" 
                                            id="price" 
                                            name="price"
                                            placeholder="Nhập số tiền..."
                                            value={contractData.price}
                                            onChange={handleInputChange}
                                        />
                                    </div>

                                    <div className="col-md-6">
                                        <label className="modern-label" htmlFor="maintenanceDate">Thời Gian Xảy Ra Sự Cố</label>
                                        <input 
                                            type="datetime-local" 
                                            className="form-control modern-input" 
                                            id="maintenanceDate" 
                                            name="maintenanceDate"
                                            value={contractData.maintenanceDate}
                                            onChange={handleInputChange}
                                        />
                                    </div>

                                    <div className="col-12">
                                        <label className="modern-label">Tải Phiếu Bảo Trì / Hóa Đơn</label>
                                        <div className="upload-box p-4 text-center bg-light">
                                            <i className="bi bi-cloud-arrow-up-fill text-emerald mb-2 d-block" style={{ fontSize: "2.5rem" }}></i>
                                            <h6 className="fw-bold text-dark mb-3">Kéo thả hoặc chọn file để tải lên</h6>
                                            <input 
                                                className="form-control modern-input w-75 mx-auto" 
                                                type="file" 
                                                accept=".pdf" 
                                                name="files" 
                                                multiple 
                                                onChange={handleFileChange} 
                                            />
                                            <small className="text-muted d-block mt-2">
                                                <i className="bi bi-info-circle me-1"></i> Chỉ chấp nhận định dạng .PDF
                                            </small>
                                        </div>
                                    </div>

                                    <div className="col-12 mt-5 pt-3 border-top">
                                        <button type="submit" className="btn bg-emerald text-white btn-modern w-100 fs-5 py-2 shadow-sm">
                                            <i className="bi bi-save me-2"></i> Lưu phiếu bảo trì
                                        </button>
                                    </div>

                                </div>
                            </form>
                        </div>
                    </div>
                </div>

            </div>
        </>
    );
}

export default AddMaintence;