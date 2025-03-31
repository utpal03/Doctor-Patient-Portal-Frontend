"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import "../../../../Styles/DashboardStyles.css"
import "../../../../Styles/PatientPages.css"

const Prescriptions = () => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [medications, setMedications] = useState([])
  const [patientInfo, setPatientInfo] = useState(null)
  const [error, setError] = useState(null)
  const [selectedMedication, setSelectedMedication] = useState(null)
  const [filter, setFilter] = useState("active")
  const [searchTerm, setSearchTerm] = useState("")
  const [showSchedule, setShowSchedule] = useState(false)
  const [scheduleData, setScheduleData] = useState(null)

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
        const [patientResponse, medicationsResponse] = await Promise.all([
          fetch("/patientInfo", { headers }),
          fetch("/medications", { headers }),
        ])

        // Parse JSON responses
        const [patientData, medicationsData] = await Promise.all([patientResponse.json(), medicationsResponse.json()])

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

        // Set medications
        setMedications(Array.isArray(medicationsData) ? medicationsData : [])
      } catch (err) {
        console.error("Error fetching data:", err)
        setError(err.message)
        setMedications([])
        setPatientInfo(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

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

  const openMedicationDetails = (medication) => {
    setSelectedMedication(medication)
  }

  const closeMedicationDetails = () => {
    setSelectedMedication(null)
  }

  const requestRefill = async (medicationId) => {
    try {
      const token = localStorage.getItem("token")
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      }

      // In a real app, you would send this to your backend
      const response = await fetch(`/medications/${medicationId}/refill`, {
        method: "POST",
        headers,
      })

      if (response.ok) {
        // Update the medication status locally
        setMedications(medications.map((med) => (med.id === medicationId ? { ...med, refillRequested: true } : med)))

        // If the selected medication is the one being refilled, update it too
        if (selectedMedication && selectedMedication.id === medicationId) {
          setSelectedMedication({ ...selectedMedication, refillRequested: true })
        }
      } else {
        throw new Error("Failed to request refill")
      }
    } catch (err) {
      console.error("Error requesting refill:", err)
      // In a real app, you would show an error message to the user
    }
  }

  const viewMedicationSchedule = (medication) => {
    // Create a schedule for the medication
    const today = new Date()
    const schedule = []

    // Parse frequency to create a schedule
    const frequencyParts = medication.frequency.toLowerCase()
    let timesPerDay = 1

    if (frequencyParts.includes("twice") || frequencyParts.includes("2 times")) {
      timesPerDay = 2
    } else if (frequencyParts.includes("three times") || frequencyParts.includes("3 times")) {
      timesPerDay = 3
    } else if (frequencyParts.includes("four times") || frequencyParts.includes("4 times")) {
      timesPerDay = 4
    }

    // Create times based on frequency
    const times = []
    if (timesPerDay === 1) {
      times.push("09:00 AM")
    } else if (timesPerDay === 2) {
      times.push("09:00 AM", "09:00 PM")
    } else if (timesPerDay === 3) {
      times.push("09:00 AM", "03:00 PM", "09:00 PM")
    } else if (timesPerDay === 4) {
      times.push("09:00 AM", "01:00 PM", "05:00 PM", "09:00 PM")
    }

    // Create a 7-day schedule
    for (let i = 0; i < 7; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() + i)

      const daySchedule = {
        date: date.toISOString().split("T")[0],
        dayName: date.toLocaleDateString("en-US", { weekday: "long" }),
        doses: times.map((time) => ({
          time,
          taken: i === 0 && Math.random() > 0.5, // Randomly mark some as taken for today
        })),
      }

      schedule.push(daySchedule)
    }

    setScheduleData({
      medication,
      schedule,
    })

    setShowSchedule(true)
  }

  const markDoseAsTaken = (dateIndex, doseIndex) => {
    const updatedSchedule = [...scheduleData.schedule]
    updatedSchedule[dateIndex].doses[doseIndex].taken = true

    setScheduleData({
      ...scheduleData,
      schedule: updatedSchedule,
    })
  }

  // Filter and search medications
  const filteredMedications = medications.filter((medication) => {
    // Filter by status
    const statusMatch =
      (filter === "active" && medication.status === "active") ||
      (filter === "completed" && medication.status === "completed") ||
      (filter === "refill" && medication.refillRequested)

    // Filter by search term
    const searchMatch =
      searchTerm === "" ||
      medication.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medication.prescribedBy.toLowerCase().includes(searchTerm.toLowerCase())

    return statusMatch && searchMatch
  })

  // Calculate statistics
  const medicationStats = {
    active: medications.filter((m) => m.status === "active").length,
    completed: medications.filter((m) => m.status === "completed").length,
    refillRequested: medications.filter((m) => m.refillRequested).length,
    refillSoon: medications.filter((m) => m.status === "active" && m.timeLeft && Number.parseInt(m.timeLeft) <= 7)
      .length,
  }

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading your prescriptions...</p>
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
        <p>Error loading prescriptions: {error}</p>
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
            <button key={name} className={`menu-item ${name === "Prescriptions" ? "active" : ""}`} onClick={handler}>
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
        <div className="page-header prescriptions-header">
          <div className="header-content">
            <h1>My Prescriptions</h1>
            <p>Manage your medications and request refills</p>
          </div>
        </div>

        <div className="prescription-stats-container">
          <div className="prescription-stat-card">
            <div className="stat-icon active-icon">💊</div>
            <div className="stat-content">
              <h3>Active Medications</h3>
              <p className="stat-number">{medicationStats.active}</p>
              <p className="stat-label">Current Prescriptions</p>
            </div>
          </div>

          <div className="prescription-stat-card">
            <div className="stat-icon refill-icon">🔄</div>
            <div className="stat-content">
              <h3>Refill Soon</h3>
              <p className="stat-number">{medicationStats.refillSoon}</p>
              <p className="stat-label">Within 7 Days</p>
            </div>
          </div>

          <div className="prescription-stat-card">
            <div className="stat-icon requested-icon">📩</div>
            <div className="stat-content">
              <h3>Refill Requested</h3>
              <p className="stat-number">{medicationStats.refillRequested}</p>
              <p className="stat-label">Awaiting Approval</p>
            </div>
          </div>

          <div className="prescription-stat-card">
            <div className="stat-icon completed-icon">✓</div>
            <div className="stat-content">
              <h3>Completed</h3>
              <p className="stat-number">{medicationStats.completed}</p>
              <p className="stat-label">Past Medications</p>
            </div>
          </div>
        </div>

        <div className="prescriptions-controls">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search medications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>

          <div className="filter-tabs">
            <button className={`filter-tab ${filter === "active" ? "active" : ""}`} onClick={() => setFilter("active")}>
              Active
            </button>
            <button className={`filter-tab ${filter === "refill" ? "active" : ""}`} onClick={() => setFilter("refill")}>
              Refill Requested
            </button>
            <button
              className={`filter-tab ${filter === "completed" ? "active" : ""}`}
              onClick={() => setFilter("completed")}
            >
              Completed
            </button>
          </div>
        </div>

        <div className="medications-grid">
          {filteredMedications.length > 0 ? (
            filteredMedications.map((medication) => (
              <div key={medication.id || Math.random()} className={`medication-card ${medication.status}`}>
                <div className="medication-header">
                  <div className="medication-icon">💊</div>
                  {medication.refillRequested && <div className="refill-badge">Refill Requested</div>}
                  {!medication.refillRequested &&
                    medication.status === "active" &&
                    Number.parseInt(medication.timeLeft) <= 7 && <div className="refill-soon-badge">Refill Soon</div>}
                </div>

                <div className="medication-body">
                  <h3 className="medication-name">{medication.name}</h3>
                  <p className="medication-prescribed">
                    Prescribed by Dr. {medication.prescribedBy} on {medication.prescribedDate}
                  </p>

                  <div className="medication-details">
                    <div className="detail-row">
                      <div className="detail-item">
                        <span className="detail-icon">💉</span>
                        <div className="detail-text">
                          <span className="detail-label">Dosage</span>
                          <span className="detail-value">{medication.dosage}</span>
                        </div>
                      </div>

                      <div className="detail-item">
                        <span className="detail-icon">🕒</span>
                        <div className="detail-text">
                          <span className="detail-label">Frequency</span>
                          <span className="detail-value">{medication.frequency}</span>
                        </div>
                      </div>
                    </div>

                    {medication.status === "active" && (
                      <div className="refill-info">
                        <div className="refill-label">Refill in:</div>
                        <div className="refill-countdown">
                          <div className="countdown-value">{medication.timeLeft}</div>
                          <div className="countdown-unit">days</div>
                        </div>
                        <div className="refill-progress">
                          <div
                            className="progress-bar"
                            style={{
                              width: `${Math.min(100, 100 - (Number.parseInt(medication.timeLeft) / 30) * 100)}%`,
                              backgroundColor:
                                Number.parseInt(medication.timeLeft) <= 7
                                  ? "var(--warning-color)"
                                  : "var(--primary-color)",
                            }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="medication-footer">
                  <button className="action-button primary-button" onClick={() => openMedicationDetails(medication)}>
                    View Details
                  </button>

                  {medication.status === "active" && !medication.refillRequested && (
                    <button className="action-button secondary-button" onClick={() => requestRefill(medication.id)}>
                      Request Refill
                    </button>
                  )}

                  {medication.status === "active" && (
                    <button
                      className="action-button schedule-button"
                      onClick={() => viewMedicationSchedule(medication)}
                    >
                      <span className="schedule-icon">📅</span>
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="no-data-container">
              <div className="no-data-icon">💊</div>
              <h3>No {filter} medications found</h3>
              <p>Your prescriptions will appear here once they are added by your doctor</p>
            </div>
          )}
        </div>

        {selectedMedication && (
          <div className="modal-overlay">
            <div className="modal-content medication-detail-modal">
              <div className="modal-header">
                <h2>{selectedMedication.name}</h2>
                <button className="close-button" onClick={closeMedicationDetails}>
                  ✕
                </button>
              </div>
              <div className="modal-body">
                <div className="medication-details">
                  <div className="medication-detail-header">
                    <div className="medication-meta">
                      <div className={`medication-status-badge ${selectedMedication.status}`}>
                        {selectedMedication.status}
                      </div>
                      <p className="medication-date-time">Prescribed on {selectedMedication.prescribedDate}</p>
                      <p className="medication-provider">
                        <span className="provider-label">Prescribed by:</span>
                        Dr. {selectedMedication.prescribedBy}
                      </p>
                    </div>
                  </div>

                  <div className="medication-detail-content">
                    <div className="medication-section">
                      <h4>Dosage Information</h4>
                      <div className="section-content">
                        <div className="medication-info-grid">
                          <div className="medication-info-item">
                            <span className="info-icon">💊</span>
                            <div className="info-content">
                              <span className="info-label">Dosage:</span>
                              <span className="info-value">{selectedMedication.dosage}</span>
                            </div>
                          </div>
                          <div className="medication-info-item">
                            <span className="info-icon">🕒</span>
                            <div className="info-content">
                              <span className="info-label">Frequency:</span>
                              <span className="info-value">{selectedMedication.frequency}</span>
                            </div>
                          </div>
                          <div className="medication-info-item">
                            <span className="info-icon">📆</span>
                            <div className="info-content">
                              <span className="info-label">Duration:</span>
                              <span className="info-value">{selectedMedication.duration || "As directed"}</span>
                            </div>
                          </div>
                          {selectedMedication.status === "active" && (
                            <div className="medication-info-item">
                              <span className="info-icon">🔄</span>
                              <div className="info-content">
                                <span className="info-label">Refill in:</span>
                                <span className="info-value">{selectedMedication.timeLeft || "N/A"} days</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {selectedMedication.instructions && (
                      <div className="medication-section">
                        <h4>Instructions</h4>
                        <div className="section-content instructions-content">
                          <p>{selectedMedication.instructions}</p>
                        </div>
                      </div>
                    )}

                    {selectedMedication.sideEffects && (
                      <div className="medication-section">
                        <h4>Possible Side Effects</h4>
                        <div className="section-content side-effects-content">
                          <ul className="side-effects-list">
                            {selectedMedication.sideEffects.split(", ").map((effect, index) => (
                              <li key={index}>{effect}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                    {selectedMedication.warnings && (
                      <div className="medication-section warning-section">
                        <h4>Warnings</h4>
                        <div className="section-content warnings-content">
                          <div className="warning-icon">⚠️</div>
                          <p>{selectedMedication.warnings}</p>
                        </div>
                      </div>
                    )}

                    {selectedMedication.refillHistory && selectedMedication.refillHistory.length > 0 && (
                      <div className="medication-section">
                        <h4>Refill History</h4>
                        <div className="section-content">
                          <div className="refill-history-table">
                            <div className="refill-table-header">
                              <div className="refill-date">Date</div>
                              <div className="refill-quantity">Quantity</div>
                              <div className="refill-pharmacy">Pharmacy</div>
                            </div>
                            {selectedMedication.refillHistory.map((refill, index) => (
                              <div key={index} className="refill-table-row">
                                <div className="refill-date">{refill.date}</div>
                                <div className="refill-quantity">{refill.quantity}</div>
                                <div className="refill-pharmacy">{refill.pharmacy}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="action-button secondary-button" onClick={closeMedicationDetails}>
                  Close
                </button>
                {selectedMedication.status === "active" && !selectedMedication.refillRequested && (
                  <button
                    className="action-button primary-button"
                    onClick={() => {
                      requestRefill(selectedMedication.id)
                    }}
                  >
                    Request Refill
                  </button>
                )}
                {selectedMedication.refillRequested && <div className="refill-badge large">Refill Requested</div>}
              </div>
            </div>
          </div>
        )}

        {showSchedule && scheduleData && (
          <div className="modal-overlay">
            <div className="modal-content schedule-modal">
              <div className="modal-header">
                <h2>Medication Schedule: {scheduleData.medication.name}</h2>
                <button className="close-button" onClick={() => setShowSchedule(false)}>
                  ✕
                </button>
              </div>
              <div className="modal-body">
                <div className="schedule-details">
                  <div className="schedule-info">
                    <p>
                      <strong>Medication:</strong> {scheduleData.medication.name}
                    </p>
                    <p>
                      <strong>Dosage:</strong> {scheduleData.medication.dosage}
                    </p>
                    <p>
                      <strong>Frequency:</strong> {scheduleData.medication.frequency}
                    </p>
                  </div>

                  <div className="schedule-calendar">
                    {scheduleData.schedule.map((day, dayIndex) => (
                      <div key={dayIndex} className={`schedule-day ${dayIndex === 0 ? "today" : ""}`}>
                        <div className="day-header">
                          <div className="day-name">{day.dayName}</div>
                          <div className="day-date">
                            {new Date(day.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </div>
                        </div>
                        <div className="day-doses">
                          {day.doses.map((dose, doseIndex) => (
                            <div key={doseIndex} className={`dose-item ${dose.taken ? "taken" : ""}`}>
                              <div className="dose-time">{dose.time}</div>
                              {dose.taken ? (
                                <div className="dose-status taken">
                                  <span className="status-icon">✓</span>
                                  <span className="status-text">Taken</span>
                                </div>
                              ) : (
                                <button
                                  className="dose-button"
                                  onClick={() => markDoseAsTaken(dayIndex, doseIndex)}
                                  disabled={dayIndex > 0}
                                >
                                  Mark as Taken
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="schedule-adherence">
                    <h4>Medication Adherence</h4>
                    <div className="adherence-stats">
                      <div className="adherence-stat">
                        <div className="adherence-value">
                          {Math.round(
                            (scheduleData.schedule[0].doses.filter((d) => d.taken).length /
                              scheduleData.schedule[0].doses.length) *
                              100,
                          )}
                          %
                        </div>
                        <div className="adherence-label">Today</div>
                      </div>
                      <div className="adherence-stat">
                        <div className="adherence-value">92%</div>
                        <div className="adherence-label">This Week</div>
                      </div>
                      <div className="adherence-stat">
                        <div className="adherence-value">88%</div>
                        <div className="adherence-label">This Month</div>
                      </div>
                    </div>
                    <div className="adherence-progress">
                      <div className="progress-label">Overall Adherence</div>
                      <div className="progress-bar-container">
                        <div className="progress-bar" style={{ width: "88%" }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="action-button secondary-button" onClick={() => setShowSchedule(false)}>
                  Close
                </button>
                <button className="action-button primary-button">Set Reminders</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default Prescriptions

