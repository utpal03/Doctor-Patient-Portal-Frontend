import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { getAccessToken } from "./components/Utils/tokenService";
import Login from "./components/Auth/Login";
import Signup from "./components/Auth/Signup";
import ForgotPassword from "./components/Auth/ForgotPassword";
import HomePage from "./components/Home/HomePage";
import DoctorDashboard from "./components/Dashboards/Doctor/DoctorDashboard";
import PatientDashboard from "./components/Dashboards/Patient/PatientDashboard";
import BookAppointment from "./components/Dashboards/Patient/Appointment/BookAppointment";
import MyAppoinments from "./components/Dashboards/Patient/Appointment/MyAppointments";
import LabReports from "./components/Dashboards/Patient/LabReports/LabReports";
import MedicalRecords from "./components/Dashboards/Patient/MedicalRecords/MedicalRecords";
import Messages from "./components/Dashboards/Patient/Messages/Messages";
import Prescriptions from "./components/Dashboards/Patient/Prescriptions/Prescriptions";
import Appointments from "./components/Dashboards/Doctor/Appointments";
import DoctorMessages from "./components/Dashboards/Doctor/DoctorMessages";
import Patient_records from "./components/Dashboards/Doctor/Patient_records";
import Schedule from "./components/Dashboards/Doctor/Schedule";
import "./App.css";
import "./Styles/AuthForm.css";
import "./Styles/DashboardStyles.css"
import "./Styles/HomePage.css";

const App = () => {
  const [theme, setTheme] = useState("light");

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const ProtectedRoute = ({ children, allowedUserType }) => {
    const token = getAccessToken();
    let userRoles = [];
    try {
      const rolesFromStorage = localStorage.getItem('roles');
      if (rolesFromStorage) {
        const parsed = JSON.parse(rolesFromStorage);
        // Ensure parsed value is an array
        userRoles = Array.isArray(parsed) ? parsed : [parsed];
      }
    } catch (error) {
      console.error('Error parsing user roles:', error);
      return <Navigate to="/login" replace />;
    }

    // Check token existence
    if (!token) {
      return <Navigate to="/login" replace />;
    }

    // Check user role if specified
    if (allowedUserType && userRoles.length > 0) {
      const hasAllowedRole = userRoles.some(role => {
        // Handle both string and object role formats
        const roleValue = typeof role === 'string' ? role : role?.name || role?.type || '';
        return roleValue.toLowerCase() === allowedUserType.toLowerCase();
      });

      if (!hasAllowedRole) {
        return <Navigate to="/" replace />;
      }
    }

    return children;
  };

  return (
    <div className={`app ${theme}`}>
      <Router>
        <Routes>
          <Route
            path="/"
            element={<HomePage theme={theme} toggleTheme={toggleTheme} />}
          />
          <Route path="/login" element={<Login />} />
          <Route path="/signup/doctor" element={<Signup userType="doctor" />} />
          <Route path="/signup/patient" element={<Signup userType="patient" />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          
          {/* Patient Protected Routes */}
          <Route
            path="/patient/dashboard"
            element={
              <ProtectedRoute allowedUserType="patient">
                <PatientDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bookappointment"
            element={
              <ProtectedRoute allowedUserType="patient">
                <BookAppointment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-appointment"
            element={
              <ProtectedRoute allowedUserType="patient">
                <MyAppoinments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/medical-record"
            element={
              <ProtectedRoute allowedUserType="patient">
                <MedicalRecords />
              </ProtectedRoute>
            }
          />
          <Route
            path="/prescription"
            element={
              <ProtectedRoute allowedUserType="patient">
                <Prescriptions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/messages"
            element={
              <ProtectedRoute allowedUserType="patient">
                <Messages />
              </ProtectedRoute>
            }
          />
          <Route
            path="/LabReports"
            element={
              <ProtectedRoute allowedUserType="patient">
                <LabReports />
              </ProtectedRoute>
            }
          />

          {/* Doctor Protected Routes */}
          <Route
            path="/doctor/dashboard"
            element={
              <ProtectedRoute allowedUserType="doctor">
                <DoctorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/myappointment"
            element={
              <ProtectedRoute allowedUserType="doctor">
                <Appointments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctordashboard/patient-record"
            element={
              <ProtectedRoute allowedUserType="doctor">
                <Patient_records />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/messages"
            element={
              <ProtectedRoute allowedUserType="doctor">
                <DoctorMessages />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctoe/Schedule"
            element={
              <ProtectedRoute allowedUserType="doctor">
                <Schedule />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </div>
  );
};

export default App;