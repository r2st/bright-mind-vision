import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { name, email, phone, date, time, message } = req.body;

  try {
    // Check if we're in development mode
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    let transporter;
    
    if (isDevelopment) {
      // For development, create a test transporter that doesn't actually send emails
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

    // Format the date for better readability (handle timezone properly)
    const dateObj = new Date(date + 'T00:00:00'); // Ensure we're working with local date
    const formattedDate = dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'Asia/Kolkata' // Adjust to your timezone
    });

    // Email to business (you)
    const businessEmailContent = {
      from: process.env.SMTP_USER || 'contact@brightmindvision.com',
      to: process.env.SMTP_USER || 'contact@brightmindvision.com',
      subject: `New Meeting Booking Request - ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #667eea;">New Meeting Booking Request</h2>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1a202c; margin-top: 0;">Client Information</h3>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
          </div>
          
          <div style="background: #e6f3ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1a202c; margin-top: 0;">Meeting Details</h3>
            <p><strong>Date:</strong> ${formattedDate}</p>
            <p><strong>Time:</strong> ${time}</p>
            <p><strong>Message:</strong> ${message || 'No additional message'}</p>
          </div>
          
          <p style="color: #4a5568;">Please confirm this booking by replying to this email or contacting the client directly.</p>
          
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
          <p style="color: #718096; font-size: 12px;">This booking request was sent from your website contact form.</p>
        </div>
      `
    };

    // Email to client (confirmation)
    const clientEmailContent = {
      from: process.env.SMTP_USER || 'contact@brightmindvision.com',
      to: email,
      subject: `Meeting Confirmation - Bright Mind Vision`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #667eea;">Meeting Request Received</h2>
          
          <p>Dear ${name},</p>
          
          <p>Thank you for your interest in our AI consulting services! We have received your meeting request and will get back to you shortly to confirm the details.</p>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1a202c; margin-top: 0;">Your Meeting Request</h3>
            <p><strong>Date:</strong> ${formattedDate}</p>
            <p><strong>Time:</strong> ${time}</p>
            <p><strong>Message:</strong> ${message || 'No additional message'}</p>
          </div>
          
          <p>We will contact you within 24 hours to confirm your meeting time and provide you with the meeting details.</p>
          
          <p>If you have any questions or need to reschedule, please don't hesitate to contact us:</p>
          <ul>
            <li>Email: contact@brightmindvision.com</li>
            <li>Phone: +91 95540 24428</li>
            <li>WhatsApp: <a href="https://wa.me/919554024428">Chat with us</a></li>
          </ul>
          
          <p>Best regards,<br>
          <strong>Bright Mind Vision Team</strong></p>
          
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
          <p style="color: #718096; font-size: 12px;">
            Bright Mind Vision - Empowering businesses with cutting-edge AI solutions<br>
            Website: <a href="https://brightmindvision.com">brightmindvision.com</a>
          </p>
        </div>
      `
    };

    // Send both emails
    await transporter.sendMail(businessEmailContent);
    await transporter.sendMail(clientEmailContent);

    res.status(200).json({ 
      message: 'Booking request sent successfully',
      bookingId: Date.now().toString()
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
