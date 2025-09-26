import { useState, useEffect } from 'react';

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
            // Removed hardcoded timezone - now uses browser's timezone
          })
        });
      }
    }
    return dates;
  };

  // Generate time slots based on browser timezone
  const generateTimeSlots = () => {
    const slots = [];
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const timezoneAbbr = new Date().toLocaleTimeString('en-US', { 
      timeZoneName: 'short' 
    }).split(' ')[2] || 'Local';
    
    // Business hours: 9 AM to 5:30 PM (in 30-minute intervals)
    const startHour = 9;
    const endHour = 17;
    const endMinute = 30;
    
    for (let hour = startHour; hour <= endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        if (hour === endHour && minute > endMinute) break;
        
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const date = new Date();
        date.setHours(hour, minute, 0, 0);
        
        const displayTime = date.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
        
        slots.push({
          value: timeString,
          label: `${displayTime} ${timezoneAbbr}`
        });
      }
    }
    
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleBookAnother = () => {
    setIsSubmitted(false);
  };

  const devModeStyle = {
    fontSize: '12px',
    color: '#666',
    fontStyle: 'italic'
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
        to: process.env.NEXT_PUBLIC_BUSINESS_EMAIL || 'your-email@example.com',
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
          <p style={devModeStyle}>
            🔧 Development mode: Email was simulated, not actually sent.
          </p>
        )}
        <button 
          onClick={handleBookAnother}
          className="book-another-btn"
        >
          Book Another Meeting
        </button>
      </div>
    );
  }

  // Get user's timezone information (client-side only to prevent hydration mismatch)
  const [userTimezone, setUserTimezone] = useState('Local');
  const [timezoneAbbr, setTimezoneAbbr] = useState('Local');
  
  useEffect(() => {
    // Only run on client side
    if (typeof window !== 'undefined') {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const tzAbbr = new Date().toLocaleTimeString('en-US', { 
        timeZoneName: 'short' 
      }).split(' ')[2] || 'Local';
      setUserTimezone(tz);
      setTimezoneAbbr(tzAbbr);
    }
  }, []);

  return (
    <div className="custom-calendar">
      <div className="calendar-header">
        <h3>Book Your Free Consultation</h3>
        <p>Select your preferred date and time. We'll confirm the meeting via email.</p>
        <div className="timezone-info">
          <small>📍 All times shown in your local timezone: <strong>{userTimezone} ({timezoneAbbr})</strong></small>
        </div>
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
                <option key={time.value} value={time.value}>
                  {time.label}
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
