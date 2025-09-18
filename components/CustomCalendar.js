import { useState } from 'react';

export default function CustomCalendar() {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Generate available dates (next 30 days)
  const generateAvailableDates = () => {
    const dates = [];
    const today = new Date();
    
    // Get timezone offset to ensure we're working with local time
    const timezoneOffset = today.getTimezoneOffset();
    
    for (let i = 1; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Skip weekends (optional - you can remove this if you want weekend bookings)
      if (date.getDay() !== 0 && date.getDay() !== 6) {
        // Ensure we get the local date string
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateString = `${year}-${month}-${day}`;
        
        dates.push({
          value: dateString,
          label: date.toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
          })
        });
      }
    }
    return dates;
  };

  // Available time slots
  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30'
  ];

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create the booking request
      const bookingData = {
        date: selectedDate,
        time: selectedTime,
        ...formData,
        to: 'contact@brightmindvision.com',
        subject: `New Meeting Booking Request - ${formData.name}`,
        message: `
New meeting booking request:

Name: ${formData.name}
Email: ${formData.email}
Phone: ${formData.phone}
Date: ${selectedDate}
Time: ${selectedTime}
Message: ${formData.message}

Please confirm this booking.
        `
      };

      // Send booking request via API
      const response = await fetch('/api/send-booking-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send booking request');
      }
      
      const result = await response.json();
      console.log('Booking response:', result);
      
      setIsSubmitted(true);
      // Reset form
      setFormData({ name: '', email: '', phone: '', message: '' });
      setSelectedDate('');
      setSelectedTime('');
      
    } catch (error) {
      console.error('Error sending booking request:', error);
      alert('Failed to send booking request. Please try again or contact us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="booking-success">
        <div className="success-icon">✅</div>
        <h3>Booking Request Sent!</h3>
        <p>Thank you for your interest. We'll contact you shortly to confirm your meeting time.</p>
        {process.env.NODE_ENV === 'development' && (
          <p style={{fontSize: '12px', color: '#666', fontStyle: 'italic'}}>
            🔧 Development mode: Email was simulated, not actually sent.
          </p>
        )}
        <button 
          onClick={() => setIsSubmitted(false)}
          className="book-another-btn"
        >
          Book Another Meeting
        </button>
      </div>
    );
  }

  return (
    <div className="custom-calendar">
      <div className="calendar-header">
        <h3>Book Your Free Consultation</h3>
        <p>Select your preferred date and time. We'll confirm the meeting via email.</p>
      </div>

      <form onSubmit={handleSubmit} className="booking-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="date">Select Date *</label>
            <select
              id="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              required
            >
              <option value="">Choose a date</option>
              {generateAvailableDates().map(date => (
                <option key={date.value} value={date.value}>
                  {date.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="time">Select Time *</label>
            <select
              id="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              required
            >
              <option value="">Choose a time</option>
              {timeSlots.map(time => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="name">Full Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              placeholder="Your full name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              placeholder="your.email@example.com"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="phone">Phone Number</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="+1 (555) 123-4567"
          />
        </div>

        <div className="form-group">
          <label htmlFor="message">Message (Optional)</label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleInputChange}
            rows="3"
            placeholder="Tell us about your project or any specific topics you'd like to discuss..."
          />
        </div>

        <button 
          type="submit" 
          className="submit-booking-btn"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Sending Request...' : 'Send Booking Request'}
        </button>
      </form>
    </div>
  );
}
