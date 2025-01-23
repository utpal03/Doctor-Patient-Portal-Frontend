import React, { useState } from "react";
import { bookAppointment } from "../../../Utils/api";

const BookAppointment = () => {
  const [formData, setFormData] = useState({
    patientName: "",
    phoneNumber: "",
    department: "",
    appointmentDate: "",
  });

  const departments = ["Cardiology", "Neurology", "Orthopedics", "Pediatrics", "General Medicine"];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await bookAppointment(formData);
      console.log(response); // Handle response
    } catch (err) {
      console.error("Booking error", err);
    }
  };

  return (
    <div className="appointment-form">
      <h2>Book Appointment</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Patient Name"
          value={formData.patientName}
          onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
        />
        <input
          type="text"
          placeholder="Phone Number"
          value={formData.phoneNumber}
          onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
        />
        <select
          value={formData.department}
          onChange={(e) => setFormData({ ...formData, department: e.target.value })}
        >
          <option value="">Select Department</option>
          {departments.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={formData.appointmentDate}
          onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
        />
        <button type="submit">Book Appointment</button>
      </form>
    </div>
  );
};

export default BookAppointment;
