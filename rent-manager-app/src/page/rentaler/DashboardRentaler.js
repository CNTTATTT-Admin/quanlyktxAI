import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import '../../assets/css/app.css';
import BarChart from './chart/BarChart';
import SubChart from './chart/SubChart';
import { getByMonth, getNumber } from '../../services/fetch/ApiUtils';

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

    useEffect(() => {
        getNumber()
            .then(response => {
                setNumber(prev => ({
                    ...prev,
                    numberOfRoom: response.numberOfRoom || 0,
                    numberOfPeople: response.numberOfPeople || 0,
                    numberOfAllTimePeople: response.numberOfAllTimePeople || 0, // Nhận data mới từ Backend
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

    return (
        <div className="container-fluid p-4 bg-light" style={{ minHeight: "100vh" }}>
            {/* HEADER */}
            <div className="row mb-4">
                <div className="col-12 d-flex justify-content-between align-items-center">
                    <div>
                        <h3 className="fw-bold text-dark mb-1">Tổng quan kinh doanh</h3>
                        <p className="text-muted mb-0">Theo dõi hiệu suất và số liệu thống kê khu trọ của bạn</p>
                    </div>
                </div>
            </div>
            
            <div className="row g-4 mb-4">
                <div className="col-sm-6 col-xl-3">
                    <div className="card shadow-sm border-0 rounded-4 h-100">
                        <div className="card-body p-4">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h6 className="text-muted fw-semibold text-uppercase mb-0">Tổng Doanh Thu</h6>
                                <div className="bg-success bg-opacity-10 text-success rounded-circle d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px' }}>
                                    <i className="bi bi-wallet2 fs-4"></i>
                                </div>
                            </div>
                            <h3 className="fw-bolder text-dark mb-2">
                                {Number(number.revenue || 0).toLocaleString('vi-VN')} <span className="fs-5 text-muted fw-normal">đ</span>
                            </h3>
                            <p className="text-success small fw-semibold mb-0">
                                <i className="bi bi-graph-up-arrow me-1"></i> Tích lũy toàn thời gian
                            </p>
                        </div>
                    </div>
                </div>

                <div className="col-sm-6 col-xl-3">
                    <div className="card shadow-sm border-0 rounded-4 h-100">
                        <div className="card-body p-4">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h6 className="text-muted fw-semibold text-uppercase mb-0">Tổng Số Phòng</h6>
                                <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px' }}>
                                    <i className="bi bi-door-open fs-4"></i>
                                </div>
                            </div>
                            <h3 className="fw-bolder text-dark mb-2">{number.numberOfRoom}</h3>
                            <p className="text-muted small mb-0">Phòng đang được quản lý</p>
                        </div>
                    </div>
                </div>

                <div className="col-sm-6 col-xl-3">
                    <div className="card shadow-sm border-0 rounded-4 h-100">
                        <div className="card-body p-4">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h6 className="text-muted fw-semibold text-uppercase mb-0">Phòng Trống</h6>
                                <div className="bg-warning bg-opacity-10 text-warning rounded-circle d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px' }}>
                                    <i className="bi bi-house-door fs-4"></i>
                                </div>
                            </div>
                            <h3 className="fw-bolder text-dark mb-2">{number.numberOfEmptyRoom}</h3>
                            <p className="text-warning small fw-semibold mb-0">
                                <i className="bi bi-exclamation-circle me-1"></i> Cần đăng tin cho thuê
                            </p>
                        </div>
                    </div>
                </div>

                <div className="col-sm-6 col-xl-3">
                    <div className="card shadow-sm border-0 rounded-4 h-100">
                        <div className="card-body p-4">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h6 className="text-muted fw-semibold text-uppercase mb-0">Số Khách Thuê</h6>
                                <div className="bg-info bg-opacity-10 text-info rounded-circle d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px' }}>
                                    <i className="bi bi-people fs-4"></i>
                                </div>
                            </div>
                            <h3 className="fw-bolder text-dark mb-2">
                                {number.numberOfPeople} <span className="fs-6 text-muted fw-normal">đang ở</span>
                            </h3>
                            <p className="text-info small fw-semibold mb-0">
                                <i className="bi bi-clock-history me-1"></i> {number.numberOfAllTimePeople} khách hàng từ trước đến nay
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row mb-4">
                <div className="col-12">
                    <div className="bg-white p-3 rounded-4 shadow-sm border-0 d-flex justify-content-between align-items-center">
                        <button className="btn btn-light text-primary fw-bold rounded-pill px-4" onClick={handlePrevMonth}>
                            <i className="bi bi-chevron-left me-2"></i> Tháng trước
                        </button>
                        <h5 className="mb-0 fw-bold text-dark text-uppercase tracking-wide">
                            <i className="bi bi-calendar-check text-primary me-2"></i> 
                            Dữ liệu Tháng {selectedMonth}
                        </h5>
                        <button className="btn btn-light text-primary fw-bold rounded-pill px-4" onClick={handleNextMonth}>
                            Tháng sau <i className="bi bi-chevron-right ms-2"></i>
                        </button>
                    </div>
                </div>
            </div>
            
            <div className="row g-4">
                <div className="col-12 col-lg-6">
                    <div className="card shadow-sm border-0 rounded-4 h-100">
                        <div className="card-header bg-white border-0 pt-4 pb-0 px-4">
                            <h5 className="card-title mb-0 fw-bold text-dark">Doanh Thu Tiền Phòng</h5>
                            <p className="text-muted small">Biểu đồ thể hiện mức thu tiền phòng cơ bản</p>
                        </div>
                        <div className="card-body p-4">
                            <div className="chart chart-md">
                                <BarChart chartData={userData} />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-12 col-lg-6">
                    <div className="card shadow-sm border-0 rounded-4 h-100">
                        <div className="card-header bg-white border-0 pt-4 pb-0 px-4">
                            <h5 className="card-title mb-0 fw-bold text-dark">Phân Bổ Chi Phí Khác</h5>
                            <p className="text-muted small">Điện, nước, internet và phí gửi xe</p>
                        </div>
                        <div className="card-body p-4">
                            <div className="chart chart-md">
                                <SubChart chartData={subData} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DashboardRentaler;