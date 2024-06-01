import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Register.css';

const Register = ({ setIsLoggedIn }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/register`, { username, password });
      if (response?.data?.success) {
        setMessage(response?.data?.message);
        localStorage.setItem('username', username);
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('token', response.data.token);
        setIsLoggedIn(true);
        alert('Register succesfully');
        navigate('/chat');
      } else {
        setMessage(response?.data?.message);
      }
    } catch (error) {
        console.log("error",error)
        setMessage(error?.response?.data?.message);
        if(error.response.data.message === "You are alrady ragister"){
            alert('User already registered');
            navigate('/login'); 
        }
      
    }
  };

  return (
    <div className="register">
      <form onSubmit={handleSubmit}>
        <h2>Register</h2>
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
        <button type="submit">Register</button>
        <p>{message}</p>
      </form>
    </div>
  );
};

export default Register;
