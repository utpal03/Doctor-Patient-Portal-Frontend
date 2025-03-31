"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import "../../../Styles/DashboardStyles.css"

const DoctorDashboard = () => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [appointments, setAppointments] = useState([])
  const [medications, setMedications] = useState([])
  const [reports, setReports] = useState([])
  const [doctorInfo, setDoctorInfo] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchDoctorData = async () => {
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

        // Fetch all data in parallel
        const [doctorResponse, appointmentsResponse, medicationsResponse, reportsResponse] = await Promise.all([
          fetch("/doctorInfo", { headers }),
          fetch("/doctorAppointments", { headers }),
          fetch("/prescribedMedications", { headers }),
          fetch("/patientReports", { headers }),
        ])

        // Parse JSON responses
        const [doctorData, appointmentsData, medicationsData, reportsData] = await Promise.all([
          doctorResponse.json(),
          appointmentsResponse.json(),
          medicationsResponse.json(),
          reportsResponse.json(),
        ])

        // Handle doctor data
        if (Array.isArray(doctorData) && doctorData.length > 0) {
          const foundDoctor = doctorData.find((doctor) => doctor.id === loggedInDoctorId)
          if (foundDoctor) {
            setDoctorInfo(foundDoctor)
          } else {
            throw new Error(`Doctor with ID ${loggedInDoctorId} not found`)
          }
        } else {
          throw new Error("Invalid doctor data format")
        }

        // Ensure other data is valid
        setAppointments(Array.isArray(appointmentsData) ? appointmentsData : [])
        setMedications(Array.isArray(medicationsData) ? medicationsData : [])
        setReports(Array.isArray(reportsData) ? reportsData : [])
      } catch (err) {
        console.error("Error fetching doctor data:", err)
        setError(err.message)
        setAppointments([])
        setMedications([])
        setReports([])
        setDoctorInfo(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDoctorData()
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("userType")
    navigate("/login")
  }

  // Navigation handlers for doctor dashboard
  const navigationHandlers = {
    Dashboard: () => navigate("/doctor/dashboard"),
    Appointments: () => navigate("/doctor/appointments"),
    Patients: () => navigate("/doctor/patients"),
    "Medical Records": () => navigate("/doctor/medical-records"),
    Prescriptions: () => navigate("/doctor/prescriptions"),
    Messages: () => navigate("/doctor/messages"),
  }

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading your dashboard...</p>
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
        <p>Error loading dashboard: {error}</p>
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

  // Get today's appointments
  const todayAppointments = appointments.filter(
    (app) => new Date(app.date).toDateString() === new Date().toDateString(),
  )

  return (
    <div className="dashboard-container">
      <nav className="sidebar">
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
            <p>Unable to load doctor info</p>
          )}
        </div>

        <div className="nav-menu">
          {Object.entries(navigationHandlers).map(([name, handler]) => (
            <button key={name} className={`menu-item ${name === "Dashboard" ? "active" : ""}`} onClick={handler}>
              <span className="menu-icon">
                {name === "Dashboard" && "🏠"}
                {name === "Appointments" && "📅"}
                {name === "Patients" && "👥"}
                {name === "Medical Records" && "📋"}
                {name === "Prescriptions" && "💊"}
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

      <main className="main-content">
        <header className="dashboard-header">
          <h1>Doctor Dashboard</h1>
          <div className="health-summary">
            <div className="health-card">
              <h3>
                <span className="card-icon">📅</span>
                Today's Appointments
              </h3>
              <p className="stat">{todayAppointments.length}</p>
              <p className="stat-label">Patients Today</p>
              {todayAppointments.length > 0 && (
                <div className="next-appointment">
                  <p className="time">Next: {todayAppointments[0].time || "Time N/A"}</p>
                  <p className="patient">with {todayAppointments[0].patientName || "Patient N/A"}</p>
                </div>
              )}
            </div>
            <div className="health-card">
              <h3>
                <span className="card-icon">💊</span>
                Active Prescriptions
              </h3>
              <p className="stat">{medications.length}</p>
              <p className="stat-label">Current Prescriptions</p>
            </div>
            <div className="health-card">
              <h3>
                <span className="card-icon">📋</span>
                Pending Reports
              </h3>
              <p className="stat">{reports.filter((r) => r.status === "pending").length}</p>
              <p className="stat-label">Awaiting Review</p>
            </div>
          </div>
        </header>

        <section className="dashboard-section">
          <div className="section-header">
            <h2>Upcoming Appointments</h2>
            <button className="view-all-btn" onClick={() => navigate("/doctor/appointments")}>
              View All
            </button>
          </div>
          <div className="cards-grid">
            {appointments.length > 0 ? (
              appointments.slice(0, 3).map((appointment) => (
                <div key={appointment.id || Math.random()} className="dashboard-card">
                  <div className="person-info">
                    <img
                      src={appointment.patientImage || "/api/placeholder/80/80"}
                      alt={appointment.patientName || "Patient"}
                      className="person-image"
                    />
                    <div>
                      <h4>{appointment.patientName || "Patient Name"}</h4>
                      <p className="person-details">ID: {appointment.patientId || "N/A"}</p>
                    </div>
                  </div>
                  <div className="card-details">
                    <div className="detail-item">
                      <span className="detail-label">Date:</span>
                      <span className="detail-value">{appointment.date || "N/A"}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Time:</span>
                      <span className="detail-value">{appointment.time || "N/A"}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Location:</span>
                      <span className="detail-value">{appointment.location || "N/A"}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Reason:</span>
                      <span className="detail-value">{appointment.reason || "N/A"}</span>
                    </div>
                  </div>
                  <div className="card-actions">
                    <div className={`status-badge ${appointment.status || "pending"}`}>
                      {appointment.status || "Pending"}
                    </div>
                    <div>
                      <button
                        className="action-button primary-button"
                        onClick={() => {
                          console.log("Complete appointment:", appointment.id)
                        }}
                      >
                        Complete
                      </button>
                      <button
                        className="action-button secondary-button"
                        style={{ marginLeft: "8px" }}
                        onClick={() => {
                          console.log("Reschedule appointment:", appointment.id)
                        }}
                      >
                        Reschedule
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-data-message">No upcoming appointments</p>
            )}
          </div>
        </section>

        <section className="dashboard-section">
          <div className="section-header">
            <h2>Recent Patients</h2>
            <button className="view-all-btn" onClick={() => navigate("/doctor/patients")}>
              View All
            </button>
          </div>
          <div className="cards-grid">
            {appointments.length > 0 ? (
              // Get unique patients from appointments
              [...new Map(appointments.map((item) => [item.patientId, item])).values()]
                .slice(0, 3)
                .map((appointment) => (
                  <div key={appointment.patientId || Math.random()} className="dashboard-card">
                    <div className="person-info">
                      <img
                        src={appointment.patientImage || "/api/placeholder/80/80"}
                        alt={appointment.patientName || "Patient"}
                        className="person-image"
                      />
                      <div>
                        <h4>{appointment.patientName || "Patient Name"}</h4>
                        <p className="person-details">ID: {appointment.patientId || "N/A"}</p>
                      </div>
                    </div>
                    <div className="card-details">
                      <div className="detail-item">
                        <span className="detail-label">Last Visit:</span>
                        <span className="detail-value">{appointment.date || "N/A"}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Reason:</span>
                        <span className="detail-value">{appointment.reason || "N/A"}</span>
                      </div>
                    </div>
                    <div className="card-actions">
                      <button
                        className="action-button primary-button"
                        onClick={() => {
                          navigate(`/doctor/patients/${appointment.patientId}`)
                        }}
                      >
                        View Records
                      </button>
                      <button
                        className="action-button secondary-button"
                        style={{ marginLeft: "8px" }}
                        onClick={() => {
                          navigate(`/doctor/schedule/${appointment.patientId}`)
                        }}
                      >
                        Schedule
                      </button>
                    </div>
                  </div>
                ))
            ) : (
              <p className="no-data-message">No recent patients</p>
            )}
          </div>
        </section>

        <section className="dashboard-section">
          <div className="section-header">
            <h2>Pending Medical Reports</h2>
            <button className="view-all-btn" onClick={() => navigate("/doctor/reports")}>
              View All
            </button>
          </div>
          <div className="cards-grid">
            {reports.length > 0 ? (
              reports
                .filter((report) => report.status === "pending")
                .slice(0, 3)
                .map((report) => (
                  <div key={report.id || Math.random()} className="dashboard-card">
                    <div className="person-info">
                      <div>
                        <h4>{report.name || "Report Name"}</h4>
                        <p className="person-details">Patient: {report.patientName || "Patient Name"}</p>
                      </div>
                    </div>
                    <div className="card-details">
                      <div className="detail-item">
                        <span className="detail-label">Date:</span>
                        <span className="detail-value">{report.date || "N/A"}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Type:</span>
                        <span className="detail-value">{report.type || "N/A"}</span>
                      </div>
                    </div>
                    <div className="card-actions">
                      <div className={`status-badge ${report.status || "pending"}`}>{report.status || "Pending"}</div>
                      <div>
                        <button
                          className="action-button primary-button"
                          onClick={() => {
                            console.log("View report:", report.id)
                          }}
                        >
                          View Report
                        </button>
                        <button
                          className="action-button secondary-button"
                          style={{ marginLeft: "8px" }}
                          onClick={() => {
                            console.log("Approve report:", report.id)
                          }}
                        >
                          Approve
                        </button>
                      </div>
                    </div>
                  </div>
                ))
            ) : (
              <p className="no-data-message">No pending reports</p>
            )}
          </div>
        </section>

        <section className="dashboard-section">
          <div className="section-header">
            <h2>Recent Prescriptions</h2>
            <button className="view-all-btn" onClick={() => navigate("/doctor/prescriptions")}>
              View All
            </button>
          </div>
          <div className="cards-grid">
            {medications.length > 0 ? (
              medications.slice(0, 3).map((medication) => (
                <div key={medication.id || Math.random()} className="dashboard-card">
                  <div className="person-info">
                    <div>
                      <h4>{medication.name || "Medication Name"}</h4>
                      <p className="person-details">For: {medication.patientName || "Patient Name"}</p>
                    </div>
                  </div>
                  <div className="card-details">
                    <div className="detail-item">
                      <span className="detail-label">Dosage:</span>
                      <span className="detail-value">{medication.dosage || "N/A"}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Frequency:</span>
                      <span className="detail-value">{medication.frequency || "N/A"}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Refill in:</span>
                      <span className="detail-value">{medication.timeLeft || "N/A"}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Prescribed:</span>
                      <span className="detail-value">{medication.prescribedDate || "N/A"}</span>
                    </div>
                  </div>
                  <div className="card-actions">
                    <button
                      className="action-button primary-button"
                      onClick={() => {
                        console.log("Renew medication:", medication.id)
                      }}
                    >
                      Renew
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-data-message">No recent prescriptions</p>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}

export default DoctorDashboard

