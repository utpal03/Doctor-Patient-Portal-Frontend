"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import "../../../../Styles/DashboardStyles.css"
import "../../../../Styles/PatientPages.css"

const Messages = () => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [conversations, setConversations] = useState([])
  const [patientInfo, setPatientInfo] = useState(null)
  const [error, setError] = useState(null)
  const [activeConversation, setActiveConversation] = useState(null)
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState([])
  const [doctors, setDoctors] = useState([])
  const [showNewMessageForm, setShowNewMessageForm] = useState(false)
  const [newMessageData, setNewMessageData] = useState({
    doctorId: "",
    subject: "",
    message: "",
  })
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const token = localStorage.getItem("token")
        const loggedInPatientId = Number(localStorage.getItem("id"))

        if (!token) {
          throw new Error("No authentication token found")
        }

        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        }

        // Fetch all data in parallel
        const [patientResponse, conversationsResponse, doctorsResponse] = await Promise.all([
          fetch("/patientInfo", { headers }),
          fetch("/conversations", { headers }),
          fetch("/doctors", { headers }),
        ])

        // Parse JSON responses
        const [patientData, conversationsData, doctorsData] = await Promise.all([
          patientResponse.json(),
          conversationsResponse.json(),
          doctorsResponse.json(),
        ])

        // Handle patient data
        if (Array.isArray(patientData) && patientData.length > 0) {
          const foundPatient = patientData.find((patient) => patient.id === loggedInPatientId)
          if (foundPatient) {
            setPatientInfo(foundPatient)
          } else {
            throw new Error(`Patient with ID ${loggedInPatientId} not found`)
          }
        } else {
          throw new Error("Invalid patient data format")
        }

        // Set conversations and doctors
        setConversations(Array.isArray(conversationsData) ? conversationsData : [])
        setDoctors(Array.isArray(doctorsData) ? doctorsData : [])

        // Set active conversation if there are any
        if (conversationsData.length > 0) {
          setActiveConversation(conversationsData[0])
          // Fetch messages for the active conversation
          const messagesResponse = await fetch(`/messages/${conversationsData[0].id}`, { headers })
          const messagesData = await messagesResponse.json()
          setMessages(Array.isArray(messagesData) ? messagesData : [])
        }
      } catch (err) {
        console.error("Error fetching data:", err)
        setError(err.message)
        setConversations([])
        setDoctors([])
        setPatientInfo(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    // Scroll to bottom of messages when messages change
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("userType")
    navigate("/login")
  }

  // Navigation functions
  const navigationHandlers = {
    Dashboard: () => navigate("/patient/dashboard"),
    Appointments: () => navigate("/my-appointment"),
    "Medical Records": () => navigate("/medical-record"),
    "Lab Reports": () => navigate("/LabReports"),
    Messages: () => navigate("/messages"),
    Prescriptions: () => navigate("/prescription"),
  }

  const selectConversation = async (conversation) => {
    setActiveConversation(conversation)
    try {
      const token = localStorage.getItem("token")
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      }

      // Fetch messages for the selected conversation
      const messagesResponse = await fetch(`/messages/${conversation.id}`, { headers })
      const messagesData = await messagesResponse.json()
      setMessages(Array.isArray(messagesData) ? messagesData : [])

      // Mark conversation as read
      if (conversation.unreadCount > 0) {
        // Update the conversation locally
        setConversations(
          conversations.map((conv) => (conv.id === conversation.id ? { ...conv, unreadCount: 0 } : conv)),
        )

        // In a real app, you would also update this on the server
        await fetch(`/conversations/${conversation.id}/read`, {
          method: "PUT",
          headers,
        })
      }
    } catch (err) {
      console.error("Error fetching messages:", err)
      // In a real app, you would show an error message to the user
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!message.trim() || !activeConversation) return

    try {
      const token = localStorage.getItem("token")
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      }

      // Add the message locally immediately for better UX
      const newMessage = {
        id: Date.now(),
        senderId: patientInfo.id,
        senderName: patientInfo.name,
        senderType: "patient",
        content: message,
        timestamp: new Date().toISOString(),
      }

      setMessages([...messages, newMessage])

      // Clear the message input
      setMessage("")

      // In a real app, you would send this to your backend
      const response = await fetch(`/messages/${activeConversation.id}`, {
        method: "POST",
        headers,
        body: JSON.stringify({ content: message }),
      })

      if (response.ok) {
        // Simulate doctor typing response
        setIsTyping(true)

        // Simulate a response after a delay
        setTimeout(() => {
          const doctorResponse = {
            id: Date.now() + 1,
            senderId: activeConversation.participantId,
            senderName: activeConversation.participantName,
            senderType: "doctor",
            content: getAutomaticResponse(message),
            timestamp: new Date().toISOString(),
          }

          setMessages((prev) => [...prev, doctorResponse])
          setIsTyping(false)

          // Update the conversation preview
          setConversations(
            conversations.map((conv) =>
              conv.id === activeConversation.id
                ? {
                    ...conv,
                    lastMessage: doctorResponse.content,
                    lastMessageTime: doctorResponse.timestamp,
                  }
                : conv,
            ),
          )
        }, 3000)
      } else {
        throw new Error("Failed to send message")
      }
    } catch (err) {
      console.error("Error sending message:", err)
      // In a real app, you would show an error message to the user
    }
  }

  // Generate an automatic response based on the message content
  const getAutomaticResponse = (msg) => {
    const lowerMsg = msg.toLowerCase()

    if (lowerMsg.includes("appointment") || lowerMsg.includes("schedule")) {
      return "I see you're asking about appointments. You can schedule a new appointment through the Appointments section. Would you like me to help you with that?"
    } else if (lowerMsg.includes("prescription") || lowerMsg.includes("medicine") || lowerMsg.includes("refill")) {
      return "Regarding your medication, I'll review your current prescriptions. If you need a refill, please let me know which medication specifically."
    } else if (lowerMsg.includes("pain") || lowerMsg.includes("hurt")) {
      return "I'm sorry to hear you're in pain. Can you describe the location, intensity, and duration of the pain in more detail? This will help me better understand your situation."
    } else if (lowerMsg.includes("result") || lowerMsg.includes("test") || lowerMsg.includes("lab")) {
      return "Your recent lab results have been uploaded to your patient portal. You can view them in the Lab Reports section. Would you like me to explain any specific results?"
    } else if (lowerMsg.includes("thank")) {
      return "You're welcome! Don't hesitate to reach out if you have any other questions or concerns."
    } else {
      return "Thank you for your message. I'll review your information and get back to you soon. Is there anything specific you'd like me to address?"
    }
  }

  const handleNewMessageChange = (e) => {
    const { name, value } = e.target
    setNewMessageData({
      ...newMessageData,
      [name]: value,
    })
  }

  const handleStartNewConversation = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem("token")
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      }

      // Find the selected doctor
      const selectedDoctor = doctors.find((d) => d.id === Number.parseInt(newMessageData.doctorId))

      if (!selectedDoctor) {
        throw new Error("Selected doctor not found")
      }

      // Create a new conversation locally for immediate feedback
      const newConversation = {
        id: Date.now(),
        participantId: selectedDoctor.id,
        participantName: selectedDoctor.name,
        participantSpecialization: selectedDoctor.specialization,
        participantImage: selectedDoctor.image,
        lastMessage: newMessageData.message,
        lastMessageTime: new Date().toISOString(),
        unreadCount: 0,
      }

      // Add the new conversation to the conversations list
      setConversations([newConversation, ...conversations])

      // Select the new conversation
      setActiveConversation(newConversation)

      // Set initial messages
      const initialMessage = {
        id: Date.now(),
        senderId: patientInfo.id,
        senderName: patientInfo.name,
        senderType: "patient",
        content: newMessageData.message,
        timestamp: new Date().toISOString(),
      }

      setMessages([initialMessage])

      // Clear the form and close it
      setNewMessageData({
        doctorId: "",
        subject: "",
        message: "",
      })
      setShowNewMessageForm(false)

      // In a real app, you would send this to your backend
      const response = await fetch("/conversations", {
        method: "POST",
        headers,
        body: JSON.stringify({
          doctorId: selectedDoctor.id,
          subject: newMessageData.subject,
          message: newMessageData.message,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to start conversation on server")
      }

      // Simulate doctor typing response
      setTimeout(() => {
        setIsTyping(true)

        // Simulate a response after a delay
        setTimeout(() => {
          const doctorResponse = {
            id: Date.now() + 1,
            senderId: selectedDoctor.id,
            senderName: selectedDoctor.name,
            senderType: "doctor",
            content: `Hello! Thank you for reaching out about "${newMessageData.subject}". I'll be happy to assist you. What specific questions do you have?`,
            timestamp: new Date().toISOString(),
          }

          setMessages((prev) => [...prev, doctorResponse])
          setIsTyping(false)

          // Update the conversation preview
          setConversations(
            conversations.map((conv) =>
              conv.id === newConversation.id
                ? {
                    ...conv,
                    lastMessage: doctorResponse.content,
                    lastMessageTime: doctorResponse.timestamp,
                  }
                : conv,
            ),
          )
        }, 3000)
      }, 1000)
    } catch (err) {
      console.error("Error starting conversation:", err)
      // In a real app, you would show an error message to the user
    }
  }

  // Format time for display
  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  // Format date for conversation list
  const formatConversationDate = (timestamp) => {
    const date = new Date(timestamp)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return "Today"
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday"
    } else {
      return date.toLocaleDateString()
    }
  }

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading your messages...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div
        className="error-container"
        style={{
          padding: "20px",
          margin: "20px",
          backgroundColor: "rgba(244, 67, 54, 0.1)",
          border: "1px solid var(--error-color)",
          borderRadius: "8px",
          color: "var(--error-color)",
          textAlign: "center",
        }}
      >
        <p>Error loading messages: {error}</p>
        <button
          onClick={() => window.location.reload()}
          style={{
            marginTop: "10px",
            padding: "8px 16px",
            backgroundColor: "var(--error-color)",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="dashboard-container">
      <nav className="sidebar">
        <div className="profile-section">
          {patientInfo ? (
            <>
              <img src={patientInfo.image || "/api/placeholder/80/80"} alt="Patient" className="avatar" />
              <h3>{patientInfo.name || "Patient Name"}</h3>
              <p>Patient ID: {patientInfo.id || "N/A"}</p>
              <div className="quick-info">
                <span>Age: {patientInfo.age || "N/A"}</span>
                <br />
                <span>Blood: {patientInfo.bloodgroup || "N/A"}</span>
              </div>
            </>
          ) : (
            <p>Unable to load patient info</p>
          )}
        </div>

        <div className="nav-menu">
          {Object.entries(navigationHandlers).map(([name, handler]) => (
            <button key={name} className={`menu-item ${name === "Messages" ? "active" : ""}`} onClick={handler}>
              <span className="menu-icon">
                {name === "Dashboard" && "🏠"}
                {name === "Appointments" && "📅"}
                {name === "Medical Records" && "📋"}
                {name === "Lab Reports" && "🔬"}
                {name === "Messages" && "✉️"}
                {name === "Prescriptions" && "💊"}
              </span>
              <span>{name}</span>
            </button>
          ))}
          <button className="menu-item logout" onClick={handleLogout}>
            <span className="menu-icon">🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </nav>

      <main className="main-content">
        <div className="page-header messages-page-header">
          <div className="header-content">
            <h1>Messages</h1>
            <p>Communicate directly with your healthcare providers</p>
          </div>
          <button className="new-message-btn" onClick={() => setShowNewMessageForm(true)}>
            <span className="btn-icon">✉️</span> New Message
          </button>
        </div>

        <div className="chat-container">
          <div className="conversations-panel">
            <div className="conversations-header">
              <h3>Conversations</h3>
              <div className="conversation-search">
                <input type="text" placeholder="Search..." />
                <span className="search-icon">🔍</span>
              </div>
            </div>

            <div className="conversations-list">
              {conversations.length > 0 ? (
                conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`conversation-item ${
                      activeConversation && activeConversation.id === conversation.id ? "active" : ""
                    } ${conversation.unreadCount > 0 ? "unread" : ""}`}
                    onClick={() => selectConversation(conversation)}
                  >
                    <div className="conversation-avatar">
                      <img
                        src={conversation.participantImage || "/api/placeholder/40/40"}
                        alt={conversation.participantName}
                      />
                      <span className={`status-indicator ${Math.random() > 0.5 ? "online" : "offline"}`}></span>
                    </div>

                    <div className="conversation-info">
                      <div className="conversation-header">
                        <h4>{conversation.participantName}</h4>
                        <span className="conversation-time">
                          {formatConversationDate(conversation.lastMessageTime)}
                        </span>
                      </div>
                      <p className="conversation-specialty">{conversation.participantSpecialization}</p>
                      <p className="conversation-preview">{conversation.lastMessage}</p>
                    </div>

                    {conversation.unreadCount > 0 && <div className="unread-badge">{conversation.unreadCount}</div>}
                  </div>
                ))
              ) : (
                <div className="no-conversations">
                  <div className="empty-state">
                    <div className="empty-icon">✉️</div>
                    <h3>No conversations yet</h3>
                    <p>Start a conversation with your doctor</p>
                    <button className="action-button primary-button" onClick={() => setShowNewMessageForm(true)}>
                      New Message
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="messages-panel">
            {activeConversation ? (
              <>
                <div className="messages-header">
                  <div className="active-conversation-info">
                    <img
                      src={activeConversation.participantImage || "/api/placeholder/40/40"}
                      alt={activeConversation.participantName}
                      className="doctor-avatar"
                    />
                    <div>
                      <h3>Dr. {activeConversation.participantName}</h3>
                      <p>{activeConversation.participantSpecialization || "Doctor"}</p>
                    </div>
                  </div>
                  <div className="conversation-actions">
                    <button className="action-icon-btn">
                      <span className="action-icon">📞</span>
                    </button>
                    <button className="action-icon-btn">
                      <span className="action-icon">📹</span>
                    </button>
                    <button className="action-icon-btn">
                      <span className="action-icon">⋮</span>
                    </button>
                  </div>
                </div>

                <div className="messages-body">
                  {messages.length > 0 ? (
                    <div className="messages-list">
                      {messages.map((msg, index) => {
                        // Check if we need to show date separator
                        const showDateSeparator =
                          index === 0 ||
                          new Date(msg.timestamp).toDateString() !==
                            new Date(messages[index - 1].timestamp).toDateString()

                        return (
                          <div key={msg.id} className="message-container">
                            {showDateSeparator && (
                              <div className="date-separator">
                                <span>{new Date(msg.timestamp).toLocaleDateString()}</span>
                              </div>
                            )}
                            <div className={`message ${msg.senderType === "patient" ? "outgoing" : "incoming"}`}>
                              {msg.senderType === "doctor" && (
                                <img
                                  src={activeConversation.participantImage || "/api/placeholder/30/30"}
                                  alt="Doctor"
                                  className="message-avatar"
                                />
                              )}
                              <div className="message-bubble">
                                <p className="message-text">{msg.content}</p>
                                <span className="message-time">{formatMessageTime(msg.timestamp)}</span>
                              </div>
                            </div>
                          </div>
                        )
                      })}

                      {isTyping && (
                        <div className="message incoming">
                          <img
                            src={activeConversation.participantImage || "/api/placeholder/30/30"}
                            alt="Doctor"
                            className="message-avatar"
                          />
                          <div className="message-bubble typing-indicator">
                            <span></span>
                            <span></span>
                            <span></span>
                          </div>
                        </div>
                      )}

                      <div ref={messagesEndRef} />
                    </div>
                  ) : (
                    <div className="no-messages">
                      <div className="empty-state">
                        <div className="empty-icon">💬</div>
                        <h3>No messages yet</h3>
                        <p>Send a message to start the conversation</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="messages-footer">
                  <form onSubmit={handleSendMessage} className="message-form">
                    <div className="message-input-container">
                      <button type="button" className="attachment-btn">
                        <span className="attachment-icon">📎</span>
                      </button>
                      <input
                        type="text"
                        placeholder="Type a message..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="message-input"
                      />
                      <button type="button" className="emoji-btn">
                        <span className="emoji-icon">😊</span>
                      </button>
                    </div>
                    <button type="submit" className="send-button" disabled={!message.trim()}>
                      <span className="send-icon">📤</span>
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="no-active-conversation">
                <div className="empty-state">
                  <div className="empty-icon">💬</div>
                  <h3>Select a Conversation</h3>
                  <p>Choose a conversation from the list or start a new one</p>
                  <button className="action-button primary-button" onClick={() => setShowNewMessageForm(true)}>
                    New Message
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {showNewMessageForm && (
          <div className="modal-overlay">
            <div className="modal-content message-modal">
              <div className="modal-header">
                <h2>New Message</h2>
                <button className="close-button" onClick={() => setShowNewMessageForm(false)}>
                  ✕
                </button>
              </div>
              <form onSubmit={handleStartNewConversation} className="new-message-form">
                <div className="form-group">
                  <label htmlFor="doctorId">Select Doctor</label>
                  <select
                    id="doctorId"
                    name="doctorId"
                    value={newMessageData.doctorId}
                    onChange={handleNewMessageChange}
                    required
                    className="form-select"
                  >
                    <option value="">Select a doctor</option>
                    {doctors.map((doctor) => (
                      <option key={doctor.id} value={doctor.id}>
                        Dr. {doctor.name} - {doctor.specialization}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="subject">Subject</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={newMessageData.subject}
                    onChange={handleNewMessageChange}
                    placeholder="Enter subject"
                    required
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="message">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    value={newMessageData.message}
                    onChange={handleNewMessageChange}
                    rows="4"
                    placeholder="Type your message here..."
                    required
                    className="form-textarea"
                  ></textarea>
                </div>
                <div className="form-actions">
                  <button
                    type="button"
                    className="action-button secondary-button"
                    onClick={() => setShowNewMessageForm(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="action-button primary-button">
                    Send Message
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default Messages

