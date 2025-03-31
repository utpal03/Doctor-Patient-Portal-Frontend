import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../../../Styles/DashboardStyles.css";
import "../../../../Styles/PatientPages.css";

const MedicalRecords = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const [patientInfo, setPatientInfo] = useState(null);
  const [error, setError] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [timelineView, setTimelineView] = useState(false);

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
        const [patientResponse, recordsResponse] = await Promise.all([
          fetch("/patientInfo", { headers }),
          fetch("/medicalRecords", { headers }),
        ]);

        // Parse JSON responses
        const [patientData, recordsData] = await Promise.all([
          patientResponse.json(),
          recordsResponse.json(),
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

        // Set medical records
        setRecords(Array.isArray(recordsData) ? recordsData : []);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message);
        setRecords([]);
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

  const openRecordDetails = (record) => {
    setSelectedRecord(record);
  };

  const closeRecordDetails = () => {
    setSelectedRecord(null);
  };

  // Filter and search records
  const filteredRecords = records.filter((record) => {
    // Filter by type
    const typeMatch = filter === "all" || record.type === filter;
    
    // Filter by search term
    const searchMatch = 
      searchTerm === "" || 
      record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (record.summary && record.summary.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return typeMatch && searchMatch;
  });

  // Sort records by date (newest first)
  const sortedRecords = [...filteredRecords].sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  );

  // Group records by year for timeline view
  const recordsByYear = sortedRecords.reduce((acc, record) => {
    const year = new Date(record.date).getFullYear();
    if (!acc[year]) {
      acc[year] = [];
    }
    acc[year].push(record);
    return acc;
  }, {});

  // Calculate statistics
  const recordStats = {
    total: records.length,
    consultations: records.filter(r => r.type === "consultation").length,
    procedures: records.filter(r => r.type === "procedure").length,
    surgeries: records.filter(r => r.type === "surgery").length,
    lastVisit: records.length > 0 ? 
      new Date(Math.max(...records.map(r => new Date(r.date)))).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }) : 'N/A'
  };

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading your medical records...</p>
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
        <p>Error loading medical records: {error}</p>
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
              className={`menu-item ${name === "Medical Records" ? "active" : ""}`}
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
        <div className="page-header medical-records-header">
          <div className="header-content">
            <h1>Medical Records</h1>
            <p>Your complete medical history and healthcare documentation</p>
          </div>
          <div className="view-toggle">
            <button 
              className={`view-toggle-btn ${!timelineView ? 'active' : ''}`}
              onClick={() => setTimelineView(false)}
            >
              <span className="toggle-icon">📋</span> Grid
            </button>
            <button 
              className={`view-toggle-btn ${timelineView ? 'active' : ''}`}
              onClick={() => setTimelineView(true)}
            >
              <span className="toggle-icon">📊</span> Timeline
            </button>
          </div>
        </div>

        <div className="medical-stats-container">
          <div className="medical-stat-card">
            <div className="stat-icon total-icon">📋</div>
            <div className="stat-content">
              <h3>Total Records</h3>
              <p className="stat-number">{recordStats.total}</p>
              <p className="stat-label">Medical Documents</p>
            </div>
          </div>
          
          <div className="medical-stat-card">
            <div className="stat-icon consultation-icon">🩺</div>
            <div className="stat-content">
              <h3>Consultations</h3>
              <p className="stat-number">{recordStats.consultations}</p>
              <p className="stat-label">Doctor Visits</p>
            </div>
          </div>
          
          <div className="medical-stat-card">
            <div className="stat-icon procedure-icon">💉</div>
            <div className="stat-content">
              <h3>Procedures</h3>
              <p className="stat-number">{recordStats.procedures}</p>
              <p className="stat-label">Medical Procedures</p>
            </div>
          </div>
          
          <div className="medical-stat-card">
            <div className="stat-icon surgery-icon">🔪</div>
            <div className="stat-content">
              <h3>Surgeries</h3>
              <p className="stat-number">{recordStats.surgeries}</p>
              <p className="stat-label">Surgical Procedures</p>
            </div>
          </div>
        </div>

        <div className="records-controls">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search records..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>
          
          <div className="filter-tabs">
            <button
              className={`filter-tab ${filter === "all" ? "active" : ""}`}
              onClick={() => setFilter("all")}
            >
              All Records
            </button>
            <button
              className={`filter-tab ${filter === "consultation" ? "active" : ""}`}
              onClick={() => setFilter("consultation")}
            >
              Consultations
            </button>
            <button
              className={`filter-tab ${filter === "procedure" ? "active" : ""}`}
              onClick={() => setFilter("procedure")}
            >
              Procedures
            </button>
            <button
              className={`filter-tab ${filter === "surgery" ? "active" : ""}`}
              onClick={() => setFilter("surgery")}
            >
              Surgeries
            </button>
          </div>
        </div>

        {timelineView ? (
          <div className="timeline-container">
            {Object.keys(recordsByYear).length > 0 ? (
              Object.keys(recordsByYear)
                .sort((a, b) => b - a) // Sort years in descending order
                .map(year => (
                  <div key={year} className="timeline-year">
                    <div className="timeline-year-marker">
                      <div className="year-circle">{year}</div>
                      <div className="year-line"></div>
                    </div>
                    <div className="timeline-events">
                      {recordsByYear[year].map(record => (
                        <div 
                          key={record.id} 
                          className={`timeline-event ${record.type}`}
                          onClick={() => openRecordDetails(record)}
                        >
                          <div className="timeline-date">
                            {new Date(record.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                          <div className="timeline-content">
                            <div className={`timeline-icon ${record.type}`}>
                              {record.type === "consultation" && "🩺"}
                              {record.type === "procedure" && "💉"}
                              {record.type === "surgery" && "🔪"}
                            </div>
                            <div className="timeline-details">
                              <h4>{record.title}</h4>
                              <p>Dr. {record.doctorName} • {record.facility}</p>
                              <div className={`record-type-badge ${record.type}`}>
                                {record.type}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
            ) : (
              <div className="no-data-container">
                <div className="no-data-icon">📋</div>
                <h3>No medical records found</h3>
                <p>Your medical history will appear here once records are added</p>
              </div>
            )}
          </div>
        ) : (
          <div className="records-grid">
            {sortedRecords.length > 0 ? (
              sortedRecords.map((record) => (
                <div 
                  key={record.id || Math.random()} 
                  className={`record-card ${record.type}`}
                  onClick={() => openRecordDetails(record)}
                >
                  <div className="record-header">
                    <div className={`record-icon ${record.type}`}>
                      {record.type === "consultation" && "🩺"}
                      {record.type === "procedure" && "💉"}
                      {record.type === "surgery" && "🔪"}
                    </div>
                    <div className={`record-type-badge ${record.type}`}>
                      {record.type}
                    </div>
                  </div>
                  
                  <div className="record-body">
                    <h3 className="record-title">{record.title}</h3>
                    <p className="record-date">
                      {new Date(record.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    <p className="record-doctor">Dr. {record.doctorName}</p>
                    <p className="record-facility">{record.facility}</p>
                    
                    {record.summary && (
                      <div className="record-summary">
                        <h4>Summary</h4>
                        <p>{record.summary.substring(0, 100)}...</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="record-footer">
                    <button className="view-details-btn">View Details</button>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-data-container">
                <div className="no-data-icon">📋</div>
                <h3>No medical records found</h3>
                <p>Your medical history will appear here once records are added</p>
              </div>
            )}
          </div>
        )}

        {selectedRecord && (
          <div className="modal-overlay">
            <div className="modal-content large-modal record-detail-modal">
              <div className="modal-header">
                <h2>{selectedRecord.title || "Medical Record Details"}</h2>
                <button className="close-button" onClick={closeRecordDetails}>
                  ✕
                </button>
              </div>
              <div className="modal-body">
                <div className="record-details">
                  <div className="record-detail-header">
                    <div className="record-meta">
                      <div className={`record-type-badge large ${selectedRecord.type}`}>
                        {selectedRecord.type}
                      </div>
                      <p className="record-date-time">
                        {new Date(selectedRecord.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      <p className="record-provider">
                        <span className="provider-label">Provider:</span> 
                        Dr. {selectedRecord.doctorName}
                      </p>
                      <p className="record-location">
                        <span className="location-label">Facility:</span> 
                        {selectedRecord.facility}
                      </p>
                    </div>
                  </div>

                  <div className="record-detail-content">
                    {selectedRecord.summary && (
                      <div className="record-section">
                        <h4>Summary</h4>
                        <div className="section-content">
                          <p>{selectedRecord.summary}</p>
                        </div>
                      </div>
                    )}

                    {selectedRecord.diagnosis && (
                      <div className="record-section">
                        <h4>Diagnosis</h4>
                        <div className="section-content diagnosis-content">
                          <p>{selectedRecord.diagnosis}</p>
                        </div>
                      </div>
                    )}

                    {selectedRecord.treatment && (
                      <div className="record-section">
                        <h4>Treatment</h4>
                        <div className="section-content">
                          <p>{selectedRecord.treatment}</p>
                        </div>
                      </div>
                    )}

                    {selectedRecord.notes && (
                      <div className="record-section">
                        <h4>Doctor's Notes</h4>
                        <div className="section-content notes-content">
                          <p>{selectedRecord.notes}</p>
                        </div>
                      </div>
                    )}

                    {selectedRecord.followUp && (
                      <div className="record-section">
                        <h4>Follow-up Instructions</h4>
                        <div className="section-content followup-content">
                          <p>{selectedRecord.followUp}</p>
                        </div>
                      </div>
                    )}

                    {selectedRecord.medications && selectedRecord.medications.length > 0 && (
                      <div className="record-section">
                        <h4>Prescribed Medications</h4>
                        <div className="section-content">
                          <div className="medications-table">
                            <div className="med-table-header">
                              <div className="med-name">Medication</div>
                              <div className="med-dosage">Dosage</div>
                              <div className="med-frequency">Frequency</div>
                              <div className="med-instructions">Instructions</div>
                            </div>
                            {selectedRecord.medications.map((med, index) => (
                              <div key={index} className="med-table-row">
                                <div className="med-name">{med.name}</div>
                                <div className="med-dosage">{med.dosage}</div>
                                <div className="med-frequency">{med.frequency}</div>
                                <div className="med-instructions">{med.instructions || "N/A"}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="action-button secondary-button" onClick={closeRecordDetails}>
                  Close
                </button>
                <button className="action-button primary-button">
                  Download PDF
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default MedicalRecords;
