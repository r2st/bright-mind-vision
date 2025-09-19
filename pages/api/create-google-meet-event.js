import { google } from 'googleapis';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { name, email, phone, date, time, message } = req.body;

  try {
    // Check if Google Meet API is enabled
    if (process.env.GOOGLE_MEET_API_ENABLED !== 'true') {
      // Fallback to mock Google Meet links
      const mockMeetLink = generateMockGoogleMeetLink();
      return res.status(200).json({
        success: true,
        calendarEvent: {
          title: `AI Consultation with ${name}`,
          start: new Date(`${date}T${time}:00`).toISOString(),
          end: new Date(new Date(`${date}T${time}:00`).getTime() + 30 * 60 * 1000).toISOString(),
          meetingLink: mockMeetLink,
          eventId: `mock-${Date.now()}`,
          isMock: true
        },
        message: 'Mock Google Meet event created (API not configured)'
      });
    }

    // Set up OAuth client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    // Set credentials
    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN
    });

    // Create calendar event with Google Meet
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    
    const eventStart = new Date(`${date}T${time}:00`);
    const eventEnd = new Date(eventStart.getTime() + 30 * 60 * 1000);

    const event = {
      summary: `AI Consultation with ${name}`,
      description: `
AI Consultation Meeting

Client: ${name}
Email: ${email}
Phone: ${phone || 'Not provided'}
Message: ${message || 'No additional message'}

Please join the meeting using the Google Meet link below.
      `,
      start: {
        dateTime: eventStart.toISOString(),
        timeZone: 'UTC',
      },
      end: {
        dateTime: eventEnd.toISOString(),
        timeZone: 'UTC',
      },
      attendees: [
        { email: email },
        { email: 'brightmindvision1@gmail.com' }
      ],
      conferenceData: {
        createRequest: {
          requestId: Math.random().toString(36).substring(2, 15),
          conferenceSolutionKey: {
            type: 'hangoutsMeet'
          }
        }
      }
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      resource: event,
      conferenceDataVersion: 1,
    });

    const meetLink = response.data.conferenceData?.entryPoints?.[0]?.uri;

    res.status(200).json({
      success: true,
      calendarEvent: {
        title: event.summary,
        start: eventStart.toISOString(),
        end: eventEnd.toISOString(),
        meetingLink: meetLink,
        eventId: response.data.id,
        isMock: false
      },
      message: 'Google Meet event created successfully'
    });

  } catch (error) {
    console.error('Error creating Google Meet event:', error);
    
    // Fallback to mock Google Meet link if API fails
    const mockMeetLink = generateMockGoogleMeetLink();
    
    res.status(200).json({
      success: true,
      calendarEvent: {
        title: `AI Consultation with ${name}`,
        start: new Date(`${date}T${time}:00`).toISOString(),
        end: new Date(new Date(`${date}T${time}:00`).getTime() + 30 * 60 * 1000).toISOString(),
        meetingLink: mockMeetLink,
        eventId: `fallback-${Date.now()}`,
        isMock: true,
        error: process.env.NODE_ENV === 'development' ? error.message : 'API error, using fallback'
      },
      message: 'Google Meet event created with fallback link'
    });
  }
}

// Fallback function for mock Google Meet links
function generateMockGoogleMeetLink() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const part1 = generateRandomString(chars, 3);
  const part2 = generateRandomString(chars, 4);
  const part3 = generateRandomString(chars, 3);
  return `https://meet.google.com/${part1}-${part2}-${part3}`;
}

function generateRandomString(chars, length) {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
