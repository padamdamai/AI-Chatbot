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
  const [currentUser, setCurrentUser] = useState(null);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
  
      try {
        const response = await axios.get('http://localhost:8000/api/user/', {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 5000
        });
        
        setIsAuthenticated(true);
        setCurrentUser(response.data);
      } catch (error) {
        // If token verification fails, clear it
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setCurrentUser(null);
        
        if (error.response?.status === 401) {
          // Optional: show a message that session expired
          setChatHistory(prev => [...prev, { 
            role: 'bot', 
            message: 'Your session has expired. Please login again.',
            format: 'text'
          }]);
        }
      }
    };
  
    verifyToken();
  }, []);

  const formatMessage = (message, format) => {
    if (format === 'list') {
      const points = message.split('\n').filter(point => point.trim());
      return (
        <ol className="ps-3" style={{ listStyleType: 'decimal' }}>
          {points.map((point, index) => (
            <li key={index} className="mb-2">
              {point.replace(/^\d+\.\s*/, '').trim()}
            </li>
          ))}
        </ol>
      );
    }
    
    if (format === 'math') {
      return (
        <div className="math-solution">
          {message.split('\n').map((line, index) => {
            if (line.match(/^Step \d+:/i)) {
              return (
                <div key={index} className="fw-bold mt-2 text-primary">
                  {line}
                </div>
              );
            } else if (line.trim() === '') {
              return <br key={index} />;
            } else {
              return (
                <div key={index} className="math-line">
                  {line}
                </div>
              );
            }
          })}
        </div>
      );
    }

    return <div className="whitespace-pre-line">{message}</div>;
  };

  const sendMessage = async () => {
    if (!userMessage.trim()) return;
    if (!isAuthenticated) {
      setIsLoginVisible(true);
      return;
    }

    setLoading(true);
    const newUserMessage = { 
      role: 'user', 
      message: userMessage, 
      format: 'text' 
    };
    setChatHistory(prev => [...prev, newUserMessage]);
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

      const botMessage = {
        role: 'bot',
        message: response.data.response,
        format: response.data.format || 'text'
      };
      setChatHistory(prev => [...prev, botMessage]);
    } catch (error) {
      if (error.response?.status === 401) {
        handleLogout();
        setChatHistory(prev => [...prev, { 
          role: 'bot', 
          message: 'Session expired. Please login again.',
          format: 'text'
        }]);
      } else {
        setChatHistory(prev => [...prev, { 
          role: 'bot', 
          message: 'Sorry, something went wrong.',
          format: 'text'
        }]);
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

  const handleSuccessfulLogin = (token, userData) => {
    localStorage.setItem('token', token);
    setIsAuthenticated(true);
    setCurrentUser({
      username: userData.username,
      email: userData.email
    });
    setIsLoginVisible(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  return (
    <div className="App container-fluid d-flex flex-column min-vh-100 p-0">
      <header className="d-flex justify-content-between align-items-center p-3 bg-white shadow-sm position-sticky top-0 z-3">
        <div className="ai-chatbot-text fw-bold fs-4 text-primary">AI Chatbot</div>
        <div className="d-flex align-items-center gap-2">
          {isAuthenticated ? (
            <div className="d-flex flex-column flex-sm-row align-items-center">
              <span className="me-3 text-muted d-flex align-items-center">
                <span className="d-none d-sm-inline">Welcome,&nbsp;</span>
                <span className="fw-bold text-dark text-truncate" style={{ maxWidth: '120px' }}>
                  {currentUser?.username}
                </span>
              </span>
              <button 
                className="btn btn-outline-danger btn-sm py-1 px-3" 
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
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

      <main className="flex-grow-1 d-flex flex-column justify-content-center align-items-center p-3">
        <div className="chat-container w-100 h-100 d-flex flex-column" style={{ maxWidth: '1000px' }}>
          {isFirstMessage && (
            <h1 className="text-center fw-bold mb-4 fs-2 fs-md-1">How can I assist you?</h1>
          )}

<div className="chatbox flex-grow-1 overflow-auto mb-3 custom-width-75 mx-auto">
  {chatHistory.map((entry, index) => (
    <div 
      key={index} 
      className={`d-flex ${entry.role === 'user' ? 'justify-content-end' : 'justify-content-start'} mb-2`}
    >
      <div 
        className={`p-3 rounded-4 ${entry.role === 'user' ? 'bg-light user-message' : 'bot-message'}`}
        style={{
          maxWidth: '100%',
          wordWrap: 'break-word'
        }}
      >
        {formatMessage(entry.message, entry.format)}
      </div>
    </div>
  ))}
  <div ref={messagesEndRef} />
</div>


          <div className="input-area position-sticky bottom-0 bg-white p-2 w-100">
          <div className="d-flex justify-content-center custom-width">
  <div className="textarea-container">
    <textarea
      className="form-control rounded-4 p-3"
      value={userMessage}
      onChange={(e) => setUserMessage(e.target.value)}
      onKeyDown={handleKeyPress}
      placeholder={isAuthenticated ? "Ask something..." : "Please login to chat"}
      disabled={loading || !isAuthenticated}
      style={{
        height: '6.5rem',
        boxShadow: 'rgba(0, 0, 0, 0.1) 0px 20px 20px 0px',
        resize: 'none',
      }}
    />
  </div>
</div>

</div>

        </div>
      </main>

      <style jsx>{`
  /* For screens less than 387px width and 626px height */
  @media (max-width: 386px) and (max-height: 625px) {
    header {
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 100%;
      text-align: center;
      padding-top: 10px; /* Space from top */
    }
    .ai-chatbot-text {
      width: 100%;
      text-align: center;
      font-size: 1.8rem;
      margin-bottom: 10px;
    }
    
    .right-section {
      width: 100%;
      flex-direction: column;
      align-items: center;
    }
    
    .right-section span,
    .right-section button {
      margin-top: 5px;
      width: 100%;
      text-align: center;
    }
    
    .right-section button {
      max-width: 150px; /* Optional: Keep button width manageable */
    }
  }
`}</style>


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
