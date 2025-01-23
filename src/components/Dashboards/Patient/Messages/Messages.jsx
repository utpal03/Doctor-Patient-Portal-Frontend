import React, { useState, useEffect } from "react";
const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);

  useEffect(() => {
    const mockMessages = [
      {
        id: 1,
        from: "Dr. Sarah Wilson",
        subject: "Follow-up Appointment",
        date: "2024-12-15",
        content:
          "Your recent test results look good. Let's schedule a follow-up appointment to discuss your progress.",
        unread: true,
        avatar: "/api/placeholder/48/48",
      },
      // ... more messages
    ];

    setMessages(mockMessages);
  }, []);

  return (
    <div className="patient-main">
      <header className="patient-header">
        <h1>Messages</h1>
        <button className="primary-button">New Message</button>
      </header>

      <div className="messages-container">
        <div className="messages-sidebar">
          <div className="messages-list">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`message-item ${message.unread ? "unread" : ""} ${
                  selectedMessage?.id === message.id ? "selected" : ""
                }`}
                onClick={() => setSelectedMessage(message)}
              >
                <img
                  src={message.avatar}
                  alt={message.from}
                  className="sender-avatar"
                />
                <div className="message-preview">
                  <div className="message-header">
                    <h4>{message.from}</h4>
                    <span className="message-date">{message.date}</span>
                  </div>
                  <p className="message-subject">{message.subject}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="message-content">
          {selectedMessage ? (
            <div className="selected-message">
              <div className="message-header">
                <h3>{selectedMessage.subject}</h3>
                <div className="message-meta">
                  <span>From: {selectedMessage.from}</span>
                  <span>Date: {selectedMessage.date}</span>
                </div>
              </div>
              <div className="message-body">
                <p>{selectedMessage.content}</p>
              </div>
              <div className="message-actions">
                <button className="reply-btn">Reply</button>
                <button className="forward-btn">Forward</button>
              </div>
            </div>
          ) : (
            <div className="no-message-selected">
              <p>Select a message to read</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default Messages;
