import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import '../../assets/css/app.css';
import BarChart from './chart/BarChart';
import SubChart from './chart/SubChart';
import { getByMonth, getNumber } from '../../services/fetch/ApiUtils';
import useAutoReload from '../../hooks/useAutoReload';
import { formatVnd } from '../../utils/currency';

const CHART_COLORS = [
    "rgba(75,192,192,1)",
    "#ecf0f1",
    "#50AF95",
    "#f3ba2f",
    "#2a71d0",
    "#e74c3c"
];

const initialChartState = {
    labels: [],
    datasets: [
        {
            label: "Doanh thu",
            data: [],
            backgroundColor: CHART_COLORS,
            borderColor: "transparent",
            borderWidth: 0,
            borderRadius: 6,
        },
    ],
};

function DashboardRentaler(props) {
    const { authenticated, location } = props;

    // ==========================================
    // KHÔNG THAY ĐỔI BẤT KỲ LOGIC NÀO Ở ĐÂY
    // ==========================================
    const [number, setNumber] = useState({
        numberOfRoom: 0,
        numberOfPeople: 0,
        numberOfAllTimePeople: 0,
        numberOfEmptyRoom: 0,
        revenue: 0, 
    });

    const [contentRevenue, setContentRevenue] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

    const [subData, setSubData] = useState(initialChartState);
    const [userData, setUserData] = useState(initialChartState);

    const reloadDashboard = () => {
        getNumber()
            .then(response => {
                setNumber(prev => ({
                    ...prev,
                    numberOfRoom: response.numberOfRoom || 0,
                    numberOfPeople: response.numberOfPeople || 0,
                    numberOfAllTimePeople: response.numberOfAllTimePeople || 0,
                    numberOfEmptyRoom: response.numberOfEmptyRoom || 0,
                }));
            })
            .catch(error => console.log(error));

        getByMonth()
          .then((revenueData) => {
              const data = revenueData.content || [];
              setContentRevenue(data);

              let totalAllTime = 0;
              data.forEach(item => {
                  totalAllTime += Number(item.revenue || 0)
                                + Number(item.waterCost || 0)
                                + Number(item.publicElectricCost || 0)
                                + Number(item.internetCost || 0)
                                + Number(item.parkingCost || 0);
              });

              setNumber(prev => ({ ...prev, revenue: totalAllTime }));
          })
          .catch((error) => console.log(error));
    };

    useEffect(() => {
        getNumber()
            .then(response => {
                setNumber(prev => ({
                    ...prev,
                    numberOfRoom: response.numberOfRoom || 0,
                    numberOfPeople: response.numberOfPeople || 0,
                    numberOfAllTimePeople: response.numberOfAllTimePeople || 0,
                    numberOfEmptyRoom: response.numberOfEmptyRoom || 0,
                }));
            })
            .catch(error => console.log(error));
    }, []);

    useEffect(() => {
        getByMonth()
          .then((revenueData) => {
              const data = revenueData.content || [];
              setContentRevenue(data);

              let totalAllTime = 0;
              data.forEach(item => {
                  totalAllTime += Number(item.revenue || 0) 
                                + Number(item.waterCost || 0) 
                                + Number(item.publicElectricCost || 0) 
                                + Number(item.internetCost || 0) 
                                + Number(item.parkingCost || 0);
              });

              setNumber(prev => ({ ...prev, revenue: totalAllTime }));
          })
          .catch((error) => console.log(error));
    }, []);

    useAutoReload({ enabled: authenticated, onReload: reloadDashboard });

    useEffect(() => {
        if (contentRevenue.length === 0) return;

        const monthRecords = contentRevenue.filter(data => Number(data.month) === selectedMonth);
        const labels = ["Tháng " + selectedMonth];

        let totalRevenue = 0, totalWater = 0, totalElectric = 0, totalInternet = 0, totalParking = 0;

        monthRecords.forEach(record => {
            totalRevenue += Number(record.revenue) || 0;
            totalWater += Number(record.waterCost) || 0;
            totalElectric += Number(record.publicElectricCost) || 0;
            totalInternet += Number(record.internetCost) || 0;
            totalParking += Number(record.parkingCost) || 0;
        });

        setUserData(prev => ({
            ...prev,
            labels: labels,
            datasets: [{ ...prev.datasets[0], data: [totalRevenue] }]
        }));

        setSubData({
            labels: labels,
            datasets: [
                { label: "Tiền nước", backgroundColor: CHART_COLORS[0], data: [totalWater], borderRadius: 4, borderWidth: 0 },
                { label: "Tiền điện", backgroundColor: CHART_COLORS[1], data: [totalElectric], borderRadius: 4, borderWidth: 0 },
                { label: "Tiền internet", backgroundColor: CHART_COLORS[2], data: [totalInternet], borderRadius: 4, borderWidth: 0 },
                { label: "Tiền bãi xe", backgroundColor: CHART_COLORS[5], data: [totalParking], borderRadius: 4, borderWidth: 0 }
            ],
        });
    }, [selectedMonth, contentRevenue]);

    const handlePrevMonth = () => setSelectedMonth(prev => prev === 1 ? 12 : prev - 1);
    const handleNextMonth = () => setSelectedMonth(prev => prev === 12 ? 1 : prev + 1);

    if (!authenticated) {
        return <Navigate to={{ pathname: "/login-rentaler", state: { from: location } }} />;
    }

    // ==========================================
    // GIAO DIỆN ECOHOME ĐƯỢC CẢI TIẾN
    // ==========================================
    return (
        <>
            <style>{`
                .eco-bg { background-color: #F8FAFC; min-height: 100vh; font-family: 'Inter', sans-serif; }
                .dashboard-card { 
                    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); 
                    border: 1px solid rgba(0,0,0,0.03) !important; 
                    background: #ffffff;
                }
                .dashboard-card:hover { 
                    transform: translateY(-6px); 
                    box-shadow: 0 20px 40px rgba(16, 185, 129, 0.08) !important; 
                    border-color: rgba(16, 185, 129, 0.2) !important; 
                }
                
                .icon-box { 
                    width: 56px; 
                    height: 56px; 
                    border-radius: 16px; 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    transition: all 0.4s ease; 
                }
                .dashboard-card:hover .icon-box { transform: scale(1.1) rotate(8deg); }
                
                .icon-revenue { background: linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%); color: #059669; }
                .icon-room { background: linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%); color: #2563EB; }
                .icon-empty { background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%); color: #D97706; }
                .icon-people { background: linear-gradient(135deg, #E0E7FF 0%, #C7D2FE 100%); color: #4F46E5; }
                
                .month-control-pill {
                    background: #ffffff;
                    border: 1px solid #E2E8F0;
                    border-radius: 50px;
                    padding: 8px 12px;
                    display: inline-flex;
                    align-items: center;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.02);
                    transition: all 0.3s ease;
                }
                .month-control-pill:hover { box-shadow: 0 8px 20px rgba(16, 185, 129, 0.1); border-color: #10B981; }
                
                .btn-month { 
                    border-radius: 50px !important; 
                    transition: all 0.3s ease; 
                    font-weight: 600; 
                    color: #64748B;
                }
                .btn-month:hover { background-color: #10B981 !important; color: white !important; transform: scale(1.05); }
                
                .text-emerald { color: #10B981 !important; }
            `}</style>

            <div className="container-fluid p-4 eco-bg">
                {/* HEADER */}
                <div className="row mb-4 pb-2 border-bottom">
                    <div className="col-12 d-flex justify-content-between align-items-end">
                        <div>
                            <h2 className="fw-bolder text-dark mb-1" style={{ letterSpacing: "-0.5px" }}>Tổng quan kinh doanh</h2>
                            <p className="text-muted mb-0 fs-6">Theo dõi hiệu suất và số liệu thống kê khu trọ của bạn</p>
                        </div>
                        <div className="d-none d-md-block">
                            <span className="badge bg-white text-emerald border border-success px-3 py-2 rounded-pill shadow-sm">
                                <i className="bi bi-circle-fill me-2" style={{ fontSize: "8px" }}></i>
                                Dữ liệu được cập nhật tự động
                            </span>
                        </div>
                    </div>
                </div>
                
                {/* 4 CARDS THỐNG KÊ */}
                <div className="row g-4 mb-5">
                    {/* Card 1: Doanh Thu */}
                    <div className="col-sm-6 col-xl-3">
                        <div className="card shadow-sm rounded-4 h-100 dashboard-card p-2">
                            <div className="card-body p-3">
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <h6 className="text-muted fw-bold text-uppercase mb-0" style={{ fontSize: "0.85rem", letterSpacing: "0.5px" }}>Tổng Doanh Thu</h6>
                                    <div className="icon-box icon-revenue shadow-sm">
                                        <i className="bi bi-wallet2 fs-4"></i>
                                    </div>
                                </div>
                                <h3 className="fw-bolder text-dark mb-2" style={{ fontSize: "1.8rem" }}>
                                    {formatVnd(number.revenue || 0)}
                                </h3>
                                <div className="mt-3 pt-3 border-top border-light">
                                    <p className="text-emerald small fw-semibold mb-0 d-flex align-items-center">
                                        <i className="bi bi-graph-up-arrow me-2 fs-6"></i> Tích lũy toàn thời gian
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Tổng Phòng */}
                    <div className="col-sm-6 col-xl-3">
                        <div className="card shadow-sm rounded-4 h-100 dashboard-card p-2">
                            <div className="card-body p-3">
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <h6 className="text-muted fw-bold text-uppercase mb-0" style={{ fontSize: "0.85rem", letterSpacing: "0.5px" }}>Tổng Số Phòng</h6>
                                    <div className="icon-box icon-room shadow-sm">
                                        <i className="bi bi-door-open fs-4"></i>
                                    </div>
                                </div>
                                <h3 className="fw-bolder text-dark mb-2" style={{ fontSize: "1.8rem" }}>{number.numberOfRoom}</h3>
                                <div className="mt-3 pt-3 border-top border-light">
                                    <p className="text-muted small mb-0 d-flex align-items-center fw-medium">
                                        <i className="bi bi-building me-2 fs-6"></i> Phòng đang được quản lý
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card 3: Phòng Trống */}
                    <div className="col-sm-6 col-xl-3">
                        <div className="card shadow-sm rounded-4 h-100 dashboard-card p-2">
                            <div className="card-body p-3">
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <h6 className="text-muted fw-bold text-uppercase mb-0" style={{ fontSize: "0.85rem", letterSpacing: "0.5px" }}>Phòng Trống</h6>
                                    <div className="icon-box icon-empty shadow-sm">
                                        <i className="bi bi-house-door fs-4"></i>
                                    </div>
                                </div>
                                <h3 className="fw-bolder text-dark mb-2" style={{ fontSize: "1.8rem" }}>{number.numberOfEmptyRoom}</h3>
                                <div className="mt-3 pt-3 border-top border-light">
                                    <p className="text-warning small fw-bold mb-0 d-flex align-items-center" style={{ color: "#D97706 !important" }}>
                                        <i className="bi bi-exclamation-circle me-2 fs-6"></i> Cần đăng tin cho thuê
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card 4: Khách Thuê */}
                    <div className="col-sm-6 col-xl-3">
                        <div className="card shadow-sm rounded-4 h-100 dashboard-card p-2">
                            <div className="card-body p-3">
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <h6 className="text-muted fw-bold text-uppercase mb-0" style={{ fontSize: "0.85rem", letterSpacing: "0.5px" }}>Số Khách Thuê</h6>
                                    <div className="icon-box icon-people shadow-sm">
                                        <i className="bi bi-people fs-4"></i>
                                    </div>
                                </div>
                                <h3 className="fw-bolder text-dark mb-2" style={{ fontSize: "1.8rem" }}>
                                    {number.numberOfPeople} <span className="fs-6 text-muted fw-normal">đang ở</span>
                                </h3>
                                <div className="mt-3 pt-3 border-top border-light">
                                    <p className="text-primary small fw-semibold mb-0 d-flex align-items-center" style={{ color: "#4F46E5 !important" }}>
                                        <i className="bi bi-clock-history me-2 fs-6"></i> Tổng {number.numberOfAllTimePeople} khách từ trước tới nay
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* BỘ CHỌN THÁNG (DESIGN PILL) */}
                <div className="row mb-5 text-center">
                    <div className="col-12">
                        <div className="month-control-pill">
                            <button className="btn btn-light btn-month px-4" onClick={handlePrevMonth}>
                                <i className="bi bi-chevron-left me-1"></i> Tháng trước
                            </button>
                            <h5 className="mb-0 fw-bolder text-dark mx-4 px-3" style={{ letterSpacing: "1px" }}>
                                <i className="bi bi-calendar2-check text-emerald me-2"></i> 
                                DỮ LIỆU THÁNG {selectedMonth}
                            </h5>
                            <button className="btn btn-light btn-month px-4" onClick={handleNextMonth}>
                                Tháng sau <i className="bi bi-chevron-right ms-1"></i>
                            </button>
                        </div>
                    </div>
                </div>
                
                {/* 2 BIỂU ĐỒ */}
                <div className="row g-4 pb-5">
                    <div className="col-12 col-lg-6">
                        <div className="card shadow-sm rounded-4 h-100 dashboard-card border-0">
                            <div className="card-header bg-transparent border-0 pt-4 pb-0 px-4">
                                <h5 className="card-title mb-1 fw-bolder text-dark d-flex align-items-center">
                                    <i className="bi bi-bar-chart-line-fill text-emerald me-2 fs-4"></i> Doanh Thu Tiền Phòng
                                </h5>
                                <p className="text-muted small ms-4 ps-1">Biểu đồ thể hiện mức thu tiền phòng cơ bản</p>
                            </div>
                            <div className="card-body p-4 pt-2">
                                <div className="chart chart-md">
                                    <BarChart chartData={userData} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-12 col-lg-6">
                        <div className="card shadow-sm rounded-4 h-100 dashboard-card border-0">
                            <div className="card-header bg-transparent border-0 pt-4 pb-0 px-4">
                                <h5 className="card-title mb-1 fw-bolder text-dark d-flex align-items-center">
                                    <i className="bi bi-pie-chart-fill text-emerald me-2 fs-4"></i> Phân Bổ Chi Phí Khác
                                </h5>
                                <p className="text-muted small ms-4 ps-1">Điện, nước, internet và phí gửi xe</p>
                            </div>
                            <div className="card-body p-4 pt-2">
                                <div className="chart chart-md">
                                    <SubChart chartData={subData} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default DashboardRentaler;