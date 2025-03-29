import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import Signup from './component/signup';
import LoginModal from './component/login';

function App() {
  const [userMessage, setUserMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFirstMessage, setIsFirstMessage] = useState(true);
  const [isLoginVisible, setIsLoginVisible] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Check for existing token on app load
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const sendMessage = async () => {
    if (!userMessage) return;
    if (!isAuthenticated) {
      setIsLoginVisible(true);
      return;
    }

    setLoading(true);
    const newChatHistory = [...chatHistory, { role: 'user', message: userMessage }];
    setChatHistory(newChatHistory);
    setUserMessage('');
    setIsFirstMessage(false);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:8000/api/chat/',
        { message: userMessage },
        {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      setChatHistory([...newChatHistory, { role: 'bot', message: response.data.response }]);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setIsLoginVisible(true);
        setChatHistory([...newChatHistory, { role: 'bot', message: 'Session expired. Please login again.' }]);
      } else {
        setChatHistory([...newChatHistory, { role: 'bot', message: 'Sorry, something went wrong.' }]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      sendMessage();
    }
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory]);

  const handleSuccessfulLogin = (token) => {
    localStorage.setItem('token', token);
    setIsAuthenticated(true);
    setIsLoginVisible(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  return (
    <div className="App d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <div className="ai-chatbot-text fw-bold" style={{ position: 'fixed', top: '20px', left: '20px', fontSize: '1.5rem', color: '#007bff' }}>
        AI Chatbot
      </div>

      <div className="chat-container" style={{ width: '90%', maxWidth: '1000px', height: '80%', padding: '30px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
        {isFirstMessage && <h1 className="text-center fw-bold mb-4 fs-2">How can I assist you?</h1>}

        <div className="chatbox mx-auto w-75" style={{ flexGrow: 1, marginBottom: '20px', overflowY: 'scroll', scrollbarWidth: 'none' }}>
          {chatHistory.map((entry, index) => (
            <div key={index} className={`d-flex ${entry.role === 'user' ? 'justify-content-end' : 'justify-content-start'}`} style={{ marginBottom: '10px' }}>
              <div className={`p-3 ${entry.role === 'user' ? 'bg-light w-50 text-dark rounded-5' : ''}`} style={{ backgroundColor: entry.role === 'user' ? '#e0e0e0' : 'transparent', fontSize: '1rem', marginLeft: entry.role === 'user' ? 'auto' : '' }}>
                {entry.message}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="d-flex justify-content-center align-items-center" style={{ position: 'sticky', bottom: 0 }}>
          <textarea 
            className="form-control me-2 rounded-5 w-75" 
            value={userMessage} 
            onChange={(e) => setUserMessage(e.target.value)} 
            onKeyDown={handleKeyPress} 
            placeholder={isAuthenticated ? "Ask something..." : "Please login to chat"} 
            disabled={loading || !isAuthenticated}
            style={{ 
              fontSize: '1.1rem', 
              height: '6.5rem',
              paddingTop: '20px',
              borderRadius: '0',
              boxShadow: 'rgba(0, 0, 0, 0.1) 0px 20px 20px 0px',
              maxWidth: '100%',
              wordWrap: 'break-word',
              whiteSpace: 'normal',
              resize: 'none',
              overflow: 'hidden',
              textAlign: 'center',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }} 
          />
        </div>
      </div>

      <div style={{ position: 'fixed', top: '20px', right: '20px', display: 'flex', flexDirection: 'row', gap: '10px' }}>
        {isAuthenticated ? (
          <button 
            className="btn btn-danger" 
            onClick={handleLogout}
            style={{
              borderRadius: '8px',
              padding: '3px 20px',
              fontSize: '16px',
              cursor: 'pointer',
            }}
          >
            Logout
          </button>
        ) : (
          <>
            <button 
              className="btn btn-primary" 
              onClick={() => setIsLoginVisible(true)} 
              style={{
                backgroundColor: '#007bff',
                color: 'white',
                borderRadius: '8px',
                padding: '3px 20px',
                fontSize: '16px',
                cursor: 'pointer',
              }}
            >
              Login
            </button>
            <Signup />
          </>
        )}
      </div>

      {isLoginVisible && (
        <LoginModal 
          isLoginVisible={isLoginVisible} 
          setIsLoginVisible={setIsLoginVisible}
          onSuccessfulLogin={handleSuccessfulLogin}
        />
      )}
    </div>
  );
}

export default App;