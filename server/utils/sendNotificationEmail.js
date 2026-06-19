const { Resend } = require("resend");

const sendNotificationEmail = async (inquiryData) => {
  const resendApiKey = process.env.RESEND_API_KEY;
  const shopOwnerEmail = process.env.SHOP_OWNER_EMAIL || 'sivasivaraman566@gmail.com';
  const shopOwnerPhone = process.env.SHOP_OWNER_PHONE || '9342913781';

  console.log(`RESEND_API_KEY loaded: ${resendApiKey ? 'yes' : 'no'}`);

  if (!resendApiKey) {
    return {
      success: false,
      error: "RESEND_API_KEY missing"
    };
  }

  try {
    const resend = new Resend(resendApiKey);

    const waText = `New enquiry details:\nCustomer Name: ${inquiryData.customerName}\nPhone: ${inquiryData.phone}\nProduct/Service: ${inquiryData.productOrService}\nType: ${inquiryData.type}\nMessage: ${inquiryData.message || ''}`;
    const waLink = `https://wa.me/91${shopOwnerPhone}?text=${encodeURIComponent(waText)}`;

    const htmlContent = `
      <h3>New Enquiry Received</h3>
      <p><strong>Customer Name:</strong> ${inquiryData.customerName}</p>
      <p><strong>Phone Number:</strong> ${inquiryData.phone}</p>
      <p><strong>Inquiry Subject / Product:</strong> ${inquiryData.productOrService}</p>
      <p><strong>Message:</strong> ${inquiryData.message || '-'}</p>
      <p><strong>Date:</strong> ${inquiryData.createdAt ? new Date(inquiryData.createdAt).toLocaleString() : new Date().toLocaleString()}</p>
      <p>
        <a href="${waLink}" style="display: inline-block; background-color: #25D366; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
          Chat on WhatsApp
        </a>
      </p>
    `;

    const { data, error } = await resend.emails.send({
      from: "M.K. MuthuSamy Flower Shop <onboarding@resend.dev>",
      to: shopOwnerEmail,
      subject: "New Flower Shop Enquiry",
      html: htmlContent
    });

    if (error) {
      console.error('Resend API error:', error);
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      id: data.id
    };
  } catch (error) {
    console.error('Email error message:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = sendNotificationEmail;
