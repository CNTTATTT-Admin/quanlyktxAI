import React from "react";
import '../style.css';

const Chats = ({ chatUsers, onSelectUser }) => {
  // Nếu mảng rỗng thì hiển thị thông báo
  if (!chatUsers || chatUsers.length === 0) {
    return (
      <div className="text-center text-muted p-4 mt-5">
        <i className="bi bi-inbox fs-1 text-secondary mb-2"></i>
        <br/>
        Chưa có cuộc trò chuyện nào.
      </div>
    );
  }

  // Nếu có dữ liệu thì render ra danh sách
  return (
    <>
      {chatUsers.map((userDTO, index) => (
        <button 
          key={index}
          className="list-group-item list-group-item-action border-0 p-3 text-start"
          onClick={() => onSelectUser(userDTO.id)} 
        >
          <div className="d-flex align-items-start">
            <img 
              src={userDTO.imageUrl || "https://via.placeholder.com/50"} 
              className="rounded-circle me-3 border border-1 border-success shadow-sm" 
              alt={userDTO.userName || "Người dùng"} 
              width="45" 
              height="45" 
              style={{ objectFit: "cover" }}
            />
            <div className="flex-grow-1 ms-1">
              <h6 className="mb-1 fw-bold text-dark">{userDTO.userName || "Người dùng ẩn danh"}</h6>
              <div className="small text-muted text-truncate" style={{ maxWidth: "150px" }}>
                {/* Lấy tin nhắn cuối cùng từ DTO do Backend trả về */}
                <span className="text-secondary">{userDTO.message}</span>
              </div>
            </div>
          </div>
        </button>
      ))}
    </>
  );
};

export default Chats;