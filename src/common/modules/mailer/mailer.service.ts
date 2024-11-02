import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

interface EmailInfo {
  email: string;
  subject: string;
  body: string;
  footer?: string;
}

/**
 * MailerService is responsible for sending emails using nodemailer.
 */
@Injectable()
export class MailerService {
  private transporter: nodemailer.Transporter;

  /**
   * Initializes the transporter with Gmail service.
   */
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_MAIL,
        pass: process.env.APP_PASSWORD,
      },
    });
  }

  /**
   * Sends an email based on the provided EmailInfo.
   *
   * @param emailInfo - The information about the email to be sent.
   */
  async sendMail(emailInfo: EmailInfo): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: `Rentify <${process.env.SMTP_MAIL}>`,
        to: emailInfo.email,
        subject: emailInfo.subject,
        html: emailInfo.footer
          ? `${emailInfo.body}<br/><br/>${emailInfo.footer}`
          : emailInfo.body,
      });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  /**
   * Sends an activation email with an OTP code.
   *
   * @param email - The recipient's email address.
   * @param otpCode - The OTP code to be sent.
   */
  async sendActivationMail(email: string, otpCode: string): Promise<void> {
    try {
      await this.sendMail({
        email,
        subject: 'Verify Your Account.',
        body: `<p>Your OTP code is <strong>${otpCode}</strong><p>`,
      });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
