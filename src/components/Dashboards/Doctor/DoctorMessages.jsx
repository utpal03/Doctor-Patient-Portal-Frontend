"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import "../../../Styles/DashboardStyles.css"
import "../../../Styles/PatientPages.css"

const DoctorMessages = () => {
  const navigate = useNavigate()
  const [conversations, setConversations] = useState([])
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [showSidebar, setShowSidebar] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef(null)
  const [doctorInfo, setDoctorInfo] = useState(null)

  // Fetch doctor info and conversations
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const token = localStorage.getItem("token")
        const loggedInDoctorId = Number(localStorage.getItem("id"))

        if (!token) {
          throw new Error("No authentication token found")
        }

        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        }

        // Match API endpoints with those used in DoctorDashboard
        const [conversationsResponse, doctorResponse] = await Promise.all([
          fetch("/doctor/messages", { headers }),
          fetch("/doctorInfo", { headers }),
        ])

        // Check for response errors
        if (!conversationsResponse.ok) {
          throw new Error(`Failed to fetch conversations: ${conversationsResponse.status}`)
        }
        if (!doctorResponse.ok) {
          throw new Error(`Failed to fetch doctor info: ${doctorResponse.status}`)
        }

        const conversationsData = await conversationsResponse.json()
        const doctorData = await doctorResponse.json()

        // Handle conversations data
        if (Array.isArray(conversationsData)) {
          setConversations(conversationsData)
          // Select the first conversation by default if available
          if (conversationsData.length > 0 && !selectedConversation) {
            setSelectedConversation(conversationsData[0])
          }
        } else {
          console.warn("Invalid conversations data format:", conversationsData)
          setConversations([])
        }

        // Handle doctor data
        if (Array.isArray(doctorData) && doctorData.length > 0) {
          const foundDoctor = doctorData.find((doctor) => doctor.id === loggedInDoctorId)
          if (foundDoctor) {
            setDoctorInfo(foundDoctor)
          } else {
            console.warn(`Doctor with ID ${loggedInDoctorId} not found in:`, doctorData)
            // Use first doctor as fallback
            setDoctorInfo(doctorData[0])
          }
        } else {
          console.warn("Invalid doctor data format:", doctorData)
          setDoctorInfo(null)
        }
      } catch (err) {
        console.error("Error fetching data:", err)
        setError(err.message)
        setConversations([])
        setDoctorInfo(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()

    // Set up real-time updates with error handling
    const updateInterval = setInterval(() => {
      fetchData().catch((err) => {
        console.error("Error in update interval:", err)
      })
    }, 30000) // Update every 30 seconds

    return () => clearInterval(updateInterval)
  }, [])

  // Fetch messages for selected conversation
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedConversation) return

      try {
        const token = localStorage.getItem("token")

        if (!token) {
          throw new Error("No authentication token found")
        }

        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        }

        const response = await fetch(`/doctor/conversation/${selectedConversation.id}`, { headers })

        if (!response.ok) {
          throw new Error(`Failed to fetch messages: ${response.status}`)
        }

        const data = await response.json()

        if (Array.isArray(data)) {
          setMessages(data)
        } else {
          console.warn("Invalid messages data format:", data)
          setMessages([])
        }
      } catch (err) {
        console.error("Error fetching messages:", err)
        setError(err.message)
        setMessages([])
      }
    }

    if (selectedConversation) {
      fetchMessages()

      // Set up real-time updates for messages with error handling
      const messagesUpdateInterval = setInterval(() => {
        fetchMessages().catch((err) => {
          console.error("Error in messages update interval:", err)
        })
      }, 5000) // Update every 5 seconds

      return () => clearInterval(messagesUpdateInterval)
    }
  }, [selectedConversation])

  // Scroll to bottom of messages when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("userType")
    localStorage.removeItem("id")
    navigate("/login")
  }

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar)
  }

  const selectConversation = (conversation) => {
    setSelectedConversation(conversation)
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return

    try {
      setIsSending(true)
      const token = localStorage.getItem("token")

      if (!token) {
        throw new Error("No authentication token found")
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      }

      const response = await fetch(`/doctor/sendMessage`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          conversationId: selectedConversation.id,
          content: newMessage,
          senderType: "doctor",
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.status}`)
      }

      // Add the new message to the current messages
      const sentMessage = await response.json()
      setMessages((prevMessages) => [...prevMessages, sentMessage])

      // Clear the input
      setNewMessage("")
    } catch (err) {
      console.error("Error sending message:", err)
      setError(err.message)
    } finally {
      setIsSending(false)
    }
  }

  // Filter conversations based on search term
  const filteredConversations = conversations.filter((conversation) => {
    if (!searchTerm) return true

    const term = searchTerm.toLowerCase()
    return (
      conversation.patientName?.toLowerCase().includes(term) ||
      (conversation.lastMessage && conversation.lastMessage.toLowerCase().includes(term))
    )
  })

  // Navigation handlers - match with DoctorDashboard
  const navigationHandlers = {
    Dashboard: () => navigate("/doctor/dashboard"),
    Appointments: () => navigate("/doctor/appointments"),
    Patients: () => navigate("/doctor/patients"),
    Schedule: () => navigate("/doctor/schedule"),
    Messages: () => navigate("/doctor/messages"),
    Profile: () => navigate("/update/profile"),
  }

  // Loading state with fallback data
  if (isLoading && conversations.length === 0) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading messages...</p>
      </div>
    )
  }

  // Error state with retry button
  if (error && conversations.length === 0) {
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
      {/* Hamburger Menu for Mobile */}
      <div className={`hamburger-menu ${!showSidebar ? "sidebar-hidden" : ""}`} onClick={toggleSidebar}>
        <span></span>
        <span></span>
        <span></span>
      </div>

      {/* Sidebar */}
      <nav className={`sidebar ${!showSidebar ? "hidden" : ""}`}>
        <div className="profile-section">
          {doctorInfo ? (
            <>
              <img src={doctorInfo.image || "/api/placeholder/80/80"} alt="Doctor" className="avatar" />
              <h3>{doctorInfo.name || "Doctor Name"}</h3>
              <p>Doctor ID: {doctorInfo.id || "N/A"}</p>
              <div className="quick-info">
                <span>{doctorInfo.department || "Specialization N/A"}</span>
                <br />
                <span>{doctorInfo.experience || "0"} years experience</span>
              </div>
            </>
          ) : (
            <p>Loading doctor info...</p>
          )}
        </div>

        <div className="nav-menu">
          {Object.entries(navigationHandlers).map(([name, handler]) => (
            <button key={name} className={`menu-item ${name === "Messages" ? "active" : ""}`} onClick={handler}>
              <span className="menu-icon">
                {name === "Dashboard" && "🏠"}
                {name === "Appointments" && "📅"}
                {name === "Patients" && "👥"}
                {name === "Schedule" && "⏰"}
                {name === "Profile" && "👤"}
                {name === "Messages" && "✉️"}
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

      {/* Main Content */}
      <main className={`main-content ${!showSidebar ? "expanded" : ""}`}>
        <div className="messages-container">
          {/* Conversations List */}
          <div className="conversations-sidebar">
            <div className="conversations-header">
              <h2>Messages</h2>
              <div className="search-container">
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
                <span className="search-icon">🔍</span>
              </div>
            </div>

            <div className="conversations-list">
              {filteredConversations.length > 0 ? (
                filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id || Math.random()}
                    className={`conversation-item ${selectedConversation && selectedConversation.id === conversation.id ? "active" : ""}`}
                    onClick={() => selectConversation(conversation)}
                  >
                    <img
                      src={conversation.patientImage || "/api/placeholder/50/50"}
                      alt={conversation.patientName || "Patient"}
                      className="conversation-avatar"
                    />
                    <div className="conversation-info">
                      <div className="conversation-header">
                        <h3>{conversation.patientName || "Patient"}</h3>
                        <span className="conversation-time">{conversation.lastMessageTime || "N/A"}</span>
                      </div>
                      <p className="conversation-preview">{conversation.lastMessage || "No messages yet"}</p>
                      {conversation.unreadCount > 0 && <span className="unread-badge">{conversation.unreadCount}</span>}
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-conversations-message">
                  <p>{searchTerm ? "No conversations found" : "No conversations yet"}</p>
                  {searchTerm && (
                    <button className="clear-search-btn" onClick={() => setSearchTerm("")}>
                      Clear Search
                    </button>
                  )}
                </div>
              )}
            </div>

            <button className="new-conversation-btn" onClick={() => navigate("/doctor/new-conversation")}>
              + New Conversation
            </button>
          </div>

          {/* Messages Area */}
          <div className="messages-area">
            {selectedConversation ? (
              <>
                <div className="messages-header">
                  <div className="selected-conversation-info">
                    <img
                      src={selectedConversation.patientImage || "/api/placeholder/40/40"}
                      alt={selectedConversation.patientName || "Patient"}
                      className="conversation-avatar"
                    />
                    <div>
                      <h3>{selectedConversation.patientName || "Patient"}</h3>
                      <p>Patient ID: {selectedConversation.patientId || "N/A"}</p>
                    </div>
                  </div>
                  <div className="messages-actions">
                    <button
                      className="view-patient-btn"
                      onClick={() => navigate(`/doctor/patients/${selectedConversation.patientId}`)}
                    >
                      View Patient
                    </button>
                  </div>
                </div>

                <div className="messages-content">
                  {messages.length > 0 ? (
                    <div className="messages-list">
                      {messages.map((message, index) => (
                        <div
                          key={message.id || index}
                          className={`message-bubble ${message.senderType === "doctor" ? "sent" : "received"}`}
                        >
                          <div className="message-content">
                            <p>{message.content || "Empty message"}</p>
                            <span className="message-time">{message.time || "N/A"}</span>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  ) : (
                    <div className="no-messages-placeholder">
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  )}
                </div>

                <div className="message-input-area">
                  <textarea
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        sendMessage()
                      }
                    }}
                    className="message-input"
                  />
                  <button className="send-message-btn" onClick={sendMessage} disabled={isSending || !newMessage.trim()}>
                    {isSending ? "Sending..." : "Send"}
                  </button>
                </div>
              </>
            ) : (
              <div className="no-conversation-selected">
                <p>Select a conversation to start messaging</p>
                {conversations.length === 0 && (
                  <button className="start-conversation-btn" onClick={() => navigate("/doctor/new-conversation")}>
                    Start a New Conversation
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default DoctorMessages

