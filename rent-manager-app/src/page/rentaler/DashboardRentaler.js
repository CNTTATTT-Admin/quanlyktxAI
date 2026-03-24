import React, { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom'
import Nav from './Nav';
import SidebarNav from './SidebarNav';
import '../../assets/css/app.css';
import BarChart from './chart/BarChart';
import PieChart from './chart/PieChart';
import { getByCost, getByMonth, getNumber } from '../../services/fetch/ApiUtils';
import { RevenueData } from '../../utils/Data';
import SubChart from './chart/SubChart';

//gộp 1 bảng màu
const CHART_COLORS = [
    "rgba(75,192,192,1)",
    "#ecf0f1",
    "#50AF95",
    "#f3ba2f",
    "#2a71d0",
    "#e74c3c"
];

//state chung
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
    console.log("Props:", props)
    const { authenticated, role, currentUser, location, onLogout } = props;

    const [number, setNumber] = useState({
        numberOfRoom: '',
        numberOfPeople: '',
        numberOfEmptyRoom: '',
        revenue: '',
        waterCost: '',
        publicElectricCost: '',
        internetCost: '',
    });

    const [contentRevenue, setContentRevenue] = useState([]);
    const [currentMonthData, setCurrentMonthData] = useState([]);

    const [revenueData, setRevenueData] = useState(); 

    const [subData, setSubData] = useState(initialChartState);
    const [userData, setUserData] = useState(initialChartState);
    const [costData, setCostData] = useState(initialChartState);

    useEffect(() => {
        getNumber()
            .then(response => {
                const number = response;
                setNumber(prevState => ({
                    ...prevState,
                    ...number
                }));
            })
            .catch(error => {
                console.log(error)
            });
    }, []);

    const monthOfNow = new Date().getMonth() + 1;

    useEffect(() => {
        getByMonth()
          .then((revenueData) => {
            const currentMonthLabels = revenueData.content.filter((data) => data.month === monthOfNow).map((data) => "Tháng " + data.month);

            setUserData((prevUserData) => ({
              ...prevUserData,
              labels: currentMonthLabels,
              datasets: [
                {
                  ...prevUserData.datasets[0],
                  data: revenueData.content.map((data) => data.revenue),
                },
              ],
            }));
            console.log("userData", userData);
            setContentRevenue(revenueData.content);

            setSubData((prevUserData) => ({
                ...prevUserData,
                labels: currentMonthLabels,
                datasets: [
                  {
                    ...prevUserData.datasets[0],
                    label: "Tiền nước",
                    backgroundColor: CHART_COLORS[0],
                    data: revenueData.content.map((data) => data.waterCost),
                  },
                  {
                    ...prevUserData.datasets[0],
                    label: "Tiền điện",
                    backgroundColor: CHART_COLORS[1],
                    data: revenueData.content.map((data) => data.publicElectricCost),
                  },
                  {
                    ...prevUserData.datasets[0], // Sửa lại thành 0 để kế thừa viền đen, do đã rút gọn datasets
                    label: "Tiền internet",
                    backgroundColor: CHART_COLORS[2],
                    data: revenueData.content.map((data) => data.internetCost),
                  },
                  {
                    ...prevUserData.datasets[0],
                    label: "Tiền bãi xe",
                    backgroundColor: CHART_COLORS[5], 
                    data: revenueData.content.map((data) => data.parkingCost || 0), 
                  }
                ],
              }));
          })
          .catch((error) => {
            console.log(error);
          });

        // GIỮ NGUYÊN PHẦN CODE BỊ COMMENT
        //   getByCost()
        //   .then((revenueData) => {
        //     setCostData((prevUserData) => ({
        //       ...prevUserData,
        //       labels: revenueData.content.map((data) => data.name),
        //       datasets: [
        //         {
        //           ...prevUserData.datasets[0],
        //           data: revenueData.content.map((data) => data.cost),
        //         },
        //       ],
        //     }));
        //   })
        //   .catch((error) => {
        //     console.log(error);
        //   });
      }, [monthOfNow]); // Thêm monthOfNow vào dependency array cho chuẩn React hook

      useEffect(() => {
        const date = new Date();
        const currentMonth = date.getMonth() + 1;
        const currentMonthData = contentRevenue.filter(content => content.month === currentMonth)
        console.log("currentMonthData", currentMonthData);
      })

    console.log("subData", subData);
    
    if (!props.authenticated) {
        return <Navigate
            to={{
                pathname: "/login-rentaler",
                state: { from: location }
            }} />;
    }

    return (
        <>
            <div className="container-fluid p-0">
                <div class="row mb-2 mb-xl-3">
                    <div class="col-auto d-none d-sm-block">
                        <h3><strong>✨</strong> Thông kê</h3>
                    </div>
                </div>
                <div class="row">
                    <div class="col-sm-6 col-xl-3">
                        <div class="card">
                            <div class="card-body">
                                <div class="row">
                                    <div class="col mt-0">
                                        <h5 class="card-title">Tổng Phòng</h5>
                                    </div>
                                    <div class="col-auto">
                                        <div class="stat text-primary">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-dollar-sign align-middle"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                                        </div>
                                    </div>
                                </div>
                                <h1 class="mt-1 mb-3">{number.numberOfRoom}</h1>
                                <div class="mb-0">
                                    <span class="badge badge-success-light"> <i class="mdi mdi-arrow-bottom-right"></i> 3.65% </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-sm-6 col-xl-3">
                        <div class="card">
                            <div class="card-body">
                                <div class="row">
                                    <div class="col mt-0">
                                        <h5 class="card-title">Số người thuê</h5>
                                    </div>
                                    <div class="col-auto">
                                        <div class="stat text-primary">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-shopping-bag align-middle"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                                        </div>
                                    </div>
                                </div>
                                <h1 class="mt-1 mb-3">{number.numberOfPeople}</h1>
                                <div class="mb-0">
                                    <span class="badge badge-danger-light"> <i class="mdi mdi-arrow-bottom-right"></i> -5.25% </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-sm-6 col-xl-3">
                        <div class="card">
                            <div class="card-body">
                                <div class="row">
                                    <div class="col mt-0">
                                        <h5 class="card-title">Phòng trống</h5>
                                    </div>
                                    <div class="col-auto">
                                        <div class="stat text-primary">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-activity align-middle"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                                        </div>
                                    </div>
                                </div>
                                <h1 class="mt-1 mb-3">{number.numberOfEmptyRoom}</h1>
                                <div class="mb-0">
                                    <span class="badge badge-success-light"> <i class="mdi mdi-arrow-bottom-right"></i> 4.65% </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-sm-6 col-xl-3">
                        <div class="card">
                            <div class="card-body">
                                <div class="row">
                                    <div class="col mt-0">
                                        <h5 class="card-title">Doanh Thu</h5>
                                    </div>
                                    <div class="col-auto">
                                        <div class="stat text-primary">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-shopping-cart align-middle"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                                        </div>
                                    </div>
                                </div>
                                <h1 class="mt-1 mb-4" style={{ fontSize: "xx-large" }}>{number.revenue.toLocaleString('vi-VN', {
                                    style: 'currency',
                                    currency: 'VND',
                                })}
                                </h1>
                                <div class="mb-0">
                                    <span class="badge badge-success-light"> <i class="mdi mdi-arrow-bottom-right"></i> 2.35% </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="row">
                    <div class="col-12 col-lg-6 d-flex">
                        <div class="card flex-fill w-100">
                            <div class="card-header">
                                <div class="float-end"></div>
                                <h5 class="card-title mb-0">Doanh Thu Tiền Phòng</h5>
                            </div>
                            <div class="card-body pt-2 pb-3">
                                <div class="chart chart-md">
                                    <BarChart chartData={userData} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-12 col-lg-6 d-flex">
                        <div class="card flex-fill w-100">
                            <div class="card-header">
                                <div class="float-end"></div>
                                <h5 class="card-title mb-0">Doanh Thu Từ Chi Phí Khác</h5>
                            </div>
                            <SubChart chartData={subData} />
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default DashboardRentaler;