"use client";

import { useState, useEffect } from "react";
import { logout, fetchWithTokenRefresh } from "../../Utils/api.js";
import { useNavigate } from "react-router-dom";
import "../../../Styles/DashboardStyles.css";

const PatientDashboard = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [medications, setMedications] = useState([]);
  const [reports, setReports] = useState([]);
  const [patientInfo, setPatientInfo] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("No authentication token found");
        }

        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        const options = {
          headers: {
            "Content-Type": "application/json",
          },
        };

        const [
          patientResponse,
          appointmentsResponse,
          medicationsResponse,
          reportsResponse,
        ] = await Promise.all([
          fetchWithTokenRefresh("/patientInfo", options),
          fetchWithTokenRefresh("/appointments", options),
          fetchWithTokenRefresh("/medications", options),
          fetchWithTokenRefresh("/reports", options),
        ]);


        const [patientData, appointmentsData, medicationsData, reportsData] =
          await Promise.all([
            patientResponse.json(),
            appointmentsResponse.json(),
            medicationsResponse.json(),
            reportsResponse.json(),
          ]);

        if (Array.isArray(patientData) && patientData.length > 0) {
          const loggedInPatientId = Number(localStorage.getItem("id"));

          const foundPatient = patientData.find(
            (patient) => patient.id === loggedInPatientId
          );
          if (foundPatient) {
            setPatientInfo(foundPatient);
          } else {
            throw new Error(`Patient with ID ${loggedInPatientId} not found`);
          }
        } else {
          throw new Error("Invalid patient data format");
        }

        setAppointments(
          Array.isArray(appointmentsData) ? appointmentsData : []
        );
        setMedications(Array.isArray(medicationsData) ? medicationsData : []);
        setReports(Array.isArray(reportsData) ? reportsData : []);
      } catch (err) {
        console.error("Error fetching patient data:", err);
        setError(err.message);

        setAppointments([]);
        setMedications([]);
        setReports([]);
        setPatientInfo(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatientData();
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  // Navigation functions
  const navigationHandlers = {
    Dashboard: () => navigate("/patient/dashboard"),
    Appointments: () => navigate("/my-appointment"),
    "Medical Records": () => navigate("/medical-record"),
    "Lab Reports": () => navigate("/LabReports"),
    Messages: () => navigate("/messages"),
    Prescriptions: () => navigate("/prescription"),
  };

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
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
    );
  }

  return (
    <div className="dashboard-container">
      <nav className="sidebar">
        <div className="profile-section">
          {patientInfo ? (
            <>
              <img
                src={patientInfo.image || "/api/placeholder/80/80"}
                alt="Patient"
                className="avatar"
              />
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
            <button
              key={name}
              className={`menu-item ${name === "Dashboard" ? "active" : ""}`}
              onClick={handler}
            >
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
        <header className="dashboard-header">
          <h1>Patient Dashboard</h1>
          <div className="health-summary">
            <div className="health-card">
              <h3>
                <span className="card-icon">📅</span>
                Next Appointment
              </h3>
              {appointments[0] ? (
                <div className="next-appointment">
                  <p className="date">{appointments[0].date || "Date N/A"}</p>
                  <p className="time">{appointments[0].time || "Time N/A"}</p>
                  <p className="doctor">
                    with {appointments[0].doctorName || "Doctor N/A"}
                  </p>
                  <p className="location">
                    {appointments[0].location || "Location N/A"}
                  </p>
                </div>
              ) : (
                <p>No upcoming appointments</p>
              )}
            </div>
            <div className="health-card">
              <h3>
                <span className="card-icon">💊</span>
                Active Medications
              </h3>
              <p className="stat">{medications.length}</p>
              <p className="stat-label">Current Prescriptions</p>
            </div>
            <div className="health-card">
              <h3>
                <span className="card-icon">📋</span>
                Recent Reports
              </h3>
              <p className="stat">
                {reports.filter((r) => r.status === "pending").length}
              </p>
              <p className="stat-label">Pending Reports</p>
            </div>
          </div>
        </header>

        <section className="dashboard-section">
          <div className="section-header">
            <h2>Upcoming Appointments</h2>
            <button
              className="view-all-btn"
              onClick={() => navigate("/my-appointment")}
            >
              View All
            </button>
          </div>
          <div className="cards-grid">
            {appointments.length > 0 ? (
              appointments.slice(0, 3).map((appointment) => (
                <div
                  key={appointment.id || Math.random()}
                  className="dashboard-card"
                >
                  <div className="person-info">
                    <img
                      src={appointment.doctorImage || "/api/placeholder/80/80"}
                      alt={appointment.doctorName || "Doctor"}
                      className="person-image"
                    />
                    <div>
                      <h4>{appointment.doctorName || "Doctor Name"}</h4>
                      <p className="person-details">
                        {appointment.specialization || "Specialization N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="card-details">
                    <div className="detail-item">
                      <span className="detail-label">Date:</span>
                      <span className="detail-value">
                        {appointment.date || "N/A"}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Time:</span>
                      <span className="detail-value">
                        {appointment.time || "N/A"}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Location:</span>
                      <span className="detail-value">
                        {appointment.location || "N/A"}
                      </span>
                    </div>
                  </div>
                  <div className="card-actions">
                    <div
                      className={`status-badge ${
                        appointment.status || "pending"
                      }`}
                    >
                      {appointment.status || "Pending"}
                    </div>
                    <button
                      className="action-button secondary-button"
                      onClick={() => {
                        console.log("Reschedule appointment:", appointment.id);
                      }}
                    >
                      Reschedule
                    </button>
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
            <h2>Current Medications</h2>
            <button
              className="view-all-btn"
              onClick={() => navigate("/prescription")}
            >
              View All
            </button>
          </div>
          <div className="cards-grid">
            {medications.length > 0 ? (
              medications.slice(0, 3).map((medication) => (
                <div
                  key={medication.id || Math.random()}
                  className="dashboard-card"
                >
                  <div className="person-info">
                    <div>
                      <h4>{medication.name || "Medication Name"}</h4>
                      <p className="person-details">
                        Prescribed by Dr. {medication.prescribedBy || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="card-details">
                    <div className="detail-item">
                      <span className="detail-label">Dosage:</span>
                      <span className="detail-value">
                        {medication.dosage || "N/A"}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Frequency:</span>
                      <span className="detail-value">
                        {medication.frequency || "N/A"}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Refill in:</span>
                      <span className="detail-value">
                        {medication.timeLeft || "N/A"}
                      </span>
                    </div>
                  </div>
                  <div className="card-actions">
                    <button
                      className="action-button primary-button"
                      onClick={() => {
                        console.log("Request refill:", medication.id);
                      }}
                    >
                      Request Refill
                    </button>
                    <button
                      className="action-button secondary-button"
                      style={{ marginLeft: "8px" }}
                      onClick={() => {
                        console.log("View details:", medication.id);
                      }}
                    >
                      Details
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-data-message">No current medications</p>
            )}
          </div>
        </section>

        <section className="dashboard-section">
          <div className="section-header">
            <h2>Recent Medical Reports</h2>
            <button
              className="view-all-btn"
              onClick={() => navigate("/LabReports")}
            >
              View All
            </button>
          </div>
          <div className="cards-grid">
            {reports.length > 0 ? (
              reports.slice(0, 3).map((report) => (
                <div
                  key={report.id || Math.random()}
                  className="dashboard-card"
                >
                  <div className="person-info">
                    <div>
                      <h4>{report.name || "Report Name"}</h4>
                      <p className="person-details">
                        Date: {report.date || "Date N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="card-details">
                    <div className="detail-item">
                      <span className="detail-label">Type:</span>
                      <span className="detail-value">
                        {report.type || "N/A"}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Doctor:</span>
                      <span className="detail-value">
                        {report.doctor || "N/A"}
                      </span>
                    </div>
                  </div>
                  <div className="card-actions">
                    <div
                      className={`status-badge ${report.status || "pending"}`}
                    >
                      {report.status || "Pending"}
                    </div>
                    <button
                      className="action-button primary-button"
                      onClick={() => {
                        console.log("View report:", report.id);
                      }}
                    >
                      View Report
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-data-message">No recent reports</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default PatientDashboard;
