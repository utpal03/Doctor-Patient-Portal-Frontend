// DoctorDashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../../Styles/DoctorDashboard.css";

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  useEffect(() => {
    // Fetch doctor's appointments
    const mockAppointments = [
      {
        id: 1,
        patientName: "John Doe",
        age: 45,
        condition: "Cardiac Follow-up",
        date: "2025-01-23",
        time: "10:00 AM",
        status: "upcoming",
        lastVisit: "2024-12-15"
      },
      {
        id: 2,
        patientName: "Sarah Smith",
        age: 32,
        condition: "Annual Checkup",
        date: "2025-01-23",
        time: "11:30 AM",
        status: "upcoming",
        lastVisit: "2024-11-20"
      }
    ];
    setAppointments(mockAppointments);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userType");
    navigate("/login");
  };

  const handlePatientRecovery = (patientId) => {
    setSelectedPatient(patientId);
    setShowConfirmModal(true);
  };

  return (
    <div className="doctor-dashboard">
      <nav className="doctor-sidebar">
        <div className="doctor-profile">
          <img 
            src="/api/placeholder/80/80" 
            alt="Doctor" 
            className="doctor-avatar"
          />
          <h3>Dr. Michael Chen</h3>
          <p>Cardiologist</p>
        </div>
        
        <div className="nav-links">
          <button className="nav-link active">Dashboard</button>
          <button className="nav-link">Appointments</button>
          <button className="nav-link">Patient Records</button>
          <button className="nav-link">Schedule</button>
          <button className="nav-link">Messages</button>
          <button className="nav-link logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      <main className="doctor-main">
        <header className="doctor-header">
          <div className="welcome-section">
            <h1>Welcome back, Dr. Chen</h1>
            <p>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          
          <div className="stats-cards">
            <div className="stat-card">
              <h3>Today's Patients</h3>
              <p className="stat-number">{appointments.length}</p>
            </div>
            <div className="stat-card">
              <h3>Total Patients</h3>
              <p className="stat-number">145</p>
            </div>
            <div className="stat-card">
              <h3>Recovery Rate</h3>
              <p className="stat-number">92%</p>
            </div>
          </div>
        </header>

        <section className="appointments-section">
          <div className="section-header">
            <h2>Today's Appointments</h2>
            <button className="view-all">View All</button>
          </div>

          <div className="appointments-table">
            <table>
              <thead>
                <tr>
                  <th>Patient Name</th>
                  <th>Age</th>
                  <th>Condition</th>
                  <th>Time</th>
                  <th>Last Visit</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map(appointment => (
                  <tr key={appointment.id}>
                    <td>{appointment.patientName}</td>
                    <td>{appointment.age}</td>
                    <td>{appointment.condition}</td>
                    <td>{appointment.time}</td>
                    <td>{appointment.lastVisit}</td>
                    <td>
                      <button 
                        className="recovery-btn"
                        onClick={() => handlePatientRecovery(appointment.id)}
                      >
                        Mark Recovered
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Confirm Patient Recovery</h3>
            <p>Are you sure you want to mark this patient as recovered?</p>
            <p>This will notify the admin for record archival.</p>
            <div className="modal-actions">
              <button 
                className="cancel-btn"
                onClick={() => setShowConfirmModal(false)}
              >
                Cancel
              </button>
              <button 
                className="confirm-btn"
                onClick={() => {
                  // Add API call here
                  setShowConfirmModal(false);
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;