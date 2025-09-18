# 📧 Email Flow Documentation

## 🔄 **How the Email System Works**

When a user books a meeting, the system sends **TWO emails**:

### **📨 Email 1: To Business (You)**
- **To**: `contact@brightmindvision.com`
- **From**: `contact@brightmindvision.com`
- **Subject**: `New Meeting Booking Request - [Client Name]`
- **Content**: 
  - Client information (name, email, phone)
  - Meeting details (date, time, message)
  - Professional HTML formatting
  - Call-to-action to confirm booking

### **📨 Email 2: To Client (Confirmation)**
- **To**: Client's email address
- **From**: `contact@brightmindvision.com`
- **Subject**: `Meeting Confirmation - Bright Mind Vision`
- **Content**:
  - Confirmation message
  - Meeting details
  - Contact information
  - Professional branding
  - 24-hour response promise

## 🔧 **Development vs Production**

### **Development Mode (Local)**
- ✅ **Simulates email sending** (no actual emails sent)
- ✅ **Logs to console** what would be sent:
  ```
  🔧 Development mode: Simulating email sending...
  📧 Would send email to business: contact@brightmindvision.com
  📧 Would send email to client: client@example.com
  📧 Would send email from: contact@brightmindvision.com
  ```
- ✅ **Shows success message** with development indicator

### **Production Mode (Hosted)**
- ✅ **Sends real emails** via Zoho SMTP
- ✅ **Sends to both parties** automatically
- ✅ **Professional email templates**
- ✅ **Proper error handling**

## 📋 **Email Templates**

### **Business Email Template**
- Clean, professional design
- Client information in organized sections
- Meeting details highlighted
- Clear call-to-action
- Company branding

### **Client Email Template**
- Welcoming confirmation message
- Meeting details summary
- Contact information
- Professional footer
- Brand consistency

## 🚀 **Deployment Checklist**

Before deploying, ensure:

1. **✅ Environment Variables Set**:
   ```bash
   SMTP_HOST=smtppro.zoho.in
   SMTP_PORT=587
   SMTP_USER=contact@brightmindvision.com
   SMTP_PASS=your-password-here
   ```

2. **✅ Zoho SMTP Access**:
   - SMTP enabled in Zoho settings
   - Correct server: `smtppro.zoho.in`
   - Port 587 with TLS

3. **✅ Test Both Emails**:
   - Business receives notification
   - Client receives confirmation
   - Both emails are properly formatted

## 🔍 **Troubleshooting**

### **If Business Email Not Received**
- Check spam folder
- Verify SMTP credentials
- Check server logs for errors

### **If Client Email Not Received**
- Verify client email address is valid
- Check SMTP authentication
- Review error logs

### **Common Issues**
- **EAUTH**: Wrong password/username
- **ECONNECTION**: SMTP server issues
- **ETIMEDOUT**: Network problems

## ✅ **Success Indicators**

The system is working correctly when:
- ✅ Booking form submits successfully
- ✅ Business receives notification email
- ✅ Client receives confirmation email
- ✅ Both emails are properly formatted
- ✅ No errors in server logs

## 📞 **Support**

If emails aren't working:
1. Check hosting platform environment variables
2. Verify Zoho SMTP settings
3. Review server logs for specific errors
4. Test SMTP connection separately
