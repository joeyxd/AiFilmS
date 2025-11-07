import { Resend } from 'resend';

const resend = new Resend(import.meta.env.VITE_RESEND_API_KEY);

export interface EmailConfirmationData {
  email: string;
  confirmationToken: string;
  username: string;
}

export class EmailService {
  static async sendConfirmationEmail(data: EmailConfirmationData) {
    try {
      const confirmationUrl = `${window.location.origin}/auth/confirm?token=${data.confirmationToken}&email=${encodeURIComponent(data.email)}`;
      
      const result = await resend.emails.send({
        from: 'Auracle Film Studio <onboarding@resend.dev>',
        to: data.email,
        subject: 'Confirm your Auracle Film Studio account',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #ff1493; font-size: 28px; margin: 0;">Auracle Film Studio</h1>
              <p style="color: #666; font-size: 16px; margin: 10px 0 0 0;">AI-Powered Cinematic Storytelling</p>
            </div>
            
            <div style="background: #f8f9fa; border-radius: 12px; padding: 30px; margin-bottom: 30px;">
              <h2 style="color: #333; font-size: 24px; margin: 0 0 15px 0;">Hi ${data.username}!</h2>
              <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Thank you for signing up for Auracle Film Studio. To complete your registration and start creating amazing cinematic stories, please confirm your email address by clicking the button below.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${confirmationUrl}" style="background: #ff1493; color: white; padding: 15px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">
                  Confirm Your Email
                </a>
              </div>
              
              <p style="color: #888; font-size: 14px; margin: 20px 0 0 0;">
                If the button doesn't work, you can copy and paste this link into your browser:<br>
                <a href="${confirmationUrl}" style="color: #ff1493; word-break: break-all;">${confirmationUrl}</a>
              </p>
            </div>
            
            <div style="text-align: center; color: #888; font-size: 14px;">
              <p>This confirmation link will expire in 24 hours.</p>
              <p>If you didn't create an account with Auracle Film Studio, you can safely ignore this email.</p>
            </div>
          </div>
        `
      });

      console.log('Confirmation email sent successfully:', result);
      return { success: true, data: result };
    } catch (error) {
      console.error('Failed to send confirmation email:', error);
      return { success: false, error };
    }
  }

  static async sendWelcomeEmail(email: string, username: string) {
    try {
      const result = await resend.emails.send({
        from: 'Auracle Film Studio <onboarding@resend.dev>',
        to: email,
        subject: 'Welcome to Auracle Film Studio! 🎬',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #ff1493; font-size: 28px; margin: 0;">Auracle Film Studio</h1>
              <p style="color: #666; font-size: 16px; margin: 10px 0 0 0;">AI-Powered Cinematic Storytelling</p>
            </div>
            
            <div style="background: #f8f9fa; border-radius: 12px; padding: 30px; margin-bottom: 30px;">
              <h2 style="color: #333; font-size: 24px; margin: 0 0 15px 0;">Welcome aboard, ${username}! 🎉</h2>
              <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Your account has been successfully confirmed and you're now ready to start creating incredible cinematic stories with AI-powered tools.
              </p>
              
              <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <h3 style="color: #ff1493; font-size: 18px; margin: 0 0 15px 0;">What's next?</h3>
                <ul style="color: #666; font-size: 14px; line-height: 1.6; padding-left: 20px;">
                  <li>Complete your profile setup</li>
                  <li>Explore our video editing tools</li>
                  <li>Try our AI-powered features</li>
                  <li>Join our community</li>
                </ul>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${window.location.origin}/dashboard" style="background: #ff1493; color: white; padding: 15px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">
                  Go to Dashboard
                </a>
              </div>
            </div>
            
            <div style="text-align: center; color: #888; font-size: 14px;">
              <p>Need help? Contact us at support@filmstudio.ai</p>
            </div>
          </div>
        `
      });

      console.log('Welcome email sent successfully:', result);
      return { success: true, data: result };
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      return { success: false, error };
    }
  }
}
