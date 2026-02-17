# 📱 Marketing Automation Setup Guide

## Overview

The SKOPE ERP marketing module now supports **real WhatsApp, SMS, and Email** campaigns! This guide will help you set up the integrations for your deployed application.

## 🎯 Features

✅ **WhatsApp Messaging** - Send WhatsApp messages via Twilio  
✅ **SMS Campaigns** - Send SMS via Twilio  
✅ **Email Marketing** - Send emails via SendGrid  
✅ **Automated Triggers** - Birthday, warranty expiry, win-back campaigns  
✅ **Campaign Logs** - Track every message sent  
✅ **Test Messages** - Test before sending to all customers  
✅ **Template Variables** - Personalize messages with customer data  

## 🔧 Setup Instructions

### 1. Twilio Setup (for SMS & WhatsApp)

#### Create Twilio Account
1. Go to [twilio.com](https://www.twilio.com)
2. Sign up for a free account
3. Get **$15 free credit** to test

#### Get Credentials
1. Go to [Twilio Console](https://console.twilio.com)
2. Copy your **Account SID** and **Auth Token**
3. Get a phone number:
   - Go to Phone Numbers → Buy a Number
   - Choose a number with SMS and Voice capabilities
   - For WhatsApp: Use Twilio's sandbox number `whatsapp:+14155238886`

#### Configure in Render
1. Go to your backend service in Render
2. Navigate to **Environment** tab
3. Add these environment variables:
   ```
   TWILIO_ACCOUNT_SID=your_account_sid_here
   TWILIO_AUTH_TOKEN=your_auth_token_here
   TWILIO_PHONE_NUMBER=+1234567890
   TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
   ```
4. Click **Save Changes**
5. Manually deploy to apply changes

### 2. SendGrid Setup (for Email)

#### Create SendGrid Account
1. Go to [sendgrid.com](https://sendgrid.com)
2. Sign up for a free account
3. Get **100 emails/day free forever**

#### Get API Key
1. Go to [SendGrid Dashboard](https://app.sendgrid.com)
2. Navigate to **Settings** → **API Keys**
3. Click **Create API Key**
4. Choose **Full Access**
5. Copy the API key (you won't see it again!)

#### Verify Sender Email
1. Go to **Settings** → **Sender Authentication**
2. Click **Verify a Single Sender**
3. Fill in your details (use your business email)
4. Verify the email address

#### Configure in Render
1. Go to your backend service in Render
2. Navigate to **Environment** tab
3. Add these environment variables:
   ```
   SENDGRID_API_KEY=your_sendgrid_api_key_here
   SENDGRID_FROM_EMAIL=noreply@yourdomain.com
   SENDGRID_FROM_NAME=SKOPE ERP
   ```
4. Click **Save Changes**
5. Manually deploy to apply changes

## 📝 Using the Marketing Module

### Create a Campaign

1. **Login to your deployed app**
2. **Go to Marketing → Campaigns**
3. **Click "Create Campaign"**
4. **Fill in details:**
   - Name: "Diwali Sale 2026"
   - Type: WhatsApp / SMS / Email
   - Message Template:
     ```
     🎉 Hi {customer_name}!
     
     Get {discount}% OFF on all products!
     Use code: {discount_code}
     
     Valid till {end_date}
     
     Shop now!
     ```
   - Discount Code: DIWALI50
   - Discount: 50%
   - Start/End Dates

### Test a Campaign

1. **Go to Campaign Details**
2. **Click "Test Message"**
3. **Select a customer**
4. **Click "Send Test"**
5. **Check if message was received**

### Execute a Campaign

1. **Go to Campaign Details**
2. **Click "Execute Campaign"**
3. **Choose:**
   - Send to all customers, OR
   - Send to specific customers
4. **Click "Execute"**
5. **View results:**
   - Total sent
   - Total failed
   - Error details

### View Campaign Logs

1. **Go to Campaign Details**
2. **Click "View Logs"**
3. **See:**
   - Customer name
   - Message sent
   - Status (sent/failed)
   - Channel (WhatsApp/SMS/Email)
   - Timestamp
   - Error message (if failed)

## 🔄 Automated Campaigns

### Available Triggers

1. **Birthday** - Send on customer's birthday
2. **Festival** - Send during festival period
3. **Warranty Expiry** - Send 30 days before warranty expires
4. **No Purchase (30 days)** - Win-back inactive customers
5. **Manual** - Send manually when you want

### How to Set Up

1. **Create campaign with trigger type**
2. **Set to "Active" status**
3. **System will automatically send** based on trigger

### Manual Trigger Check

You can manually trigger the automation check:
- **API Endpoint**: `POST /api/v1/marketing/execution/automation/trigger`
- **Or set up a cron job** to call this every hour

## 📊 Template Variables

Use these in your message templates:

- `{customer_name}` - Customer's full name
- `{name}` - Same as customer_name
- `{email}` - Customer's email
- `{phone}` - Customer's phone
- `{loyalty_points}` - Customer's loyalty points
- `{campaign_name}` - Campaign name
- `{discount_code}` - Discount code
- `{discount}` - Discount percentage
- `{start_date}` - Campaign start date
- `{end_date}` - Campaign end date

## 🎨 Message Examples

### WhatsApp Template
```
🎊 Hello {customer_name}!

Special offer just for you! 🎁

Get {discount}% OFF on all electronics!
Use code: {discount_code}

Offer valid till {end_date}

Visit us today! 🛍️
```

### SMS Template
```
Hi {customer_name}! Get {discount}% OFF with code {discount_code}. Valid till {end_date}. Shop now!
```

### Email Template
```
Dear {customer_name},

We have an exclusive offer for you!

Get {discount}% discount on your next purchase.

Use code: {discount_code}
Valid until: {end_date}

Thank you for being a valued customer!

Best regards,
SKOPE ERP Team
```

## 🔍 Check Configuration Status

**API Endpoint**: `GET /api/v1/marketing/execution/settings/credentials`

Returns:
```json
{
  "twilio": {
    "configured": true,
    "phone_number": true,
    "whatsapp_number": true
  },
  "sendgrid": {
    "configured": true,
    "from_email": "noreply@skope-erp.com"
  }
}
```

## 💰 Pricing

### Twilio (SMS & WhatsApp)
- **Free Trial**: $15 credit
- **SMS**: ~$0.0075 per message (India)
- **WhatsApp**: ~$0.005 per message
- **Pay as you go** - No monthly fees

### SendGrid (Email)
- **Free Forever**: 100 emails/day
- **Essentials**: $19.95/month for 50,000 emails
- **Pro**: $89.95/month for 100,000 emails

## 🚨 Important Notes

1. **Phone Numbers**: Must include country code (+91 for India)
2. **WhatsApp Sandbox**: For testing only. For production, apply for WhatsApp Business API
3. **Email Verification**: Verify sender email in SendGrid before sending
4. **Rate Limits**: Twilio and SendGrid have rate limits on free tiers
5. **Customer Consent**: Ensure customers have opted in for marketing messages

## 🐛 Troubleshooting

### Messages Not Sending

1. **Check credentials** in Render environment variables
2. **Check logs** in campaign execution logs
3. **Verify phone numbers** have correct format (+91...)
4. **Check Twilio/SendGrid dashboards** for errors

### "Demo Mode" Messages

If you see "Demo: Message would be sent...", it means:
- Credentials are not configured
- Set up Twilio/SendGrid as described above

### WhatsApp Not Working

- Use Twilio sandbox for testing: `whatsapp:+14155238886`
- For production, apply for WhatsApp Business API approval
- Customer must send "join <your-sandbox-code>" first

## 📚 API Endpoints

### Execute Campaign
```
POST /api/v1/marketing/execution/campaigns/{campaign_id}/execute
Body: {
  "customer_ids": [1, 2, 3]  // Optional, null = all customers
}
```

### Send Test Message
```
POST /api/v1/marketing/execution/campaigns/{campaign_id}/test
Body: {
  "campaign_id": 1,
  "customer_id": 1
}
```

### Get Campaign Logs
```
GET /api/v1/marketing/execution/campaigns/{campaign_id}/logs?skip=0&limit=100
```

### Trigger Automation
```
POST /api/v1/marketing/execution/automation/trigger
```

### Check Credentials
```
GET /api/v1/marketing/execution/settings/credentials
```

## ✅ Quick Start Checklist

- [ ] Create Twilio account
- [ ] Get Twilio Account SID and Auth Token
- [ ] Get Twilio phone number
- [ ] Create SendGrid account
- [ ] Get SendGrid API key
- [ ] Verify sender email in SendGrid
- [ ] Add environment variables in Render
- [ ] Deploy backend
- [ ] Create test campaign
- [ ] Send test message
- [ ] Execute campaign
- [ ] Check logs

## 🎉 You're All Set!

Your marketing automation is now fully functional! You can send real WhatsApp, SMS, and Email campaigns to your customers.

For support, check the API documentation at: `https://your-backend-url.onrender.com/docs`
