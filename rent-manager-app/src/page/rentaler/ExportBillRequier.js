import { Navigate, useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import Nav from './Nav';
import SidebarNav from './SidebarNav';
import { getRequestById } from '../../services/fetch/ApiUtils';
import * as XLSX from 'xlsx';

function ExportBillRequier(props) {
    const { authenticated, role, currentUser, location, onLogout } = props;
    const { id } = useParams();
    const navigate = useNavigate();

    const [contractData, setContractData] = useState({
        nameBill: '',
        description: '',
        price: 0,
        nameOfRent: '',
        nameRoom: ''
    });

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setContractData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        toast.success("Xuât hóa đơn thành công!!")
        setContractData({
            nameBill: "",
            price: "",
        });
    };

    useEffect(() => {
        getRequestById(id)
            .then(response => {
                const description = response.description;
                const nameOfRent = response.name;
                const nameRoom = response.room.title
                setContractData({
                    description,
                    nameOfRent,
                    nameRoom
                });
            })
            .catch(error => {
                toast.error((error && error.message) || 'Oops! Có điều gì đó xảy ra. Vui lòng thử lại!');
            });
    }, [id]);

    const handleExport = () => {
        exportToExcel(contractData);
    };

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
            `}</style>

            <div className="container-fluid p-4 eco-bg">
                
                {/* Header với nút Quay lại */}
                <div className="row mb-4">
                    <div className="col-12 d-flex justify-content-between align-items-center flex-wrap gap-3">
                        <div>
                            <h2 className="fw-bolder text-dark mb-1">Xuất hóa đơn dịch vụ</h2>
                            <p className="text-muted mb-0">Tạo và tải xuống hóa đơn Excel cho yêu cầu của người thuê.</p>
                        </div>
                        <button 
                            type="button"
                            className="btn btn-light bg-white border shadow-sm btn-modern text-secondary rounded-pill" 
                            onClick={() => navigate('/rentaler/request-management')}
                        >
                            <i className="bi bi-arrow-left me-2"></i> Quay lại danh sách
                        </button>
                    </div>
                </div>

                {/* Form nhập liệu (Căn giữa) */}
                <div className="row justify-content-center">
                    <div className="col-12 col-xl-8 col-lg-10">
                        <div className="modern-card p-4 p-md-5">
                            <h5 className="fw-bold text-emerald mb-4 pb-3 border-bottom d-flex align-items-center">
                                <i className="bi bi-receipt me-2 fs-4"></i> Thông tin hóa đơn
                            </h5>
                            
                            <form onSubmit={handleSubmit}>
                                <div className="row g-4">
                                    
                                    <div className="col-12">
                                        <label className="modern-label" htmlFor="nameBill">Tên Hóa Đơn</label>
                                        <input 
                                            type="text" 
                                            className="form-control modern-input" 
                                            id="nameBill" 
                                            name="nameBill" 
                                            value={contractData.nameBill}
                                            onChange={handleInputChange}
                                            placeholder="VD: Hóa đơn sửa điện phòng 101..."
                                        />
                                    </div>

                                    <div className="col-md-6">
                                        <label className="modern-label" htmlFor="nameRoom">Tên Phòng</label>
                                        <input 
                                            type="text" 
                                            className="form-control modern-input" 
                                            id="nameRoom" 
                                            name="nameRoom" 
                                            value={contractData.nameRoom}
                                            onChange={handleInputChange}
                                        />
                                    </div>

                                    <div className="col-md-6">
                                        <label className="modern-label" htmlFor="nameOfRent">Người thuê</label>
                                        <input 
                                            type="text" 
                                            className="form-control modern-input" 
                                            id="nameOfRent" 
                                            name="nameOfRent" 
                                            value={contractData.nameOfRent}
                                            onChange={handleInputChange}
                                        />
                                    </div>

                                    <div className="col-md-6">
                                        <label className="modern-label" htmlFor="price">Chi Phí (VNĐ)</label>
                                        <input 
                                            type="number" 
                                            className="form-control modern-input text-danger fw-bold" 
                                            id="price" 
                                            name="price" 
                                            value={contractData.price}
                                            onChange={handleInputChange}
                                        />
                                    </div>

                                    <div className="col-12">
                                        <label className="modern-label" htmlFor="description">Mô tả chi tiết</label>
                                        <input 
                                            type="text" 
                                            className="form-control modern-input" 
                                            id="description" 
                                            name="description" 
                                            value={contractData.description}
                                            onChange={handleInputChange}
                                        />
                                    </div>

                                    {/* Nút Submit */}
                                    <div className="col-12 mt-5 pt-3 border-top">
                                        <button 
                                            type="submit" 
                                            onClick={handleExport} 
                                            className="btn bg-emerald text-white btn-modern w-100 fs-5 py-2 shadow-sm"
                                        >
                                            <i className="bi bi-file-earmark-excel-fill me-2"></i> Xuất hóa đơn
                                        </button>
                                    </div>

                                </div>
                            </form>
                        </div>
                    </div>
                </div>

            </div>
        </>
    )
}

function exportToExcel(contractData) {
    // Create an empty workbook
    const workbook = XLSX.utils.book_new();

    const formattedPrice = contractData.price ? formatCurrency(contractData.price) : '';
  
    // Add a worksheet to the workbook
    const worksheet = XLSX.utils.aoa_to_sheet([
        ['Tên Hóa Đơn', 'Mô tả', 'Chi Phí', 'Tên Người Thuê', 'Tên Phòng'],
        [contractData.nameBill, contractData.description, formattedPrice, contractData.nameOfRent, contractData.nameRoom],
    ]);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  
    function formatCurrency(value) {
        return value.toLocaleString('vi-VN', {
            style: 'currency',
            currency: 'VND',
        });
      }
    
    // Generate the Excel file data
    const excelBuffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
  
    // Create a Blob from the Excel file data
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
    // Create a download link and trigger the download
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'hoa_don.xlsx';
    a.click();
  
    // Cleanup
    URL.revokeObjectURL(url);
}

export default ExportBillRequier;