// controllers/auctionManager/pokeBuyer.controller.js
import AuctionRequest from '../../models/AuctionRequest.js';
import nodemailer from 'nodemailer';

const THIRTY_HOURS_MS = 0; // TEST: set to 0 for testing, change back to: 30 * 60 * 60 * 1000

const createTransporter = () =>
  nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

export const pokeBuyer = async (req, res) => {
  try {
    const { id } = req.params;

    const auction = await AuctionRequest.findById(id)
      .populate('winnerId', 'firstName lastName email')
      .populate('sellerId', 'firstName lastName');

    if (!auction) {
      return res.json({ success: false, message: 'Auction not found' });
    }

    // Must be stopped
    if (!auction.auction_stopped) {
      return res.json({ success: false, message: 'Auction has not ended yet' });
    }

    // Must have a winner
    if (!auction.winnerId) {
      return res.json({ success: false, message: 'No winner found for this auction' });
    }

    // Must have a payment deadline and be past 30 hours
    if (!auction.paymentDeadline) {
      return res.json({ success: false, message: 'No payment deadline set for this auction' });
    }

    const now = new Date();
    const deadline = new Date(auction.paymentDeadline);
    const auctionStoppedAt = new Date(auction.updatedAt);
    const hoursSinceEnd = (now - auctionStoppedAt) / (1000 * 60 * 60);

    if (hoursSinceEnd < 0) { // TEST: set to 0 for testing, change back to: 30
      const hoursLeft = Math.ceil(30 - hoursSinceEnd);
      return res.json({
        success: false,
        message: `Poke available after 30 hours from auction end. ${hoursLeft} hour(s) remaining.`,
      });
    }

    // Payment already completed (paymentFailed means they didn't pay and was re-auctioned)
    if (auction.paymentFailed) {
      return res.json({ success: false, message: 'Payment window has already expired and car was re-auctioned' });
    }

    const buyer = auction.winnerId;
    const paymentDeadlineStr = deadline.toLocaleString('en-IN', {
      dateStyle: 'long',
      timeStyle: 'short',
      timeZone: 'Asia/Kolkata',
    });

    const mailOptions = {
      from: process.env.SMTP_FROM || '"DriveBidRent" <noreply@drivebidrent.com>',
      to: buyer.email,
      subject: `⚠️ Payment Reminder – You won the auction for ${auction.vehicleName}!`,
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 620px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 40px 40px 32px; text-align: center;">
            <div style="font-size: 40px; margin-bottom: 12px;">🚨</div>
            <h1 style="color: #f97316; font-size: 26px; font-weight: 800; margin: 0; letter-spacing: -0.5px;">Payment Reminder</h1>
            <p style="color: #94a3b8; margin-top: 8px; font-size: 14px;">DriveBidRent Auction Platform</p>
          </div>

          <!-- Body -->
          <div style="padding: 36px 40px;">
            <p style="font-size: 16px; color: #1e293b; margin: 0 0 20px;">
              Hi <strong>${buyer.firstName} ${buyer.lastName}</strong>,
            </p>
            <p style="font-size: 15px; color: #475569; line-height: 1.7; margin: 0 0 24px;">
              Congratulations on winning the auction! 🎉 However, we noticed that your payment for the vehicle below is still pending.
            </p>

            <!-- Car Info Box -->
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 20px 24px; margin-bottom: 28px;">
              <p style="margin: 0 0 8px; font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 600;">Winning Bid Details</p>
              <p style="margin: 0 0 4px; font-size: 20px; font-weight: 800; color: #0f172a;">${auction.vehicleName}</p>
              <p style="margin: 0 0 16px; font-size: 24px; font-weight: 900; color: #16a34a;">₹${auction.finalPurchasePrice?.toLocaleString('en-IN') || 'N/A'}</p>
              <div style="display: flex; gap: 0; border-top: 1px solid #e2e8f0; padding-top: 14px;">
                <div>
                  <p style="margin: 0 0 2px; font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.08em;">Payment Deadline</p>
                  <p style="margin: 0; font-size: 14px; font-weight: 700; color: #dc2626;">${paymentDeadlineStr} IST</p>
                </div>
              </div>
            </div>

            <!-- Warning -->
            <div style="background: #fff7ed; border-left: 4px solid #f97316; border-radius: 6px; padding: 16px 20px; margin-bottom: 28px;">
              <p style="margin: 0; font-size: 14px; color: #9a3412; line-height: 1.6;">
                <strong>⚠️ Important:</strong> Failure to complete payment by the deadline may result in your bid being cancelled and the vehicle being re-auctioned. You may also be reported to platform admins.
              </p>
            </div>

            <!-- CTA -->
            <div style="text-align: center; margin-bottom: 28px;">
              <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/buyer/purchases"
                 style="display: inline-block; background: linear-gradient(135deg, #f97316, #ea580c); color: #fff; font-weight: 700; font-size: 15px; text-decoration: none; padding: 14px 36px; border-radius: 10px; letter-spacing: 0.02em;">
                Complete Payment Now →
              </a>
            </div>

            <p style="font-size: 13px; color: #94a3b8; text-align: center; margin: 0;">
              If you've already completed the payment, please ignore this email.
            </p>
          </div>

          <!-- Footer -->
          <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 40px; text-align: center;">
            <p style="margin: 0; font-size: 12px; color: #94a3b8;">
              This is an automated reminder from <strong>DriveBidRent</strong>. Please do not reply to this email.
            </p>
          </div>
        </div>
      `,
    };

    const transporter = createTransporter();
    await transporter.sendMail(mailOptions);

    console.log(`✅ [pokeBuyer] Payment reminder sent to ${buyer.email} for auction ${id}`);

    res.json({
      success: true,
      message: `Payment reminder sent to ${buyer.email}`,
    });
  } catch (err) {
    console.error('❌ [pokeBuyer] Error:', err);
    res.json({ success: false, message: 'Failed to send reminder email' });
  }
};
