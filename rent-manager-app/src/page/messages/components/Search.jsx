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
    <>
      <style>{`
        .eco-search-input-wrapper { position: relative; width: 100%; margin-top: 15px; margin-bottom: 10px; }
        
        .eco-search-input { width: 100%; border-radius: 50px; padding: 10px 20px 10px 45px; border: 1px solid #E2E8F0; background-color: #F8FAFC; font-size: 0.95rem; color: #1E293B; transition: all 0.3s; }
        .eco-search-input:focus { outline: none; border-color: #10B981; background-color: #fff; box-shadow: 0 0 0 4px rgba(16,185,129,0.1); }
        .eco-search-input::placeholder { color: #94A3B8; }
        
        .eco-search-icon { position: absolute; top: 50%; left: 18px; transform: translateY(-50%); color: #94A3B8; font-size: 1rem; pointer-events: none; }
        
        .eco-search-dropdown { position: absolute; top: 100%; left: 0; width: 100%; background: #fff; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); border: 1px solid #F1F5F9; max-height: 350px; overflow-y: auto; z-index: 1000; padding: 8px; margin-top: 5px; }
        /* Tùy chỉnh thanh cuộn cho dropdown */
        .eco-search-dropdown::-webkit-scrollbar { width: 6px; }
        .eco-search-dropdown::-webkit-scrollbar-thumb { background-color: #CBD5E1; border-radius: 10px; }
        
        .eco-search-item { border-radius: 12px; transition: all 0.2s ease; margin-bottom: 2px; }
        .eco-search-item:hover { background-color: #F0FDF4; transform: translateX(4px); }
        .eco-search-item:hover .fw-bold { color: #10B981; }
      `}</style>

      <div className="px-4 d-none d-md-block border-bottom position-relative pb-2">
        <div className="d-flex align-items-center">
          <div className="flex-grow-1">
            
            <div className="eco-search-input-wrapper">
              <i className="bi bi-search eco-search-icon"></i>
              <input 
                type="text" 
                className="form-control eco-search-input" 
                placeholder="Tìm theo tên và ấn Enter..."
                onKeyDown={handleKey}
                onChange={handleChange}
                value={username}
              />
            </div>

            {err && <div className="text-danger small ms-3 fw-semibold"><i className="bi bi-exclamation-circle me-1"></i> Không tìm thấy người dùng</div>}

            {userList && userList.length > 0 && (
              <div className="eco-search-dropdown">
                {userList.map((user, index) => (
                  <button 
                    key={index}
                    className="list-group-item list-group-item-action border-0 p-3 text-start eco-search-item" 
                    onClick={() => handleSelect(user)}
                  >
                    <div className="d-flex align-items-center">
                      <img 
                        src={user.imageUrl || "https://via.placeholder.com/50"} 
                        alt={user.name} 
                        className="rounded-circle me-3 border border-2 border-white shadow-sm" 
                        style={{ width: '45px', height: '45px', objectFit: 'cover' }} 
                      />
                      <div className="flex-grow-1">
                        <span className="fw-bold text-dark transition-colors">{user.name}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
};

export default Search;