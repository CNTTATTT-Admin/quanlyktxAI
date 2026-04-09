import React, { useState, useEffect } from "react";
import { useUserContext } from "../context/UserContext";
import { getUserOfChat } from "../../../services/fetch/ApiUtils"; 
import { API_BASE_URL, ACCESS_TOKEN } from "../../../constants/Connect";
import Search from "./Search";
import Chats from "./Chats";
import '../style.css';

const Sidebar = (props) => {

  const [chatUsers, setChatUsers] = useState([]);
  const { selectedUser, setSelectedUser } = useUserContext();

  // 1. Tải danh sách chat khi load trang hoặc khi có phòng chat mới được tạo
  useEffect(() => {
    fetchChatUsers();
  }, [selectedUser?.id]);

  const fetchChatUsers = () => {
    getUserOfChat()
      .then(response => {
        setChatUsers(response || []);
      })
      .catch(error => console.error("Lỗi tải danh sách Sidebar:", error));
  };

  // 2. Hàm dùng chung cho cả Search và Chats khi click vào 1 người
  const handleSelectUser = async (partnerId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/message-chat/${partnerId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedUser(data); 
      } else {
        console.error("Lỗi khi tải tin nhắn chi tiết");
      }
    } catch (error) {
      console.error("Lỗi khi gọi API tin nhắn:", error);
    }
  };

  return (
    <>
      <style>{`
        .eco-sidebar-container {
          background-color: #ffffff;
          border-right: 1px solid #E2E8F0;
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .eco-sidebar-header {
          padding: 20px 20px 5px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .eco-sidebar-actions .btn-icon {
          background-color: #F8FAFC;
          color: #1E293B;
          border: none;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          cursor: pointer;
        }

        .eco-sidebar-actions .btn-icon:hover {
          background-color: #E2E8F0;
          color: #10B981;
        }

        .eco-chat-list-container {
          overflow-y: auto;
          overflow-x: hidden;
          flex-grow: 1;
        }

        /* Custom scrollbar cho danh sách */
        .eco-chat-list-container::-webkit-scrollbar {
          width: 5px;
        }
        .eco-chat-list-container::-webkit-scrollbar-track {
          background: transparent;
        }
        .eco-chat-list-container::-webkit-scrollbar-thumb {
          background-color: #CBD5E1;
          border-radius: 10px;
        }
        .eco-chat-list-container::-webkit-scrollbar-thumb:hover {
          background-color: #94A3B8;
        }
      `}</style>

      <div className="col-12 col-lg-5 col-xl-3 eco-sidebar-container p-0">

        {/* KHUNG TÌM KIẾM */}
        <Search onSelectUser={handleSelectUser} />

        {/* DANH SÁCH CHAT */}
        <div className="eco-chat-list-container" style={{ height: "550px" }}>
          <Chats chatUsers={chatUsers} onSelectUser={handleSelectUser} />
        </div>

      </div>
    </>
  );
};

export default Sidebar;