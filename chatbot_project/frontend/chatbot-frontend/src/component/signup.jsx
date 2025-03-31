import React, { useState, useEffect, useRef } from 'react';

function Signup() {
  const [isSignupVisible, setIsSignupVisible] = useState(false);
  const [signupForm, setSignupForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const signupModalRef = useRef(null);

  const handleSignupChange = (e) => {
    const { name, value } = e.target;
    setSignupForm({ ...signupForm, [name]: value });
  };

  const validatePassword = (password) => {
    return password.length >= 8;
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (signupForm.password !== signupForm.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!validatePassword(signupForm.password)) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: signupForm.username,
          email: signupForm.email,
          password: signupForm.password,
          confirmPassword: signupForm.confirmPassword
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Registration successful! Please log in.');
        setIsSignupVisible(false);
        setSignupForm({ username: '', email: '', password: '', confirmPassword: '' });
      } else {
        setError(data.error || 'Registration failed. Please check your inputs.');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (signupModalRef.current && !signupModalRef.current.contains(e.target)) {
        setIsSignupVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <button
        className="btn btn-primary signup-button"
        onClick={() => setIsSignupVisible(true)}
      >
        Signup
      </button>

      {isSignupVisible && (
        <>
          <div
            onClick={() => setIsSignupVisible(false)}
            className="modal-backdrop"
          ></div>

          <div
            ref={signupModalRef}
            className="signup-modal-container"
          >
            <h2 className="text-center mb-3 signup-title">Sign Up</h2>

            <form onSubmit={handleSignupSubmit}>
              {error && (
                <div className="alert alert-danger error-message" role="alert">
                  {error}
                </div>
              )}

              <div className="mb-2 form-group">
                <label className="form-label">Username</label>
                <input
                  type="text"
                  name="username"
                  value={signupForm.username}
                  placeholder="Enter your username"
                  onChange={handleSignupChange}
                  className="form-control"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="mb-2 form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  name="email"
                  value={signupForm.email}
                  placeholder="Enter your email"
                  onChange={handleSignupChange}
                  className="form-control"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="mb-2 form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  name="password"
                  value={signupForm.password}
                  placeholder="Enter your password"
                  onChange={handleSignupChange}
                  className="form-control"
                  required
                  disabled={isLoading}
                />
                <small className="password-hint">Must be at least 8 characters</small>
              </div>

              <div className="mb-3 form-group">
                <label className="form-label">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={signupForm.confirmPassword}
                  placeholder="Confirm your password"
                  onChange={handleSignupChange}
                  className="form-control"
                  required
                  disabled={isLoading}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100 submit-button"
                disabled={isLoading}
              >
                {isLoading ? 'Registering...' : 'Sign Up'}
              </button>
            </form>
          </div>
        </>
      )}

      <style jsx>{`
        /* Default styles */
        .signup-button {
          background-color: #4CAF50;
          color: #fff;
          border-radius: 8px;
          padding: 3px 15px;
          font-size: 0.9rem;
        }
        
        .modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.5);
          z-index: 999;
        }
        
        .signup-modal-container {
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
        
        .signup-title {
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
        
        .password-hint {
          color: gray;
          font-size: 0.8rem;
        }
        
        .submit-button {
          background-color: #4CAF50;
          color: white;
          border-radius: 6px;
          padding: 8px;
          font-size: 0.9rem;
        }

        /* Styles for screens below 618px × 621px */
        @media (max-width: 617px), (max-height: 620px) {
          .signup-modal-container {
            top: 22%;
            padding: 15px;
            max-width: 340px;
          }
          
          .signup-title {
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
          
          .password-hint {
            font-size: 0.75rem;
          }
          
          .submit-button {
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
}

export default Signup;