const nodemailer = require('nodemailer');

function createTransporter() {
  const service = process.env.EMAIL_SERVICE?.toLowerCase();

  if (service && service !== 'smtp') {
    return nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  return nodemailer.createTransport({
    host:   process.env.EMAIL_HOST,
    port:   parseInt(process.env.EMAIL_PORT || '587', 10),
    secure: process.env.EMAIL_PORT === '465', // true for port 465
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

function validate({ firstName, lastName, email, practiceArea, message }) {
  if (!firstName || firstName.trim().length < 2)
    return 'First name is required.';
  if (!lastName || lastName.trim().length < 2)
    return 'Last name is required.';
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
    return 'A valid email address is required.';
  if (!practiceArea || practiceArea.trim() === '')
    return 'Please select a practice area.';
  if (!message || message.trim().length < 20)
    return 'Message must be at least 20 characters.';
  return null;
}

function buildTextEmail({ firstName, lastName, email, phone, practiceArea, message }) {
  return `
New Client Inquiry — Harmon & Vega Law
=======================================

Name:           ${firstName} ${lastName}
Email:          ${email}
Phone:          ${phone || 'Not provided'}
Practice Area:  ${practiceArea}

Message:
--------
${message}

---------------------------------------
Sent via harmonvegalaw.com contact form
  `.trim();
}

function buildHtmlEmail({ firstName, lastName, email, phone, practiceArea, message }) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <style>
    body  { font-family: Georgia, serif; background: #f7f3eb; margin: 0; padding: 0; }
    .wrap { max-width: 600px; margin: 40px auto; background: #0d1b2a; border-radius: 6px; overflow: hidden; }
    .hdr  { background: #c9a84c; padding: 28px 36px; }
    .hdr h1 { margin: 0; font-size: 20px; color: #0d1b2a; letter-spacing: 0.02em; }
    .hdr p  { margin: 4px 0 0; font-size: 12px; color: rgba(13,27,42,0.7); text-transform: uppercase; letter-spacing: 0.1em; }
    .body { padding: 36px; }
    .row  { margin-bottom: 20px; }
    .lbl  { font-size: 10px; text-transform: uppercase; letter-spacing: 0.14em; color: #c9a84c; margin-bottom: 4px; }
    .val  { font-size: 15px; color: rgba(255,255,255,0.85); line-height: 1.5; }
    .msg  { background: rgba(255,255,255,0.04); border-left: 2px solid #c9a84c; padding: 16px 20px; margin-top: 8px; border-radius: 0 3px 3px 0; }
    .ftr  { padding: 20px 36px; border-top: 1px solid rgba(255,255,255,0.06); font-size: 11px; color: rgba(255,255,255,0.25); text-align: center; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="hdr">
      <h1>New Client Inquiry</h1>
      <p>Harmon &amp; Vega Law — harmonvegalaw.com</p>
    </div>
    <div class="body">
      <div class="row">
        <div class="lbl">Client Name</div>
        <div class="val">${firstName} ${lastName}</div>
      </div>
      <div class="row">
        <div class="lbl">Email Address</div>
        <div class="val"><a href="mailto:${email}" style="color:#e8c97e;">${email}</a></div>
      </div>
      <div class="row">
        <div class="lbl">Phone</div>
        <div class="val">${phone || '<em style="opacity:0.4">Not provided</em>'}</div>
      </div>
      <div class="row">
        <div class="lbl">Practice Area</div>
        <div class="val">${practiceArea}</div>
      </div>
      <div class="row">
        <div class="lbl">Message</div>
        <div class="msg val">${message.replace(/\n/g, '<br>')}</div>
      </div>
    </div>
    <div class="ftr">
      Sent via harmonvegalaw.com contact form &nbsp;·&nbsp; Reply directly to respond to ${firstName}.
    </div>
  </div>
</body>
</html>
  `.trim();
}

export default async function handler(req, res) {

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const { firstName, lastName, email, phone, practiceArea, message } = req.body || {};

  const validationError = validate({ firstName, lastName, email, practiceArea, message });
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || !process.env.EMAIL_TO) {
    console.error('[contact] Missing email environment variables.');
    return res.status(500).json({ error: 'Server configuration error. Please call us directly.' });
  }

  try {
    const transporter = createTransporter();

    await transporter.sendMail({
      from:     `"Harmon & Vega Law Website" <${process.env.EMAIL_USER}>`,
      to:       process.env.EMAIL_TO,
      replyTo:  email.trim(),
      subject:  `New Inquiry: ${practiceArea} — ${firstName} ${lastName}`,
      text:     buildTextEmail({ firstName, lastName, email, phone, practiceArea, message }),
      html:     buildHtmlEmail({ firstName, lastName, email, phone, practiceArea, message }),
    });

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error('[contact] Email send failed:', err.message);
    return res.status(500).json({
      error: 'Failed to send your message. Please call us at (800) 555-1947.',
    });
  }
}
