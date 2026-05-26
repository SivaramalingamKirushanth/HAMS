import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import API_BASE_URL from '../../config';
import './Login.css';

const Login = ({ setUser }) => {
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState('');

  // =========================
  // GOOGLE LOGIN
  // =========================
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const token = credentialResponse.credential;
      if (!token) throw new Error("No token received");

      // Send token to backend for verification instead of decoding manually
      const response = await fetch(`${API_BASE_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });

      const data = await response.json();

      if (data.success) {
        // Save user and JWT
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token); // Store the backend JWT

        // Update global state
        if (setUser) setUser(data.user);

        // Redirect
        navigate('/student');
      } else {
        setErrorMsg(data.message || 'Authentication failed');
      }
    } catch (err) {
      console.error("Backend auth failed:", err);
      setErrorMsg("Server unreachable. Please try again.");
    }
  };

  // =========================
  // UI
  // =========================
  return (
    <div className="login-container">
      <div className="login-card" style={{ maxWidth: '400px', margin: '0 auto', padding: '40px' }}>
        <div className="login-header">
          <div className="logo-placeholder">
            <span className="logo-icon">🏢</span>
            <h2>HAMS</h2>
          </div>

          <h1>Welcome</h1>
          <p>Please log in with your university account.</p>
        </div>
        
        {/* Error Message */}
        {errorMsg && (
          <div style={{ color: 'red', marginTop: '10px', marginBottom: '20px', textAlign: 'center', fontWeight: 'bold' }}>
            {errorMsg}
          </div>
        )}

        {/* GOOGLE LOGIN */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: "20px" }}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setErrorMsg("Google Login Failed. Please try again.")}
          />
        </div>
      </div>
    </div>
  );
};

export default Login;