import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const LoginModal = ({ isLoginVisible, setIsLoginVisible, onSuccessfulLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const loginModalRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
  
    if (!formData.username || !formData.password) {
      setError('Both fields are required');
      return;
    }
  
    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:8000/api/login/', {
        username: formData.username,
        password: formData.password,
      }, {
        timeout: 5000 // 5 second timeout
      });
  
      if (response.data?.token) {
        // Clear any previous tokens first
        localStorage.removeItem('token');
        
        // Store the new token
        localStorage.setItem('token', response.data.token);
        
        // Call success handler with all user data
        onSuccessfulLogin(response.data.token, {
          username: response.data.username,
          email: response.data.email,
          id: response.data.user_id
        });
        
        // Clear form
        setFormData({ username: '', password: '' });
      } else {
        throw new Error('Authentication failed - no token received');
      }
    } catch (error) {
      // Clear token on any error
      localStorage.removeItem('token');
      
      if (error.response) {
        // The request was made and the server responded with a status code
        if (error.response.status === 401) {
          setError('Invalid username or password');
        } else {
          setError(error.response.data?.error || 'Login failed');
        }
      } else if (error.request) {
        // The request was made but no response was received
        setError('Network error. Please check your connection.');
      } else {
        // Something happened in setting up the request
        setError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (loginModalRef.current && !loginModalRef.current.contains(e.target)) {
        setIsLoginVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isLoginVisible) return null;

  return (
    <>
      <div
        onClick={() => setIsLoginVisible(false)}
        className="modal-backdrop"
      ></div>

      <div
        ref={loginModalRef}
        className="login-modal-container"
      >
        <h2 className="text-center mb-3 login-title">Login</h2>

        {error && (
          <div className="alert alert-danger error-message" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="mb-2 form-group">
            <label className="form-label">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              placeholder="Enter your username"
              onChange={handleChange}
              className="form-control"
              required
              disabled={isLoading}
              autoFocus
            />
          </div>

          <div className="mb-3 form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              placeholder="Enter your password"
              onChange={handleChange}
              className="form-control"
              required
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
        .modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.5);
          z-index: 999;
        }
        
        .login-modal-container {
          position: fixed;
          top: 13%;
          left: 50%;
          transform: translateX(-50%);
          background-color: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
          z-index: 1000;
          width: 90%;
          max-width: 380px;
        }
        
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
            max-width: 340px;
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
    </>
  );
};

export default LoginModal;