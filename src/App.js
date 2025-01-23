import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
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
import "./App.css";
import "./Styles/AuthForm.css";
import "./Styles/DoctorDashboard.css";
import "./Styles/BookAppoinment.css";
import "./Styles/HomePage.css";

const App = () => {
  const [theme, setTheme] = useState("light");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [Role, setUserType] = useState(null);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  // Protected Route Component
  const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" />;
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
          <Route
            path="/login"
            element={
              <Login setAuth={setIsAuthenticated} setUserType={setUserType} />
            }
          />
          <Route path="/signup/doctor" element={<Signup userType="doctor" />} />
          <Route
            path="/signup/patient"
            element={<Signup userType="patient" />}
          />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route
            path="/book-appointment"
            element={
              <ProtectedRoute>
                <BookAppointment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-appointment"
            element={
              <ProtectedRoute>
                <MyAppoinments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/medical-record"
            element={
              <ProtectedRoute>
                <MedicalRecords />
              </ProtectedRoute>
            }
          />
          <Route
            path="/prescription"
            element={
              <ProtectedRoute>
                <Prescriptions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/messages"
            element={
              <ProtectedRoute>
                <Messages />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/dashboard"
            element={
              <ProtectedRoute allowedUserType="patient">
                <PatientDashboard />
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
          <Route
            path="/doctor/dashboard"
            element={
              <ProtectedRoute allowedUserType="doctor">
                <DoctorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bookAppointment"
            element={
              <ProtectedRoute allowedUserType="doctor">
                <BookAppointment />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </div>
  );
};

export default App;
