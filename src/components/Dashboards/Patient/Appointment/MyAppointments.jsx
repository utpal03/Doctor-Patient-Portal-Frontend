import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const MyAppointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [pastAppointments, setPastAppointments] = useState([]);

  useEffect(() => {
    // Mock data
    const mockUpcoming = [
      {
        id: 1,
        doctorName: "Dr. Sarah Wilson",
        specialization: "Cardiologist",
        doctorImage: "/api/placeholder/64/64",
        date: "2025-01-23",
        time: "10:00 AM",
        status: "upcoming",
        location: "Main Clinic, Room 105"
      },
      // ... more appointments
    ];

    const mockPast = [
      {
        id: 3,
        doctorName: "Dr. James Smith",
        specialization: "Neurologist",
        doctorImage: "/api/placeholder/64/64",
        date: "2024-12-15",
        time: "3:00 PM",
        status: "completed",
        location: "East Wing, Room 302"
      },
      // ... more past appointments
    ];

    setAppointments(mockUpcoming);
    setPastAppointments(mockPast);
  }, []);

  const BookAppointment = () => {
    navigate("/bookAppointment");
  };

  return (
    <div className="patient-main">
      <header className="patient-header">
        <h1>My Appointments</h1>
        <button className="primary-button" onClick={BookAppointment}>
        Schedule New Appointment</button>
      </header>

      <section className="appointments-section">
        <h2>Upcoming Appointments</h2>
        <div className="appointment-cards">
          {appointments.map(appointment => (
            <div key={appointment.id} className="appointment-card">
              <div className="doctor-info">
                <img 
                  src={appointment.doctorImage} 
                  alt={appointment.doctorName}
                  className="doctor-image"
                />
                <div>
                  <h4>{appointment.doctorName}</h4>
                  <p className="specialization">{appointment.specialization}</p>
                </div>
              </div>
              <div className="appointment-details">
                <p className="appointment-date">
                  <span>Date:</span> {appointment.date}
                </p>
                <p className="appointment-time">
                  <span>Time:</span> {appointment.time}
                </p>
                <p className="appointment-location">
                  <span>Location:</span> {appointment.location}
                </p>
              </div>
              <div className="appointment-actions">
                <button className="reschedule-btn">Reschedule</button>
                <button className="cancel-btn">Cancel</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="appointments-section past-appointments">
        <h2>Past Appointments</h2>
        <div className="appointment-cards">
          {pastAppointments.map(appointment => (
            <div key={appointment.id} className="appointment-card">
              <div className="doctor-info">
                <img 
                  src={appointment.doctorImage} 
                  alt={appointment.doctorName}
                  className="doctor-image"
                />
                <div>
                  <h4>{appointment.doctorName}</h4>
                  <p className="specialization">{appointment.specialization}</p>
                </div>
              </div>
              <div className="appointment-details">
                <p className="appointment-date">
                  <span>Date:</span> {appointment.date}
                </p>
                <p className="appointment-time">
                  <span>Time:</span> {appointment.time}
                </p>
                <p className="appointment-location">
                  <span>Location:</span> {appointment.location}
                </p>
              </div>
              <div className="appointment-actions">
                <span className="status-badge completed">Completed</span>
                <button className="view-summary-btn">View Summary</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
export default MyAppointments;