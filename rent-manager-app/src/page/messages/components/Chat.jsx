import React, { useEffect } from "react";
import Messages from "./Messages";
import Input from "./Input";
import { useUserContext } from "../context/UserContext";
import { useLocation } from "react-router-dom";
// BƯỚC 1: Import thêm API_BASE_URL và ACCESS_TOKEN để gọi API
import { API_BASE_URL, ACCESS_TOKEN } from "../../../constants/Connect"; 
import '../style.css';

const Chat = (props) => {
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

  return (
    <div className="position-relative">
      
      {/* HEADER THÔNG TIN */}
      {selectedUser && (
        <div className="py-2 px-4 border-bottom d-none d-lg-block bg-white shadow-sm">
          <div className="d-flex align-items-center py-1">
            <div className="position-relative">
              <img
                src={chatPartnerImage}
                className="rounded-circle border border-2 border-success"
                alt={chatPartnerName}
                width="45"
                height="45"
                style={{ objectFit: "cover", marginRight: "15px" }}
              />
              <span className="position-absolute bottom-0 end-0 bg-success border border-white rounded-circle" style={{ width: "12px", height: "12px", right: "12px", marginBottom: "2px" }}></span>
            </div>
            <div className="flex-grow-1">
              <h5 className="mb-0 fw-bold text-dark">{chatPartnerName}</h5>
              <div className="text-success small fw-semibold">
                Đang hoạt động
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="chat-messages p-4 bg-light">
        <Messages selectedUser={selectedUser} />
      </div>
      <Input selectedUser={selectedUser} />
      
    </div>
  );
};

export default Chat;