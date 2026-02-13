import nodemailer from 'nodemailer';

function getSubjectLine(urgentieLevel: string): string {
  const now = new Date();
  const dayFormatter = new Intl.DateTimeFormat('nl-NL', {
    weekday: 'long',
    timeZone: 'Europe/Amsterdam',
  });
  const timeFormatter = new Intl.DateTimeFormat('nl-NL', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Amsterdam',
  });

  const dag = dayFormatter.format(now);
  const tijd = timeFormatter.format(now);
  const prefix = urgentieLevel === 'hoog' ? '\u26A0\uFE0F ' : '';

  return `${prefix}Dewthread \u2014 ${dag} ${tijd}`;
}

export async function sendEmail(
  humanResponse: string | null,
  analysisText: string,
  urgentieLevel: string
): Promise<void> {
  const gmailUser = process.env.GMAIL_USER;
  const gmailPassword = process.env.GMAIL_APP_PASSWORD;

  if (!gmailUser || !gmailPassword) {
    console.log('[email] GMAIL_USER of GMAIL_APP_PASSWORD niet ingesteld, email overgeslagen');
    return;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: gmailUser,
      pass: gmailPassword,
    },
  });

  const parts: string[] = [];

  if (urgentieLevel === 'hoog') {
    parts.push('<p style="color: #d32f2f; font-weight: bold;">\u26A0\uFE0F Items met hoge urgentie actief</p>');
  }

  if (humanResponse) {
    parts.push(`<p><strong>Update:</strong> ${humanResponse}</p>`);
  }

  parts.push(`<p>${analysisText}</p>`);

  const html = parts.join('\n<hr style="border: none; border-top: 1px solid #eee; margin: 16px 0;">\n');

  const subject = getSubjectLine(urgentieLevel);

  await transporter.sendMail({
    from: gmailUser,
    to: gmailUser,
    subject,
    html,
  });

  console.log(`[email] Verzonden: ${subject}`);
}
