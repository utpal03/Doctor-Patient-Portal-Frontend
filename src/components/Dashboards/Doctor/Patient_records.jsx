"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import "../../../Styles/DashboardStyles.css"
import "../../../Styles/PatientPages.css"

const DoctorPatients = () => {
  const navigate = useNavigate()
  const [patients, setPatients] = useState([])
  const [filteredPatients, setFilteredPatients] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [showSidebar, setShowSidebar] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [showPatientDetails, setShowPatientDetails] = useState(false)
  const [sortBy, setSortBy] = useState("name")
  const [sortOrder, setSortOrder] = useState("asc")
  const [doctorInfo, setDoctorInfo] = useState(null)

  // Fetch patients data from backend
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

        // Fetch patients and doctor info in parallel
        const [patientsResponse, doctorResponse] = await Promise.all([
          fetch("/doctor/patients", { headers }),
          fetch("/doctorInfo", { headers }),
        ])

        const patientsData = await patientsResponse.json()
        const doctorData = await doctorResponse.json()

        if (Array.isArray(patientsData)) {
          setPatients(patientsData)
          setFilteredPatients(patientsData)
        } else {
          throw new Error("Invalid patient data format")
        }

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
      } catch (err) {
        console.error("Error fetching data:", err)
        setError(err.message)
        setPatients([])
        setFilteredPatients([])
        setDoctorInfo(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()

    // Set up real-time updates
    const updateInterval = setInterval(() => {
      fetchData()
    }, 300000) // Update every 5 minutes

    return () => clearInterval(updateInterval)
  }, [])

  // Filter and sort patients
  useEffect(() => {
    let result = [...patients]

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(
        (patient) =>
          patient.name.toLowerCase().includes(term) ||
          patient.id.toString().includes(term) ||
          (patient.condition && patient.condition.toLowerCase().includes(term)),
      )
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0

      if (sortBy === "name") {
        comparison = a.name.localeCompare(b.name)
      } else if (sortBy === "id") {
        comparison = a.id - b.id
      } else if (sortBy === "lastVisit") {
        const dateA = new Date(a.lastVisit || "1970-01-01")
        const dateB = new Date(b.lastVisit || "1970-01-01")
        comparison = dateA - dateB
      }

      return sortOrder === "asc" ? comparison : -comparison
    })

    setFilteredPatients(result)
  }, [searchTerm, patients, sortBy, sortOrder])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("userType")
    navigate("/login")
  }

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar)
  }

  const viewPatientDetails = (patient) => {
    setSelectedPatient(patient)
    setShowPatientDetails(true)
  }

  const closePatientDetails = () => {
    setShowPatientDetails(false)
    setSelectedPatient(null)
  }

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(field)
      setSortOrder("asc")
    }
  }

  // Navigation handlers
  const navigationHandlers = {
    Dashboard: () => navigate("/doctor/dashboard"),
    Appointments: () => navigate("/doctor/appointments"),
    Patients: () => navigate("/doctor/patients"),
    "Schedule": () => navigate("/doctor/schedule"),
    Profile: () => navigate("/update/profile"),
    Messages: () => navigate("/doctor/messages"),
  }

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading patients...</p>
      </div>
    )
  }

  if (error && !showPatientDetails) {
    return (
      <div className="error-container">
        <p>Error loading patients: {error}</p>
        <button onClick={() => window.location.reload()} className="retry-button">
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
              <p>{doctorInfo.department || "Specialization N/A"}</p>
              <div className="quick-info">
                <span>{doctorInfo.experience || "0"} years experience</span>
                <br />
                <span>Doctor ID: {doctorInfo.id || "N/A"}</span>
              </div>
            </>
          ) : (
            <p>Loading doctor info...</p>
          )}
        </div>

        <div className="nav-menu">
          {Object.entries(navigationHandlers).map(([name, handler]) => (
            <button key={name} className={`menu-item ${name === "Patients" ? "active" : ""}`} onClick={handler}>
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
        <div className="page-header">
          <h1>Patient Management</h1>
          <div className="header-actions">
            <div className="search-container">
              <input
                type="text"
                placeholder="Search patients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <span className="search-icon">🔍</span>
            </div>
            <button className="new-patient-btn" onClick={() => navigate("/doctor/add-patient")}>
              + Add New Patient
            </button>
          </div>
        </div>

        {/* Patient List */}
        <div className="patients-table-container">
          <table className="patients-table">
            <thead>
              <tr>
                <th onClick={() => handleSort("id")} className="sortable-header">
                  Patient ID
                  {sortBy === "id" && <span className="sort-indicator">{sortOrder === "asc" ? " ↑" : " ↓"}</span>}
                </th>
                <th onClick={() => handleSort("name")} className="sortable-header">
                  Name
                  {sortBy === "name" && <span className="sort-indicator">{sortOrder === "asc" ? " ↑" : " ↓"}</span>}
                </th>
                <th>Age</th>
                <th>Gender</th>
                <th>Contact</th>
                <th onClick={() => handleSort("lastVisit")} className="sortable-header">
                  Last Visit
                  {sortBy === "lastVisit" && (
                    <span className="sort-indicator">{sortOrder === "asc" ? " ↑" : " ↓"}</span>
                  )}
                </th>
                <th>Condition</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.length > 0 ? (
                filteredPatients.map((patient) => (
                  <tr key={patient.id} onClick={() => viewPatientDetails(patient)}>
                    <td>{patient.id}</td>
                    <td>
                      <div className="patient-name-cell">
                        <img
                          src={patient.image || "/api/placeholder/40/40"}
                          alt={patient.name}
                          className="patient-table-avatar"
                        />
                        {patient.name}
                      </div>
                    </td>
                    <td>{patient.age}</td>
                    <td>{patient.gender}</td>
                    <td>{patient.contact}</td>
                    <td>{patient.lastVisit || "N/A"}</td>
                    <td>
                      <span className={`condition-badge ${patient.condition ? patient.condition.toLowerCase() : ""}`}>
                        {patient.condition || "N/A"}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="table-action-btn view-btn"
                          onClick={(e) => {
                            e.stopPropagation()
                            viewPatientDetails(patient)
                          }}
                        >
                          View
                        </button>
                        <button
                          className="table-action-btn schedule-btn"
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/doctor/schedule/${patient.id}`)
                          }}
                        >
                          Schedule
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="no-data-cell">
                    <div className="no-data-message">
                      <p>No patients found</p>
                      {searchTerm && (
                        <button className="clear-filters-btn" onClick={() => setSearchTerm("")}>
                          Clear Search
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Patient Details Modal */}
        {showPatientDetails && selectedPatient && (
          <div className="modal-overlay">
            <div className="modal-content patient-details-modal">
              <div className="modal-header">
                <h2>Patient Details</h2>
                <button className="close-modal-btn" onClick={closePatientDetails}>
                  ×
                </button>
              </div>

              <div className="modal-body">
                <div className="patient-profile">
                  <img
                    src={selectedPatient.image || "/api/placeholder/150/150"}
                    alt={selectedPatient.name}
                    className="patient-profile-img"
                  />
                  <div className="patient-profile-info">
                    <h3>{selectedPatient.name}</h3>
                    <p>Patient ID: {selectedPatient.id}</p>
                    <div className="patient-badges">
                      <span
                        className={`condition-badge ${selectedPatient.condition ? selectedPatient.condition.toLowerCase() : ""}`}
                      >
                        {selectedPatient.condition || "No condition"}
                      </span>
                      <span className="age-gender-badge">
                        {selectedPatient.age} years, {selectedPatient.gender}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="patient-info-grid">
                  <div className="info-item">
                    <h4>Contact Information</h4>
                    <p>
                      <strong>Phone:</strong> {selectedPatient.contact}
                    </p>
                    <p>
                      <strong>Email:</strong> {selectedPatient.email || "N/A"}
                    </p>
                    <p>
                      <strong>Address:</strong> {selectedPatient.address || "N/A"}
                    </p>
                  </div>
                  <div className="info-item">
                    <h4>Medical Information</h4>
                    <p>
                      <strong>Blood Type:</strong> {selectedPatient.bloodType || "N/A"}
                    </p>
                    <p>
                      <strong>Allergies:</strong> {selectedPatient.allergies || "None"}
                    </p>
                    <p>
                      <strong>Chronic Conditions:</strong> {selectedPatient.chronicConditions || "None"}
                    </p>
                  </div>
                  <div className="info-item">
                    <h4>Emergency Contact</h4>
                    <p>
                      <strong>Name:</strong> {selectedPatient.emergencyContactName || "N/A"}
                    </p>
                    <p>
                      <strong>Relationship:</strong> {selectedPatient.emergencyContactRelation || "N/A"}
                    </p>
                    <p>
                      <strong>Phone:</strong> {selectedPatient.emergencyContactPhone || "N/A"}
                    </p>
                  </div>
                  <div className="info-item">
                    <h4>Insurance Information</h4>
                    <p>
                      <strong>Provider:</strong> {selectedPatient.insuranceProvider || "N/A"}
                    </p>
                    <p>
                      <strong>Policy Number:</strong> {selectedPatient.insurancePolicy || "N/A"}
                    </p>
                    <p>
                      <strong>Expiry Date:</strong> {selectedPatient.insuranceExpiry || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="patient-history">
                  <h4>Visit History</h4>
                  <div className="timeline">
                    {selectedPatient.visitHistory ? (
                      selectedPatient.visitHistory.map((visit, index) => (
                        <div key={index} className="timeline-item">
                          <div className="timeline-point"></div>
                          <div className="timeline-content">
                            <p className="timeline-date">{visit.date}</p>
                            <p>
                              <strong>Reason:</strong> {visit.reason}
                            </p>
                            <p>
                              <strong>Diagnosis:</strong> {visit.diagnosis}
                            </p>
                            <p>
                              <strong>Treatment:</strong> {visit.treatment}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p>No visit history available</p>
                    )}
                  </div>
                </div>

                <div className="patient-notes">
                  <h4>Doctor's Notes</h4>
                  <textarea
                    placeholder="Add notes about this patient..."
                    defaultValue={selectedPatient.doctorNotes || ""}
                    className="doctor-notes-input"
                  ></textarea>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  className="action-button primary-button"
                  onClick={() => navigate(`/doctor/medical-records/${selectedPatient.id}`)}
                >
                  View Medical Records
                </button>
                <button
                  className="action-button secondary-button"
                  onClick={() => navigate(`/doctor/schedule/${selectedPatient.id}`)}
                >
                  Schedule Appointment
                </button>
                <button className="action-button outline-button" onClick={closePatientDetails}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default DoctorPatients

