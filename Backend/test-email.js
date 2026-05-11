import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

const testSMTP = async () => {
  try {
    const t = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
    await t.verify();
    console.log("SMTP OK");
  } catch(e) {
    console.error("SMTP ERROR:", e.message);
  }
};
testSMTP();
