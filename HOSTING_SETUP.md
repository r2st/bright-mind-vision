# 🚀 Hosting Platform Setup Guide

## 🔒 **Security Note**
**NEVER put real passwords in documentation files!** Always use placeholder values like `your-password-here` in examples.

## 📧 **Zoho Pro Email Configuration**

Based on your Zoho configuration, here are the correct settings:

### **✅ Correct Environment Variables**

Set these in your hosting platform:

```bash
SMTP_HOST=smtppro.zoho.in
SMTP_PORT=587
SMTP_USER=contact@brightmindvision.com
SMTP_PASS=your-password-here
```

### **🔧 Platform-Specific Instructions**

#### **Netlify Setup:**
1. Go to your site dashboard
2. Click **Site Settings**
3. Go to **Environment Variables**
4. Add each variable:
   - `SMTP_HOST` = `smtppro.zoho.in`
   - `SMTP_PORT` = `587`
   - `SMTP_USER` = `contact@brightmindvision.com`
   - `SMTP_PASS` = `your-password-here`
5. Click **Save**
6. **Redeploy** your site

#### **Vercel Setup:**
1. Go to your project dashboard
2. Click **Settings**
3. Go to **Environment Variables**
4. Add each variable (same as above)
5. Click **Save**
6. **Redeploy** your site

#### **Other Platforms:**
- Look for "Environment Variables", "Config Vars", or "App Settings"
- Add the same four variables
- Redeploy your site

### **🔐 Zoho Pro Authentication**

**Important Notes:**
- ✅ **Server**: `smtppro.zoho.in` (not `smtp.zoho.com`)
- ✅ **Port**: `587` with TLS or `465` with SSL
- ✅ **Authentication**: Required
- ✅ **Password**: Use your regular Zoho password (not app password for Pro)

### **🧪 Test Your Setup**

After setting environment variables:

1. **Redeploy** your site
2. **Test the booking form**
3. **Check server logs** for any errors
4. **Verify emails** are received

### **🚨 Common Issues**

**If still not working:**

1. **Check Zoho Security Settings:**
   - Ensure SMTP access is enabled
   - Check if 2FA is blocking access
   - Verify account is active

2. **Try Port 465 with SSL:**
   ```bash
   SMTP_HOST=smtppro.zoho.in
   SMTP_PORT=465
   SMTP_USER=contact@brightmindvision.com
   SMTP_PASS=your-password-here
   ```

3. **Check Hosting Platform:**
   - Ensure environment variables are set correctly
   - Verify the site was redeployed after adding variables
   - Check function logs for detailed errors

### **✅ Success Indicators**

You'll know it's working when:
- ✅ Booking form submits successfully
- ✅ You receive email notifications
- ✅ Clients receive confirmation emails
- ✅ No errors in server logs

### **📞 Need Help?**

1. **Check your hosting platform's documentation** for environment variables
2. **Contact Zoho support** if authentication issues persist
3. **Review server logs** for specific error messages
4. **Test with a simple email client** first to verify SMTP works
