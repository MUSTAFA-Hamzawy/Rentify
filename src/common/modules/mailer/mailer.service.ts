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

  /**
   * Sends an email to the customer regarding their car rental order status.
   *
   * This email includes order details such as rental interval, total price, and current status.
   *
   * @param {string} email - The recipient's email address.
   * @param {object} bodyInfo - Contains information about the order including:
   * @returns {Promise<void>} - Resolves if the email is sent successfully, otherwise throws an error.
   * @throws {InternalServerErrorException} - Thrown if the email could not be sent.
   */
  async sendOrderMail(email: string, bodyInfo: any): Promise<void> {
    try {
      const { rentalInterval, totalPrice, orderStatus, userName, orderId } =
        bodyInfo;

      let body = `
      <h1>Order Update from Rentify</h1>
      <p>Dear ${userName},</p>
      <p>Your car rental order with id <strong>#${orderId}</strong> is <strong>${orderStatus.charAt(0).toUpperCase() + orderStatus.slice(1)}</strong>.</p>`;
      console.log(orderStatus.toLowerCase());
      if (orderStatus.toLowerCase() === 'pending') {
        body += `
      <p><strong>Order Details:</strong></p>
      <ul>
        <li>Rental Interval: ${rentalInterval} day(s)</li>
        <li>Total Price: ${totalPrice}</li>
        <li>Status: ${orderStatus.charAt(0).toUpperCase() + orderStatus.slice(1)}</li>
      </ul>`;
      }

      await this.sendMail({
        email,
        subject: '[Rentify]: Your order status.',
        body,
        footer: `<p>Thank you for choosing Rentify. Please contact us if you have any questions regarding your order.</p>
      <p>Best regards,<br>Rentify Team</p>`,
      });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
