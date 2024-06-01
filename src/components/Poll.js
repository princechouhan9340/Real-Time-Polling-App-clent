// src/components/Poll.js
import React, { useState, useEffect } from 'react';
import socket from '../socket';

import './Poll.css';

const Poll = () => {
  const [polls, setPolls] = useState([]);
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const currentUsername = localStorage.getItem('username');

  useEffect(() => {
    socket.on('initialData', (data) => {
      setPolls(data.polls);
    });

    socket.on('pollUpdated', (updatedPoll) => {
      setPolls((prevPolls) => prevPolls.map(poll => poll._id === updatedPoll._id ? updatedPoll : poll));
    });

    return () => {
      socket.off('initialData');
      socket.off('pollUpdated');
    };
  }, []);

  const handleVote = (pollId, optionIndex) => {
    socket.emit('vote', { pollId, optionIndex ,currentUsername});
  };

  const handleCreatePoll = (e) => {
    e.preventDefault();
    socket.emit('createPoll', { question, options });
    setQuestion('');
    setOptions(['', '']);
  };

  return (
    <div className="poll">
      <div className="create-poll">
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
      </div>
      <div className="polls">
        {polls.map((poll) => (
          <div key={poll._id} className="poll-item">
            <h3>{poll.question}</h3>
            {poll.options.map((option, index) => (
              <button key={index} onClick={() => handleVote(poll._id, index)}>
                {option.text} ({option.votes})
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Poll;
