const nodemailer = require('nodemailer');

const sendNotificationEmail = async (inquiryData) => {
  const shopOwnerEmail = process.env.SHOP_OWNER_EMAIL || 'sivasivaraman566@gmail.com';
  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
  const smtpPort = parseInt(process.env.SMTP_PORT || '587');
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const shopOwnerPhone = process.env.SHOP_OWNER_PHONE || '9342913781';

  console.log(`SMTP_USER loaded: ${smtpUser ? 'yes' : 'no'}`);
  console.log(`SMTP_PASS loaded: ${smtpPass ? 'yes' : 'no'}`);

  if (!smtpUser || !smtpPass || smtpPass === 'GMAIL_APP_PASSWORD_HERE' || smtpPass === 'YOUR_GMAIL_APP_PASSWORD') {
    const errorMsg = 'SMTP not configured';
    console.log('Email not sent: ' + errorMsg);
    return { success: false, error: errorMsg };
  }

  try {
    const configOptions = {
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    };

    if (smtpHost && smtpHost.toLowerCase().includes('gmail.com')) {
      configOptions.service = 'gmail';
    } else {
      configOptions.host = smtpHost;
      configOptions.port = smtpPort;
      configOptions.secure = smtpPort === 465;
    }

    const transporter = nodemailer.createTransport(configOptions);

    // Verify SMTP connection configuration
    await transporter.verify();
    console.log('SMTP verify success');

    const waText = `New inquiry details:\nCustomer Name: ${inquiryData.customerName}\nPhone: ${inquiryData.phone}\nProduct/Service: ${inquiryData.productOrService}\nType: ${inquiryData.type}\nMessage: ${inquiryData.message || ''}`;
    const waLink = `https://wa.me/91${shopOwnerPhone}?text=${encodeURIComponent(waText)}`;

    const mailOptions = {
      from: smtpUser,
      to: shopOwnerEmail,
      subject: 'New M.K. MuthuSamy Flower Shop Enquiry',
      html: `
        <h3>New Enquiry Received</h3>
        <p><strong>Customer Name:</strong> ${inquiryData.customerName}</p>
        <p><strong>Phone:</strong> ${inquiryData.phone}</p>
        <p><strong>Product/Service:</strong> ${inquiryData.productOrService}</p>
        <p><strong>Type:</strong> ${inquiryData.type}</p>
        <p><strong>Message:</strong> ${inquiryData.message || '-'}</p>
        <p><strong>Date:</strong> ${inquiryData.createdAt ? new Date(inquiryData.createdAt).toLocaleString() : new Date().toLocaleString()}</p>
        <p>
          <a href="${waLink}" style="display: inline-block; background-color: #25D366; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Chat on WhatsApp
          </a>
        </p>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error('Email error code:', err.code);
    console.error('Email error response:', err.response);
    console.error('Email error message:', err.message);
    return { success: false, error: err.message };
  }
};

module.exports = sendNotificationEmail;
