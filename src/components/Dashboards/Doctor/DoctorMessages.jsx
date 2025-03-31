import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../../Styles/DashboardStyles.css"

const DoctorMessages = () => {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // Mock conversations data
    const mockConversations = [
      {
        id: 1,
        patient: {
          name: "John Doe",
          avatar: "/api/placeholder/40/40",
          status: "online"
        },
        messages: [
          {
            id: 1,
            sender: "patient",
            content: "Hello Dr. Chen, I have a question about my medication.",
            timestamp: "2025-01-28 09:30 AM",
            read: true
          },
          {
            id: 2,
            sender: "doctor",
            content: "Of course, what would you like to know?",
            timestamp: "2025-01-28 09:35 AM",
            read: true
          }
        ],
        unread: 0
      },
      {
        id: 2,
        patient: {
          name: "Sarah Smith",
          avatar: "/api/placeholder/40/40",
          status: "offline"
        },
        messages: [
          {
            id: 1,
            sender: "patient",
            content: "My symptoms have improved since last visit.",
            timestamp: "2025-01-27 02:15 PM",
            read: false
          }
        ],
        unread: 1
      }
    ];
    setConversations(mockConversations);
  }, []);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const updatedConversations = conversations.map(conv => {
      if (conv.id === selectedConversation.id) {
        return {
          ...conv,
          messages: [
            ...conv.messages,
            {
              id: conv.messages.length + 1,
              sender: "doctor",
              content: newMessage,
              timestamp: new Date().toLocaleString(),
              read: true
            }
          ]
        };
      }
      return conv;
    });

    setConversations(updatedConversations);
    setNewMessage("");
  };

  const handleConversationSelect = (conversation) => {
    // Mark messages as read when conversation is selected
    const updatedConversations = conversations.map(conv => {
      if (conv.id === conversation.id) {
        return {
          ...conv,
          unread: 0,
          messages: conv.messages.map(msg => ({ ...msg, read: true }))
        };
      }
      return conv;
    });
    
    setConversations(updatedConversations);
    setSelectedConversation(conversation);
  };

  const filteredConversations = conversations.filter(conv =>
    conv.patient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="messages-page">
      <div className="conversations-sidebar">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="conversations-list">
          {filteredConversations.map((conv) => (
            <div
              key={conv.id}
              className={`conversation-item ${selectedConversation?.id === conv.id ? 'selected' : ''}`}
              onClick={() => handleConversationSelect(conv)}
            >
              <img
                src={conv.patient.avatar}
                alt={conv.patient.name}
                className="patient-avatar"
              />
              <div className="conversation-info">
                <div className="conversation-header">
                  <h3>{conv.patient.name}</h3>
                  <span className={`status-dot ${conv.patient.status}`}></span>
                </div>
                <p className="last-message">
                  {conv.messages[conv.messages.length - 1].content.substring(0, 30)}...
                </p>
              </div>
              {conv.unread > 0 && (
                <span className="unread-badge">{conv.unread}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="message-area">
        {selectedConversation ? (
          <>
            <div className="message-header">
              <div className="patient-info">
                <img
                  src={selectedConversation.patient.avatar}
                  alt={selectedConversation.patient.name}
                  className="patient-avatar"
                />
                <div>
                  <h3>{selectedConversation.patient.name}</h3>
                  <span className={`status ${selectedConversation.patient.status}`}>
                    {selectedConversation.patient.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="messages-container">
              {selectedConversation.messages.map((message) => (
                <div
                  key={message.id}
                  className={`message ${message.sender === 'doctor' ? 'sent' : 'received'}`}
                >
                  <div className="message-content">
                    <p>{message.content}</p>
                    <span className="timestamp">{message.timestamp}</span>
                    {message.sender === 'doctor' && (
                      <span className="read-status">
                        {message.read ? '✓✓' : '✓'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <form className="message-input" onSubmit={handleSendMessage}>
              <input
                type="text"
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button type="submit" className="send-button">
                Send
              </button>
            </form>
          </>
        ) : (
          <div className="no-conversation-selected">
            <p>Select a conversation to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorMessages;