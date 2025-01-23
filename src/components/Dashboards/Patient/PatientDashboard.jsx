import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../../Styles/PatientDashboard.css";

const PatientDashboard = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [medications, setMedications] = useState([]);
  const [reports, setReports] = useState([]);
  const [patientInfo, setPatientInfo] = useState({
    name: "John Doe",
    id: "P-12345",
    age: 35,
    bloodGroup: "O+",
    nextAppointment: "2025-01-23",
  });

  useEffect(() => {
    // Fetch patient's data
    const mockAppointments = [
      {
        id: 1,
        doctorName: "Dr. Sarah Wilson",
        specialization: "Cardiologist",
        doctorImage: "/api/placeholder/64/64",
        date: "2025-01-23",
        time: "10:00 AM",
        status: "upcoming",
        location: "Main Clinic, Room 105",
      },
      {
        id: 2,
        doctorName: "Dr. Michael Brown",
        specialization: "General Physician",
        doctorImage: "/api/placeholder/64/64",
        date: "2025-02-15",
        time: "2:30 PM",
        status: "scheduled",
        location: "West Wing, Room 203",
      },
    ];

    const mockMedications = [
      {
        id: 1,
        name: "Aspirin",
        dosage: "81mg",
        frequency: "Once daily",
        timeLeft: "15 days",
        prescribedBy: "Dr. Sarah Wilson",
      },
      {
        id: 2,
        name: "Lisinopril",
        dosage: "10mg",
        frequency: "Twice daily",
        timeLeft: "7 days",
        prescribedBy: "Dr. Sarah Wilson",
      },
    ];

    const mockReports = [
      {
        id: 1,
        name: "Blood Work Analysis",
        date: "2024-12-15",
        doctor: "Dr. Sarah Wilson",
        status: "completed",
      },
      {
        id: 2,
        name: "ECG Report",
        date: "2024-12-15",
        doctor: "Dr. Sarah Wilson",
        status: "pending",
      },
    ];

    setAppointments(mockAppointments);
    setMedications(medications);
    setReports(mockReports);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userType");
    navigate("/login");
  };

  const MyAppointments = () => {
    navigate("/my-appointment");
  };
  const Dashboard = () => {
    navigate("/patient/dashboard");
  };
  const MedicalRecords = () => {
    navigate("/medical-record");
  };

  const LabReports = () => {
    navigate("/LabReports");
  };

  const Messages = () => {
    navigate("/messages");
  };
  const prescription = () => {
    navigate("/prescription");
  };

  return (
    <div className="patient-dashboard">
      <nav className="patient-sidebar">
        <div className="patient-profile">
          <img
            src="/api/placeholder/80/80"
            alt="Patient"
            className="patient-avatar"
          />
          <h3>{patientInfo.name}</h3>
          <p>Patient ID: {patientInfo.id}</p>
          <div className="patient-quick-info">
            <span>Age: {patientInfo.age}</span>
            <span>Blood: {patientInfo.bloodGroup}</span>
          </div>
        </div>

        <div className="nav-menu">
          <button className="menu-item active" onClick={Dashboard}>
            Dashboard
          </button>

          <button className="menu-item " onClick={MyAppointments}>
            MyAppointment
          </button>

          <button className="menu-item" onClick={MedicalRecords}>
            Medical Records
          </button>

          <button className="menu-item" onClick={prescription}>
            Prescriptions
          </button>

          <button className="menu-item" onClick={LabReports}>
            LabReports
          </button>

          <button className="menu-item" onClick={Messages}>
            Messages
          </button>

          <button className="menu-item logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      <main className="patient-main">
        <header className="patient-header">
          <h1>My Health Dashboard</h1>

          <div className="health-summary">
            <div className="health-card">
              <h3>Next Appointment</h3>
              {appointments[0] ? (
                <div className="next-appointment">
                  <p className="date">{appointments[0].date}</p>
                  <p className="time">{appointments[0].time}</p>
                  <p className="doctor">with {appointments[0].doctorName}</p>
                  <p className="location">{appointments[0].location}</p>
                </div>
              ) : (
                <p>No upcoming appointments</p>
              )}
            </div>

            <div className="health-card">
              <h3>Active Medications</h3>
              <p className="stat">{medications.length}</p>
              <p className="stat-label">Current Prescriptions</p>
            </div>

            <div className="health-card">
              <h3>Recent Reports</h3>
              <p className="stat">
                {reports.filter((r) => r.status === "pending").length}
              </p>
              <p className="stat-label">Pending Reports</p>
            </div>
          </div>
        </header>

        <section className="appointments-overview">
          <h2>Upcoming Appointments</h2>
          <div className="appointment-cards">
            {appointments.map((appointment) => (
              <div key={appointment.id} className="appointment-card">
                <div className="doctor-info">
                  <img
                    src={appointment.doctorImage}
                    alt={appointment.doctorName}
                    className="doctor-image"
                  />
                  <div>
                    <h4>{appointment.doctorName}</h4>
                    <p className="specialization">
                      {appointment.specialization}
                    </p>
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
                  <div className={`status-badge ${appointment.status}`}>
                    {appointment.status}
                  </div>
                  <button className="reschedule-btn">Reschedule</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="medications-section">
          <h2>Current Medications</h2>
          <div className="medications-list">
            {medications.map((medication) => (
              <div key={medication.id} className="medication-card">
                <div className="medication-info">
                  <h4>{medication.name}</h4>
                  <p className="medication-dosage">{medication.dosage}</p>
                  <p className="medication-frequency">{medication.frequency}</p>
                </div>
                <div className="medication-status">
                  <p className="time-left">Refill in: {medication.timeLeft}</p>
                  <p className="prescribed-by">Dr. {medication.prescribedBy}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="reports-section">
          <h2>Recent Medical Reports</h2>
          <div className="reports-list">
            {reports.map((report) => (
              <div key={report.id} className="report-card">
                <div className="report-info">
                  <h4>{report.name}</h4>
                  <p className="report-date">{report.date}</p>
                </div>
                <div className="report-status">
                  <span className={`status-badge ${report.status}`}>
                    {report.status}
                  </span>
                  <button className="view-report-btn">View Report</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};
export default PatientDashboard;