import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../../Styles/DoctorSchedule.css";

const DoctorSchedule = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [schedule, setSchedule] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [newEvent, setNewEvent] = useState({
    title: "",
    startTime: "",
    endTime: "",
    type: "appointment",
    notes: ""
  });

  useEffect(() => {
    // Mock schedule data
    const mockSchedule = [
      {
        id: 1,
        title: "Patient Consultation - John Doe",
        startTime: "09:00",
        endTime: "10:00",
        type: "appointment",
        notes: "Follow-up checkup"
      },
      {
        id: 2,
        title: "Team Meeting",
        startTime: "11:00",
        endTime: "12:00",
        type: "meeting",
        notes: "Weekly staff meeting"
      },
      {
        id: 3,
        title: "Lunch Break",
        startTime: "13:00",
        endTime: "14:00",
        type: "break",
        notes: ""
      }
    ];
    setSchedule(mockSchedule);
  }, [selectedDate]);

  const handleAddEvent = (e) => {
    e.preventDefault();
    const newId = schedule.length + 1;
    setSchedule([...schedule, { ...newEvent, id: newId }]);
    setShowAddModal(false);
    setNewEvent({
      title: "",
      startTime: "",
      endTime: "",
      type: "appointment",
      notes: ""
    });
  };

  const handleEditEvent = (e) => {
    e.preventDefault();
    const updatedSchedule = schedule.map(event => 
      event.id === selectedEvent.id ? { ...selectedEvent, ...newEvent } : event
    );
    setSchedule(updatedSchedule);
    setShowEditModal(false);
    setSelectedEvent(null);
    setNewEvent({
      title: "",
      startTime: "",
      endTime: "",
      type: "appointment",
      notes: ""
    });
  };

  const handleDeleteEvent = (eventId) => {
    const updatedSchedule = schedule.filter(event => event.id !== eventId);
    setSchedule(updatedSchedule);
    setShowEditModal(false);
    setSelectedEvent(null);
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setNewEvent({
      title: event.title,
      startTime: event.startTime,
      endTime: event.endTime,
      type: event.type,
      notes: event.notes
    });
    setShowEditModal(true);
  };

  const handleDateChange = (direction) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + (direction === 'next' ? 1 : -1));
    setSelectedDate(newDate);
  };

  const timeSlots = Array.from({ length: 12 }, (_, i) => {
    const hour = i + 8; // Starting from 8 AM
    return `${hour.toString().padStart(2, '0')}:00`;
  });

  const validateTimeSlot = (startTime, endTime, eventId = null) => {
    return !schedule.some(event => {
      if (eventId && event.id === eventId) return false;
      const eventStart = parseInt(event.startTime.replace(':', ''));
      const eventEnd = parseInt(event.endTime.replace(':', ''));
      const newStart = parseInt(startTime.replace(':', ''));
      const newEnd = parseInt(endTime.replace(':', ''));
      return (newStart >= eventStart && newStart < eventEnd) ||
             (newEnd > eventStart && newEnd <= eventEnd) ||
             (newStart <= eventStart && newEnd >= eventEnd);
    });
  };

  return (
    <div className="schedule-page">
      <div className="schedule-header">
        <div className="date-navigation">
          <button className="nav-btn" onClick={() => handleDateChange('prev')}>
            Previous Day
          </button>
          <h2>
            {selectedDate.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </h2>
          <button className="nav-btn" onClick={() => handleDateChange('next')}>
            Next Day
          </button>
        </div>
        <button 
          className="add-event-btn"
          onClick={() => setShowAddModal(true)}
        >
          Add Event
        </button>
      </div>

      <div className="schedule-grid">
        <div className="time-column">
          {timeSlots.map(time => (
            <div key={time} className="time-slot">
              {time}
            </div>
          ))}
        </div>

        <div className="events-column">
          {schedule.map(event => (
            <div
              key={event.id}
              className={`event-card ${event.type}`}
              style={{
                top: `${(parseInt(event.startTime.split(':')[0]) - 8) * 60}px`,
                height: `${
                  (parseInt(event.endTime.split(':')[0]) -
                    parseInt(event.startTime.split(':')[0])) *
                  60
                }px`
              }}
              onClick={() => handleEventClick(event)}
            >
              <h4>{event.title}</h4>
              <p className="event-time">
                {event.startTime} - {event.endTime}
              </p>
              {event.notes && <p className="event-notes">{event.notes}</p>}
            </div>
          ))}
        </div>
      </div>

      {/* Add Event Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Add New Event</h3>
            <form onSubmit={handleAddEvent}>
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Start Time</label>
                <input
                  type="time"
                  min="08:00"
                  max="20:00"
                  value={newEvent.startTime}
                  onChange={(e) => setNewEvent({...newEvent, startTime: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>End Time</label>
                <input
                  type="time"
                  min="08:00"
                  max="20:00"
                  value={newEvent.endTime}
                  onChange={(e) => setNewEvent({...newEvent, endTime: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Type</label>
                <select
                  value={newEvent.type}
                  onChange={(e) => setNewEvent({...newEvent, type: e.target.value})}
                >
                  <option value="appointment">Appointment</option>
                  <option value="meeting">Meeting</option>
                  <option value="break">Break</option>
                </select>
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={newEvent.notes}
                  onChange={(e) => setNewEvent({...newEvent, notes: e.target.value})}
                  rows="3"
                />
              </div>
              <div className="modal-actions">
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => {
                    setShowAddModal(false);
                    setNewEvent({
                      title: "",
                      startTime: "",
                      endTime: "",
                      type: "appointment",
                      notes: ""
                    });
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="confirm-btn"
                  disabled={
                    !newEvent.startTime || 
                    !newEvent.endTime || 
                    !validateTimeSlot(newEvent.startTime, newEvent.endTime)
                  }
                >
                  Add Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Event Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Edit Event</h3>
            <form onSubmit={handleEditEvent}>
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Start Time</label>
                <input
                  type="time"
                  min="08:00"
                  max="20:00"
                  value={newEvent.startTime}
                  onChange={(e) => setNewEvent({...newEvent, startTime: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>End Time</label>
                <input
                  type="time"
                  min="08:00"
                  max="20:00"
                  value={newEvent.endTime}
                  onChange={(e) => setNewEvent({...newEvent, endTime: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Type</label>
                <select
                  value={newEvent.type}
                  onChange={(e) => setNewEvent({...newEvent, type: e.target.value})}
                >
                  <option value="appointment">Appointment</option>
                  <option value="meeting">Meeting</option>
                  <option value="break">Break</option>
                </select>
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={newEvent.notes}
                  onChange={(e) => setNewEvent({...newEvent, notes: e.target.value})}
                  rows="3"
                />
              </div>
              <div className="modal-actions">
                <button 
                  type="button" 
                  className="delete-btn"
                  onClick={() => handleDeleteEvent(selectedEvent.id)}
                >
                  Delete
                </button>
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedEvent(null);
                    setNewEvent({
                      title: "",
                      startTime: "",
                      endTime: "",
                      type: "appointment",
                      notes: ""
                    });
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="confirm-btn"
                  disabled={
                    !newEvent.startTime || 
                    !newEvent.endTime || 
                    !validateTimeSlot(newEvent.startTime, newEvent.endTime, selectedEvent?.id)
                  }
                >
                  Update Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorSchedule;