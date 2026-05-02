import React from "react";
import '../style.css';

const Chats = ({ chatUsers, onSelectUser }) => {
  
  // Nếu mảng rỗng thì hiển thị thông báo
  if (!chatUsers || chatUsers.length === 0) {
    return (
      <div className="text-center text-muted p-4 mt-5">
        <i className="bi bi-chat-square-dots fs-1 d-block mb-3 opacity-50" style={{color: "#10B981"}}></i>
        <span className="fw-medium">Chưa có cuộc trò chuyện nào.</span>
      </div>
    );
  }

  // Nếu có dữ liệu thì render ra danh sách
  return (
    <>
      <style>{`
        .eco-chats-wrapper { padding: 10px 15px; }
        
        .eco-chat-btn { width: 100%; display: block; border: none; background: transparent; padding: 12px 15px; border-radius: 16px; transition: all 0.2s ease; text-align: left; margin-bottom: 5px; }
        .eco-chat-btn:hover { background-color: #F8FAFC; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
        .eco-chat-btn:active { transform: translateY(0); }
        
        .eco-chat-avatar { width: 50px; height: 50px; border-radius: 50%; object-fit: cover; border: 2px solid #10B981; padding: 2px; background-color: #fff; box-shadow: 0 2px 8px rgba(16,185,129,0.15); }
        
        .eco-chat-name { font-weight: 700; color: #1E293B; font-size: 0.95rem; margin-bottom: 2px; }
        
        .eco-chat-msg { color: #64748B; font-size: 0.85rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px; }
      `}</style>

      <div className="eco-chats-wrapper">
        {chatUsers.map((userDTO, index) => (
          <button 
            key={index}
            className="eco-chat-btn"
            onClick={() => onSelectUser(userDTO.id)} 
          >
            <div className="d-flex align-items-center">
              <div className="position-relative">
                <img 
                  src={userDTO.imageUrl || "https://via.placeholder.com/50"} 
                  className="eco-chat-avatar me-3" 
                  alt={userDTO.userName || "Người dùng"} 
                />
              </div>
              <div className="flex-grow-1 min-w-0">
                <h6 className="eco-chat-name text-truncate">{userDTO.userName || "Người dùng ẩn danh"}</h6>
                <div className="eco-chat-msg">
                  {/* Lấy tin nhắn cuối cùng từ DTO do Backend trả về */}
                  {userDTO.message ? userDTO.message : <span className="fst-italic opacity-50">Chưa có tin nhắn</span>}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </>
  );
};

export default Chats;