import React, { useEffect, useRef } from "react";
import jwtDecode from "jwt-decode";
import "../style.css";

const Message = ({ message, scrollToLast }) => {
  const ref = useRef();

  const accessToken = localStorage.getItem("accessToken");
  const decodedToken = jwtDecode(accessToken);
  const userId = decodedToken.sub;

  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [message]);

  return (
    <>
      <style>{`
        .eco-chat-container {
          display: flex;
          flex-direction: column;
          overflow-y: auto;
        }

        .eco-message-row {
          display: flex;
          width: 100%;
          margin-bottom: 12px;
        }

        .eco-message-row.sent {
          justify-content: flex-end;
        }

        .eco-message-row.received {
          justify-content: flex-start;
        }

        .eco-bubble {
          max-width: 75%;
          padding: 10px 16px;
          font-size: 0.95rem;
          line-height: 1.4;
          word-wrap: break-word;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }

        /* Kiểu dáng tin nhắn Gửi đi (Bên phải - EcoHome Emerald) */
        .eco-bubble.sent {
          background: linear-gradient(135deg, #10B981 0%, #059669 100%);
          color: white;
          /* Bo tròn 3 góc, vuốt nhọn góc dưới phải */
          border-radius: 20px 20px 4px 20px; 
        }

        /* Kiểu dáng tin nhắn Nhận được (Bên trái - Xám nhạt hiện đại) */
        .eco-bubble.received {
          background-color: #F1F5F9;
          color: #1E293B;
          border: 1px solid #E2E8F0;
          /* Bo tròn 3 góc, vuốt nhọn góc dưới trái */
          border-radius: 20px 20px 20px 4px;
        }
      `}</style>

      <div>
        <div className="chat-messages eco-chat-container p-3 p-md-4">
          {message &&
            message.content &&
            message.content.map((contentItem) => {
              // Logic kiểm tra người gửi giữ nguyên bản 100%
              const isSentByCurrentUser = userId == message.sender.id ? (contentItem.sendBy ? false : true) : (contentItem.sendBy ? true : false);
              
              return (
                <div
                  key={contentItem.id}
                  className={`eco-message-row ${isSentByCurrentUser ? "sent" : "received"}`}
                >
                  <div className={`eco-bubble ${isSentByCurrentUser ? "sent" : "received"}`}>
                    {contentItem.content}
                  </div>
                </div>
              );
            })}
          {/* Mỏ neo để tự động cuộn xuống tin nhắn cuối */}
          <div ref={ref} />
        </div>
      </div>
    </>
  );
};

export default Message;