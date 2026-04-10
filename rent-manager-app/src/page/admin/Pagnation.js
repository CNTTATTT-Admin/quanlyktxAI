import React from 'react';

const Pagination = ({ itemsPerPage, totalItems, currentPage, paginate }) => {
    const pageNumbers = Math.ceil(totalItems / itemsPerPage);

    const handlePrevious = (e) => {
        e?.preventDefault();
        if (currentPage > 1) {
            paginate(currentPage - 1);
        }
    };

    const handleNext = (e) => {
        e?.preventDefault();
        if (currentPage < pageNumbers) {
            paginate(currentPage + 1);
        }
    };

    if (totalItems <= 0) return null;

    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    return (
        <>
            <style>{`
                .eco-pagination-wrapper {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    width: 100%;
                    padding: 10px 0;
                }
                
                .eco-pagination-info {
                    color: #64748B;
                    font-size: 0.9rem;
                    font-weight: 500;
                }

                .eco-pagination .page-item .page-link {
                    color: #475569;
                    background-color: #ffffff;
                    border: 1px solid #E2E8F0;
                    padding: 8px 16px;
                    margin: 0 4px;
                    border-radius: 8px;
                    font-weight: 600;
                    transition: all 0.2s ease;
                    cursor: pointer;
                    text-decoration: none;
                }

                .eco-pagination .page-item.active .page-link {
                    z-index: 3;
                    color: #ffffff;
                    background-color: #3B82F6;
                    border-color: #3B82F6;
                    box-shadow: 0 4px 10px rgba(59, 130, 246, 0.25);
                }

                .eco-pagination .page-item:not(.active):not(.disabled) .page-link:hover {
                    background-color: #EFF6FF;
                    color: #3B82F6;
                    border-color: #BFDBFE;
                }

                .eco-pagination .page-item.disabled .page-link {
                    color: #94A3B8;
                    background-color: #F8FAFC;
                    border-color: #E2E8F0;
                    cursor: not-allowed;
                }
                
                @media (max-width: 768px) {
                    .eco-pagination-wrapper {
                        flex-direction: column;
                        gap: 15px;
                        justify-content: center;
                    }
                }
            `}</style>

            <div className="eco-pagination-wrapper">
                <div className="eco-pagination-info">
                    Hiển thị <span className="fw-bold text-dark">{startItem}</span> đến <span className="fw-bold text-dark">{endItem}</span> trong tổng số <span className="fw-bold text-dark">{totalItems}</span> kết quả
                </div>
                
                <div>
                    <ul className="pagination eco-pagination mb-0">
                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                            <a href="#!" onClick={handlePrevious} className="page-link">
                                <i className="bi bi-chevron-left me-1"></i> Trước
                            </a>
                        </li>
                        
                        {Array.from({ length: pageNumbers }, (_, index) => index + 1).map((number) => (
                            <li key={number} className={`page-item ${currentPage === number ? 'active' : ''}`}>
                                <a href="#!" onClick={(e) => { e.preventDefault(); paginate(number); }} className="page-link">
                                    {number}
                                </a>
                            </li>
                        ))}
                        
                        <li className={`page-item ${currentPage === pageNumbers ? 'disabled' : ''}`}>
                            <a href="#!" onClick={handleNext} className="page-link">
                                Sau <i className="bi bi-chevron-right ms-1"></i>
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </>
    );
};

export default Pagination;