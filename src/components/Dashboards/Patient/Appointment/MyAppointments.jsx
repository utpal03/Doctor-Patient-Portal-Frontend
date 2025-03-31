import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../../../Styles/DashboardStyles.css";
import "../../../../Styles/PatientPages.css";

const PatientAppointments = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [patientInfo, setPatientInfo] = useState(null);
  const [error, setError] = useState(null);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [formData, setFormData] = useState({
    doctorId: "",
    date: "",
    time: "",
    reason: "",
  });
  const [doctors, setDoctors] = useState([]);
  const [filter, setFilter] = useState("upcoming");
  const [calendarView, setCalendarView] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");
        const loggedInPatientId = Number(localStorage.getItem("id"));

        if (!token) {
          throw new Error("No authentication token found");
        }

        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        // Fetch all data in parallel
        const [patientResponse, appointmentsResponse, doctorsResponse] = await Promise.all([
          fetch("/patientInfo", { headers }),
          fetch("/appointments", { headers }),
          fetch("/doctors", { headers }),
        ]);

        // Parse JSON responses
        const [patientData, appointmentsData, doctorsData] = await Promise.all([
          patientResponse.json(),
          appointmentsResponse.json(),
          doctorsResponse.json(),
        ]);

        // Handle patient data
        if (Array.isArray(patientData) && patientData.length > 0) {
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

        // Set appointments and doctors
        setAppointments(Array.isArray(appointmentsData) ? appointmentsData : []);
        setDoctors(Array.isArray(doctorsData) ? doctorsData : []);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message);
        setAppointments([]);
        setDoctors([]);
        setPatientInfo(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userType");
    navigate("/login");
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      // In a real app, you would send this to your backend
      const response = await fetch("/schedule-appointment", {
        method: "POST",
        headers,
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        // Refresh appointments after scheduling
        const appointmentsResponse = await fetch("/appointments", { headers });
        const appointmentsData = await appointmentsResponse.json();
        setAppointments(Array.isArray(appointmentsData) ? appointmentsData : []);
        setShowScheduleForm(false);
        setFormData({
          doctorId: "",
          date: "",
          time: "",
          reason: "",
        });
      } else {
        throw new Error("Failed to schedule appointment");
      }
    } catch (err) {
      console.error("Error scheduling appointment:", err);
      // In a real app, you would show an error message to the user
    }
  };

  const cancelAppointment = async (appointmentId) => {
    try {
      const token = localStorage.getItem("token");
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      // In a real app, you would send this to your backend
      const response = await fetch(`/cancel-appointment/${appointmentId}`, {
        method: "PUT",
        headers,
      });

      if (response.ok) {
        // Update the appointment status locally
        setAppointments(
          appointments.map((app) =>
            app.id === appointmentId ? { ...app, status: "cancelled" } : app
          )
        );
      } else {
        throw new Error("Failed to cancel appointment");
      }
    } catch (err) {
      console.error("Error cancelling appointment:", err);
      // In a real app, you would show an error message to the user
    }
  };

  const rescheduleAppointment = (appointment) => {
    setFormData({
      doctorId: appointment.doctorId || "",
      date: "",
      time: "",
      reason: appointment.reason || "",
      appointmentId: appointment.id, // For rescheduling
    });
    setShowScheduleForm(true);
  };

  const filteredAppointments = appointments.filter((appointment) => {
    const appointmentDate = new Date(appointment.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (filter === "upcoming") {
      return appointmentDate >= today && appointment.status !== "cancelled";
    } else if (filter === "past") {
      return appointmentDate < today || appointment.status === "completed";
    } else if (filter === "cancelled") {
      return appointment.status === "cancelled";
    }
    return true;
  });

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays();
  
  // Check if a date has appointments
  const getAppointmentsForDate = (date) => {
    if (!date) return [];
    
    return appointments.filter(app => {
      const appDate = new Date(app.date);
      return (
        appDate.getDate() === date.getDate() &&
        appDate.getMonth() === date.getMonth() &&
        appDate.getFullYear() === date.getFullYear()
      );
    });
  };

  // Format date for display
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading your appointments...</p>
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
        <p>Error loading appointments: {error}</p>
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

  // Get upcoming appointment count
  const upcomingCount = appointments.filter(app => {
    const appDate = new Date(app.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return appDate >= today && app.status !== "cancelled";
  }).length;

  // Get next appointment
  const nextAppointment = appointments
    .filter(app => {
      const appDate = new Date(app.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return appDate >= today && app.status !== "cancelled";
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date))[0];

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
            <button
              key={name}
              className={`menu-item ${name === "Appointments" ? "active" : ""}`}
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
        <div className="page-header appointments-header">
          <div className="header-content">
            <h1>My Appointments</h1>
            <p>Manage your healthcare appointments and schedule new visits</p>
          </div>
          <div className="view-toggle">
            <button 
              className={`view-toggle-btn ${!calendarView ? 'active' : ''}`}
              onClick={() => setCalendarView(false)}
            >
              <span className="toggle-icon">📋</span> List
            </button>
            <button 
              className={`view-toggle-btn ${calendarView ? 'active' : ''}`}
              onClick={() => setCalendarView(true)}
            >
              <span className="toggle-icon">📅</span> Calendar
            </button>
          </div>
        </div>

        <div className="appointments-overview">
          <div className="overview-card upcoming-card">
            <div className="overview-icon">📅</div>
            <div className="overview-details">
              <h3>Upcoming Appointments</h3>
              <p className="overview-count">{upcomingCount}</p>
              <p className="overview-label">Scheduled visits</p>
            </div>
          </div>
          
          <div className="overview-card next-card">
            <div className="overview-icon">⏰</div>
            <div className="overview-details">
              <h3>Next Appointment</h3>
              {nextAppointment ? (
                <>
                  <p className="next-date">{formatDate(nextAppointment.date)}</p>
                  <p className="next-doctor">Dr. {nextAppointment.doctorName}</p>
                </>
              ) : (
                <p className="no-appointments">No upcoming appointments</p>
              )}
            </div>
          </div>
          
          <div className="overview-card action-card">
            <div className="overview-icon">➕</div>
            <div className="overview-details">
              <h3>Schedule Visit</h3>
              <p>Book a new appointment with your doctor</p>
              <button 
                className="schedule-btn" 
                onClick={() => setShowScheduleForm(true)}
              >
                Book Now
              </button>
            </div>
          </div>
        </div>

        {calendarView ? (
          <section className="calendar-section">
            <div className="calendar-header">
              <button 
                className="month-nav-btn"
                onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1))}
              >
                &lt;
              </button>
              <h2>
                {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h2>
              <button 
                className="month-nav-btn"
                onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1))}
              >
                &gt;
              </button>
            </div>
            
            <div className="calendar-grid">
              <div className="calendar-day-header">Sun</div>
              <div className="calendar-day-header">Mon</div>
              <div className="calendar-day-header">Tue</div>
              <div className="calendar-day-header">Wed</div>
              <div className="calendar-day-header">Thu</div>
              <div className="calendar-day-header">Fri</div>
              <div className="calendar-day-header">Sat</div>
              
              {calendarDays.map((day, index) => {
                if (!day) return <div key={`empty-${index}`} className="calendar-day empty"></div>;
                
                const dayAppointments = getAppointmentsForDate(day);
                const isToday = new Date().toDateString() === day.toDateString();
                
                return (
                  <div 
                    key={day.getTime()} 
                    className={`calendar-day ${isToday ? 'today' : ''} ${dayAppointments.length > 0 ? 'has-appointments' : ''}`}
                  >
                    <div className="calendar-date">{day.getDate()}</div>
                    {dayAppointments.length > 0 && (
                      <div className="calendar-appointments">
                        {dayAppointments.slice(0, 2).map((app, i) => (
                          <div 
                            key={i} 
                            className={`calendar-appointment ${app.status}`}
                            onClick={() => rescheduleAppointment(app)}
                          >
                            {app.time} - Dr. {app.doctorName.split(' ')[0]}
                          </div>
                        ))}
                        {dayAppointments.length > 2 && (
                          <div className="more-appointments">+{dayAppointments.length - 2} more</div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ) : (
          <section className="appointments-section">
            <div className="filter-tabs">
              <button
                className={`filter-tab ${filter === "upcoming" ? "active" : ""}`}
                onClick={() => setFilter("upcoming")}
              >
                Upcoming
              </button>
              <button
                className={`filter-tab ${filter === "past" ? "active" : ""}`}
                onClick={() => setFilter("past")}
              >
                Past
              </button>
              <button
                className={`filter-tab ${filter === "cancelled" ? "active" : ""}`}
                onClick={() => setFilter("cancelled")}
              >
                Cancelled
              </button>
            </div>

            <div className="appointments-list">
              {filteredAppointments.length > 0 ? (
                filteredAppointments.map((appointment) => (
                  <div key={appointment.id || Math.random()} className="appointment-card">
                    <div className="appointment-date-column">
                      <div className="appointment-date">
                        <div className="appointment-month">
                          {new Date(appointment.date).toLocaleDateString('en-US', { month: 'short' })}
                        </div>
                        <div className="appointment-day">
                          {new Date(appointment.date).getDate()}
                        </div>
                        <div className="appointment-year">
                          {new Date(appointment.date).getFullYear()}
                        </div>
                      </div>
                      <div className="appointment-time">{appointment.time}</div>
                    </div>
                    
                    <div className="appointment-details-column">
                      <div className="appointment-doctor">
                        <img
                          src={appointment.doctorImage || "/api/placeholder/80/80"}
                          alt={appointment.doctorName || "Doctor"}
                          className="doctor-avatar"
                        />
                        <div className="doctor-info">
                          <h4>Dr. {appointment.doctorName || "Doctor Name"}</h4>
                          <p>{appointment.specialization || "Specialization N/A"}</p>
                        </div>
                      </div>
                      
                      <div className="appointment-info">
                        <div className="info-item">
                          <span className="info-icon">📍</span>
                          <span>{appointment.location || "Location N/A"}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-icon">🔍</span>
                          <span>{appointment.reason || "Reason N/A"}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="appointment-status-column">
                      <div className={`status-badge ${appointment.status || "pending"}`}>
                        {appointment.status || "Pending"}
                      </div>
                      
                      {appointment.status !== "cancelled" && appointment.status !== "completed" && (
                        <div className="appointment-actions">
                          <button
                            className="action-button secondary-button"
                            onClick={() => rescheduleAppointment(appointment)}
                          >
                            Reschedule
                          </button>
                          <button
                            className="action-button danger-button"
                            onClick={() => cancelAppointment(appointment.id)}
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                      
                      {appointment.status === "completed" && (
                        <button
                          className="action-button primary-button"
                          onClick={() => navigate(`/medical-record/${appointment.id}`)}
                        >
                          View Summary
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-data-container">
                  <div className="no-data-icon">📅</div>
                  <h3>No {filter} appointments found</h3>
                  <p>Schedule a new appointment to get started</p>
                  <button 
                    className="action-button primary-button"
                    onClick={() => setShowScheduleForm(true)}
                  >
                    Schedule Appointment
                  </button>
                </div>
              )}
            </div>
          </section>
        )}

        {showScheduleForm && (
          <div className="modal-overlay">
            <div className="modal-content appointment-modal">
              <div className="modal-header">
                <h2>{formData.appointmentId ? "Reschedule Appointment" : "Schedule New Appointment"}</h2>
                <button className="close-button" onClick={() => setShowScheduleForm(false)}>
                  ✕
                </button>
              </div>
              <form onSubmit={handleSubmit} className="appointment-form">
                <div className="form-group">
                  <label htmlFor="doctorId">Select Doctor</label>
                  <select
                    id="doctorId"
                    name="doctorId"
                    value={formData.doctorId}
                    onChange={handleInputChange}
                    required
                    disabled={formData.appointmentId}
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
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="date">Date</label>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      min={new Date().toISOString().split("T")[0]}
                      required
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="time">Time</label>
                    <select 
                      id="time" 
                      name="time" 
                      value={formData.time} 
                      onChange={handleInputChange} 
                      required
                      className="form-select"
                    >
                      <option value="">Select a time</option>
                      <option value="09:00 AM">09:00 AM</option>
                      <option value="10:00 AM">10:00 AM</option>
                      <option value="11:00 AM">11:00 AM</option>
                      <option value="12:00 PM">12:00 PM</option>
                      <option value="01:00 PM">01:00 PM</option>
                      <option value="02:00 PM">02:00 PM</option>
                      <option value="03:00 PM">03:00 PM</option>
                      <option value="04:00 PM">04:00 PM</option>
                      <option value="05:00 PM">05:00 PM</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="reason">Reason for Visit</label>
                  <textarea
                    id="reason"
                    name="reason"
                    value={formData.reason}
                    onChange={handleInputChange}
                    rows="3"
                    required
                    className="form-textarea"
                    placeholder="Please describe your symptoms or reason for the appointment"
                  ></textarea>
                </div>
                <div className="form-actions">
                  <button type="button" className="action-button secondary-button" onClick={() => setShowScheduleForm(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="action-button primary-button">
                    {formData.appointmentId ? "Reschedule" : "Schedule"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default PatientAppointments;
