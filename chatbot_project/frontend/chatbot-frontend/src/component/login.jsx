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
        className="login-modal-container"
        style={{
          position: 'fixed',
          top: '22%',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
          zIndex: 1000,
          width: '90%',
          maxWidth: '380px',
        }}
      >
        <h2 className="text-center mb-3 login-title">Login</h2>

        {errorMessage && (
          <div className="alert alert-danger error-message" role="alert">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="mb-2 form-group">
            <label htmlFor="username" className="form-label">Username</label>
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
          <div className="mb-3 form-group">
            <label htmlFor="password" className="form-label">Password</label>
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
            className="btn btn-primary w-100 login-button"
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>

      <style jsx>{`
        /* Default styles */
        .login-title {
          color: #4CAF50;
          font-size: 1.7rem;
        }
        .form-label {
          font-weight: bold;
          font-size: 0.9rem;
        }
        .form-control {
          padding: 0.4rem;
          font-size: 0.9rem;
        }
        .error-message {
          padding: 0.5rem;
          font-size: 0.85rem;
        }
        .login-button {
          background-color: #4CAF50;
          color: white;
          border-radius: 6px;
          padding: 8px;
          font-size: 0.9rem;
        }

        /* Styles for screens below 618px × 621px */
        @media (max-width: 617px), (max-height: 620px) {
          .login-modal-container {
            top: 22%;
            padding: 15px;
            maxWidth: 340px;
          }
          .login-title {
            font-size: 1.4rem;
            margin-bottom: 1rem;
          }
          .form-label {
            font-size: 0.8rem;
          }
          .form-control {
            padding: 0.3rem;
            font-size: 0.8rem;
          }
          .error-message {
            padding: 0.4rem;
            font-size: 0.8rem;
          }
          .login-button {
            padding: 6px;
            font-size: 0.85rem;
          }
          .form-group {
            margin-bottom: 0.8rem;
          }
        }
      `}</style>
    </div>
  );
};

export default LoginModal;