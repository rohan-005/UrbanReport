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

    if (user && pass) {
      try {
        const isGmail = (host && host.includes('gmail')) || (user && user.endsWith('@gmail.com'));
        
        if (isGmail) {
          this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user, pass },
          });
          this.logger.log(`Nodemailer Gmail Transporter initialized for user: ${user}`);
        } else if (host) {
          this.transporter = nodemailer.createTransport({
            host,
            port,
            secure: port === 465,
            auth: { user, pass },
          });
          this.logger.log(`Nodemailer SMTP Transporter configured for host: ${host}:${port}`);
        }
      } catch (err: any) {
        this.logger.warn(`Failed to initialize Nodemailer transporter: ${err.message}`);
      }
    } else {
      this.logger.log('SMTP configuration omitted. Emails will be simulated/logged to console in Dev Mode.');
    }
  }

  async testSmtpConnection(): Promise<{ success: boolean; message: string; details?: any }> {
    if (!this.transporter) {
      return {
        success: false,
        message: 'SMTP Transporter is unconfigured or missing credentials (SMTP_USER / SMTP_PASSWORD).',
      };
    }
    try {
      await this.transporter.verify();
      return { success: true, message: 'SMTP connection & credentials verified successfully.' };
    } catch (err: any) {
      const isGmailErr = err.message?.includes('Invalid login') || err.message?.includes('535');
      const detailMsg = isGmailErr
        ? 'Gmail Authentication Failed. Gmail requires an "App Password" (16 characters) generated under Google Account -> Security -> App Passwords. Standard passwords will be rejected.'
        : err.message;
      return { success: false, message: `SMTP verification failed: ${detailMsg}`, details: err.message };
    }
  }

  async sendEmail(
    to: string,
    subject: string,
    html: string,
    text: string,
  ): Promise<{ success: boolean; messageId?: string; simulated?: boolean; error?: string }> {
    this.logger.log(`[Notification Delivery] To: ${to} | Subject: "${subject}"`);

    if (!this.emailEnabled || !this.transporter) {
      this.logger.log(`[SIMULATED EMAIL SENT] (EMAIL_ENABLED=${this.emailEnabled})\nTo: ${to}\nSubject: ${subject}\nText: ${text.substring(0, 150)}...`);
      return { success: true, simulated: true, messageId: `sim-${Date.now()}` };
    }

    try {
      const info = await this.transporter.sendMail({
        from: this.fromAddress || this.configService.get<string>('SMTP_USER'),
        to,
        subject,
        html,
        text,
      });

      this.logger.log(`[SMTP EMAIL DELIVERED] MessageID: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (err: any) {
      this.logger.error(`[SMTP DELIVERY FAILURE] To: ${to} | Error: ${err.message}`);
      return { success: false, error: err.message };
    }
  }
}

