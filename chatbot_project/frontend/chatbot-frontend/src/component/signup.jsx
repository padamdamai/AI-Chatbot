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
        className="btn btn-primary"
        onClick={() => setIsSignupVisible(true)}
        style={{ backgroundColor: '#4CAF50', color: '#fff', borderRadius: '8px', padding: '4px 20px' }}
      >
        Signup
      </button>

      {isSignupVisible && (
        <>
          <div
            onClick={() => setIsSignupVisible(false)}
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
            ref={signupModalRef}
            style={{
              position: 'fixed',
              top: '8%',
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
            <h2 className="text-center mb-4" style={{ color: '#4CAF50' }}>Sign Up</h2>

            <form onSubmit={handleSignupSubmit}>
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              <div className="mb-3">
                <label className="form-label" style={{ fontWeight: 'bold' }}>Username</label>
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

              <div className="mb-3">
                <label className="form-label" style={{ fontWeight: 'bold' }}>Email</label>
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

              <div className="mb-3">
                <label className="form-label" style={{ fontWeight: 'bold' }}>Password</label>
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
                <small style={{ color: 'gray' }}>Must be at least 8 characters</small>
              </div>

              <div className="mb-3">
                <label className="form-label" style={{ fontWeight: 'bold' }}>Confirm Password</label>
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
                className="btn btn-primary w-100"
                style={{ backgroundColor: '#4CAF50', color: 'white', borderRadius: '8px', padding: '12px' }}
                disabled={isLoading}
              >
                {isLoading ? 'Registering...' : 'Sign Up'}
              </button>
            </form>
          </div>
        </>
      )}
    </>
  );
}

export default Signup;