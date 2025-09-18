# 🔧 Email Troubleshooting Guide

## 🚨 "Failed to send booking request" Error

If you're getting this error on your hosted server, here are the most common causes and solutions:

### 🔍 **Step 1: Check Your Hosting Platform Environment Variables**

**For Netlify:**
1. Go to your site dashboard
2. Navigate to **Site Settings** → **Environment Variables**
3. Verify these variables are set:
   ```
   SMTP_HOST=smtppro.zoho.in
   SMTP_PORT=587
   SMTP_USER=contact@brightmindvision.com
   SMTP_PASS=your-password-here
   ```

**For Vercel:**
1. Go to your project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the same variables as above

**For Other Platforms:**
- Look for "Environment Variables", "Config Vars", or "App Settings"
- Add the SMTP configuration variables

### 🔐 **Step 2: Zoho Mail Authentication Issues**

**Common Zoho Issues:**
1. **App Password Required**: Zoho requires app passwords for SMTP
2. **2FA Enabled**: If 2FA is on, you need an app password
3. **Account Security**: Check if SMTP access is enabled

**How to Fix:**
1. Go to Zoho Mail settings
2. Navigate to **Security** → **App Passwords**
3. Generate a new app password
4. Use this password in `SMTP_PASS` (not your regular password)

### 🌐 **Step 3: SMTP Server Issues**

**Try Alternative SMTP Settings:**

**Option 1: Zoho Pro with SSL**
```bash
SMTP_HOST=smtppro.zoho.in
SMTP_PORT=465
SMTP_USER=contact@brightmindvision.com
SMTP_PASS=your-password-here
```

**Option 1b: Zoho Pro with TLS**
```bash
SMTP_HOST=smtppro.zoho.in
SMTP_PORT=587
SMTP_USER=contact@brightmindvision.com
SMTP_PASS=your-password-here
```

**Option 2: Gmail (if you have Gmail)**
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-gmail@gmail.com
SMTP_PASS=your-app-password
```

**Option 3: Outlook**
```bash
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

### 🔧 **Step 4: Test Your SMTP Settings**

Create a simple test script to verify your SMTP works:

```javascript
// test-smtp.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtppro.zoho.in',
  port: 587,
  secure: false,
  auth: {
    user: 'contact@brightmindvision.com',
    pass: 'your-password-here'
  }
});

transporter.verify((error, success) => {
  if (error) {
    console.log('SMTP Error:', error);
  } else {
    console.log('SMTP Success:', success);
  }
});
```

### 📊 **Step 5: Check Server Logs**

**For Netlify:**
1. Go to **Functions** tab in your dashboard
2. Look for error logs in the function execution

**For Vercel:**
1. Go to **Functions** tab
2. Check the logs for your API endpoint

**Common Error Codes:**
- `EAUTH`: Authentication failed (wrong password/username)
- `ECONNECTION`: Can't connect to SMTP server
- `ETIMEDOUT`: Connection timeout
- `EENVELOPE`: Invalid email address

### 🛠️ **Step 6: Alternative Solutions**

**Option 1: Use EmailJS (Client-side)**
- No server-side SMTP required
- Works with any email provider
- Free tier available

**Option 2: Use SendGrid**
- Professional email service
- Free tier: 100 emails/day
- More reliable than SMTP

**Option 3: Use Resend**
- Modern email API
- Developer-friendly
- Good free tier

### 🚀 **Quick Fix: Temporary Solution**

If you need a quick fix, you can temporarily disable email sending and just log the booking:

```javascript
// In your API endpoint, replace the email sending with:
console.log('Booking Request:', {
  name, email, phone, date, time, message
});

res.status(200).json({ 
  message: 'Booking request received (emails temporarily disabled)',
  bookingId: Date.now().toString()
});
```

### 📞 **Need Help?**

1. **Check your hosting platform's documentation** for environment variables
2. **Contact your hosting support** if environment variables aren't working
3. **Test SMTP settings** with a simple script first
4. **Consider using a dedicated email service** like SendGrid or Resend

### ✅ **Most Likely Solution**

The most common issue is that **environment variables aren't set correctly** on your hosting platform. Double-check that all four SMTP variables are properly configured in your hosting dashboard.
