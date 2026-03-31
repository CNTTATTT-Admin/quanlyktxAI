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
    <div className="col-12 col-lg-5 col-xl-3 border-end bg-white">
      
      {/* KHUNG TÌM KIẾM - Nhận hàm click từ Sidebar truyền xuống */}
      <Search onSelectUser={handleSelectUser} />

      {/* DANH SÁCH CHAT - Nhận mảng dữ liệu và hàm click từ Sidebar truyền xuống */}
      <div className="overflow-auto list-group list-group-flush" style={{ height: "550px" }}>
        <Chats chatUsers={chatUsers} onSelectUser={handleSelectUser} />
      </div>

    </div>
  );
};

export default Sidebar;