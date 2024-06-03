import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import socket from '../socket';
import { useNavigate } from 'react-router-dom';
import './Chat.css';

const Chat = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [polls, setPolls] = useState([]);
  const currentUsername = localStorage.getItem('username');
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const messagesResponse = await axios.get(`${process.env.REACT_APP_API_URL}/messages`);
        const pollsResponse = await axios.get(`${process.env.REACT_APP_API_URL}/polls`);
        setMessages(messagesResponse.data);
        setPolls(pollsResponse.data);
      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
    };

    fetchData();

    socket.on('chat message', (msg) => {
      setMessages((prevMessages) => [msg,...prevMessages]);
    });

    socket.on('poll created', (poll) => {
      setPolls((prevPolls) => [...prevPolls, poll]);
    });

    socket.on('poll voted', (updatedPoll) => {
      if (updatedPoll.error) {
        alert(updatedPoll.error);
      }
      setPolls((prevPolls) =>
        prevPolls.map((poll) => (poll._id === updatedPoll._id ? updatedPoll : poll))
      );
    });

    socket.on('user typing', ({ username, typing }) => {
      if(username !== currentUsername){
        setTypingUsers((prevTypingUsers) => {
          if (typing) {
            return [...new Set([...prevTypingUsers, username])];
          } else {
            return prevTypingUsers.filter((user) => user !== username);
          }
        });
      }
      
    });

    socket.on('poll vote alert', ({ username, option }) => {
      alert(`${username} voted for ${option}`);
    });

    return () => {
      socket.off('chat message');
      socket.off('poll created');
      socket.off('poll voted');
      socket.off('user typing');
      socket.off('poll vote alert');
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    const username = localStorage.getItem('username');
    if (username) {
      socket.emit('chat message', { message, username });
      setMessage('');
      setTyping(false);
      socket.emit('user typing', { username, typing: false });
    } else {
      alert('Username not found. Please log in again.');
      navigate('/login');
    }
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);
    if (!typing) {
      setTyping(true);
      socket.emit('user typing', { username: currentUsername, typing: true });
    }
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setTyping(false);
      socket.emit('user typing', { username: currentUsername, typing: false });
    }, 3000);
  };

  const handleCreatePoll = (e) => {
    e.preventDefault();
    const poll = { question, options: options.map((option) => option) };
    socket.emit('create poll', poll);
    setQuestion('');
    setOptions(['', '']);
  };

  const handleVote = (pollId, optionIndex) => {
    socket.emit('vote poll', { pollId, optionIndex },currentUsername);
  };

  return (
    <div className="chat-container">
      <div className="poll-section">
        <form onSubmit={handleCreatePoll}>
          <h2>Create Poll</h2>
          <input
            type="text"
            placeholder="Question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          {options.map((option, index) => (
            <input
              key={index}
              type="text"
              placeholder={`Option ${index + 1}`}
              value={option}
              onChange={(e) => {
                const newOptions = [...options];
                newOptions[index] = e.target.value;
                setOptions(newOptions);
              }}
            />
          ))}
          <button type="submit">Create Poll</button>
        </form>
        <div className="poll-results">
          {polls.map((poll) => (
            <div key={poll._id} className="poll-item">
              <h3>{poll.question}</h3>
              {poll.options.map((option, index) => (
                <button key={index} onClick={() => handleVote(poll._id, index)}>
                  {option.option} ({option.votes})
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="chat-messages">
      {[...messages].reverse().map((msg, index) => (
          <div key={index} className={`chat-message ${msg.username === currentUsername ? 'my-message' : 'other-message'}`}>
            <strong>{msg.username}:</strong> {msg.message}
          </div>
        ))}
        <div ref={messagesEndRef} />
        {typingUsers.length > 0 && (
          <div className="typing-indicator">
            {typingUsers.join(', ')} {typingUsers.length > 1 ? 'are' : 'is'} typing...
          </div>
        )}
      </div>
      <form className="chat-form" onSubmit={handleSendMessage}>
        <input
          type="text"
          placeholder="Type a message..."
          value={message}
          onChange={handleTyping}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default Chat;
