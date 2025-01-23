import React, { useState, useEffect } from "react";
const Prescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [activePrescriptions, setActivePrescriptions] = useState([]);

  useEffect(() => {
    const mockActive = [
      {
        id: 1,
        name: "Lisinopril",
        dosage: "10mg",
        frequency: "Once daily",
        startDate: "2024-12-01",
        endDate: "2025-03-01",
        prescribedBy: "Dr. Sarah Wilson",
        refillsLeft: 2,
        pharmacy: "HealthCare Pharmacy",
      },
      // ... more active prescriptions
    ];

    const mockPast = [
      {
        id: 3,
        name: "Amoxicillin",
        dosage: "500mg",
        frequency: "Three times daily",
        startDate: "2024-11-01",
        endDate: "2024-11-14",
        prescribedBy: "Dr. Michael Brown",
        refillsLeft: 0,
        pharmacy: "HealthCare Pharmacy",
      },
      // ... more past prescriptions
    ];

    setActivePrescriptions(mockActive);
    setPrescriptions(mockPast);
  }, []);

  return (
    <div className="patient-main">
      <header className="patient-header">
        <h1>Prescriptions</h1>
        <div className="header-actions">
          <button className="primary-button">Request Refill</button>
        </div>
      </header>

      <section className="prescriptions-section">
        <h2>Active Prescriptions</h2>
        <div className="prescriptions-list">
          {activePrescriptions.map((prescription) => (
            <div key={prescription.id} className="prescription-card">
              <div className="prescription-header">
                <h4>{prescription.name}</h4>
                <span className="status-badge active">Active</span>
              </div>
              <div className="prescription-details">
                <p className="dosage">
                  <span>Dosage:</span> {prescription.dosage}
                </p>
                <p className="frequency">
                  <span>Frequency:</span> {prescription.frequency}
                </p>
                <p className="dates">
                  <span>Valid:</span> {prescription.startDate} to{" "}
                  {prescription.endDate}
                </p>
                <p className="doctor">
                  <span>Prescribed by:</span> {prescription.prescribedBy}
                </p>
                <p className="pharmacy">
                  <span>Pharmacy:</span> {prescription.pharmacy}
                </p>
              </div>
              <div className="prescription-actions">
                <p className="refills">
                  Refills remaining: {prescription.refillsLeft}
                </p>
                <button className="refill-btn">Request Refill</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="prescriptions-section past-prescriptions">
        <h2>Past Prescriptions</h2>
        <div className="prescriptions-list">
          {prescriptions.map((prescription) => (
            <div key={prescription.id} className="prescription-card inactive">
              {/* Similar structure to active prescriptions */}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Prescriptions;
