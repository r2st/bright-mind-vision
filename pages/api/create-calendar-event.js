import ical from 'ical-generator';
import axios from 'axios';
import { google } from 'googleapis';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { name, email, phone, date, time, message } = req.body;

  try {
    // Create calendar event data
    const eventDate = new Date(`${date}T${time}:00`);
    const endDate = new Date(eventDate.getTime() + 30 * 60 * 1000); // 30 minutes duration

    // Try to create real Google Meet event first
    let googleMeetLink;
    let isRealMeetLink = false;

    if (process.env.GOOGLE_MEET_API_ENABLED === 'true' && 
        process.env.GOOGLE_CLIENT_ID && 
        process.env.GOOGLE_REFRESH_TOKEN) {
      try {
        // Set up OAuth client
        const oauth2Client = new google.auth.OAuth2(
          process.env.GOOGLE_CLIENT_ID,
          process.env.GOOGLE_CLIENT_SECRET,
          process.env.GOOGLE_REDIRECT_URI
        );

        oauth2Client.setCredentials({
          refresh_token: process.env.GOOGLE_REFRESH_TOKEN
        });

        // Create calendar event with Google Meet
        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
        
        const event = {
          summary: `AI Consultation with ${name}`,
          description: `
Client: ${name}
Email: ${email}
Phone: ${phone || 'Not provided'}
Message: ${message || 'No additional message'}
          `,
          start: {
            dateTime: eventDate.toISOString(),
            timeZone: 'UTC',
          },
          end: {
            dateTime: endDate.toISOString(),
            timeZone: 'UTC',
          },
          attendees: [
            { email: email },
            { email: 'brightmindvision1@gmail.com' },
            { email: 'contact@brightmindvision.com' }
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

        googleMeetLink = response.data.conferenceData?.entryPoints?.[0]?.uri;
        isRealMeetLink = true;
        
        console.log('✅ Real Google Meet event created:', googleMeetLink);
      } catch (apiError) {
        console.log('⚠️ Google Meet API failed, using fallback:', apiError.message);
        googleMeetLink = generateGoogleMeetLink();
        isRealMeetLink = false;
      }
    } else {
      // Use mock Google Meet link
      googleMeetLink = generateGoogleMeetLink();
      isRealMeetLink = false;
      console.log('📝 Using mock Google Meet link (API not configured)');
    }

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

Meeting Link: ${googleMeetLink}

Please join the meeting using the Google Meet link above.
      `,
      location: googleMeetLink,
      url: googleMeetLink,
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
        },
        {
          name: 'Bright Mind Vision (Gmail)',
          email: 'brightmindvision1@gmail.com'
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
        meetingLink: googleMeetLink,
        icalContent: icalContent,
        isRealMeetLink: isRealMeetLink
      },
      message: isRealMeetLink ? 'Google Meet event created successfully' : 'Calendar event created with mock Google Meet link'
    });

  } catch (error) {
    console.error('Error creating calendar event:', error);
    res.status(500).json({ 
      message: 'Failed to create calendar event',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
}

// Generate Google Meet link
function generateGoogleMeetLink() {
  // Google Meet links use a specific format with 3 groups of 3-4 characters
  // Format: https://meet.google.com/xxx-xxxx-xxx
  const meetingId = generateMeetingId();
  return `https://meet.google.com/${meetingId}`;
}

// Generate a unique meeting ID for Google Meet
function generateMeetingId() {
  // Google Meet uses format: xxx-xxxx-xxx (3-4-3 characters)
  // Using lowercase letters and numbers
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  
  const part1 = generateRandomString(chars, 3);
  const part2 = generateRandomString(chars, 4);
  const part3 = generateRandomString(chars, 3);
  
  return `${part1}-${part2}-${part3}`;
}

// Helper function to generate random string
function generateRandomString(chars, length) {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
