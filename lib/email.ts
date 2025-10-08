import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendFamilyInviteEmailParams {
  to: string;
  familyName: string;
  inviteCode: string;
  inviterName: string;
  inviteLink: string;
}

export async function sendFamilyInviteEmail({
  to,
  familyName,
  inviteCode,
  inviterName,
  inviteLink,
}: SendFamilyInviteEmailParams) {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
      to: [to],
      subject: `${inviterName} invited you to join ${familyName} on Secret Shopper`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Family Invitation</title>
          </head>
          <body style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-family: 'Libre Baskerville', serif; font-size: 32px;">🎁 Secret Shopper</h1>
            </div>

            <div style="background: #f9fafb; padding: 40px 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <h2 style="color: #1f2937; margin-top: 0; font-family: 'Libre Baskerville', serif;">You've been invited!</h2>

              <p style="font-size: 16px; color: #4b5563; margin: 20px 0;">
                <strong>${inviterName}</strong> has invited you to join the <strong>${familyName}</strong> family on Secret Shopper.
              </p>

              <p style="font-size: 16px; color: #4b5563; margin: 20px 0;">
                Secret Shopper makes it easy to coordinate gift-giving with your family by sharing wishlists, tracking preferences, and organizing group gifts.
              </p>

              <div style="background: white; border: 2px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 30px 0; text-align: center;">
                <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">Your invite code:</p>
                <p style="font-family: 'Courier New', monospace; font-size: 28px; font-weight: bold; color: #667eea; margin: 0; letter-spacing: 2px;">${inviteCode}</p>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${inviteLink}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.4);">
                  Join ${familyName}
                </a>
              </div>

              <p style="font-size: 14px; color: #6b7280; margin: 30px 0 10px 0;">
                Or copy and paste this link into your browser:
              </p>
              <p style="font-size: 14px; color: #667eea; word-break: break-all; background: white; padding: 12px; border-radius: 6px; border: 1px solid #e5e7eb;">
                ${inviteLink}
              </p>

              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

              <p style="font-size: 12px; color: #9ca3af; text-align: center; margin: 0;">
                This invitation was sent to ${to}. If you didn't expect this invitation, you can safely ignore this email.
              </p>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error("Error sending email:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
}
