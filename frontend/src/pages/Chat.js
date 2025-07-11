import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const Chat = () => {
  const { complaintId } = useParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [complaint, setComplaint] = useState(null);

  useEffect(() => {
    fetchMessages();
    fetchComplaint();
  }, [complaintId]);

  const fetchMessages = async () => {
    try {
      const response = await api.get(`/messages/complaint/${complaintId}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const fetchComplaint = async () => {
    try {
      const response = await api.get(`/complaints/${complaintId}`);
      setComplaint(response.data);
    } catch (error) {
      console.error('Error fetching complaint:', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const receiverId = user.role === 'customer' 
        ? complaint.assignedAgent?._id 
        : complaint.customer._id;

      await api.post('/messages', {
        complaintId,
        receiverId,
        content: newMessage
      });

      setNewMessage('');
      fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div>
      <h2>Chat - {complaint?.title}</h2>
      
      <div className="chat-container">
        <div className="chat-messages">
          {messages.map((message) => (
            <div
              key={message._id}
              className={`message ${message.sender._id === user.id ? 'sent' : 'received'}`}
            >
              <div className="message-content">{message.content}</div>
              <small className="text-muted">
                {new Date(message.createdAt).toLocaleTimeString()}
              </small>
            </div>
          ))}
        </div>
        
        <form onSubmit={sendMessage} className="chat-input">
          <input
            type="text"
            className="form-control"
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat; 