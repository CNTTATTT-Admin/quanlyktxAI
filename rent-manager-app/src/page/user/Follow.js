import React, { useEffect, useState } from 'react';
import SidebarNav from './SidebarNav';
import { getAllFollow} from '../../services/fetch/ApiUtils';
import Pagination from './Pagnation';
import { toast } from 'react-toastify';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import Header from '../../common/Header';
import Footer from '../../common/Footer';

function Follow(props) {

    const { authenticated, role, currentUser, location, onLogout } = props;
    const history = useNavigate();

    const [tableData, setTableData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(6);
    const [totalItems, setTotalItems] = useState(0);

    // Fetch data from the API
    useEffect(() => {
        fetchData();
    }, [currentPage]);

    const fetchData = () => {
        getAllFollow(currentPage, itemsPerPage).then(response => {
            setTableData(response.content);
            setTotalItems(response.totalElements);
        }).catch(
            error => {
                toast.error((error && error.message) || 'Oops! Có điều gì đó xảy ra. Vui lòng thử lại!');
            }
        )
    }

    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    if (!authenticated) {
        return <Navigate
            to={{
                pathname: "/login",
                state: { from: location }
            }} />;
    }

    return (
        <>
            <style>{`
                .eco-page-bg {
                    background-color: #F8FAFC;
                    min-height: calc(100vh - 70px);
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                    -webkit-font-smoothing: antialiased;
                    -moz-osx-font-smoothing: grayscale;
                    display: flex;
                    flex-direction: column;
                }

                .wrapper { display: flex; align-items: stretch; width: 100%; flex-grow: 1; }
                
                #sidebar.sidebar {
                    background-color: #ffffff !important; position: relative !important; align-self: stretch !important; 
                    min-height: 100% !important; width: 260px !important; min-width: 260px !important; max-width: 260px !important;
                    border-right: 1px solid #EEF2FF; z-index: 1000; top: auto !important; bottom: auto !important; height: auto !important; margin: 0 !important; transform: none !important;
                }

                .sidebar-content {
                    position: sticky !important; top: 70px !important; height: calc(100vh - 70px) !important;
                    overflow-y: auto !important; background-color: #ffffff !important; display: flex; flex-direction: column;
                }
                
                .sidebar-content::-webkit-scrollbar { width: 4px; }
                .sidebar-content::-webkit-scrollbar-thumb { background-color: #CBD5E1; border-radius: 4px; }

                .main { flex-grow: 1; min-width: 0; }

                .eco-main-wrapper { padding: 30px; width: 100%; }

                .eco-card-container {
                    background: #ffffff; border-radius: 16px; box-shadow: 0 4px 20px rgba(79, 70, 229, 0.05);
                    border: 1px solid #EEF2FF; overflow: hidden;
                }

                .eco-card-header {
                    background-color: #ffffff; padding: 25px 30px 20px 30px; border-bottom: 1px solid #EEF2FF;
                    display: flex; justify-content: space-between; align-items: center;
                }

                .eco-title-icon { color: #4F46E5; margin-right: 10px; font-size: 1.3rem; }

                .eco-agent-card {
                    background: #ffffff; border-radius: 16px; border: 1px solid #E2E8F0;
                    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.03); transition: all 0.3s ease;
                    display: flex; flex-direction: column; height: 100%; overflow: hidden;
                }
                .eco-agent-card:hover {
                    transform: translateY(-5px); box-shadow: 0 12px 30px rgba(79, 70, 229, 0.12); border-color: #C7D2FE;
                }

                .eco-agent-img-wrapper {
                    height: 220px; overflow: hidden; position: relative;
                }
                .eco-agent-img {
                    width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease;
                }
                .eco-agent-card:hover .eco-agent-img { transform: scale(1.05); }

                .eco-agent-info { padding: 20px; flex-grow: 1; display: flex; flex-direction: column; }
                
                .eco-agent-name {
                    font-size: 1.15rem; font-weight: 800; color: #1E293B; text-decoration: none; transition: color 0.2s;
                    margin-bottom: 4px; display: inline-block;
                }
                .eco-agent-name:hover { color: #4F46E5; }

                .eco-agent-address { color: #64748B; font-size: 0.85rem; line-height: 1.4; margin-bottom: 15px; }

                .eco-agent-contact-list { margin: 0; padding: 0; list-style: none; flex-grow: 1; }
                .eco-agent-contact-list li {
                    display: flex; align-items: center; font-size: 0.9rem; color: #475569; margin-bottom: 8px; font-weight: 500;
                }
                .eco-agent-contact-list li i { color: #4F46E5; margin-right: 10px; font-size: 1rem; }

                .eco-social-wrap {
                    display: flex; gap: 10px; margin-top: 15px; border-top: 1px solid #EEF2FF; padding-top: 15px; justify-content: center;
                }
                .eco-social-btn {
                    width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
                    background-color: #F8FAFC; color: #64748B; transition: all 0.3s ease; text-decoration: none;
                }
                .eco-social-btn svg { width: 16px; height: 16px; fill: currentColor; }
                .eco-social-btn.fb:hover { background-color: #1877F2; color: #ffffff; transform: translateY(-2px); box-shadow: 0 4px 10px rgba(24, 119, 242, 0.3); }
                .eco-social-btn.zl:hover { background-color: #0068FF; color: #ffffff; transform: translateY(-2px); box-shadow: 0 4px 10px rgba(0, 104, 255, 0.3); }

            `}</style>

            <Header authenticated={authenticated} currentUser={currentUser} onLogout={onLogout} />
            
            <div style={{ marginTop: "90px" }}></div>
            
            <main id="main" className="eco-page-bg">
                <div className="wrapper">
                    <nav id="sidebar" className="sidebar js-sidebar">
                        <div className="sidebar-content js-simplebar">
                            <SidebarNav />
                        </div>
                    </nav>

                    <div className="main">
                        <div className="eco-main-wrapper">
                            
                            <div className="eco-card-container">
                                <div className="eco-card-header">
                                    <div>
                                        <h4 className="fw-bold text-dark mb-1">
                                            <i className="bi bi-people-fill eco-title-icon"></i>
                                            Theo dõi chủ trọ
                                        </h4>
                                        <h6 className="text-muted mb-0" style={{fontSize: "0.95rem"}}>
                                            Quản lý danh sách các người cho thuê mà bạn đang quan tâm.
                                        </h6>
                                    </div>
                                    {/* thừa */}
                                    {/* <div className="text-muted opacity-50 d-none d-sm-block" style={{fontSize: "2rem"}}>
                                        <i className="bi bi-heart-fill"></i>
                                    </div> */}
                                </div>
                                
                                <div className="card-body p-4">
                                    {tableData.length === 0 ? (
                                        <div className="text-center py-5">
                                            <i className="bi bi-person-x text-muted fs-1 mb-3 d-block" style={{opacity: 0.3}}></i>
                                            <span className="text-muted fw-semibold" style={{fontSize: "1.1rem"}}>Bạn chưa theo dõi chủ trọ nào.</span>
                                        </div>
                                    ) : (
                                        <div className="row g-4">
                                            {tableData.map((item, index) => (
                                                <div className="col-sm-6 col-lg-4" key={item.id || index}>
                                                    <div className="eco-agent-card">
                                                        <div className="eco-agent-img-wrapper">
                                                            {item.rentaler?.imageUrl ? (
                                                                <img src={item.rentaler?.imageUrl} alt={item.rentaler.name} className="eco-agent-img" />
                                                            ) : (
                                                                <img src="assets/img/agent-4.jpg" alt="Default Agent" className="eco-agent-img" />
                                                            )}
                                                        </div>
                                                        
                                                        <div className="eco-agent-info">
                                                            <Link to={`/angent-single/`+item.rentaler.id} className="eco-agent-name">
                                                                {item.rentaler.name}
                                                            </Link>
                                                            <p className="eco-agent-address">
                                                                <i className="bi bi-geo-alt-fill text-muted me-1"></i>
                                                                {item.rentaler.address || "Chưa cập nhật địa chỉ"}
                                                            </p>
                                                            
                                                            <ul className="eco-agent-contact-list">
                                                                <li>
                                                                    <i className="bi bi-telephone-fill"></i>
                                                                    {item.rentaler.phone || "Trống"}
                                                                </li>
                                                                <li>
                                                                    <i className="bi bi-envelope-at-fill"></i>
                                                                    {item.rentaler.email || "Trống"}
                                                                </li>
                                                            </ul>

                                                            <div className="eco-social-wrap">
                                                                <a href={item.rentaler?.facebookUrl || "#"} className="eco-social-btn fb" target="_blank" rel="noreferrer" title="Facebook">
                                                                    <i className="bi bi-facebook fs-5"></i>
                                                                </a>
                                                                <a href={item.rentaler?.zaloUrl || "#"} className="eco-social-btn zl" target="_blank" rel="noreferrer" title="Zalo">
                                                                    {/* SVG Zalo */}
                                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50">
                                                                        <path d="M 9 4 C 6.2504839 4 4 6.2504839 4 9 L 4 41 C 4 43.749516 6.2504839 46 9 46 L 41 46 C 43.749516 46 46 43.749516 46 41 L 46 9 C 46 6.2504839 43.749516 4 41 4 L 9 4 z M 9 6 L 15.576172 6 C 12.118043 9.5981082 10 14.323627 10 19.5 C 10 24.861353 12.268148 29.748596 15.949219 33.388672 C 15.815412 33.261195 15.988635 33.48288 16.005859 33.875 C 16.023639 34.279773 15.962689 34.835916 15.798828 35.386719 C 15.471108 36.488324 14.785653 37.503741 13.683594 37.871094 A 1.0001 1.0001 0 0 0 13.804688 39.800781 C 16.564391 40.352722 18.51646 39.521812 19.955078 38.861328 C 21.393696 38.200845 22.171033 37.756375 23.625 38.34375 A 1.0001 1.0001 0 0 0 23.636719 38.347656 C 26.359037 39.41176 29.356235 40 32.5 40 C 36.69732 40 40.631169 38.95117 44 37.123047 L 44 41 C 44 42.668484 42.668484 44 41 44 L 9 44 C 7.3315161 44 6 42.668484 6 41 L 6 9 C 6 7.3315161 7.3315161 6 9 6 z M 18.496094 6 L 41 6 C 42.668484 6 44 7.3315161 44 9 L 44 34.804688 C 40.72689 36.812719 36.774644 38 32.5 38 C 29.610147 38 26.863646 37.459407 24.375 36.488281 C 22.261967 35.634656 20.540725 36.391201 19.121094 37.042969 C 18.352251 37.395952 17.593707 37.689389 16.736328 37.851562 C 17.160501 37.246758 17.523335 36.600775 17.714844 35.957031 C 17.941109 35.196459 18.033096 34.45168 18.003906 33.787109 C 17.974816 33.12484 17.916946 32.518297 17.357422 31.96875 L 17.355469 31.966797 C 14.016928 28.665356 12 24.298743 12 19.5 C 12 14.177406 14.48618 9.3876296 18.496094 6 z M 32.984375 14.986328 A 1.0001 1.0001 0 0 0 32 16 L 32 25 A 1.0001 1.0001 0 1 0 34 25 L 34 16 A 1.0001 1.0001 0 0 0 32.984375 14.986328 z M 18 16 A 1.0001 1.0001 0 1 0 18 18 L 21.197266 18 L 17.152344 24.470703 A 1.0001 1.0001 0 0 0 18 26 L 23 26 A 1.0001 1.0001 0 1 0 23 24 L 19.802734 24 L 23.847656 17.529297 A 1.0001 1.0001 0 0 0 23 16 L 18 16 z M 29.984375 18.986328 A 1.0001 1.0001 0 0 0 29.162109 19.443359 C 28.664523 19.170123 28.103459 19 27.5 19 C 25.578848 19 24 20.578848 24 22.5 C 24 24.421152 25.578848 26 27.5 26 C 28.10285 26 28.662926 25.829365 29.160156 25.556641 A 1.0001 1.0001 0 0 0 31 25 L 31 22.5 L 31 20 A 1.0001 1.0001 0 0 0 29.984375 18.986328 z M 38.5 19 C 36.578848 19 35 20.578848 35 22.5 C 35 24.421152 36.578848 26 38.5 26 C 40.421152 26 42 24.421152 42 22.5 C 42 20.578848 40.421152 19 38.5 19 z M 27.5 21 C 28.340272 21 29 21.659728 29 22.5 C 29 23.340272 28.340272 24 27.5 24 C 26.659728 24 26 23.340272 26 22.5 C 26 21.659728 26.659728 21 27.5 21 z M 38.5 21 C 39.340272 21 40 21.659728 40 22.5 C 40 23.340272 39.340272 24 38.5 24 C 37.659728 24 37 23.340272 37 22.5 C 37 21.659728 37.659728 21 38.5 21 z"></path>
                                                                    </svg>
                                                                </a>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                        <div className="d-flex justify-content-center mt-5 mb-2">
                                            <Pagination
                                                itemsPerPage={itemsPerPage}
                                                totalItems={totalItems}
                                                currentPage={currentPage}
                                                paginate={paginate}
                                            />
                                        </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    )
}

export default Follow;