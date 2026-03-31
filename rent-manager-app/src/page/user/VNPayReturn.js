import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { updateInvoiceStatus } from "../../services/fetch/ApiUtils";
import { toast } from "react-toastify";

const VNPayReturn = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [status, setStatus] = useState("Đang xử lý kết quả thanh toán từ VNPAY...");

    useEffect(() => {
        //Lấy các tham số VNPAY trả về trên URL
        const searchParams = new URLSearchParams(location.search);
        const responseCode = searchParams.get("vnp_ResponseCode");
        const txnRef = searchParams.get("vnp_TxnRef");

        if (responseCode === "00" && txnRef) {
            //00 là mã thành công
            const invoiceId = txnRef.split("_")[0];//lấy invoiceID
            
            updateInvoiceStatus(invoiceId, "PAID", "VNPAY")
                .then(() => {
                    setStatus("Thanh toán thành công! Đang đưa bạn về trang lịch sử...");
                    toast.success("Thanh toán phí gửi xe thành công!");
                    setTimeout(() => {
                        navigate("/parking-card-history");
                    }, 2500);
                })
                .catch((err) => {
                    setStatus("Lỗi đồng bộ dữ liệu với hệ thống.");
                    toast.error("Thanh toán thành công trên VNPAY nhưng có lỗi cập nhật hệ thống!");
                });
        } else {
            //Hủy/Lỗi
            setStatus("Thanh toán thất bại.");
            toast.error("Giao dịch không thành công!");
            setTimeout(() => {
                 navigate("/parking-card-history"); 
            }, 2500);
        }
    }, [location, navigate]);

    return (
        <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh", backgroundColor: "#f8f9fa" }}>
            <div className="card shadow-lg p-5 text-center border-0" style={{ borderRadius: "15px" }}>
                <h2 className="mb-4">Kết Quả Giao Dịch VNPAY</h2>
                <h5 className={status.includes("thành công") ? "text-success" : "text-danger"}>
                    {status}
                </h5>
                <div className="spinner-border text-primary mt-4" role="status" style={{ width: "3rem", height: "3rem" }}>
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        </div>
    );
};

export default VNPayReturn;