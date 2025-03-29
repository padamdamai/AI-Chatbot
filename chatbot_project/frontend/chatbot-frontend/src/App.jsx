import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import Signup from './component/signup';
import LoginModal from './component/login';  // Import LoginModal

function App() {
  const [userMessage, setUserMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFirstMessage, setIsFirstMessage] = useState(true);
  const [isLoginVisible, setIsLoginVisible] = useState(false);  // State for Login Modal visibility

  const messagesEndRef = useRef(null);

  const sendMessage = async () => {
    if (!userMessage) return;

    setLoading(true);
    const newChatHistory = [...chatHistory, { role: 'user', message: userMessage }];
    setChatHistory(newChatHistory);
    setUserMessage('');
    setIsFirstMessage(false);

    try {
      const response = await axios.post('http://localhost:8000/api/chat/', { message: userMessage });
      const botReply = response.data.response;

      setChatHistory([...newChatHistory, { role: 'bot', message: botReply }]);
    } catch (error) {
      console.log(error);
      setChatHistory([...newChatHistory, { role: 'bot', message: 'Sorry, something went wrong.' }]);
    }

    setLoading(false);
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

  return (
    <div className="App d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      {/* AI Chatbot text */}
      <div className="ai-chatbot-text fw-bold" style={{ position: 'fixed', top: '20px', left: '20px', fontSize: '1.5rem', color: '#007bff' }}>
        AI Chatbot
      </div>

      {/* Chat History */}
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



<div 
  className="d-flex justify-content-center align-items-center" 
  style={{ 
    position: 'sticky', 
    bottom: 0,  
  }}
>
  <textarea 
    className="form-control me-2 rounded-5 w-75" 
    value={userMessage} 
    onChange={(e) => setUserMessage(e.target.value)} 
    onKeyDown={handleKeyPress} 
    placeholder="Ask something..." 
    disabled={loading} 
    style={{ 
      fontSize: '1.1rem', 
      height: '6.5rem', 
      paddingTop: '20px', // Adjust this for vertical alignment of the placeholder text
      borderRadius: '0',
      boxShadow: 'rgba(0, 0, 0, 0.1) 0px 20px 20px 0px',
      maxWidth: '100%', // Ensure it doesn't overflow parent container
      wordWrap: 'break-word', // Break long words
      whiteSpace: 'normal', // Allow wrapping of text
      resize: 'none', // Disable manual resizing
      overflow: 'hidden', // Hide the scrollbar
      textAlign: 'center', // Center the placeholder horizontally
      display: 'flex', // Use flexbox to center the text vertically
      justifyContent: 'center', // Vertically center the content
      alignItems: 'center', // Vertically align the text
    }} 
  />
</div>


      </div>

      <div style={{ position: 'fixed', top: '20px', right: '20px', display: 'flex', flexDirection: 'row', gap: '10px' }}>
        {/* Login Button */}
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

        {/* Signup Button */}
        <Signup />
      </div>

      {/* LoginModal Component */}
      {isLoginVisible && <LoginModal isLoginVisible={isLoginVisible} setIsLoginVisible={setIsLoginVisible} />}
    </div>
  );
}

export default App;
