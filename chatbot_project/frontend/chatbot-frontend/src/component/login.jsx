import React, { useState } from 'react';
import axios from 'axios';

const LoginModal = ({ isLoginVisible, setIsLoginVisible, onSuccessfulLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setErrorMessage('Both fields are required');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:8000/api/login/', {
        username,
        password,
      });

      if (response.data.token) {
        onSuccessfulLogin(response.data.token);
        setErrorMessage('');
      }
    } catch (error) {
      if (error.response) {
        setErrorMessage(error.response.data.error || 'Login failed');
      } else {
        setErrorMessage('Network error. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoginVisible) return null;

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

        {errorMessage && (
          <div className="alert alert-danger" role="alert">
            {errorMessage}
          </div>
        )}

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
              disabled={isLoading}
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
              disabled={isLoading}
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
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;