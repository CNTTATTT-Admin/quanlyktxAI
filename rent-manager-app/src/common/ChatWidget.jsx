import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { API_BASE_URL, ACCESS_TOKEN } from '../constants/Connect';

const CHAT_SUGGESTIONS = [
  '📋 Xem nội quy ký túc xá',
  '🏠 Phòng nào đang có giá rẻ nhất?',
  '🔧 Báo hỏng thiết bị trong phòng',
];

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      content: 'Xin chào! 👋 Mình là Trợ lý ảo của Ký túc xá. Mình có thể giúp bạn:\n\n- 📋 Xem **nội quy** ký túc xá\n- 🏠 Tìm **phòng trống** giá tốt\n- 🔧 Tạo **phiếu báo hỏng** thiết bị\n\nBạn cần hỗ trợ gì không?',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const sendMessage = async (text) => {
    const userText = (text || inputValue).trim();
    if (!userText || isLoading) return;

    setInputValue('');
    setMessages((prev) => [...prev, { role: 'user', content: userText }]);
    setIsLoading(true);

    try {
      const token = localStorage.getItem(ACCESS_TOKEN);
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(
        `${API_BASE_URL}/api/ai/chat?message=${encodeURIComponent(userText)}`,
        { method: 'GET', headers }
      );

      const result = await response.text();
      setMessages((prev) => [
        ...prev,
        { role: 'ai', content: result || 'Xin lỗi, mình không có phản hồi.' },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          content: '⚠️ Mình đang gặp sự cố kết nối. Bạn vui lòng thử lại sau nhé!',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        style={styles.fab}
        title="Trợ lý AI ký túc xá"
        aria-label="Mở chatbot AI"
      >
        {isOpen ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
          </svg>
        )}
        {/* Pulse indicator */}
        {!isOpen && (
          <span style={styles.pulse} />
        )}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div style={styles.panel}>
          {/* Header */}
          <div style={styles.header}>
            <div style={styles.headerLeft}>
              <div style={styles.avatar}>🤖</div>
              <div>
                <div style={styles.headerTitle}>Trợ lý KTX</div>
                <div style={styles.headerSub}>
                  <span style={styles.onlineDot} />
                  Đang hoạt động
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} style={styles.closeBtn}>✕</button>
          </div>

          {/* Messages */}
          <div style={styles.messageList}>
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  ...styles.messageRow,
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                {msg.role === 'ai' && (
                  <div style={styles.aiAvatar}>🤖</div>
                )}
                <div
                  style={{
                    ...styles.bubble,
                    ...(msg.role === 'user' ? styles.userBubble : styles.aiBubble),
                  }}
                >
                  {msg.role === 'ai' ? (
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => (
                          <p style={{ margin: '4px 0', lineHeight: '1.5', color: "#343434ff" }}>{children}</p>
                        ),
                        ul: ({ children }) => (
                          <ul style={{ margin: '4px 0', paddingLeft: '18px' }}>{children}</ul>
                        ),
                        li: ({ children }) => (
                          <li style={{ marginBottom: '2px' }}>{children}</li>
                        ),
                        strong: ({ children }) => (
                          <strong style={{ color: '#4f46e5' }}>{children}</strong>
                        ),
                        code: ({ children }) => (
                          <code style={{ background: '#f0f0f0', padding: '1px 4px', borderRadius: '3px', fontSize: '12px' }}>
                            {children}
                          </code>
                        ),
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  ) : (
                    <span style={{ lineHeight: '1.5' }}>{msg.content}</span>
                  )}
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div style={{ ...styles.messageRow, justifyContent: 'flex-start' }}>
                <div style={styles.aiAvatar}>🤖</div>
                <div style={{ ...styles.bubble, ...styles.aiBubble, ...styles.typingBubble }}>
                  <span style={styles.dot} />
                  <span style={{ ...styles.dot, animationDelay: '0.2s' }} />
                  <span style={{ ...styles.dot, animationDelay: '0.4s' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions */}
          {messages.length <= 1 && (
            <div style={styles.suggestions}>
              {CHAT_SUGGESTIONS.map((s, i) => (
                <button key={i} style={styles.suggestionChip} onClick={() => sendMessage(s)}>
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={styles.inputArea}>
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nhập câu hỏi... (Enter để gửi)"
              rows={1}
              style={styles.textarea}
              disabled={isLoading}
            />
            <button
              onClick={() => sendMessage()}
              disabled={isLoading || !inputValue.trim()}
              style={{
                ...styles.sendBtn,
                opacity: isLoading || !inputValue.trim() ? 0.5 : 1,
                cursor: isLoading || !inputValue.trim() ? 'not-allowed' : 'pointer',
              }}
              aria-label="Gửi tin nhắn"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </div>

          <div style={styles.footer}>
            ✨ Powered by Groq AI
          </div>
        </div>
      )}

      {/* Keyframe animations */}
      <style>{`
        @keyframes chatPulse {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(2.5); opacity: 0; }
        }
        @keyframes chatBounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
        @keyframes chatSlideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </>
  );
};

const styles = {
  fab: {
    position: 'fixed',
    bottom: '28px',
    right: '28px',
    width: '58px',
    height: '58px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 6px 20px rgba(102, 126, 234, 0.5)',
    zIndex: 9999,
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  },
  pulse: {
    position: 'absolute',
    top: '4px',
    right: '4px',
    width: '12px',
    height: '12px',
    background: '#22c55e',
    borderRadius: '50%',
    border: '2px solid white',
    animation: 'chatPulse 2s ease-out infinite',
  },
  panel: {
    position: 'fixed',
    bottom: '100px',
    right: '28px',
    width: '370px',
    maxHeight: '550px',
    background: '#fff',
    borderRadius: '20px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15), 0 4px 20px rgba(102, 126, 234, 0.2)',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 9998,
    overflow: 'hidden',
    animation: 'chatSlideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
  header: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '14px 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  avatar: {
    width: '38px',
    height: '38px',
    background: 'rgba(255,255,255,0.2)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    backdropFilter: 'blur(4px)',
  },
  headerTitle: {
    color: '#fff',
    fontWeight: '700',
    fontSize: '15px',
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
  },
  headerSub: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: '11px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    marginTop: '1px',
  },
  onlineDot: {
    width: '7px',
    height: '7px',
    background: '#4ade80',
    borderRadius: '50%',
    display: 'inline-block',
  },
  closeBtn: {
    background: 'rgba(255,255,255,0.2)',
    border: 'none',
    color: '#fff',
    cursor: 'pointer',
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    fontWeight: 'bold',
  },
  messageList: {
    flex: 1,
    overflowY: 'auto',
    padding: '14px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    scrollbarWidth: 'thin',
    scrollbarColor: '#ddd transparent',
  },
  messageRow: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '6px',
  },
  aiAvatar: {
    width: '28px',
    height: '28px',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    flexShrink: 0,
  },
  bubble: {
    maxWidth: '82%',
    padding: '10px 14px',
    borderRadius: '18px',
    fontSize: '13.5px',
    lineHeight: '1.5',
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    wordBreak: 'break-word',
  },
  aiBubble: {
    background: '#f4f4f8',
    color: '#000',
    borderBottomLeftRadius: '4px',
  },
  userBubble: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff',
    borderBottomRightRadius: '4px',
    textAlign: 'right',
  },
  typingBubble: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    padding: '12px 16px',
    minWidth: '60px',
  },
  dot: {
    width: '8px',
    height: '8px',
    background: '#9ca3af',
    borderRadius: '50%',
    display: 'inline-block',
    animation: 'chatBounce 1.4s infinite ease-in-out',
  },
  suggestions: {
    padding: '0 12px 10px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  suggestionChip: {
    background: 'linear-gradient(135deg, #f0f0ff, #f8f0ff)',
    border: '1px solid #e0d9ff',
    borderRadius: '20px',
    padding: '7px 14px',
    fontSize: '12px',
    cursor: 'pointer',
    color: '#5b21b6',
    textAlign: 'left',
    transition: 'all 0.2s ease',
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
  },
  inputArea: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '8px',
    padding: '10px 12px',
    borderTop: '1px solid #f0f0f5',
    background: '#fafafa',
  },
  textarea: {
    flex: 1,
    border: '1.5px solid #e0e0ef',
    borderRadius: '14px',
    padding: '9px 14px',
    resize: 'none',
    fontSize: '13.5px',
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    outline: 'none',
    background: '#fff',
    color: '#1a1a2e',
    lineHeight: '1.5',
    maxHeight: '80px',
    overflowY: 'auto',
  },
  sendBtn: {
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: 'opacity 0.2s ease',
    boxShadow: '0 3px 10px rgba(102,126,234,0.35)',
  },
  footer: {
    textAlign: 'center',
    fontSize: '10px',
    color: '#b0b0c0',
    padding: '5px 0 8px',
    background: '#fafafa',
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    letterSpacing: '0.3px',
  },
};

export default ChatWidget;
