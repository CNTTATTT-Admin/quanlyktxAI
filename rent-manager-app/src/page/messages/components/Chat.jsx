import React, { useEffect } from "react";
import Messages from "./Messages";
import Input from "./Input";
import { useUserContext } from "../context/UserContext";
import { useLocation } from "react-router-dom";
// BƯỚC 1: Import thêm API_BASE_URL và ACCESS_TOKEN để gọi API
import { API_BASE_URL, ACCESS_TOKEN } from "../../../constants/Connect"; 
import '../style.css';

const Chat = (props) => {
  // ==========================================
  // 🧠 LOGIC & API GIỮ NGUYÊN BẢN 100%
  // ==========================================
  const { selectedUser, setSelectedUser } = useUserContext();
  const location = useLocation();

  // BƯỚC 2: SỬA LẠI ĐOẠN NÀY - Gọi API thay vì tạo dữ liệu giả
  useEffect(() => {
    if (location.state && location.state.targetRentaler && props.currentUser) {
       const partnerId = location.state.targetRentaler.id;

       // Khai báo hàm gọi API lấy lịch sử / tạo phòng chat
       const fetchRealChatHistory = async () => {
         try {
           const response = await fetch(`${API_BASE_URL}/user/message-chat/${partnerId}`, {
             method: "GET",
             headers: {
               Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`,
             },
           });

           if (response.ok) {
             const data = await response.json();
             // Ném toàn bộ dữ liệu THẬT (có cả lịch sử) vào Context
             setSelectedUser(data); 
           }
         } catch (error) {
           console.error("Lỗi khi gọi API chat lúc chuyển trang:", error);
         }
       };

       // Thực thi hàm
       fetchRealChatHistory();

       // Xóa bưu kiện khỏi URL để tránh bị gọi lại API khi người dùng F5
       window.history.replaceState({}, document.title);
    }
  }, [location.state, props.currentUser, setSelectedUser]);

  // xử lý header chat (GIỮ NGUYÊN)
  let chatPartnerName = "Đang tải...";
  let chatPartnerImage = "https://via.placeholder.com/50";
  if (selectedUser && props.currentUser) {
     // nếu là sender - đối là receive
     if (selectedUser.sender && selectedUser.sender.id === props.currentUser.id) {
         chatPartnerName = selectedUser.receiver?.name || "Người dùng";
         chatPartnerImage = selectedUser.receiver?.imageUrl || chatPartnerImage;
     } 
     // đối là receive - mình sender
     else if (selectedUser.receiver && selectedUser.receiver.id === props.currentUser.id) {
         chatPartnerName = selectedUser.sender?.name || "Người dùng";
         chatPartnerImage = selectedUser.sender?.imageUrl || chatPartnerImage;
     }
  }

  // ==========================================
  // 🎨 GIAO DIỆN MỚI (MESSENGER x ECOHOME)
  // ==========================================
  return (
    <>
      <style>{`
        .eco-chat-main-wrapper {
          background-color: #ffffff;
          border-radius: 16px;
          border: 1px solid #E2E8F0;
          box-shadow: 0 4px 20px rgba(0,0,0,0.02);
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .eco-chat-header {
          padding: 16px 24px;
          background-color: #ffffff;
          border-bottom: 1px solid #E2E8F0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          z-index: 10;
        }

        .eco-header-avatar {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid #10B981;
          padding: 2px;
          background-color: #fff;
        }

        .eco-header-status-dot {
          position: absolute;
          bottom: 2px;
          right: 0px;
          width: 14px;
          height: 14px;
          background-color: #10B981;
          border: 2px solid #ffffff;
          border-radius: 50%;
        }

        .eco-header-name {
          font-size: 1.1rem;
          font-weight: 700;
          color: #1E293B;
          margin-bottom: 2px;
        }

        .eco-header-status-text {
          font-size: 0.85rem;
          color: #10B981;
          font-weight: 600;
          display: flex;
          align-items: center;
        }

        .eco-pulse-dot {
          width: 8px;
          height: 8px;
          background-color: #10B981;
          border-radius: 50%;
          margin-right: 6px;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
          70% { box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
          100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }

        .eco-header-actions .btn {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: #64748B;
          background-color: transparent;
          transition: all 0.2s ease;
          margin-left: 8px;
          border: none;
        }

        .eco-header-actions .btn:hover {
          color: #10B981;
          background-color: #F0FDF4;
        }
      `}</style>

      <div className="position-relative eco-chat-main-wrapper h-100">
        
        {/* HEADER THÔNG TIN */}
        {selectedUser ? (
          <div className="eco-chat-header d-none d-lg-flex">
            <div className="d-flex align-items-center">
              <div className="position-relative me-3">
                <img
                  src={chatPartnerImage}
                  className="eco-header-avatar shadow-sm"
                  alt={chatPartnerName}
                />
                <span className="eco-header-status-dot"></span>
              </div>
              <div className="flex-grow-1">
                <h5 className="eco-header-name">{chatPartnerName}</h5>
                <div className="eco-header-status-text">
                  <div className="eco-pulse-dot"></div>
                  Đang hoạt động
                </div>
              </div>
            </div>

            {/* Các icon chức năng trang trí phong cách Messenger */}
            <div className="eco-header-actions d-flex align-items-center">
              <button className="btn" title="Cuộc gọi thoại"><i className="bi bi-telephone-fill fs-5"></i></button>
              <button className="btn" title="Cuộc gọi video"><i className="bi bi-camera-video-fill fs-5"></i></button>
              <button className="btn" title="Thông tin cuộc trò chuyện"><i className="bi bi-info-circle-fill fs-5"></i></button>
            </div>
          </div>
        ) : (
          <div className="eco-chat-header d-none d-lg-flex" style={{minHeight: "83px", justifyContent: "center"}}>
              <span className="text-muted fw-medium"><i className="bi bi-chat-dots me-2"></i>Chọn một người dùng để bắt đầu trò chuyện</span>
          </div>
        )}

        <div className="chat-messages-container flex-grow-1">
          <Messages selectedUser={selectedUser} />
        </div>
        
        <div className="chat-input-container">
          <Input selectedUser={selectedUser} />
        </div>
        
      </div>
    </>
  );
};

export default Chat;