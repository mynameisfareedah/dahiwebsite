const RESEND_API = 'https://api.resend.com/emails';

export const handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let body = {};
  try {
    body = JSON.parse(event.body || '{}');
  } catch (e) {
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  const { firstName, email } = body;
  if (!email) return { statusCode: 400, body: 'Missing email' };

  const API_KEY = process.env.RESEND_API_KEY;
  const FROM = process.env.RESEND_FROM || 'no-reply@dahi.org';
  if (!API_KEY) return { statusCode: 500, body: 'Missing Resend API key' };

  const subject = 'Welcome to the DAHI Community';
  const html = `
    <p>Dear ${firstName || 'Friend'},</p>
    <p>Thank you for joining the DAHI Community.</p>
    <p>We are excited to support your health and wellness journey through trusted education, webinars, resources, and community engagement.</p>
    <p>You will receive updates about upcoming events, women's health resources, and opportunities to connect with other women committed to lifelong wellbeing.</p>
    <p>Welcome aboard.</p>
    <p>Warm regards,<br/>Dr. Adiyat Olamide D.<br/>Founder, DAHI</p>
  `;

  try {
    const res = await fetch(RESEND_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        from: FROM,
        to: [email],
        subject,
        html
      })
    });

    if (!res.ok) {
      const text = await res.text();
      return { statusCode: res.status || 500, body: `Resend error: ${text}` };
    }

    return { statusCode: 200, body: 'Email sent' };
  } catch (err) {
    return { statusCode: 500, body: String(err) };
  }
};
