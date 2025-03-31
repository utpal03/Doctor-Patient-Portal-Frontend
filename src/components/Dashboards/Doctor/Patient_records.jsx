import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../../Styles/DashboardStyles.css"

const PatientRecords = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);

  useEffect(() => {
    // Mock patient records
    const mockPatients = [
      {
        id: 1,
        name: "John Doe",
        age: 45,
        gender: "Male",
        condition: "Hypertension",
        lastVisit: "2024-12-15",
        nextAppointment: "2025-01-23",
        medicalHistory: [
          { date: "2024-12-15", description: "Regular checkup, BP: 130/85" },
          { date: "2024-11-01", description: "Prescribed new medication" }
        ]
      },
      {
        id: 2,
        name: "Sarah Smith",
        age: 32,
        gender: "Female",
        condition: "Diabetes Type 2",
        lastVisit: "2024-11-20",
        nextAppointment: "2025-01-24",
        medicalHistory: [
          { date: "2024-11-20", description: "HbA1c Test: 6.8%" },
          { date: "2024-10-05", description: "Diet consultation" }
        ]
      }
    ]
    setPatients(mockPatients);
  }, []);

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
  };

  const handleAddNote = (patientId, note) => {
    setPatients(patients.map(patient => {
      if (patient.id === patientId) {
        return {
          ...patient,
          medicalHistory: [
            { date: new Date().toISOString().split('T')[0], description: note },
            ...patient.medicalHistory
          ]
        };
      }
      return patient;
    }));
  };

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.condition.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="patient-records">
      <div className="records-sidebar">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search patients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="patients-list">
          {filteredPatients.map((patient) => (
            <div
              key={patient.id}
              className={`patient-item ${selectedPatient?.id === patient.id ? 'selected' : ''}`}
              onClick={() => handlePatientSelect(patient)}
            >
              <h3>{patient.name}</h3>
              <p>{patient.condition}</p>
              <span className="last-visit">Last visit: {patient.lastVisit}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="record-details">
        {selectedPatient ? (
          <>
            <div className="patient-header">
              <h2>{selectedPatient.name}</h2>
              <div className="patient-info">
                <span>Age: {selectedPatient.age}</span>
                <span>Gender: {selectedPatient.gender}</span>
                <span>Condition: {selectedPatient.condition}</span>
              </div>
            </div>

            <div className="appointments-info">
              <div className="info-card">
                <h3>Last Visit</h3>
                <p>{selectedPatient.lastVisit}</p>
              </div>
              <div className="info-card">
                <h3>Next Appointment</h3>
                <p>{selectedPatient.nextAppointment}</p>
              </div>
            </div>

            <div className="medical-history">
              <h3>Medical History</h3>
              <div className="add-note">
                <textarea
                  placeholder="Add new note..."
                  rows="3"
                />
                <button onClick={() => handleAddNote(selectedPatient.id, document.querySelector('textarea').value)}>
                  Add Note
                </button>
              </div>
              
              <div className="history-list">
                {selectedPatient.medicalHistory.map((record, index) => (
                  <div key={index} className="history-item">
                    <span className="date">{record.date}</span>
                    <p>{record.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="no-selection">
            <p>Select a patient to view their records</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientRecords;