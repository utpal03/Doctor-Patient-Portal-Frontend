import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signup } from "../Utils/api";

const Signup = ({ userType }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
    phoneNumber: "",
    age: userType === "patient" ? "" : undefined,
    bloodGroup: userType === "patient" ? "" : undefined,
    department: userType === "doctor" ? "" : undefined,
    experience: userType === "doctor" ? "" : undefined,
    licenseNumber: userType === "doctor" ? "" : undefined,
    consultationFees: userType === "doctor" ? "" : undefined,
    availableDays: userType === "doctor" ? [] : undefined,
    profileImage: null,
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  const departments = [
    "Cardiology",
    "Neurology",
    "Orthopedics",
    "Pediatrics",
    "General Medicine",
    "Dermatology",
    "Psychiatry",
    "Ophthalmology",
  ];
  const availableDays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name?.trim()) newErrors.name = "Name is required";
    if (!formData.email?.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email is invalid";
    if (!formData.username?.trim()) newErrors.username = "Username is required";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    if (!formData.phoneNumber?.trim())
      newErrors.phoneNumber = "Phone number is required";
    else if (!/^\d{10}$/.test(formData.phoneNumber))
      newErrors.phoneNumber = "Invalid phone number format";
    if (userType === "patient") {
      if (!formData.age || isNaN(Number(formData.age)))
        newErrors.age = "Valid age is required";
      if (!formData.bloodGroup)
        newErrors.bloodGroup = "Blood group is required";
    }

    if (userType === "doctor") {
      if (!formData.department) newErrors.department = "Department is required";
      if (!formData.licenseNumber)
        newErrors.licenseNumber = "License number is required";
      if (!formData.consultationFees)
        newErrors.consultationFees = "Consultation fees are required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const formDataToSubmit = new FormData();
      formDataToSubmit.append("role", userType);
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== undefined && formData[key] !== null) {
          if (key === "availableDays" && Array.isArray(formData[key])) {
            formDataToSubmit.append(key, JSON.stringify(formData[key]));
          } else if (key === "profileImage" && formData[key]) {
            const file = formData[key];
            const blob = new Blob([file], { type: file.type });
            formDataToSubmit.append(key, blob, file.name);
          } else {
            formDataToSubmit.append(key, formData[key]);
          }
        }
      });
      await signup(userType, formDataToSubmit);
      navigate("/login");
    } catch (err) {
      setErrors({
        submit:
          err.response?.data?.message || "Signup failed. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDaysChange = (day) => {
    setFormData((prev) => ({
      ...prev,
      availableDays: prev.availableDays.includes(day)
        ? prev.availableDays.filter((d) => d !== day)
        : [...prev.availableDays, day],
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, profileImage: file }));
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>Create {userType === "doctor" ? "Doctor" : "Patient"} Account</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className={errors.name ? "error" : ""}
            />
            {errors.name && <div className="error-message">{errors.name}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className={errors.email ? "error" : ""}
            />
            {errors.email && (
              <div className="error-message">{errors.email}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              className={errors.username ? "error" : ""}
            />
            {errors.username && (
              <div className="error-message">{errors.username}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className={errors.password ? "error" : ""}
            />
            {errors.password && (
              <div className="error-message">{errors.password}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="phoneNumber">Phone Number</label>
            <input
              id="phoneNumber"
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) =>
                setFormData({ ...formData, phoneNumber: e.target.value })
              }
              className={errors.phoneNumber ? "error" : ""}
            />
            {errors.phoneNumber && (
              <div className="error-message">{errors.phoneNumber}</div>
            )}
          </div>

          {userType === "patient" && (
            <>
              <div className="form-group">
                <label htmlFor="age">Age</label>
                <input
                  id="age"
                  type="number"
                  value={formData.age}
                  onChange={(e) =>
                    setFormData({ ...formData, age: e.target.value })
                  }
                  className={errors.age ? "error" : ""}
                />
                {errors.age && (
                  <div className="error-message">{errors.age}</div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="bloodGroup">Blood Group</label>
                <select
                  id="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={(e) =>
                    setFormData({ ...formData, bloodGroup: e.target.value })
                  }
                  className={errors.bloodGroup ? "error" : ""}
                >
                  <option value="">Select Blood Group</option>
                  {bloodGroups.map((group) => (
                    <option key={group} value={group}>
                      {group}
                    </option>
                  ))}
                </select>
                {errors.bloodGroup && (
                  <div className="error-message">{errors.bloodGroup}</div>
                )}
              </div>
            </>
          )}

          {userType === "doctor" && (
            <>
              <div className="form-group">
                <label htmlFor="department">Department</label>
                <select
                  id="department"
                  value={formData.department}
                  onChange={(e) =>
                    setFormData({ ...formData, department: e.target.value })
                  }
                  className={errors.department ? "error" : ""}
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
                {errors.department && (
                  <div className="error-message">{errors.department}</div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="experience">Experience (Years)</label>
                <input
                  id="experience"
                  type="number"
                  value={formData.experience || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, experience: e.target.value })
                  }
                  className={errors.experience ? "error" : ""}
                />
                {errors.experience && (
                  <div className="error-message">{errors.experience}</div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="licenseNumber">License Number</label>
                <input
                  id="licenseNumber"
                  type="text"
                  value={formData.licenseNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, licenseNumber: e.target.value })
                  }
                  className={errors.licenseNumber ? "error" : ""}
                />
                {errors.licenseNumber && (
                  <div className="error-message">{errors.licenseNumber}</div>
                )}
              </div>

              <div className="form-group available-days-container">
                <label>Available Days</label>
                {availableDays.map((day) => (
                  <div key={day}>
                    <input
                      type="checkbox"
                      id={day}
                      checked={formData.availableDays.includes(day)}
                      onChange={() => handleDaysChange(day)}
                    />
                    <label htmlFor={day}>{day}</label>
                  </div>
                ))}
              </div>

              <div className="form-group">
                <label htmlFor="consultationFees">Consultation Fees</label>
                <input
                  id="consultationFees"
                  type="number"
                  value={formData.consultationFees}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      consultationFees: e.target.value,
                    })
                  }
                  className={errors.consultationFees ? "error" : ""}
                />
                {errors.consultationFees && (
                  <div className="error-message">{errors.consultationFees}</div>
                )}
              </div>
            </>
          )}

          <div className="form-group">
            <label htmlFor="profileImage">Upload Profile Image</label>
            <input
              id="profileImage"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
            {errors.profileImage && (
              <div className="error-message">{errors.profileImage}</div>
            )}
          </div>

          <div className="form-group">
            <button type="submit" className="auth-button" disabled={isLoading}>
              {isLoading ? <div className="spinner"></div> : "Sign Up"}
            </button>
          </div>

          <div className="auth-links">
            <p>
              Already have an account? <Link to="/login">Login</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;
