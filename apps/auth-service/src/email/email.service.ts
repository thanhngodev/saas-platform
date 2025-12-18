/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    const emailHost = this.configService.get('EMAIL_HOST', '');
    const emailPort = this.configService.get('EMAIL_PORT', '');
    const emailFrom = this.configService.get('EMAIL_FROM', '');
    const emailPassword = this.configService.get('EMAIL_PASSWORD', '');

    this.transporter = nodemailer.createTransport({
      host: emailHost as string,
      port: emailPort as number,
      secure: true,
      auth: {
        user: emailFrom as string,
        pass: emailPassword as string,
      },
    });
  }

  private getEmailTemplate(otp: string): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Email Verification</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .container {
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        .header {
          background: #4f46e5;
          color: white;
          padding: 20px;
          text-align: center;
        }
        .content {
          padding: 30px;
          background: #ffffff;
        }
        .otp-code {
          font-size: 32px;
          letter-spacing: 3px;
          color: #4f46e5;
          font-weight: bold;
          text-align: center;
          margin: 25px 0;
          padding: 15px;
          background: #f5f5ff;
          border-radius: 6px;
          border: 1px dashed #c7d2fe;
        }
        .button {
          display: inline-block;
          padding: 12px 30px;
          margin: 20px 0;
          background: #4f46e5;
          color: white;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
        }
        .footer {
          text-align: center;
          padding: 20px;
          font-size: 12px;
          color: #666;
          background: #f9fafb;
        }
        .divider {
          border-top: 1px solid #e5e7eb;
          margin: 25px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Verify Your Email Address</h1>
        </div>
        <div class="content">
          <p>Hello,</p>
          <p>Thank you for registering with our service. To complete your registration, please use the following verification code:</p>
          
          <div class="otp-code">${otp}</div>
          
          <p>This code will expire in 10 minutes. If you didn't request this, please ignore this email.</p>
          
          <div class="divider"></div>
          
          <p>Need help? <a href="mailto:support@yourdomain.com" style="color: #4f46e5;">Contact our support team</a></p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Your Company Name. All rights reserved.</p>
          <p>123 Business Street, City, Country</p>
        </div>
      </div>
    </body>
    </html>
    `;
  }

  async sendVerificationEmail(email: string, otp: string): Promise<void> {
    const mailOptions = {
      from: this.configService.get('EMAIL_FROM') as string,
      to: email,
      subject: 'Verify Your Email Address',
      text: `Your verification code is: ${otp}\n\nPlease use this code to verify your email address. This code will expire in 10 minutes.`,
      html: this.getEmailTemplate(otp),
    };

    await this.transporter.sendMail(mailOptions);
  }

  // Add this to email.service.ts
  async sendPasswordResetEmail(
    email: string,
    name: string = 'User',
    otp: string,
  ) {
    const mailOptions = {
      from: this.configService.get('EMAIL_FROM'),
      to: email,
      subject: 'Password Reset OTP',
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset Request</h2>
        <p>Hello ${name},</p>
        <p>You have requested to reset your password. Please use the following OTP to verify your identity:</p>
        <div style="font-size: 24px; font-weight: bold; letter-spacing: 2px; margin: 20px 0; padding: 10px; background: #f5f5f5; text-align: center; border-radius: 4px;">
          ${otp}
        </div>
        <p>This OTP will expire in 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <p>Best regards,<br>Your App Team</p>
      </div>
    `,
    };

    await this.transporter.sendMail(mailOptions);
  }
}
