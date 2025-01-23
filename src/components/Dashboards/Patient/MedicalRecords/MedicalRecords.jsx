import React, { useState, useEffect } from "react";
const MedicalRecords = () => {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    const mockRecords = [
      {
        id: 1,
        type: "Diagnosis",
        condition: "Hypertension",
        date: "2024-12-15",
        doctor: "Dr. Sarah Wilson",
        details: "Stage 1 hypertension diagnosed. Regular monitoring required.",
      },
      // ... more records
    ];

    setRecords(mockRecords);
  }, []);

  return (
    <div className="patient-main">
      <header className="patient-header">
        <h1>Medical Records</h1>
        <div className="header-actions">
          <input
            type="text"
            placeholder="Search records..."
            className="search-input"
          />
          <select className="filter-select">
            <option value="all">All Records</option>
            <option value="diagnosis">Diagnosis</option>
            <option value="procedures">Procedures</option>
            <option value="tests">Test Results</option>
          </select>
        </div>
      </header>

      <section className="records-section">
        <div className="records-list">
          {records.map((record) => (
            <div key={record.id} className="record-card">
              <div className="record-header">
                <h4>{record.type}</h4>
                <span className="record-date">{record.date}</span>
              </div>
              <div className="record-content">
                <p className="condition">{record.condition}</p>
                <p className="details">{record.details}</p>
                <p className="doctor">Attending: {record.doctor}</p>
              </div>
              <div className="record-actions">
                <button className="view-details-btn">View Details</button>
                <button className="download-btn">Download</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default MedicalRecords;
