import React, { useState, useEffect } from "react";
import jwtDecode from "jwt-decode";
import { useUserContext } from "../context/UserContext";
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import '../style.css'

const Input = () => {
  const [text, setText] = useState("");
  const [img, setImg] = useState(null);

  const accessToken = localStorage.getItem("accessToken");
  const decodedToken = jwtDecode(accessToken);
  const userId = decodedToken.sub;
  const { selectedUser, setSelectedUser } = useUserContext();

  const [messages, setMessages] = useState([]);
  const [stompClient, setStompClient] = useState(null);
  const [currentId, setCurrentId] = useState(null);

  useEffect(() => {
    if (selectedUser) {
      console.log("Old currentId: ")
      console.log(currentId)
      console.log("vô được nè");
      console.log("SelectedUser:");
      console.log(selectedUser);
      if (userId == selectedUser.sender.id) setCurrentId(selectedUser.receiver.id)
      else setCurrentId(selectedUser.sender.id);
      console.log(currentId);
    }
  }, [selectedUser]);

  useEffect(() => {
    console.log("New currentId after setCurrentId: ");
    console.log(currentId);

    // Thực hiện các hành động khác liên quan đến currentId ở đây
  }, [currentId]);

  useEffect(() => {
    // Tạo kết nối WebSocket tới server
    const socket = new SockJS("http://localhost:8080/ws");
    const stompClient = Stomp.over(socket);

    // Kết nối tới WebSocket server
    stompClient.connect({}, () => {
      console.log("Connected to WebSocket");
      setStompClient(stompClient);

      // Đăng ký để lắng nghe sự kiện từ địa chỉ đích tương ứng
      const destination = `/topic/messages`; // Thay userId bằng giá trị tương ứng
      stompClient.subscribe(destination, (message) => {
        // Xử lý message (nếu cần)
        if (selectedUser) {
          const selectedUserId = selectedUser.sender.id;
          const newId = userId == selectedUserId ? selectedUser.receiver.id : selectedUserId;
          setCurrentId(newId);
        }
        console.log("Received message:", message.body);
        console.log("UserId: " + userId)
        console.log("CurrentId: " + currentId)

        const messageParts = message.body.split(" ");
        if (messageParts.length === 2) {
          const firstNumber = parseInt(messageParts[0]);
          const secondNumber = parseInt(messageParts[1]);

          if (firstNumber == userId && secondNumber == currentId) {
            fetchMessageData(secondNumber);
          }
          else if (firstNumber == currentId && secondNumber == userId) {
            fetchMessageData(firstNumber);
          }
        }
      });
    });

    // Đóng kết nối khi component bị hủy
    return () => {
      stompClient.disconnect();
    };
  }, [userId, currentId]); // Đảm bảo thay đổi userId thì useEffect sẽ chạy lại


  const fetchMessageData = async (sendId) => {
    try {
      const response = await fetch(`http://localhost:8080/user/message-chat/${sendId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedUser(data);
      } else {
        console.error("Error fetching message data");
      }
    } catch (error) {
      console.error("Error fetching message data:", error);
    }
  };

  const handleSend = async () => {
    const sendMessageData = {
      id: 1,
      content: text,
      sentAt: new Date(),
      read: false,
      sendBy: false,
    };

    const destination = `/app/user/message-chat/${userId}/${currentId}`;
    // Gửi tin nhắn tới địa chỉ đích
    stompClient.send(destination, {}, JSON.stringify(sendMessageData));
    setText("")
    //fetchMessageData();
  };


  return (
    <>
     
        <div className="flex-grow-0 py-3 px-4 border-top">
          <div className="input-group">
            <input type="text" className="form-control" placeholder="Nhập tin nhắn của bạn"
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSend();
                }
              }}
              value={text}
              style={{width : "300px"}}
            />
            <button className="btn btn-primary"  onClick={handleSend}>Send</button>
          </div>
        </div>
     

    </>
  );

}


export default Input;
