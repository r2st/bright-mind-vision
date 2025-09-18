import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { name, email, phone, date, time, message } = req.body;

  try {
    // Check if we're in development mode and if email simulation is enabled
    const isDevelopment = process.env.NODE_ENV === 'development';
    const simulateEmails = process.env.SIMULATE_EMAILS === 'true';
    
    let transporter;
    
    if (isDevelopment && simulateEmails) {
      // For development with simulation enabled, create a test transporter that doesn't actually send emails
      console.log('🔧 Development mode: Simulating email sending...');
      console.log('📧 Would send email to business:', process.env.SMTP_USER || 'contact@brightmindvision.com');
      console.log('📧 Would send email to client:', email);
      console.log('📧 Would send email from:', process.env.SMTP_USER || 'contact@brightmindvision.com');
      
      // Simulate email sending
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      res.status(200).json({ 
        message: 'Booking request simulated successfully (development mode)',
        bookingId: Date.now().toString(),
        development: true
      });
      return;
    }
    
    // Create transporter for production (Zoho Mail Pro or any SMTP provider)
    const smtpConfig = {
      host: process.env.SMTP_HOST || 'smtppro.zoho.in',
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false, // true for 465, false for other ports (587 uses TLS)
      auth: {
        user: process.env.SMTP_USER || 'contact@brightmindvision.com',
        pass: process.env.SMTP_PASS || 'your-app-password'
      }
    };
    
    console.log('SMTP Config:', {
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.secure,
      user: smtpConfig.auth.user,
      hasPassword: !!smtpConfig.auth.pass
    });
    
    transporter = nodemailer.createTransport(smtpConfig);

    // Create calendar event first
    const calendarResponse = await fetch(`${req.headers.origin || 'http://localhost:3000'}/api/create-calendar-event`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, phone, date, time, message }),
    });

    let calendarEvent = null;
    if (calendarResponse.ok) {
      calendarEvent = await calendarResponse.json();
    }

    // Format the date and time for better readability (using browser timezone)
    const dateObj = new Date(date + 'T00:00:00');
    const formattedDate = dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
      // Removed hardcoded timezone - now uses browser's timezone
    });
    
    // Format time with AM/PM and browser timezone
    const formatTime = (time) => {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      
      // Get browser timezone abbreviation
      const timezoneAbbr = new Date().toLocaleTimeString('en-US', { 
        timeZoneName: 'short' 
      }).split(' ')[2] || 'Local';
      
      return `${displayHour}:${minutes} ${ampm} ${timezoneAbbr}`;
    };
    
    const formattedTime = formatTime(time);

    // Email to business (you)
    const businessEmailContent = {
      from: process.env.SMTP_USER || 'contact@brightmindvision.com',
      to: process.env.SMTP_USER || 'contact@brightmindvision.com',
      subject: `📅 New Meeting Booking Request - ${name}`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">📅 New Meeting Booking Request</h1>
            <p style="color: #e2e8f0; margin: 10px 0 0 0; font-size: 16px;">Bright Mind Vision - AI Consulting</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 30px; background: #ffffff;">
            <!-- Client Information -->
            <div style="background: #f8fafc; padding: 25px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #667eea;">
              <h3 style="color: #1a202c; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">👤 Client Information</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; font-weight: 600; color: #4a5568; width: 100px;">Name:</td>
                  <td style="padding: 8px 0; color: #1a202c;">${name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: 600; color: #4a5568;">Email:</td>
                  <td style="padding: 8px 0; color: #1a202c;"><a href="mailto:${email}" style="color: #667eea; text-decoration: none;">${email}</a></td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: 600; color: #4a5568;">Phone:</td>
                  <td style="padding: 8px 0; color: #1a202c;">${phone ? `<a href="tel:${phone}" style="color: #667eea; text-decoration: none;">${phone}</a>` : 'Not provided'}</td>
                </tr>
              </table>
            </div>
            
            <!-- Meeting Details -->
            <div style="background: #e6f3ff; padding: 25px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #3182ce;">
              <h3 style="color: #1a202c; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">📅 Meeting Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; font-weight: 600; color: #4a5568; width: 100px;">Date:</td>
                  <td style="padding: 8px 0; color: #1a202c; font-weight: 500;">${formattedDate}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: 600; color: #4a5568;">Time:</td>
                  <td style="padding: 8px 0; color: #1a202c; font-weight: 500;">${formattedTime}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: 600; color: #4a5568; vertical-align: top;">Message:</td>
                  <td style="padding: 8px 0; color: #1a202c;">${message || 'No additional message provided'}</td>
                </tr>
              </table>
            </div>
            
            <!-- Calendar Event Info -->
            ${calendarEvent && calendarEvent.calendarEvent ? `
            <div style="background: #f0fff4; padding: 20px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #38a169;">
              <h3 style="color: #1a202c; margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">📅 Calendar Event Created</h3>
              <p style="color: #4a5568; margin: 0 0 10px 0; line-height: 1.6;">A calendar event has been automatically created for this meeting.</p>
              <p style="color: #4a5568; margin: 0; line-height: 1.6;"><strong>Meeting Link:</strong> <a href="${calendarEvent.calendarEvent.meetingLink}" style="color: #667eea; text-decoration: none;">${calendarEvent.calendarEvent.meetingLink}</a></p>
            </div>
            ` : ''}
            
            <!-- Action Required -->
            <div style="background: #fff5f5; padding: 20px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #e53e3e;">
              <h3 style="color: #c53030; margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">⚠️ Action Required</h3>
              <p style="color: #4a5568; margin: 0; line-height: 1.6;">Please confirm this booking by replying to this email or contacting the client directly within 24 hours.</p>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background: #2d3748; padding: 20px; text-align: center; border-radius: 0 0 8px 8px;">
            <p style="color: #a0aec0; margin: 0; font-size: 12px;">This booking request was sent from your website contact form</p>
            <p style="color: #a0aec0; margin: 5px 0 0 0; font-size: 12px;">Bright Mind Vision - Empowering businesses with AI solutions</p>
          </div>
        </div>
      `
    };

    // Email to client (confirmation)
    const clientEmailContent = {
      from: process.env.SMTP_USER || 'contact@brightmindvision.com',
      to: email,
      subject: `✅ Meeting Request Confirmed - Bright Mind Vision`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">✅ Meeting Request Confirmed</h1>
            <p style="color: #e2e8f0; margin: 10px 0 0 0; font-size: 16px;">Bright Mind Vision - AI Consulting</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 30px; background: #ffffff;">
            <!-- Greeting -->
            <div style="margin-bottom: 25px;">
              <p style="color: #1a202c; font-size: 16px; margin: 0 0 10px 0;">Dear <strong>${name}</strong>,</p>
              <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0;">Thank you for your interest in our AI consulting services! We have received your meeting request and will get back to you shortly to confirm the details.</p>
            </div>
            
            <!-- Meeting Details -->
            <div style="background: #f0fff4; padding: 25px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #38a169;">
              <h3 style="color: #1a202c; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">📅 Your Meeting Request</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; font-weight: 600; color: #4a5568; width: 100px;">Date:</td>
                  <td style="padding: 8px 0; color: #1a202c; font-weight: 500;">${formattedDate}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: 600; color: #4a5568;">Time:</td>
                  <td style="padding: 8px 0; color: #1a202c; font-weight: 500;">${formattedTime}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: 600; color: #4a5568; vertical-align: top;">Message:</td>
                  <td style="padding: 8px 0; color: #1a202c;">${message || 'No additional message provided'}</td>
                </tr>
              </table>
            </div>
            
            <!-- Calendar Invite Placeholder -->
            <!-- Calendar Invite Placeholder -->
            
            <!-- Next Steps -->
            <div style="background: #e6f3ff; padding: 20px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #3182ce;">
              <h3 style="color: #1a202c; margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">📋 What Happens Next?</h3>
              <ul style="color: #4a5568; margin: 0; padding-left: 20px; line-height: 1.6;">
                <li>We will review your request and confirm the meeting time</li>
                <li>You'll receive a confirmation email with meeting details</li>
                <li>We'll send you a calendar invitation if needed</li>
                <li>Our team will prepare for your consultation</li>
              </ul>
            </div>
            
            <!-- Contact Information -->
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #667eea;">
              <h3 style="color: #1a202c; margin: 0 0 15px 0; font-size: 16px; font-weight: 600;">📞 Need to Make Changes?</h3>
              <p style="color: #4a5568; margin: 0 0 15px 0; line-height: 1.6;">If you have any questions or need to reschedule, please don't hesitate to contact us:</p>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 5px 0; font-weight: 600; color: #4a5568; width: 80px;">Email:</td>
                  <td style="padding: 5px 0;"><a href="mailto:contact@brightmindvision.com" style="color: #667eea; text-decoration: none;">contact@brightmindvision.com</a></td>
                </tr>
                <tr>
                  <td style="padding: 5px 0; font-weight: 600; color: #4a5568;">Phone:</td>
                  <td style="padding: 5px 0;"><a href="tel:+919554024428" style="color: #667eea; text-decoration: none;">+91 95540 24428</a></td>
                </tr>
                <tr>
                  <td style="padding: 5px 0; font-weight: 600; color: #4a5568;">WhatsApp:</td>
                  <td style="padding: 5px 0;"><a href="https://wa.me/919554024428" style="color: #25d366; text-decoration: none;">Chat with us instantly</a></td>
                </tr>
              </table>
            </div>
            
            <!-- Signature -->
            <div style="text-align: center; margin: 30px 0;">
              <p style="color: #4a5568; margin: 0; font-size: 16px;">Best regards,</p>
              <p style="color: #1a202c; margin: 5px 0 0 0; font-size: 18px; font-weight: 600;">Bright Mind Vision Team</p>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background: #2d3748; padding: 20px; text-align: center; border-radius: 0 0 8px 8px;">
            <p style="color: #a0aec0; margin: 0; font-size: 12px;">Bright Mind Vision - Empowering businesses with cutting-edge AI solutions</p>
            <p style="color: #a0aec0; margin: 5px 0 0 0; font-size: 12px;">Website: <a href="https://brightmindvision.com" style="color: #667eea; text-decoration: none;">brightmindvision.com</a></p>
          </div>
        </div>
      `
    };


    // Update client email with calendar invite
    if (calendarEvent && calendarEvent.calendarEvent) {
      const calendarInviteSection = `
        <!-- Calendar Invite Section -->
        <div style="background: #f0fff4; padding: 25px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #38a169;">
          <h3 style="color: #1a202c; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">📅 Calendar Invite</h3>
          <p style="color: #4a5568; margin: 0 0 15px 0; line-height: 1.6;">We've created a calendar event for your consultation. You can add it to your calendar using the link below:</p>
          <div style="text-align: center; margin: 20px 0;">
            <a href="data:text/calendar;charset=utf8,${encodeURIComponent(calendarEvent.calendarEvent.icalContent)}" 
               style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
              📅 Add to Calendar
            </a>
          </div>
          <p style="color: #4a5568; margin: 15px 0 0 0; font-size: 14px; text-align: center;">
            Meeting Link: <a href="${calendarEvent.calendarEvent.meetingLink}" style="color: #667eea; text-decoration: none;">${calendarEvent.calendarEvent.meetingLink}</a>
          </p>
        </div>
      `;
      
      clientEmailContent.html = clientEmailContent.html.replace(
        '<!-- Calendar Invite Placeholder -->',
        calendarInviteSection
      );
    }

    // Send both emails
    await transporter.sendMail(businessEmailContent);
    await transporter.sendMail(clientEmailContent);

    res.status(200).json({ 
      message: 'Booking request sent successfully',
      bookingId: Date.now().toString(),
      calendarEvent: calendarEvent?.calendarEvent || null
    });

  } catch (error) {
    console.error('Error sending booking email:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      response: error.response,
      command: error.command,
      responseCode: error.responseCode
    });
    
    // More detailed error information for debugging
    let errorMessage = 'Failed to send booking request';
    if (error.code === 'EAUTH') {
      errorMessage = 'Email authentication failed. Please check your email credentials.';
    } else if (error.code === 'ECONNECTION') {
      errorMessage = 'Could not connect to email server. Please check your SMTP settings.';
    } else if (error.code === 'ETIMEDOUT') {
      errorMessage = 'Email server connection timed out.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    res.status(500).json({ 
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      code: process.env.NODE_ENV === 'development' ? error.code : undefined
    });
  }
}
