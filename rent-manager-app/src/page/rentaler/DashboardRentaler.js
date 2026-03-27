import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import '../../assets/css/app.css';
import BarChart from './chart/BarChart';
import SubChart from './chart/SubChart';
import { getByMonth, getNumber } from '../../services/fetch/ApiUtils';

// Bảng màu
const CHART_COLORS = [
    "rgba(75,192,192,1)",
    "#ecf0f1",
    "#50AF95",
    "#f3ba2f",
    "#2a71d0",
    "#e74c3c"
];

// State chung cho biểu đồ
const initialChartState = {
    labels: [],
    datasets: [
        {
            label: "Doanh thu",
            data: [],
            backgroundColor: CHART_COLORS,
            borderColor: "black",
            borderWidth: 2,
        },
    ],
};

function DashboardRentaler(props) {
    const { authenticated, location } = props;

    // State lưu 4 thẻ thông tin
    const [number, setNumber] = useState({
        numberOfRoom: 0,
        numberOfPeople: 0,
        numberOfEmptyRoom: 0,
        revenue: 0, // Mặc định là 0, sẽ được React tự động tính lại
    });

    const [contentRevenue, setContentRevenue] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

    const [subData, setSubData] = useState(initialChartState);
    const [userData, setUserData] = useState(initialChartState);

    // 1. Lấy thông số (Phòng, Người) từ API getNumber
    useEffect(() => {
        getNumber()
            .then(response => {
                setNumber(prev => ({
                    ...prev,
                    numberOfRoom: response.numberOfRoom || 0,
                    numberOfPeople: response.numberOfPeople || 0,
                    numberOfEmptyRoom: response.numberOfEmptyRoom || 0,
                    // CỐ TÌNH BỎ QUA response.revenue vì Backend đang bị lỗi 0đ
                }));
            })
            .catch(error => console.log(error));
    }, []);

    // 2. Lấy dữ liệu Biểu đồ TẤT CẢ các tháng và TỰ ĐỘNG TÍNH TỔNG DOANH THU
    useEffect(() => {
        getByMonth()
          .then((revenueData) => {
              const data = revenueData.content || [];
              setContentRevenue(data);

              // CHÌA KHÓA FIX LỖI 0đ: Frontend tự động cộng dồn doanh thu thực tế
              let totalAllTime = 0;
              data.forEach(item => {
                  totalAllTime += Number(item.revenue || 0) 
                                + Number(item.waterCost || 0) 
                                + Number(item.publicElectricCost || 0) 
                                + Number(item.internetCost || 0) 
                                + Number(item.parkingCost || 0);
              });

              // Cập nhật lại số tiền Doanh Thu ở Top Card cực chuẩn xác
              setNumber(prev => ({ ...prev, revenue: totalAllTime }));
          })
          .catch((error) => console.log(error));
    }, []);

    // 3. Mỗi khi đổi tháng -> Cập nhật lại biểu đồ
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
                { label: "Tiền nước", backgroundColor: CHART_COLORS[0], borderColor: "black", borderWidth: 2, data: [totalWater] },
                { label: "Tiền điện", backgroundColor: CHART_COLORS[1], borderColor: "black", borderWidth: 2, data: [totalElectric] },
                { label: "Tiền internet", backgroundColor: CHART_COLORS[2], borderColor: "black", borderWidth: 2, data: [totalInternet] },
                { label: "Tiền bãi xe", backgroundColor: CHART_COLORS[5], borderColor: "black", borderWidth: 2, data: [totalParking] }
            ],
        });
    }, [selectedMonth, contentRevenue]);

    const handlePrevMonth = () => setSelectedMonth(prev => prev === 1 ? 12 : prev - 1);
    const handleNextMonth = () => setSelectedMonth(prev => prev === 12 ? 1 : prev + 1);

    if (!authenticated) {
        return <Navigate to={{ pathname: "/login-rentaler", state: { from: location } }} />;
    }

    return (
        <>
            <div className="container-fluid p-0">
                <div className="row mb-2 mb-xl-3">
                    <div className="col-auto d-none d-sm-block">
                        <h3><strong>✨</strong> Thống kê</h3>
                    </div>
                </div>
                
                {/* 4 Ô TỔNG QUAN */}
                <div className="row">
                    <div className="col-sm-6 col-xl-3">
                        <div className="card shadow-sm">
                            <div className="card-body">
                                <div className="row">
                                    <div className="col mt-0">
                                        <h5 className="card-title">Tổng Phòng</h5>
                                    </div>
                                    <div className="col-auto">
                                        <div className="stat text-primary">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-dollar-sign align-middle"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                                        </div>
                                    </div>
                                </div>
                                <h1 className="mt-1 mb-3">{number.numberOfRoom}</h1>
                                <div className="mb-0">
                                    <span className="badge badge-success-light"> <i className="mdi mdi-arrow-bottom-right"></i> 3.65% </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-sm-6 col-xl-3">
                        <div className="card shadow-sm">
                            <div className="card-body">
                                <div className="row">
                                    <div className="col mt-0">
                                        <h5 className="card-title">Số người thuê</h5>
                                    </div>
                                    <div className="col-auto">
                                        <div className="stat text-primary">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-shopping-bag align-middle"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                                        </div>
                                    </div>
                                </div>
                                <h1 className="mt-1 mb-3">{number.numberOfPeople}</h1>
                                <div className="mb-0">
                                    <span className="badge badge-danger-light"> <i className="mdi mdi-arrow-bottom-right"></i> -5.25% </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-sm-6 col-xl-3">
                        <div className="card shadow-sm">
                            <div className="card-body">
                                <div className="row">
                                    <div className="col mt-0">
                                        <h5 className="card-title">Phòng trống</h5>
                                    </div>
                                    <div className="col-auto">
                                        <div className="stat text-primary">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-activity align-middle"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                                        </div>
                                    </div>
                                </div>
                                <h1 className="mt-1 mb-3">{number.numberOfEmptyRoom}</h1>
                                <div className="mb-0">
                                    <span className="badge badge-success-light"> <i className="mdi mdi-arrow-bottom-right"></i> 4.65% </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-sm-6 col-xl-3">
                        <div className="card shadow-sm">
                            <div className="card-body">
                                <div className="row">
                                    <div className="col mt-0">
                                        <h5 className="card-title">Tổng Doanh Thu</h5>
                                    </div>
                                    <div className="col-auto">
                                        <div className="stat text-primary">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-shopping-cart align-middle"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                                        </div>
                                    </div>
                                </div>
                                <h1 className="mt-1 mb-4 text-success" style={{ fontSize: "xx-large" }}>
                                    {Number(number.revenue || 0).toLocaleString('vi-VN', {
                                        style: 'currency',
                                        currency: 'VND',
                                    })}
                                </h1>
                            </div>
                        </div>
                    </div>
                </div>

                {/* BỘ ĐIỀU KHIỂN CHUYỂN THÁNG */}
                <div className="row mb-3 mt-4">
                    <div className="col-12 d-flex justify-content-center align-items-center">
                        <button className="btn btn-primary fw-bold shadow-sm" onClick={handlePrevMonth}>
                            &laquo; Tháng trước
                        </button>
                        <h4 className="mx-4 mb-0 fw-bold text-primary text-uppercase">
                            Dữ liệu Tháng {selectedMonth}
                        </h4>
                        <button className="btn btn-primary fw-bold shadow-sm" onClick={handleNextMonth}>
                            Tháng sau &raquo;
                        </button>
                    </div>
                </div>
                
                {/* 2 BIỂU ĐỒ */}
                <div className="row">
                    <div className="col-12 col-lg-6 d-flex">
                        <div className="card flex-fill w-100 shadow-sm">
                            <div className="card-header bg-white">
                                <h5 className="card-title mb-0 fw-bold">Doanh Thu Tiền Phòng</h5>
                            </div>
                            <div className="card-body pt-2 pb-3">
                                <div className="chart chart-md">
                                    <BarChart chartData={userData} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-12 col-lg-6 d-flex">
                        <div className="card flex-fill w-100 shadow-sm">
                            <div className="card-header bg-white">
                                <h5 className="card-title mb-0 fw-bold">Doanh Thu Từ Chi Phí Khác</h5>
                            </div>
                            <div className="card-body pt-2 pb-3">
                                <SubChart chartData={subData} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default DashboardRentaler;