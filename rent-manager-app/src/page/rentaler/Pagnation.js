import React from "react";

const Pagination = ({ itemsPerPage, totalItems, currentPage, paginate }) => {
    const pageNumbers = Math.ceil(totalItems / itemsPerPage);

    const handlePrevious = (e) => {
        e.preventDefault();
        if (currentPage > 1) {
            paginate(currentPage - 1);
        }
    };

    const handleNext = (e) => {
        e.preventDefault();
        if (currentPage < pageNumbers) {
            paginate(currentPage + 1);
        }
    };

    const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    if (totalItems <= 0) return null;

    return (
        <>
            <style>{`
                .eco-pagination-wrapper {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    flex-wrap: wrap;
                    gap: 15px;
                    width: 100%;
                    padding: 10px 0;
                }

                .eco-pagination-info {
                    font-size: 0.9rem;
                    color: #64748B;
                    font-weight: 500;
                }

                .eco-pagination {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin: 0;
                    padding: 0;
                    list-style: none;
                }

                .eco-page-btn {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    min-width: 38px;
                    height: 38px;
                    padding: 0 10px;
                    border-radius: 50px;
                    border: 1px solid transparent;
                    background-color: #ffffff;
                    color: #475569;
                    font-weight: 600;
                    font-size: 0.9rem;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    text-decoration: none;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.04);
                }

                /* Hiệu ứng Hover */
                .eco-page-btn:hover:not(.disabled) {
                    background-color: #F0FDF4;
                    color: #10B981;
                    border-color: #D1FAE5;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.15);
                }

                /* Trạng thái Đang chọn (Active) */
                .eco-page-btn.active {
                    background-color: #10B981;
                    color: #ffffff;
                    border-color: #10B981;
                    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
                    cursor: default;
                }

                /* Trạng thái Vô hiệu hóa (Disabled) */
                .eco-page-btn.disabled {
                    background-color: #F8FAFC;
                    color: #CBD5E1;
                    box-shadow: none;
                    cursor: not-allowed;
                }

                /* Nút Prev/Next dạng viên thuốc dài hơn chút */
                .eco-page-btn.nav-btn {
                    padding: 0 16px;
                }
            `}</style>

            <div className="eco-pagination-wrapper">
                <div className="eco-pagination-info">
                    Hiển thị <strong className="text-dark">{startItem}</strong> đến <strong className="text-dark">{endItem}</strong> trong tổng số <strong className="text-dark">{totalItems}</strong> kết quả
                </div>
                
                <ul className="eco-pagination">
                    <li>
                        <a 
                            href="#!" 
                            onClick={handlePrevious} 
                            className={`eco-page-btn nav-btn ${currentPage === 1 ? 'disabled' : ''}`}
                            aria-disabled={currentPage === 1}
                        >
                            <i className="bi bi-chevron-left me-1" style={{ fontSize: "0.8rem" }}></i> Trước
                        </a>
                    </li>

                    {Array.from({ length: pageNumbers }, (_, index) => index + 1).map((number) => (
                        <li key={number}>
                            <a 
                                href="#!" 
                                onClick={(e) => { e.preventDefault(); paginate(number); }} 
                                className={`eco-page-btn ${currentPage === number ? 'active' : ''}`}
                            >
                                {number}
                            </a>
                        </li>
                    ))}

                    <li>
                        <a 
                            href="#!" 
                            onClick={handleNext} 
                            className={`eco-page-btn nav-btn ${currentPage === pageNumbers ? 'disabled' : ''}`}
                            aria-disabled={currentPage === pageNumbers}
                        >
                            Sau <i className="bi bi-chevron-right ms-1" style={{ fontSize: "0.8rem" }}></i>
                        </a>
                    </li>
                </ul>
            </div>
        </>
    );
};

export default Pagination;