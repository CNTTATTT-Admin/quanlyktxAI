import React from 'react';

const Pagination = ({ itemsPerPage, totalItems, currentPage, paginate }) => {
    //totalItems bị null/undefined thì mặc định là 1 trang
    const safeTotalItems = totalItems || 0;
    const pageNumbers = Math.max(Math.ceil(safeTotalItems / itemsPerPage), 1);

    const handlePrevious = (e) => {
        e.preventDefault();
        if (currentPage > 1) paginate(currentPage - 1);
    };

    const handleNext = (e) => {
        e.preventDefault();
        if (currentPage < pageNumbers) paginate(currentPage + 1);
    };

    return (
        <>
            <style>{`
                .bulletproof-pagination {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 12px;
                    list-style: none;
                    padding: 0;
                    margin: 0;
                    width: 100%;
                }
                .bulletproof-pagination .page-item .page-link {
                    border-radius: 50% !important; 
                    width: 45px;
                    height: 45px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: none;
                    color: #6c757d;
                    font-weight: 600;
                    font-size: 1.1rem;
                    background-color: #ffffff;
                    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
                    text-decoration: none;
                }
                .bulletproof-pagination .page-item .page-link:hover {
                    background-color: #e6fcf0;
                    color: #10B981;
                    transform: translateY(-3px);
                    box-shadow: 0 6px 15px rgba(16, 185, 129, 0.25);
                }
                .bulletproof-pagination .page-item.active .page-link {
                    background-color: #10B981 !important;
                    color: #ffffff !important;
                    box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4) !important;
                    transform: scale(1.1);
                }
                .bulletproof-pagination .page-item.disabled .page-link {
                    opacity: 0.4;
                    cursor: not-allowed;
                    transform: none;
                    box-shadow: none;
                    background-color: #f8f9fa;
                    color: #adb5bd;
                }
            `}</style>

            <div className="w-100 py-3">
                <nav aria-label="Page navigation">
                    <ul className="bulletproof-pagination">
                        
                        {/* Nút Lùi (Previous) */}
                        <li className={`page-item ${currentPage <= 1 ? 'disabled' : ''}`}>
                            <a href="#" aria-label="Previous" onClick={handlePrevious} className="page-link">
                                <i className="bi bi-chevron-left"></i>
                            </a>
                        </li>
                        
                        {/* Các nút Số Trang */}
                        {Array.from({ length: pageNumbers }, (_, index) => index + 1).map((number) => (
                            <li key={number} className={`page-item ${currentPage === number ? 'active' : ''}`}>
                                <a href="#" onClick={(e) => { e.preventDefault(); paginate(number); }} className="page-link">
                                    {number}
                                </a>
                            </li>
                        ))}

                        {/* Nút Tiến (Next) */}
                        <li className={`page-item ${currentPage >= pageNumbers ? 'disabled' : ''}`}>
                            <a href="#" aria-label="Next" onClick={handleNext} className="page-link">
                                <i className="bi bi-chevron-right"></i>
                            </a>
                        </li>
                        
                    </ul>
                </nav>
            </div>
        </>
    );
};

export default Pagination;