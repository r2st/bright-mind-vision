# Email Setup Guide

## 📧 How to Set Up Email Integration

The booking system is now configured to send emails to both you and your clients. Here's how to set it up:

### 🔧 Environment Variables

Create a `.env.local` file in your project root with the following variables:

```bash
# SMTP Configuration
SMTP_HOST=smtp.zoho.com
SMTP_PORT=587
SMTP_USER=contact@brightmindvision.com
SMTP_PASS=your-app-password-here
```

### 📮 Zoho Mail Setup

1. **Enable App Passwords in Zoho Mail:**
   - Go to Zoho Mail settings
   - Navigate to Security settings
   - Enable "App Passwords"
   - Generate a new app password
   - Use this password in `SMTP_PASS`

2. **SMTP Settings for Zoho:**
   - Host: `smtp.zoho.com`
   - Port: `587`
   - Security: `STARTTLS`
   - Username: `contact@brightmindvision.com`
   - Password: Your app password

### 🔄 Alternative Email Providers

#### Gmail
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

#### Outlook/Hotmail
```bash
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

#### Custom SMTP
```bash
SMTP_HOST=your-smtp-server.com
SMTP_PORT=587
SMTP_USER=your-email@domain.com
SMTP_PASS=your-password
```

### 📧 How It Works

When a user books a meeting:

1. **Email to You** (`contact@brightmindvision.com`):
   - Contains client information
   - Meeting details (date, time, message)
   - Professional HTML formatting

2. **Email to Client**:
   - Confirmation of booking request
   - Meeting details
   - Contact information
   - Professional branding

### 🚀 Testing

1. Set up your environment variables
2. Deploy your website
3. Test the booking form
4. Check both email addresses for confirmation

### 🔒 Security Notes

- Never commit `.env.local` to version control
- Use app passwords instead of regular passwords
- Consider using environment variables in your hosting platform

### 🆘 Troubleshooting

**Common Issues:**
- **Authentication failed**: Check your app password
- **Connection timeout**: Verify SMTP host and port
- **Emails not received**: Check spam folder
- **SSL errors**: Ensure correct port (587 for STARTTLS)

**Need Help?**
- Check your email provider's SMTP documentation
- Verify firewall settings
- Test with a simple email client first
