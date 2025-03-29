import React, { useState } from 'react';
import axios from 'axios';

const LoginModal = ({ isLoginVisible, setIsLoginVisible }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isLoginVisible) return null; // Don't render the modal if not visible

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:8000/api/login/', {
        username,
        password,
      });

      if (response.status === 200) {
        localStorage.setItem('token', response.data.token); // Store token in localStorage
        alert('Login successful!');
        setIsLoginVisible(false);
      }
    } catch (error) {
      setErrorMessage('Invalid username or password');
    }
  };

  return (
    <div>
      <div 
        onClick={() => setIsLoginVisible(false)} 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 999,
        }}
      ></div>

      <div
        style={{
          position: 'fixed',
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '12px',
          boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
          zIndex: 1000,
          width: '90%',
          maxWidth: '400px',
        }}
      >
        <h2 className="text-center mb-4" style={{ color: '#4CAF50' }}>Login</h2>

        {errorMessage && <p style={{ color: 'red', textAlign: 'center' }}>{errorMessage}</p>}

        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label htmlFor="username" className="form-label" style={{ fontWeight: 'bold' }}>Username</label>
            <input 
              type="text" 
              id="username" 
              className="form-control" 
              placeholder="Enter your username" 
              required 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label" style={{ fontWeight: 'bold' }}>Password</label>
            <input 
              type="password" 
              id="password" 
              className="form-control" 
              placeholder="Enter your password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100"
            style={{
              backgroundColor: '#4CAF50',
              color: 'white',
              borderRadius: '8px',
              padding: '12px',
            }}
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;
