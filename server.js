/* ═══════════════════════════════════════════════
   SUJEET KUMAR PORTFOLIO — BACKEND SERVER
   Express + Nodemailer for real email delivery
   ═══════════════════════════════════════════════ */

require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ── MIDDLEWARE ──
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (index.html, style.css, script.js)
app.use(express.static(path.join(__dirname)));

// ── NODEMAILER TRANSPORTER (Gmail SMTP) ──
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// Verify transporter on startup
transporter.verify((error) => {
  if (error) {
    console.error('❌ Email transporter error:', error.message);
    console.log('⚠️  Make sure you set GMAIL_APP_PASSWORD in .env file');
    console.log('   Get it from: https://myaccount.google.com/apppasswords');
  } else {
    console.log('✅ Email transporter ready — emails will be sent via Gmail');
  }
});

// ── API: CONTACT FORM SUBMISSION ──
app.post('/api/contact', async (req, res) => {
  try {
    const { firstName, lastName, email, phone, subject, budget, message } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required fields.',
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      });
    }

    // ── BUILD EMAIL ──
    const htmlBody = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; border-radius: 12px; overflow: hidden; border: 1px solid #e0e0e0;">
        <div style="background: #000; padding: 24px 32px;">
          <h1 style="color: #00d4ff; margin: 0; font-size: 20px;">📩 New Portfolio Enquiry</h1>
        </div>
        <div style="padding: 28px 32px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 0; color: #888; font-size: 13px; width: 120px; vertical-align: top;">Name</td>
              <td style="padding: 10px 0; font-weight: 600; font-size: 15px;">${firstName} ${lastName}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #888; font-size: 13px; vertical-align: top;">Email</td>
              <td style="padding: 10px 0; font-size: 15px;"><a href="mailto:${email}" style="color: #0090cc;">${email}</a></td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #888; font-size: 13px; vertical-align: top;">Phone</td>
              <td style="padding: 10px 0; font-size: 15px;">${phone || 'Not provided'}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #888; font-size: 13px; vertical-align: top;">Subject</td>
              <td style="padding: 10px 0; font-weight: 600; font-size: 15px;">${subject}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #888; font-size: 13px; vertical-align: top;">Budget</td>
              <td style="padding: 10px 0; font-size: 15px;">${budget || 'Not specified'}</td>
            </tr>
          </table>
          <div style="margin-top: 20px; padding: 16px; background: #fff; border: 1px solid #e8e8e8; border-radius: 8px;">
            <p style="color: #888; font-size: 12px; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 0.5px;">Message</p>
            <p style="margin: 0; font-size: 15px; line-height: 1.7; color: #333;">${message.replace(/\n/g, '<br>')}</p>
          </div>
        </div>
        <div style="padding: 16px 32px; background: #f0f0f0; text-align: center; font-size: 12px; color: #999;">
          Sent from your Portfolio Contact Form • ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
        </div>
      </div>
    `;

    const textBody = `
New Portfolio Enquiry
=====================

Name: ${firstName} ${lastName}
Email: ${email}
Phone: ${phone || 'Not provided'}
Subject: ${subject}
Budget: ${budget || 'Not specified'}

Message:
${message}

---
Sent from Portfolio Contact Form
${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
    `.trim();

    // ── SEND EMAIL ──
    const mailOptions = {
      from: `"Portfolio Enquiry" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,
      replyTo: email,
      subject: `📩 Portfolio Enquiry: ${subject} — from ${firstName} ${lastName}`,
      text: textBody,
      html: htmlBody,
    };

    await transporter.sendMail(mailOptions);

    console.log(`✅ Email sent — ${firstName} ${lastName} (${email}) — ${subject}`);

    // ── BUILD WHATSAPP LINK ──
    const waNumber = process.env.WHATSAPP_NUMBER || '916206406515';
    const waText = encodeURIComponent(
      `Hi Sujeet! I just submitted an enquiry on your portfolio.\n\n` +
      `*Name:* ${firstName} ${lastName}\n` +
      `*Email:* ${email}\n` +
      `*Phone:* ${phone || 'Not provided'}\n` +
      `*Subject:* ${subject}\n` +
      `*Budget:* ${budget || 'Not specified'}\n\n` +
      `*Message:* ${message}`
    );
    const whatsappLink = `https://wa.me/${waNumber}?text=${waText}`;

    return res.status(200).json({
      success: true,
      message: 'Enquiry sent successfully! I will respond within 24 hours.',
      whatsappLink,
    });

  } catch (error) {
    console.error('❌ Error sending email:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send enquiry. Please try again or contact directly.',
    });
  }
});

// ── CATCH-ALL: serve index.html ──
app.get('{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ── START SERVER ──
app.listen(PORT, () => {
  console.log('');
  console.log('═══════════════════════════════════════════════');
  console.log('   🚀 Sujeet Kumar Portfolio — Server Running');
  console.log(`   🌐 http://localhost:${PORT}`);
  console.log('   📧 Email: ' + process.env.GMAIL_USER);
  console.log('   📱 WhatsApp: +' + (process.env.WHATSAPP_NUMBER || '916206406515'));
  console.log('═══════════════════════════════════════════════');
  console.log('');
});
