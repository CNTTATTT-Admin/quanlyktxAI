import React, { useState, useEffect } from "react";
import { API_BASE_URL, ACCESS_TOKEN } from "../../../constants/Connect";
import '../style.css';

const Search = ({ onSelectUser }) => {
  const [username, setUsername] = useState("");
  const [userList, setUserList] = useState([]);
  const [err, setErr] = useState(false);

  useEffect(() => {
    let timer;
    if (err) {
      timer = setTimeout(() => {
        setErr(false);
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [err]);

  const handleSearch = async () => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    try {
      const response = await fetch(`${API_BASE_URL}/user/message/${username}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data != null && data.length > 0) {
          setUserList(data);
          setErr(false);
        } else {
          setUserList([]);
          setErr(true);
        }
      } else {
        setUserList([]);
        setErr(true);
      }
    } catch (error) {
      console.error("Lỗi gọi API tìm kiếm:", error);
      setErr(true);
    }
  };

  const handleKey = (e) => {
    if (e.code === "Enter") {
      handleSearch();
    }
  };

  const handleChange = (e) => {
    setUsername(e.target.value);
    if (err) setErr(false); 
  };

  const handleSelect = (user) => {
    onSelectUser(user.id); 
    setUserList([]);
    setUsername("");
  };

  return (
    <div className="px-4 d-none d-md-block border-bottom position-relative">
      <div className="d-flex align-items-center">
        <div className="flex-grow-1 pb-2">
          <input 
            type="text" 
            className="form-control mt-3 mb-1 rounded-pill" 
            placeholder="Tìm theo tên và ấn Enter..."
            onKeyDown={handleKey}
            onChange={handleChange}
            value={username}
          />

          {err && <div className="text-danger small ms-2 fw-semibold">Không tìm thấy người dùng</div>}

          {userList && userList.length > 0 && (
            <div 
              className="position-absolute w-100 bg-white shadow-lg rounded-3 border" 
              style={{ top: "100%", left: 0, maxHeight: "300px", overflowY: "auto", zIndex: 1000 }}
            >
              {userList.map((user, index) => (
                <button 
                  key={index}
                  className="list-group-item list-group-item-action border-0 p-3 text-start" 
                  onClick={() => handleSelect(user)}
                >
                  <div className="d-flex align-items-start">
                    <img 
                      src={user.imageUrl || "https://via.placeholder.com/50"} 
                      alt={user.name} 
                      className="rounded-circle me-3 border" 
                      style={{ width: '45px', height: '45px', objectFit: 'cover' }} 
                    />
                    <div className="flex-grow-1 mt-2">
                      <span className="fw-bold">{user.name}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Search;