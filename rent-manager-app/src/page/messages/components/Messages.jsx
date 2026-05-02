import React, { useContext, useEffect, useState } from "react";
import Message from "./Message";
import '../style.css'

const Messages = ({ selectedUser }) => {
  //const { data } = useContext(ChatContext);
  const realMessages = selectedUser ? selectedUser : null;
  console.log("Real messages: " + realMessages)
  
  return (
    <>
      <style>{`
        .eco-messages-wrapper {
          background-color: #F8FAFC;
          scroll-behavior: smooth;
        }

        .eco-messages-wrapper::-webkit-scrollbar {
          width: 6px;
        }
        .eco-messages-wrapper::-webkit-scrollbar-track {
          background: transparent;
        }
        .eco-messages-wrapper::-webkit-scrollbar-thumb {
          background-color: #CBD5E1;
          border-radius: 10px;
        }
        .eco-messages-wrapper::-webkit-scrollbar-thumb:hover {
          background-color: #94A3B8;
        }
      `}</style>

      <div className="overflow-auto messages eco-messages-wrapper" style={{height : "450px"}}>
        <Message message={realMessages} />
      </div>
    </>
  );
};

export default Messages;