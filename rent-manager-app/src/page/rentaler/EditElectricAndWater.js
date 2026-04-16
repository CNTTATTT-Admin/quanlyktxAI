import { useEffect, useState } from 'react';
import { Navigate, useParams, useNavigate } from 'react-router-dom';
import SidebarNav from './SidebarNav';
import { toast } from 'react-toastify';
import Nav from './Nav';
import axios from 'axios';
import { getElectricAndWater, getRentOfHome } from '../../services/fetch/ApiUtils';
import { formatVnd } from '../../utils/currency';

const EditElectric = (props) => {
    const { authenticated, role, currentUser, location, onLogout } = props;
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [roomOptions, setRoomOptions] = useState([]);

    const [electricData, setElectricData] = useState({
        month: "",
        name: "",
        lastMonthNumberOfElectric: "",
        thisMonthNumberOfElectric: "",
        moneyEachNumberOfElectric: "",
        lastMonthBlockOfWater: "",
        thisMonthBlockOfWater: "",
        moneyEachBlockOfWater: "",
        internetCost: "",
        paid: '',
        roomId: '',
        room: ''
    });

    const [roomId, setRoomId] = useState();

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setElectricData(prevState => ({
            ...prevState,
            [name]: name === 'paid' ? value === 'true' : value
        }));
    };

    console.log("electricData", electricData);


    const handleSubmit = async (event) => {
        event.preventDefault();
        await axios.put(`http://localhost:8080/electric-water/update/${id}`, electricData, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            },
        })
            .then(response => {
                toast.success(response.message);
                toast.success("Cập nhật hợp đồng thành công!!");
                localStorage.setItem("app-data-updated-at", String(Date.now()));
                window.dispatchEvent(new Event("app-data-updated"));
            })
            .catch(error => {
                toast.error((error && error.message) || 'Oops! Có điều gì đó xảy ra. Vui lòng thử lại!');
            });

        console.log(electricData);
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

        getElectricAndWater(id)
            .then(response => {
                const contract = response;
                setElectricData(prevState => ({
                    ...prevState,
                    ...contract
                }));
                setRoomId(response.room.id)
            })
            .catch(error => {
                toast.error((error && error.message) || 'Oops! Có điều gì đó xảy ra. Vui lòng thử lại!');
            });

    }, [id]);

    const hasInvalidReadings = () => {
        const oldElec = electricData.lastMonthNumberOfElectric;
        const newElec = electricData.thisMonthNumberOfElectric;
        const oldWater = electricData.lastMonthBlockOfWater;
        const newWater = electricData.thisMonthBlockOfWater;

        const elecError = newElec !== "" && oldElec !== "" && Number(newElec) < Number(oldElec);
        const waterError = newWater !== "" && oldWater !== "" && Number(newWater) < Number(oldWater);

        return elecError || waterError;
    };

    const calculateTotal = () => {
        const oldElec = Number(electricData.lastMonthNumberOfElectric) || 0;
        const newElec = Number(electricData.thisMonthNumberOfElectric) || 0;
        const priceElec = Number(electricData.moneyEachNumberOfElectric) || 0;
        
        const oldWater = Number(electricData.lastMonthBlockOfWater) || 0;
        const newWater = Number(electricData.thisMonthBlockOfWater) || 0;
        const priceWater = Number(electricData.moneyEachBlockOfWater) || 0;
        const internetCost = Number(electricData.internetCost) || 0;

        const elecUsed = newElec - oldElec;
        const waterUsed = newWater - oldWater;

        return (elecUsed * priceElec) + (waterUsed * priceWater) + internetCost;
    };

    const isError = hasInvalidReadings();

    if (!authenticated) {
        return <Navigate to="/login-rentaler" state={{ from: location }} />;
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
                
                .section-title { font-size: 1.1rem; font-weight: 700; color: #0F172A; margin-bottom: 15px; }
                .electric-box { background-color: #FEF9C3; border: 1px solid #FDE047; border-radius: 12px; padding: 24px; margin-bottom: 24px; }
                .water-box { background-color: #E0F2FE; border: 1px solid #BAE6FD; border-radius: 12px; padding: 24px; margin-bottom: 24px; }
                .internet-box { background-color: #ECFDF5; border: 1px solid #A7F3D0; border-radius: 12px; padding: 24px; margin-bottom: 32px; }

                .total-box { background-color: #F0FDF4; border: 2px dashed #10B981; transition: all 0.3s ease; }
                .total-box:hover { background-color: #D1FAE5; }
                .total-box.error { border-color: #EF4444; background-color: #FEF2F2; }

                .modern-input:disabled, .modern-input[readonly] { background-color: #E2E8F0; color: #64748B; cursor: not-allowed; border-color: #CBD5E1; }
            `}</style>

            <div className="container-fluid p-4 eco-bg">
                
                {/* Header với nút Quay lại */}
                <div className="row mb-4">
                    <div className="col-12 d-flex justify-content-between align-items-center flex-wrap gap-3">
                        <div>
                            <h2 className="fw-bolder text-dark mb-1">Chỉnh sửa hóa đơn điện nước</h2>
                            <p className="text-muted mb-0">Cập nhật lại chỉ số sử dụng hoặc trạng thái thanh toán.</p>
                        </div>
                        <button 
                            type="button"
                            className="btn btn-light bg-white border shadow-sm btn-modern text-secondary rounded-pill" 
                            onClick={() => navigate('/rentaler/electric_water-management')}
                        >
                            <i className="bi bi-arrow-left me-2"></i> Quay lại danh sách
                        </button>
                    </div>
                </div>

                {/* Form nhập liệu */}
                <div className="row justify-content-center">
                    <div className="col-12 col-xl-8 col-lg-10">
                        <div className="modern-card p-4 p-md-5">
                            <form onSubmit={handleSubmit}>
                                
                                {/* --- KHU VỰC 1: THÔNG TIN CHUNG --- */}
                                <h5 className="fw-bold text-emerald mb-4 pb-3 border-bottom d-flex align-items-center">
                                    <i className="bi bi-info-circle-fill me-2 fs-4"></i> Thông tin chung
                                </h5>
                                <div className="row g-4 mb-5">
                                    <div className="col-md-12">
                                        <label className="modern-label" htmlFor="name">
                                            Tên hóa đơn
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control modern-input"
                                            id="name"
                                            name="name"
                                            value={electricData.name}
                                            onChange={handleInputChange}
                                            placeholder="VD: Hóa đơn điện nước tháng 10 - Phòng 101"
                                        />
                                    </div>
                                    
                                    <div className="col-md-4">
                                        <label className="modern-label" htmlFor="locationId">
                                            Phòng đang thuê
                                        </label>
                                        <select 
                                            className="form-select modern-input fw-bold" 
                                            id="locationId" 
                                            name="roomId" 
                                            value={electricData.roomId} 
                                            onChange={handleInputChange} 
                                            disabled
                                        >
                                            {electricData.room && (
                                                <option key={electricData.room.id} value={electricData.room.id}>
                                                    {electricData.room.title}
                                                </option>
                                            )}
                                        </select>
                                    </div>

                                    <div className="col-md-4">
                                        <label className="modern-label" htmlFor="lastMonthBlock">
                                            Tháng sử dụng
                                        </label>
                                        <select
                                            className="form-select modern-input"
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

                                    <div className="col-md-4">
                                        <label className="modern-label" htmlFor="paid">
                                            Trạng thái thanh toán
                                        </label>
                                        <select 
                                            className={`form-select modern-input fw-bold ${electricData.paid === 'true' || electricData.paid === true ? 'text-success' : 'text-danger'}`} 
                                            id="paid" 
                                            name="paid" 
                                            value={electricData.paid} 
                                            onChange={handleInputChange}
                                        >
                                            <option value={true}>Đã thanh toán</option>
                                            <option value={false}>Chưa thanh toán</option>
                                        </select>
                                    </div>
                                </div>

                                {/* --- KHU VỰC 2: CHỈ SỐ ĐIỆN --- */}
                                <div className="electric-box shadow-sm">
                                    <div className="section-title text-warning text-darken-3">
                                        <i className="bi bi-lightning-charge-fill me-2"></i> Chỉ Số Điện
                                    </div>
                                    <div className="row g-3">
                                        <div className="col-md-4">
                                            <label className="modern-label" htmlFor="lastMonthNumberOfElectric">Số điện tháng trước</label>
                                            <input
                                                type="number"
                                                className="form-control modern-input bg-white"
                                                id="lastMonthNumberOfElectric"
                                                name="lastMonthNumberOfElectric"
                                                value={electricData.lastMonthNumberOfElectric}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div className="col-md-4">
                                            <label className="modern-label" htmlFor="thisMonthNumberOfElectric">Số điện tháng này</label>
                                            <input
                                                type="number"
                                                className="form-control modern-input bg-white"
                                                id="thisMonthNumberOfElectric"
                                                name="thisMonthNumberOfElectric"
                                                value={electricData.thisMonthNumberOfElectric}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div className="col-md-4">
                                            <label className="modern-label" htmlFor="moneyEachNumberOfElectric">Đơn giá 1 số điện</label>
                                            <input
                                                type="number"
                                                className="form-control modern-input bg-white"
                                                id="moneyEachNumberOfElectric"
                                                name="moneyEachNumberOfElectric"
                                                value={electricData.moneyEachNumberOfElectric}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* --- KHU VỰC 3: CHỈ SỐ NƯỚC --- */}
                                <div className="water-box shadow-sm">
                                    <div className="section-title text-info text-darken-3">
                                        <i className="bi bi-droplet-fill me-2"></i> Chỉ Số Nước
                                    </div>
                                    <div className="row g-3">
                                        <div className="col-md-4">
                                            <label className="modern-label" htmlFor="lastMonthBlockOfWater">Số khối tháng trước</label>
                                            <input
                                                type="number"
                                                className="form-control modern-input bg-white"
                                                id="lastMonthBlockOfWater"
                                                name="lastMonthBlockOfWater"
                                                value={electricData.lastMonthBlockOfWater}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div className="col-md-4">
                                            <label className="modern-label" htmlFor="thisMonthBlockOfWater">Số khối tháng này</label>
                                            <input
                                                type="number"
                                                className="form-control modern-input bg-white"
                                                id="thisMonthBlockOfWater"
                                                name="thisMonthBlockOfWater"
                                                value={electricData.thisMonthBlockOfWater}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div className="col-md-4">
                                            <label className="modern-label" htmlFor="moneyEachBlockOfWater">Đơn giá 1 khối nước</label>
                                            <input
                                                type="number"
                                                className="form-control modern-input bg-white"
                                                id="moneyEachBlockOfWater"
                                                name="moneyEachBlockOfWater"
                                                value={electricData.moneyEachBlockOfWater}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="modern-card p-4 mb-3" style={{ backgroundColor: "#ECFDF5", border: "1px solid #A7F3D0" }}>
                                    <div className="section-title text-success mb-3">
                                        <i className="bi bi-wifi me-2"></i> Chi Phí Internet
                                    </div>
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="modern-label" htmlFor="internetCost">Tiền internet tháng này</label>
                                            <input
                                                type="number"
                                                min="0"
                                                className="form-control modern-input bg-white"
                                                id="internetCost"
                                                name="internetCost"
                                                value={electricData.internetCost}
                                                onChange={handleInputChange}
                                                placeholder="VD: 150000"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* --- FOOTER: TỔNG TIỀN VÀ SUBMIT --- */}
                                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end mt-5 pt-4 border-top">
                                    
                                    {/* Góc bên trái: Tổng tiền */}
                                    <div className={`total-box p-3 rounded-3 ${isError ? 'error' : ''}`} style={{ minWidth: '280px' }}>
                                        <h6 className="text-muted mb-1 text-uppercase fw-bold" style={{ fontSize: '0.8rem', letterSpacing: '1px' }}>
                                            <i className="bi bi-calculator me-2"></i>Tổng tiền tạm tính
                                        </h6>
                                        <h2 className={`fw-bolder mb-0 ${isError ? 'text-danger fs-4 mt-2' : 'text-emerald'}`}>
                                            {isError 
                                                ? "⚠ Sai chỉ số (Mới < Cũ)" 
                                                : formatVnd(calculateTotal())}
                                        </h2>
                                    </div>

                                    {/* Góc bên phải: Nút Submit */}
                                    <div className="mt-3 mt-md-0">
                                        <button type="submit" className="btn bg-emerald text-white btn-modern fs-5 py-2 px-5 shadow-sm h-100" disabled={isError}>
                                            <i className="bi bi-save me-2"></i> Cập nhật hóa đơn
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

export default EditElectric;