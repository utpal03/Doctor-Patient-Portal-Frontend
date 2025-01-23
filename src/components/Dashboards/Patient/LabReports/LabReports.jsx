import React, { useState, useEffect } from "react";
const LabReports = () => {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const mockReports = [
      {
        id: 1,
        name: "Complete Blood Count",
        date: "2024-12-15",
        category: "Blood Work",
        requestedBy: "Dr. Sarah Wilson",
        status: "completed",
        results: "Normal",
        priority: "routine",
      },
      // ... more reports
    ];

    setReports(mockReports);
  }, []);

  return (
    <div className="patient-main">
      <header className="patient-header">
        <h1>Lab Reports</h1>
        <div className="header-actions">
          <input
            type="text"
            placeholder="Search reports..."
            className="search-input"
          />
          <select className="filter-select">
            <option value="all">All Reports</option>
            <option value="blood">Blood Work</option>
            <option value="imaging">Imaging</option>
            <option value="other">Other Tests</option>
          </select>
        </div>
      </header>

      <section className="lab-reports-section">
        <div className="reports-list">
          {reports.map((report) => (
            <div key={report.id} className="report-card">
              <div className="report-header">
                <div>
                  <h4>{report.name}</h4>
                  <p className="category">{report.category}</p>
                </div>
                <span className={`status-badge ${report.status}`}>
                  {report.status}
                </span>
              </div>
              <div className="report-details">
                <p className="date">
                  <span>Date:</span> {report.date}
                </p>
                <p className="doctor">
                  <span>Requested by:</span> {report.requestedBy}
                </p>
                <p className="results">
                  <span>Results:</span> {report.results}
                </p>
              </div>
              <div className="report-actions">
                <button className="view-report-btn">View Full Report</button>
                <button className="download-btn">Download PDF</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
export default LabReports;
