import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../../Styles/DashboardStyles.css"

const DoctorAppointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    // Mock appointments data
    const mockAppointments = [
      {
        id: 1,
        patientName: "John Doe",
        age: 45,
        condition: "Cardiac Follow-up",
        date: "2025-01-23",
        time: "10:00 AM",
        status: "upcoming",
        notes: "Regular checkup for heart condition"
      },
      {
        id: 2,
        patientName: "Sarah Smith",
        age: 32,
        condition: "Annual Checkup",
        date: "2025-01-24",
        time: "11:30 AM",
        status: "confirmed",
        notes: "First time patient"
      },
      {
        id: 3,
        patientName: "Mike Johnson",
        age: 28,
        condition: "Follow-up",
        date: "2025-01-25",
        time: "2:00 PM",
        status: "pending",
        notes: "Post-surgery follow-up"
      }
    ];
    setAppointments(mockAppointments);
  }, []);

  const handleStatusChange = (appointmentId, newStatus) => {
    setAppointments(appointments.map(apt => 
      apt.id === appointmentId ? {...apt, status: newStatus} : apt
    ));
  };

  const filteredAppointments = appointments.filter(apt => 
    filter === "all" ? true : apt.status === filter
  );

  return (
    <div className="appointments-page">
      <header className="appointments-header">
        <h1>Appointments Management</h1>
        <div className="filter-section">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button 
            className={`filter-btn ${filter === 'upcoming' ? 'active' : ''}`}
            onClick={() => setFilter('upcoming')}
          >
            Upcoming
          </button>
          <button 
            className={`filter-btn ${filter === 'confirmed' ? 'active' : ''}`}
            onClick={() => setFilter('confirmed')}
          >
            Confirmed
          </button>
          <button 
            className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            Pending
          </button>
        </div>
      </header>

      <div className="appointments-container">
        <div className="appointments-list">
          {filteredAppointments.map((appointment) => (
            <div key={appointment.id} className="appointment-card">
              <div className="appointment-header">
                <h3>{appointment.patientName}</h3>
                <span className={`status-badge ${appointment.status}`}>
                  {appointment.status}
                </span>
              </div>
              
              <div className="appointment-details">
                <div className="detail-row">
                  <span className="label">Date:</span>
                  <span>{appointment.date}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Time:</span>
                  <span>{appointment.time}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Condition:</span>
                  <span>{appointment.condition}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Notes:</span>
                  <span>{appointment.notes}</span>
                </div>
              </div>

              <div className="appointment-actions">
                <button 
                  className="action-btn confirm"
                  onClick={() => handleStatusChange(appointment.id, 'confirmed')}
                >
                  Confirm
                </button>
                <button 
                  className="action-btn reschedule"
                  onClick={() => handleStatusChange(appointment.id, 'pending')}
                >
                  Reschedule
                </button>
                <button 
                  className="action-btn cancel"
                  onClick={() => handleStatusChange(appointment.id, 'cancelled')}
                >
                  Cancel
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DoctorAppointments;