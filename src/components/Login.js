// src/components/Login.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = ({ setIsLoggedIn }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/login`, { username, password });
      console.log("Response: ", response.data);
      if (response.data.success) {
        localStorage.setItem('username', username);
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('token', response.data.token);
        setIsLoggedIn(true);
        console.log("Navigating to /chat");
        navigate('/chat');
      } else {
        setMessage(response.data.message);
      }
    } catch (error) {
      console.error("Login error: ", error);
      setMessage(error?.response?.data?.message || 'An error occurred');
      alert(error?.response?.data?.message || 'An error occurred');
    }
  };

  return (
    <div className="login">
      <form onSubmit={handleSubmit}>
        <h2>Login</h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
        <p>{message}</p>
      </form>
    </div>
  );
};

export default Login;
