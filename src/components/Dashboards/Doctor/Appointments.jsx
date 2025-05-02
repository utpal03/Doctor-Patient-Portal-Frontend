"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../../Styles/DashboardStyles.css";
import "../../../Styles/PatientPages.css";

const DoctorAppointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showSidebar, setShowSidebar] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showAppointmentDetails, setShowAppointmentDetails] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [doctorInfo, setDoctorInfo] = useState(null);

  // Fetch appointments data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");
        const loggedInDoctorId = Number(localStorage.getItem("id"));

        if (!token) {
          throw new Error("No authentication token found");
        }

        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        // Fetch appointments and doctor info in parallel
        const [appointmentsResponse, doctorResponse] = await Promise.all([
          fetch("/doctor/appointments", { headers }),
          fetch("/doctorInfo", { headers }),
        ]);

        const appointmentsData = await appointmentsResponse.json();
        const doctorData = await doctorResponse.json();

        if (Array.isArray(appointmentsData)) {
          setAppointments(appointmentsData);
          setFilteredAppointments(appointmentsData);
        } else {
          throw new Error("Invalid appointment data format");
        }

        // Handle doctor data
        if (Array.isArray(doctorData) && doctorData.length > 0) {
          const foundDoctor = doctorData.find(
            (doctor) => doctor.id === loggedInDoctorId
          );
          if (foundDoctor) {
            setDoctorInfo(foundDoctor);
          } else {
            throw new Error(`Doctor with ID ${loggedInDoctorId} not found`);
          }
        } else {
          throw new Error("Invalid doctor data format");
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message);
        setAppointments([]);
        setFilteredAppointments([]);
        setDoctorInfo(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Set up real-time updates
    const updateInterval = setInterval(() => {
      fetchData();
    }, 60000); // Update every minute

    return () => clearInterval(updateInterval);
  }, []);

  // Filter appointments based on status and search term
  useEffect(() => {
    let result = appointments;

    // Apply status filter
    if (filter !== "all") {
      result = result.filter((appointment) => appointment.status === filter);
    }

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (appointment) =>
          appointment.patientName.toLowerCase().includes(term) ||
          appointment.reason.toLowerCase().includes(term) ||
          appointment.patientId.toString().includes(term)
      );
    }

    setFilteredAppointments(result);
  }, [filter, searchTerm, appointments])

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userType");
    navigate("/login");
  };

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  const viewAppointmentDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setShowAppointmentDetails(true);
  };

  const closeAppointmentDetails = () => {
    setShowAppointmentDetails(false);
    setSelectedAppointment(null);
  };

  const updateAppointmentStatus = async (appointmentId, newStatus) => {
    try {
      setIsUpdating(true);
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("No authentication token found");
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const response = await fetch(`/updateAppointmentStatus`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ appointmentId, status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update appointment status");
      }

      // Update local state
      setAppointments((prevAppointments) =>
        prevAppointments.map((app) =>
          app.id === appointmentId ? { ...app, status: newStatus } : app
        )
      );

      if (selectedAppointment && selectedAppointment.id === appointmentId) {
        setSelectedAppointment({ ...selectedAppointment, status: newStatus });
      }
    } catch (err) {
      console.error("Error updating appointment status:", err);
      setError(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  // Navigation handlers
  const navigationHandlers = {
    Dashboard: () => navigate("/doctor/dashboard"),
    Appointments: () => navigate("/doctor/appointments"),
    Patients: () => navigate("/doctor/patients"),
    Schedule: () => navigate("/doctor/schedule"),
    Messages: () => navigate("/doctor/messages"),
    Profile: () => navigate("/update/profile"),
  };

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading appointments...</p>
      </div>
    );
  }

  if (error && !showAppointmentDetails) {
    return (
      <div className="error-container">
        <p>Error loading appointments: {error}</p>
        <button
          onClick={() => window.location.reload()}
          className="retry-button"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Hamburger Menu for Mobile */}
      <div
        className={`hamburger-menu ${!showSidebar ? "sidebar-hidden" : ""}`}
        onClick={toggleSidebar}
      >
        <span></span>
        <span></span>
        <span></span>
      </div>

      {/* Sidebar */}
      <nav className={`sidebar ${!showSidebar ? "hidden" : ""}`}>
        <div className="profile-section">
          {doctorInfo ? (
            <>
              <img
                src={doctorInfo.image || "/api/placeholder/80/80"}
                alt="Doctor"
                className="avatar"
              />
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
            <button
              key={name}
              className={`menu-item ${name === "Appointments" ? "active" : ""}`}
              onClick={handler}
            >
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
          <h1>Appointments Management</h1>
          <div className="header-actions">
            <div className="search-container">
              <input
                type="text"
                placeholder="Search patients or reasons..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <span className="search-icon">🔍</span>
            </div>
            <button
              className="new-appointment-btn"
              onClick={() => navigate("/doctor/schedule-appointment")}
            >
              + New Appointment
            </button>
          </div>
        </div>

        <div className="filter-tabs">
          <button
            className={`filter-tab ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            All
          </button>
          <button
            className={`filter-tab ${filter === "confirmed" ? "active" : ""}`}
            onClick={() => setFilter("confirmed")}
          >
            Confirmed
          </button>
          <button
            className={`filter-tab ${filter === "pending" ? "active" : ""}`}
            onClick={() => setFilter("pending")}
          >
            Pending
          </button>
          <button
            className={`filter-tab ${filter === "completed" ? "active" : ""}`}
            onClick={() => setFilter("completed")}
          >
            Completed
          </button>
          <button
            className={`filter-tab ${filter === "cancelled" ? "active" : ""}`}
            onClick={() => setFilter("cancelled")}
          >
            Cancelled
          </button>
        </div>

        {/* Appointment List */}
        <div className="appointments-list">
          {filteredAppointments.length > 0 ? (
            filteredAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="appointment-card"
                onClick={() => viewAppointmentDetails(appointment)}
              >
                <div className="appointment-header">
                  <div className="patient-info">
                    <img
                      src={appointment.patientImage || "/api/placeholder/50/50"}
                      alt={appointment.patientName}
                      className="patient-avatar"
                    />
                    <div>
                      <h3>{appointment.patientName}</h3>
                      <p>Patient ID: {appointment.patientId}</p>
                    </div>
                  </div>
                  <div className={`status-badge ${appointment.status}`}>
                    {appointment.status}
                  </div>
                </div>
                <div className="appointment-details">
                  <div className="detail-row">
                    <div className="detail-item">
                      <span className="detail-icon">📅</span>
                      <div>
                        <p className="detail-label">Date</p>
                        <p className="detail-value">{appointment.date}</p>
                      </div>
                    </div>
                    <div className="detail-item">
                      <span className="detail-icon">⏰</span>
                      <div>
                        <p className="detail-label">Time</p>
                        <p className="detail-value">{appointment.time}</p>
                      </div>
                    </div>
                  </div>
                  <div className="detail-row">
                    <div className="detail-item">
                      <span className="detail-icon">🏥</span>
                      <div>
                        <p className="detail-label">Location</p>
                        <p className="detail-value">{appointment.location}</p>
                      </div>
                    </div>
                    <div className="detail-item">
                      <span className="detail-icon">🩺</span>
                      <div>
                        <p className="detail-label">Reason</p>
                        <p className="detail-value">{appointment.reason}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="appointment-actions">
                  <button className="action-button primary-button">
                    {appointment.status === "confirmed"
                      ? "Start Session"
                      : appointment.status === "pending"
                      ? "Confirm"
                      : appointment.status === "completed"
                      ? "View Notes"
                      : "Reschedule"}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="no-data-message">
              <p>No appointments found</p>
              {searchTerm || filter !== "all" ? (
                <button
                  className="clear-filters-btn"
                  onClick={() => {
                    setSearchTerm("");
                    setFilter("all");
                  }}
                >
                  Clear Filters
                </button>
              ) : null}
            </div>
          )}
        </div>

        {/* Appointment Details Modal */}
        {showAppointmentDetails && selectedAppointment && (
          <div className="modal-overlay">
            <div className="modal-content appointment-details-modal">
              <div className="modal-header">
                <h2>Appointment Details</h2>
                <button
                  className="close-modal-btn"
                  onClick={closeAppointmentDetails}
                >
                  ×
                </button>
              </div>

              <div className="modal-body">
                <div className="patient-profile">
                  <img
                    src={
                      selectedAppointment.patientImage ||
                      "/api/placeholder/100/100"
                    }
                    alt={selectedAppointment.patientName}
                    className="patient-profile-img"
                  />
                  <div className="patient-profile-info">
                    <h3>{selectedAppointment.patientName}</h3>
                    <p>Patient ID: {selectedAppointment.patientId}</p>
                    <div
                      className={`status-badge ${selectedAppointment.status}`}
                    >
                      {selectedAppointment.status}
                    </div>
                  </div>
                </div>

                <div className="appointment-info-grid">
                  <div className="info-item">
                    <h4>Date & Time</h4>
                    <p>
                      {selectedAppointment.date} at {selectedAppointment.time}
                    </p>
                  </div>
                  <div className="info-item">
                    <h4>Location</h4>
                    <p>{selectedAppointment.location}</p>
                  </div>
                  <div className="info-item">
                    <h4>Reason for Visit</h4>
                    <p>{selectedAppointment.reason}</p>
                  </div>
                  <div className="info-item">
                    <h4>Patient Notes</h4>
                    <p>
                      {selectedAppointment.notes ||
                        "No additional notes provided"}
                    </p>
                  </div>
                </div>

                <div className="appointment-history">
                  <h4>Appointment History</h4>
                  <div className="timeline">
                    <div className="timeline-item">
                      <div className="timeline-point"></div>
                      <div className="timeline-content">
                        <p className="timeline-date">
                          Created on {selectedAppointment.createdAt || "N/A"}
                        </p>
                        <p>Appointment scheduled</p>
                      </div>
                    </div>
                    {selectedAppointment.status !== "pending" && (
                      <div className="timeline-item">
                        <div className="timeline-point"></div>
                        <div className="timeline-content">
                          <p className="timeline-date">
                            {selectedAppointment.confirmedAt || "N/A"}
                          </p>
                          <p>Appointment confirmed</p>
                        </div>
                      </div>
                    )}
                    {selectedAppointment.status === "completed" && (
                      <div className="timeline-item">
                        <div className="timeline-point"></div>
                        <div className="timeline-content">
                          <p className="timeline-date">
                            {selectedAppointment.completedAt || "N/A"}
                          </p>
                          <p>Appointment completed</p>
                        </div>
                      </div>
                    )}
                    {selectedAppointment.status === "cancelled" && (
                      <div className="timeline-item">
                        <div className="timeline-point"></div>
                        <div className="timeline-content">
                          <p className="timeline-date">
                            {selectedAppointment.cancelledAt || "N/A"}
                          </p>
                          <p>Appointment cancelled</p>
                          <p className="cancel-reason">
                            {selectedAppointment.cancelReason ||
                              "No reason provided"}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="doctor-notes">
                  <h4>Doctor's Notes</h4>
                  <textarea
                    placeholder="Add notes about this appointment..."
                    defaultValue={selectedAppointment.doctorNotes || ""}
                    className="doctor-notes-input"
                  ></textarea>
                </div>
              </div>

              <div className="modal-footer">
                {selectedAppointment.status === "pending" && (
                  <>
                    <button
                      className="action-button primary-button"
                      onClick={() =>
                        updateAppointmentStatus(
                          selectedAppointment.id,
                          "confirmed"
                        )
                      }
                      disabled={isUpdating}
                    >
                      {isUpdating ? "Confirming..." : "Confirm Appointment"}
                    </button>
                    <button
                      className="action-button secondary-button"
                      onClick={() =>
                        updateAppointmentStatus(
                          selectedAppointment.id,
                          "cancelled"
                        )
                      }
                      disabled={isUpdating}
                    >
                      {isUpdating ? "Cancelling..." : "Cancel Appointment"}
                    </button>
                  </>
                )}

                {selectedAppointment.status === "confirmed" && (
                  <>
                    <button
                      className="action-button primary-button"
                      onClick={() =>
                        updateAppointmentStatus(
                          selectedAppointment.id,
                          "completed"
                        )
                      }
                      disabled={isUpdating}
                    >
                      {isUpdating ? "Completing..." : "Complete Appointment"}
                    </button>
                    <button
                      className="action-button secondary-button"
                      onClick={() =>
                        updateAppointmentStatus(
                          selectedAppointment.id,
                          "cancelled"
                        )
                      }
                      disabled={isUpdating}
                    >
                      {isUpdating ? "Cancelling..." : "Cancel Appointment"}
                    </button>
                  </>
                )}

                {(selectedAppointment.status === "completed" ||
                  selectedAppointment.status === "cancelled") && (
                  <button
                    className="action-button primary-button"
                    onClick={() =>
                      navigate(
                        `/doctor/patients/${selectedAppointment.patientId}`
                      )
                    }
                  >
                    View Patient Profile
                  </button>
                )}

                <button
                  className="action-button outline-button"
                  onClick={closeAppointmentDetails}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default DoctorAppointments;
