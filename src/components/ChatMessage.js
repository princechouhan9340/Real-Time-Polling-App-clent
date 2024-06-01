// src/components/ChatMessage.js
import React from 'react';
import './ChatMessage.css';

const ChatMessage = ({ msg }) => {
  return (
    <div className="chat-message">
      <strong>{msg.username}: </strong>
      <span>{msg.message}</span>
    </div>
  );
};

export default ChatMessage;
