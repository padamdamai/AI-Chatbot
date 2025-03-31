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
    <div className="App container-fluid d-flex flex-column min-vh-100 p-0">
      {/* Header Section */}
      <header className="d-flex justify-content-between align-items-center p-3 bg-white shadow-sm position-sticky top-0 z-3">
        <div className="ai-chatbot-text fw-bold fs-4 text-primary">AI Chatbot</div>
        
        <div className="d-flex gap-2">
          {isAuthenticated ? (
            <button 
              className="btn btn-danger btn-sm py-1 px-3" 
              onClick={handleLogout}
            >
              Logout
            </button>
          ) : (
            <>
              <button 
                className="btn btn-primary btn-sm py-1 px-3" 
                onClick={() => setIsLoginVisible(true)}
              >
                Login
              </button>
              <Signup />
            </>
          )}
        </div>
      </header>

{/* Main Chat Area */}
<main className="flex-grow-1 d-flex flex-column justify-content-center align-items-center p-3">
  <div className="chat-container w-100 h-100 d-flex flex-column" style={{ maxWidth: '1000px' }}>
    {isFirstMessage && (
      <h1 className="text-center fw-bold mb-4 fs-2 fs-md-1">How can I assist you?</h1>
    )}

    {/* Chatbox with custom width for larger screens */}
    <div className="chatbox flex-grow-1 overflow-auto mb-3 w-100 custom-width-75 mx-auto">
      {chatHistory.map((entry, index) => (
        <div 
          key={index} 
          className={`d-flex ${entry.role === 'user' ? 'justify-content-end' : 'justify-content-start'} mb-2`}
        >
          <div 
            className={`p-3 rounded-4 ${entry.role === 'user' ? 'bg-light user-message' : 'bot-message'}`}
            style={{
              maxWidth: '85%',
              wordWrap: 'break-word'
            }}
          >
            {entry.message}
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
    
    {/* Input Area with matching custom width */}
    <div className="input-area position-sticky bottom-0 bg-white p-2 w-100">
      <div className="d-flex justify-content-center">
        <div className="w-100 custom-width-75">
          <textarea 
            className="form-control rounded-4 p-3 w-100"
            value={userMessage} 
            onChange={(e) => setUserMessage(e.target.value)} 
            onKeyDown={handleKeyPress} 
            placeholder={isAuthenticated ? "Ask something..." : "Please login to chat"} 
            disabled={loading || !isAuthenticated}
            style={{ 
              height: '6.5rem',
              boxShadow: 'rgba(0, 0, 0, 0.1) 0px 20px 20px 0px',
              resize: 'none'
            }} 
          />
        </div>
      </div>
    </div>
  </div>
</main>

{/* Custom CSS for specific screen size */}
<style jsx>{`
  @media (min-width: 618px) and (min-height: 621px) {
    .custom-width-75 {
      width: 75% !important;
    }
  }
`}</style>

      {/* Login Modal */}
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