import ical from 'ical-generator';
import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { name, email, phone, date, time, message } = req.body;

  try {
    // Create calendar event data
    const eventDate = new Date(`${date}T${time}:00`);
    const endDate = new Date(eventDate.getTime() + 30 * 60 * 1000); // 30 minutes duration

    // Generate Zoho Meeting link (this would be replaced with actual Zoho Meeting API)
    const meetingId = generateMeetingId();
    const zohoMeetingLink = `https://meetings.zoho.com/meeting/${meetingId}`;

    // Create iCal event
    const calendar = ical({ name: 'Bright Mind Vision - AI Consultation' });
    
    const event = calendar.createEvent({
      start: eventDate,
      end: endDate,
      summary: `AI Consultation with ${name}`,
      description: `
AI Consultation Meeting

Client: ${name}
Email: ${email}
Phone: ${phone || 'Not provided'}
Message: ${message || 'No additional message'}

Meeting Link: ${zohoMeetingLink}

Please join the meeting using the link above.
      `,
      location: zohoMeetingLink,
      url: zohoMeetingLink,
      organizer: {
        name: 'Bright Mind Vision',
        email: 'contact@brightmindvision.com'
      },
      attendees: [
        {
          name: name,
          email: email
        },
        {
          name: 'Bright Mind Vision',
          email: 'contact@brightmindvision.com'
        }
      ],
      status: 'CONFIRMED',
      busyStatus: 'BUSY',
      transparency: 'OPAQUE'
    });

    // Generate iCal content
    const icalContent = calendar.toString();

    // For now, we'll return the calendar data
    // In production, you would:
    // 1. Create the event in Zoho Calendar using their API
    // 2. Send the calendar invite via email
    // 3. Generate actual Zoho Meeting links

    res.status(200).json({
      success: true,
      calendarEvent: {
        title: `AI Consultation with ${name}`,
        start: eventDate.toISOString(),
        end: endDate.toISOString(),
        meetingLink: zohoMeetingLink,
        icalContent: icalContent
      },
      message: 'Calendar event created successfully'
    });

  } catch (error) {
    console.error('Error creating calendar event:', error);
    res.status(500).json({ 
      message: 'Failed to create calendar event',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
}

// Generate a mock meeting ID (replace with actual Zoho Meeting API)
function generateMeetingId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
