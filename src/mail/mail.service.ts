import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private resend = new Resend(process.env.RESEND_API_KEY);

  async sendVerificationEmail(email: string, token: string) {
    const link = `${process.env.APP_URL}/auth/verify-email?token=${token}`;

    await this.resend.emails.send({
      from: 'Afri Tribe <onboarding@resend.dev>',
      to: email,
      subject: 'Verify your Afri Tribe account',
      html: `
        <div style="font-family: Arial;">
          <h2>Welcome to Afri Tribe 🚀</h2>
          <p>Please verify your email to activate your account:</p>
          <a href="${link}" style="padding:10px 15px;background:#000;color:#fff;text-decoration:none;">
            Verify Email
          </a>
          <p>This link expires in 1 hour.</p>
        </div>
      `,
    });
  }

  async sendResetPasswordEmail(email: string, token: string) {
    const link = `${process.env.APP_URL}/auth/reset-password?token=${token}`;

    await this.resend.emails.send({
      from: 'Afri Tribe <onboarding@resend.dev>',
      to: email,
      subject: 'Do you want to reset your Afri Tribe password?',
      html: `
        <div style="font-family: Arial;">
          <h2>Welcome to Afri Tribe 🚀</h2>
          <p>Please click the button below to reset your password:</p>
          <a href="${link}" style="padding:10px 15px;background:#000;color:#fff;text-decoration:none;">
            Reset Password
          </a>
          <p>This link expires in 1 hour.</p>
        </div>
      `,
    });
  }
}
