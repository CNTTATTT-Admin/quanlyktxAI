import React, { useState, useEffect } from "react";
import jwtDecode from "jwt-decode";
import { useUserContext } from "../context/UserContext";
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import '../style.css'
import { toast } from "react-toastify";

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

  //test
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
  }, [currentId]);

  useEffect(() => {
    //kết nối websocket
    const socket = new SockJS("http://localhost:8080/ws");
    const stompClient = Stomp.over(socket);

    stompClient.connect({}, () => {
      console.log("Connected to WebSocket");
      setStompClient(stompClient);

      //chọn địa chỉ nghe event
      const destination = `/topic/messages`;
      stompClient.subscribe(destination, (message) => {
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

    //tránh bị đóng kết nối trước khi kịp mount lại
    return () => {
      if (stompClient && stompClient.connected) {
        stompClient.disconnect(() => {
           console.log("Disconnected WebSocket");
        });
      }
    };
  }, [userId, currentId]);


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
    if (!currentId) {
        toast.error("Chưa chọn người nhận tin nhắn!");
        return; 
    }

    const sendMessageData = {
      id: 1,
      content: text,
      sentAt: new Date(),
      read: false,
      sendBy: false,
    };

    const destination = `/app/user/message-chat/${userId}/${currentId}`;
    //gửi msg tới đích
    stompClient.send(destination, {}, JSON.stringify(sendMessageData));
    setText("")
    fetchMessageData(currentId);
  };

  return (
    <>
      <style>{`
        .eco-chat-input-wrapper {
          background-color: #ffffff;
          border-top: 1px solid #E2E8F0;
          padding: 15px 20px;
        }

        .eco-input-group {
          display: flex;
          align-items: center;
          background-color: #F1F5F9;
          border-radius: 50px;
          padding: 6px 12px 6px 20px;
          border: 1px solid transparent;
          transition: all 0.3s ease;
        }

        .eco-input-group:focus-within {
          border-color: #10B981;
          box-shadow: 0 0 0 3px rgba(16,185,129,0.1);
          background-color: #fff;
        }

        .eco-chat-input {
          flex-grow: 1;
          border: none;
          background: transparent;
          padding: 8px 0;
          font-size: 0.95rem;
          color: #1E293B;
          outline: none;
          width: 100%;
        }

        .eco-chat-input::placeholder {
          color: #94A3B8;
        }

        .eco-send-btn {
          background: linear-gradient(135deg, #10B981 0%, #059669 100%);
          color: white;
          border: none;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          flex-shrink: 0;
          margin-left: 10px;
          box-shadow: 0 2px 6px rgba(16,185,129,0.2);
        }

        .eco-send-btn:hover {
          transform: scale(1.05) translateY(-2px);
          box-shadow: 0 4px 10px rgba(16,185,129,0.3);
        }

        .eco-send-btn:active {
          transform: scale(0.95) translateY(0);
        }
        
        /* Hiệu ứng khi chưa nhập text thì làm mờ nút send */
        .eco-send-btn.disabled {
          opacity: 0.5;
          pointer-events: none;
          background: #CBD5E1;
          box-shadow: none;
        }
      `}</style>

      <div className="eco-chat-input-wrapper">
        <div className="eco-input-group">
          {/* Icon đính kèm (có thể dùng sau nếu bạn thêm chức năng gửi ảnh) */}
          <i className="bi bi-plus-circle-fill text-muted me-3 fs-5" style={{cursor: "pointer", transition: "color 0.2s"}} onMouseOver={(e) => e.target.classList.add('text-emerald')} onMouseOut={(e) => e.target.classList.remove('text-emerald')}></i>
          
          <input 
            type="text" 
            className="eco-chat-input" 
            placeholder="Nhập tin nhắn của bạn..."
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && text.trim() !== "") {
                handleSend();
              }
            }}
            value={text}
          />
          
          <button 
            className={`eco-send-btn ${text.trim() === "" ? "disabled" : ""}`}  
            onClick={handleSend}
            title="Gửi tin nhắn"
          >
            <i className="bi bi-send-fill ms-1"></i>
          </button>
        </div>
      </div>
    </>
  );
}

export default Input;