import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../../../Styles/DashboardStyles.css";
import "../../../../Styles/PatientPages.css";

const LabReports = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [patientInfo, setPatientInfo] = useState(null);
  const [error, setError] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showTrends, setShowTrends] = useState(false);
  const [trendData, setTrendData] = useState(null);

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
        const [patientResponse, reportsResponse] = await Promise.all([
          fetch("/patientInfo", { headers }),
          fetch("/labReports", { headers }),
        ]);

        // Parse JSON responses
        const [patientData, reportsData] = await Promise.all([
          patientResponse.json(),
          reportsResponse.json(),
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

        // Set lab reports
        setReports(Array.isArray(reportsData) ? reportsData : []);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message);
        setReports([]);
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

  const openReportDetails = (report) => {
    setSelectedReport(report);
  };

  const closeReportDetails = () => {
    setSelectedReport(null);
  };

  const downloadReport = (report) => {
    // In a real app, this would trigger a download of the report
    console.log(`Downloading report: ${report.id}`);
    
    // Create a fake download link
    const link = document.createElement('a');
    link.href = report.fileUrl || '#';
    link.download = `${report.type}_report_${report.id}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const showTrendAnalysis = (testName) => {
    // This would fetch trend data for a specific test
    // For demo purposes, we'll create some mock data
    const mockTrendData = {
      testName: testName,
      unit: testName === "Hemoglobin" ? "g/dL" : testName === "Glucose" ? "mg/dL" : "units",
      normalRange: testName === "Hemoglobin" ? "13.5-17.5" : testName === "Glucose" ? "70-100" : "0-100",
      values: [
        { date: "2023-01-15", value: testName === "Hemoglobin" ? 14.2 : testName === "Glucose" ? 85 : 50 },
        { date: "2023-03-22", value: testName === "Hemoglobin" ? 13.8 : testName === "Glucose" ? 92 : 55 },
        { date: "2023-06-10", value: testName === "Hemoglobin" ? 14.5 : testName === "Glucose" ? 88 : 48 },
        { date: "2023-09-05", value: testName === "Hemoglobin" ? 14.0 : testName === "Glucose" ? 95 : 52 },
        { date: "2023-12-18", value: testName === "Hemoglobin" ? 14.8 : testName === "Glucose" ? 82 : 49 },
        { date: "2024-03-07", value: testName === "Hemoglobin" ? 14.3 : testName === "Glucose" ? 90 : 51 }
      ]
    };
    
    setTrendData(mockTrendData);
    setShowTrends(true);
  };

  // Filter and search reports
  const filteredReports = reports.filter((report) => {
    // Filter by type
    const typeMatch = filter === "all" || report.type === filter;
    
    // Filter by search term
    const searchMatch = 
      searchTerm === "" || 
      report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.orderedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.lab.toLowerCase().includes(searchTerm.toLowerCase());
    
    return typeMatch && searchMatch;
  });

  // Sort reports by date (newest first)
  const sortedReports = [...filteredReports].sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  );

  // Calculate statistics
  const reportStats = {
    total: reports.length,
    completed: reports.filter(r => r.status === "completed").length,
    pending: reports.filter(r => r.status === "pending").length,
    abnormal: reports.filter(r => {
      if (!r.results) return false;
      return r.results.some(result => result.status === "abnormal" || result.status === "critical");
    }).length
  };

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading your lab reports...</p>
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
        <p>Error loading lab reports: {error}</p>
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
              className={`menu-item ${name === "Lab Reports" ? "active" : ""}`}
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
        <div className="page-header lab-reports-header">
          <div className="header-content">
            <h1>Lab Reports</h1>
            <p>View and download your laboratory test results and diagnostic reports</p>
          </div>
        </div>

        <div className="lab-stats-container">
          <div className="lab-stat-card">
            <div className="stat-icon total-icon">🔬</div>
            <div className="stat-content">
              <h3>Total Tests</h3>
              <p className="stat-number">{reportStats.total}</p>
              <p className="stat-label">Lab Reports</p>
            </div>
            <div className="stat-progress">
              <div 
                className="progress-bar" 
                style={{width: `${reportStats.completed / (reportStats.total || 1) * 100}%`}}
              ></div>
            </div>
            <p className="progress-label">
              {reportStats.completed} completed, {reportStats.pending} pending
            </p>
          </div>
          
          <div className="lab-stat-card">
            <div className="stat-icon blood-icon">🩸</div>
            <div className="stat-content">
              <h3>Blood Tests</h3>
              <p className="stat-number">{reports.filter(r => r.type === "blood").length}</p>
              <p className="stat-label">Hematology</p>
            </div>
          </div>
          
          <div className="lab-stat-card">
            <div className="stat-icon imaging-icon">📷</div>
            <div className="stat-content">
              <h3>Imaging</h3>
              <p className="stat-number">{reports.filter(r => r.type === "imaging").length}</p>
              <p className="stat-label">Radiology</p>
            </div>
          </div>
          
          <div className="lab-stat-card">
            <div className="stat-icon abnormal-icon">⚠️</div>
            <div className="stat-content">
              <h3>Abnormal Results</h3>
              <p className="stat-number">{reportStats.abnormal}</p>
              <p className="stat-label">Require Attention</p>
            </div>
          </div>
        </div>

        <div className="reports-controls">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search reports..."
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
              All Reports
            </button>
            <button
              className={`filter-tab ${filter === "blood" ? "active" : ""}`}
              onClick={() => setFilter("blood")}
            >
              Blood Tests
            </button>
            <button
              className={`filter-tab ${filter === "imaging" ? "active" : ""}`}
              onClick={() => setFilter("imaging")}
            >
              Imaging
            </button>
            <button
              className={`filter-tab ${filter === "pathology" ? "active" : ""}`}
              onClick={() => setFilter("pathology")}
            >
              Pathology
            </button>
          </div>
        </div>

        <div className="lab-reports-grid">
          {sortedReports.length > 0 ? (
            sortedReports.map((report) => (
              <div 
                key={report.id || Math.random()} 
                className={`lab-report-card ${report.status}`}
              >
                <div className="report-header">
                  <div className={`report-icon ${report.type}`}>
                    {report.type === "blood" && "🩸"}
                    {report.type === "imaging" && "📷"}
                    {report.type === "pathology" && "🔬"}
                    {!["blood", "imaging", "pathology"].includes(report.type) && "📋"}
                  </div>
                  <div className={`report-status-badge ${report.status}`}>
                    {report.status}
                  </div>
                </div>
                
                <div className="report-body">
                  <h3 className="report-title">{report.name}</h3>
                  <p className="report-date">
                    {new Date(report.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  <div className="report-meta">
                    <div className="meta-item">
                      <span className="meta-label">Ordered by:</span>
                      <span className="meta-value">Dr. {report.orderedBy}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Lab:</span>
                      <span className="meta-value">{report.lab}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Type:</span>
                      <span className="meta-value capitalize">{report.type}</span>
                    </div>
                  </div>
                </div>
                
                <div className="report-footer">
                  {report.status === "completed" ? (
                    <div className="report-actions">
                      <button 
                        className="action-button primary-button"
                        onClick={() => openReportDetails(report)}
                      >
                        View Results
                      </button>
                      <button 
                        className="action-button secondary-button"
                        onClick={() => downloadReport(report)}
                      >
                        Download
                      </button>
                    </div>
                  ) : (
                    <div className="pending-message">
                      <span className="pending-icon">⏳</span>
                      Results pending
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="no-data-container">
              <div className="no-data-icon">🔬</div>
              <h3>No lab reports found</h3>
              <p>Your lab test results will appear here once they are available</p>
            </div>
          )}
        </div>

        {selectedReport && (
          <div className="modal-overlay">
            <div className="modal-content large-modal lab-report-modal">
              <div className="modal-header">
                <h2>{selectedReport.name || "Lab Report Details"}</h2>
                <button className="close-button" onClick={closeReportDetails}>
                  ✕
                </button>
              </div>
              <div className="modal-body">
                <div className="report-details">
                  <div className="report-detail-header">
                    <div className="report-meta">
                      <div className={`report-type-badge large ${selectedReport.type}`}>
                        {selectedReport.type}
                      </div>
                      <p className="report-date-time">
                        {new Date(selectedReport.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      <p className="report-provider">
                        <span className="provider-label">Ordered by:</span> 
                        Dr. {selectedReport.orderedBy}
                      </p>
                      <p className="report-location">
                        <span className="location-label">Laboratory:</span> 
                        {selectedReport.lab}
                      </p>
                    </div>
                  </div>

                  <div className="report-detail-content">
                    {selectedReport.summary && (
                      <div className="report-section">
                        <h4>Summary</h4>
                        <div className="section-content">
                          <p>{selectedReport.summary}</p>
                        </div>
                      </div>
                    )}

                    {selectedReport.results && (
                      <div className="report-section">
                        <h4>Test Results</h4>
                        <div className="section-content">
                          <table className="results-table">
                            <thead>
                              <tr>
                                <th>Test</th>
                                <th>Result</th>
                                <th>Reference Range</th>
                                <th>Status</th>
                                <th>Trend</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedReport.results.map((result, index) => (
                                <tr key={index} className={result.status}>
                                  <td>{result.test}</td>
                                  <td>{result.value}</td>
                                  <td>{result.range}</td>
                                  <td>
                                    <span className={`result-status ${result.status}`}>
                                      {result.status}
                                    </span>
                                  </td>
                                  <td>
                                    <button 
                                      className="trend-button"
                                      onClick={() => showTrendAnalysis(result.test)}
                                    >
                                      View History
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {selectedReport.interpretation && (
                      <div className="report-section">
                        <h4>Interpretation</h4>
                        <div className="section-content interpretation-content">
                          <p>{selectedReport.interpretation}</p>
                        </div>
                      </div>
                    )}

                    {selectedReport.notes && (
                      <div className="report-section">
                        <h4>Notes</h4>
                        <div className="section-content notes-content">
                          <p>{selectedReport.notes}</p>
                        </div>
                      </div>
                    )}

                    {selectedReport.images && selectedReport.images.length > 0 && (
                      <div className="report-section">
                        <h4>Images</h4>
                        <div className="report-images">
                          {selectedReport.images.map((image, index) => (
                            <div key={index} className="report-image">
                              <img src={image.url || "/placeholder.svg"} alt={`Report image ${index + 1}`} />
                              <p>{image.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="action-button secondary-button" onClick={closeReportDetails}>
                  Close
                </button>
                <button 
                  className="action-button primary-button"
                  onClick={() => downloadReport(selectedReport)}
                >
                  Download PDF
                </button>
              </div>
            </div>
          </div>
        )}

        {showTrends && trendData && (
          <div className="modal-overlay">
            <div className="modal-content trend-modal">
              <div className="modal-header">
                <h2>Trend Analysis: {trendData.testName}</h2>
                <button className="close-button" onClick={() => setShowTrends(false)}>
                  ✕
                </button>
              </div>
              <div className="modal-body">
                <div className="trend-details">
                  <div className="trend-info">
                    <p><strong>Test:</strong> {trendData.testName}</p>
                    <p><strong>Unit:</strong> {trendData.unit}</p>
                    <p><strong>Normal Range:</strong> {trendData.normalRange}</p>
                  </div>
                  
                  <div className="trend-chart">
                    <div className="chart-container">
                      <div className="chart-y-axis">
                        {trendData.values.map((_, index) => (
                          <div key={index} className="y-axis-label">
                            {Math.max(...trendData.values.map(v => v.value)) - index * (Math.max(...trendData.values.map(v => v.value)) - Math.min(...trendData.values.map(v => v.value))) / 4}
                          </div>
                        ))}
                      </div>
                      <div className="chart-content">
                        <div className="chart-normal-range"></div>
                        <div className="chart-line">
                          {trendData.values.map((value, index) => (
                            <div 
                              key={index} 
                              className="chart-point"
                              style={{
                                left: `${index / (trendData.values.length - 1) * 100}%`,
                                bottom: `${((value.value - Math.min(...trendData.values.map(v => v.value))) / (Math.max(...trendData.values.map(v => v.value)) - Math.min(...trendData.values.map(v => v.value)))) * 100}%`
                              }}
                              data-value={value.value}
                              data-date={new Date(value.date).toLocaleDateString()}
                            ></div>
                          ))}
                        </div>
                      </div>
                      <div className="chart-x-axis">
                        {trendData.values.map((value, index) => (
                          <div key={index} className="x-axis-label">
                            {new Date(value.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="trend-table">
                    <h4>Historical Values</h4>
                    <table>
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Value</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {trendData.values.map((value, index) => {
                          const normalRangeParts = trendData.normalRange.split('-');
                          const min = parseFloat(normalRangeParts[0]);
                          const max = parseFloat(normalRangeParts[1]);
                          let status = "normal";
                          
                          if (value.value < min) status = "low";
                          if (value.value > max) status = "high";
                          
                          return (
                            <tr key={index} className={status}>
                              <td>{new Date(value.date).toLocaleDateString()}</td>
                              <td>{value.value} {trendData.unit}</td>
                              <td>
                                <span className={`result-status ${status}`}>
                                  {status}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="action-button secondary-button" onClick={() => setShowTrends(false)}>
                  Close
                </button>
                <button className="action-button primary-button">
                  Download Data
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default LabReports;
