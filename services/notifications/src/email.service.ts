import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;
  private emailEnabled: boolean = false;
  private fromAddress: string = 'no-reply@urbanreports.gov.in';

  constructor(private readonly configService: ConfigService) {
    this.initTransporter();
  }

  private initTransporter() {
    const enabledStr = this.configService.get<string>('EMAIL_ENABLED', 'false');
    this.emailEnabled = enabledStr === 'true' || enabledStr === '1';
    this.fromAddress = this.configService.get<string>('SMTP_FROM', 'no-reply@urbanreports.gov.in');

    const host = this.configService.get<string>('SMTP_HOST');
    const port = parseInt(this.configService.get<string>('SMTP_PORT', '587'), 10);
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASSWORD');

    if (host && user) {
      try {
        this.transporter = nodemailer.createTransport({
          host,
          port,
          secure: port === 465,
          auth: { user, pass },
        });
        this.logger.log(`Nodemailer SMTP Transporter configured for host: ${host}:${port}`);
      } catch (err: any) {
        this.logger.warn(`Failed to initialize Nodemailer SMTP transporter: ${err.message}`);
      }
    } else {
      this.logger.log('SMTP configuration omitted. Emails will be logged to console in Dev Mode.');
    }
  }

  async testSmtpConnection(): Promise<{ success: boolean; message: string }> {
    if (!this.transporter) {
      return { success: false, message: 'SMTP Transporter is unconfigured or disabled.' };
    }
    try {
      await this.transporter.verify();
      return { success: true, message: 'SMTP connection verified successfully.' };
    } catch (err: any) {
      return { success: false, message: `SMTP verification failed: ${err.message}` };
    }
  }

  async sendEmail(
    to: string,
    subject: string,
    html: string,
    text: string,
  ): Promise<{ success: boolean; messageId?: string; simulated?: boolean }> {
    this.logger.log(`[Notification Delivery] To: ${to} | Subject: "${subject}"`);

    if (!this.emailEnabled || !this.transporter) {
      this.logger.log(`[SIMULATED EMAIL SENT] (EMAIL_ENABLED=false)\nTo: ${to}\nSubject: ${subject}\nText: ${text.substring(0, 150)}...`);
      return { success: true, simulated: true, messageId: `sim-${Date.now()}` };
    }

    try {
      const info = await this.transporter.sendMail({
        from: this.fromAddress,
        to,
        subject,
        html,
        text,
      });

      this.logger.log(`[SMTP EMAIL DELIVERED] MessageID: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (err: any) {
      this.logger.error(`[SMTP DELIVERY FAILURE] To: ${to} | Error: ${err.message}`);
      // Return false but do not throw unhandled exception
      return { success: false };
    }
  }
}
