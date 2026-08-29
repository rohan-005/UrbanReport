import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';
import { EmailService } from './email.service';
import { TemplateService } from './templates/template.service';
import { DomainNotificationEvent } from './redis-stream.service';

@Injectable()
export class NotificationWorkerService implements OnModuleInit {
  private readonly logger = new Logger(NotificationWorkerService.name);
  private processedEvents = new Set<string>();
  private usersServiceUrl: string = 'http://localhost:5001';

  constructor(
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
    private readonly templateService: TemplateService,
  ) {
    this.usersServiceUrl = this.configService.get<string>('USERS_SERVICE_URL', 'http://localhost:5001');
  }

  onModuleInit() {
    this.logger.log('Notification Worker Service initialized and ready to consume complaint domain events.');
  }

  @OnEvent('domain.notification')
  async handleDomainNotification(event: DomainNotificationEvent) {
    // 1. Idempotency check
    if (this.processedEvents.has(event.eventId)) {
      this.logger.log(`[Idempotency Check] Event ID ${event.eventId} already processed. Skipping duplicate delivery.`);
      return;
    }

    this.logger.log(`[Worker Consuming Event] Type: ${event.eventType} | Complaint: ${event.complaintId} | User: ${event.reporterUserId}`);

    // Mark as processed
    this.processedEvents.add(event.eventId);

    // 2. Resolve User Email & Notification Preferences
    const recipient = await this.resolveRecipient(event.reporterUserId, event.metadata);
    if (!recipient || !recipient.email) {
      this.logger.warn(`Could not resolve recipient email for user ID ${event.reporterUserId}. Skipping email.`);
      return;
    }


    // 3. Evaluate User Notification Preferences
    const prefs = recipient.notificationPreferences || {
      complaintUpdates: true,
      resolutionNotifications: true,
      assignmentUpdates: true,
    };

    if (event.eventType === 'ComplaintResolved' && prefs.resolutionNotifications === false) {
      this.logger.log(`User ${recipient.email} has disabled resolution notifications. Skipping.`);
      return;
    }

    if (event.eventType === 'ComplaintAssigned' && prefs.assignmentUpdates === false) {
      this.logger.log(`User ${recipient.email} has disabled assignment notifications. Skipping.`);
      return;
    }

    if (
      ['ComplaintCreated', 'ComplaintVerified', 'ComplaintRejected', 'ComplaintInProgress', 'ComplaintReopened'].includes(event.eventType) &&
      prefs.complaintUpdates === false
    ) {
      this.logger.log(`User ${recipient.email} has disabled general complaint updates. Skipping.`);
      return;
    }

    // 4. Render Email Template
    const templateData = {
      complaintId: event.complaintId,
      title: event.metadata?.title || 'Civic Infrastructure Incident',
      category: event.metadata?.category || 'Civic Issue',
      status: event.metadata?.status || 'SUBMITTED',
      address: event.metadata?.address || 'Location Coordinates',
      recipientName: recipient.name || 'Citizen',
      notes: event.metadata?.notes,
      rejectionReason: event.metadata?.rejectionReason,
      departmentName: event.metadata?.departmentName,
    };

    const rendered = this.templateService.renderTemplate(event.eventType, templateData);

    // 5. Bounded Retry Strategy for Email Delivery
    await this.sendWithRetry(recipient.email, rendered.subject, rendered.html, rendered.text, 3);
  }

  private async sendWithRetry(
    to: string,
    subject: string,
    html: string,
    text: string,
    maxRetries: number,
  ) {
    let attempt = 1;
    while (attempt <= maxRetries) {
      try {
        const res = await this.emailService.sendEmail(to, subject, html, text);
        if (res.success) {
          this.logger.log(`[Worker Delivery Success] Attempt ${attempt}/${maxRetries} to ${to}`);
          return;
        }
      } catch (err: any) {
        this.logger.warn(`[Worker Retry Warning] Attempt ${attempt}/${maxRetries} failed: ${err.message}`);
      }
      attempt++;
      if (attempt <= maxRetries) {
        await new Promise((r) => setTimeout(r, 1000 * attempt));
      }
    }

    this.logger.error(`[Worker Delivery Permanently Failed] Max retries (${maxRetries}) reached for ${to}. Complaint status unaffected.`);
  }

  private async resolveRecipient(userId: string, metadata?: any): Promise<{ name?: string; email: string; notificationPreferences?: any } | null> {
    if (metadata?.reporterEmail || metadata?.email) {
      return {
        name: metadata?.reporterName || 'Citizen Reporter',
        email: metadata?.reporterEmail || metadata?.email,
        notificationPreferences: { complaintUpdates: true, resolutionNotifications: true, assignmentUpdates: true },
      };
    }

    if (userId && userId.includes('@')) {
      return {
        name: 'Citizen Reporter',
        email: userId,
        notificationPreferences: { complaintUpdates: true, resolutionNotifications: true, assignmentUpdates: true },
      };
    }

    if (userId === 'admin-001' || userId === 'admin@urbanreports.gov.in') {
      return {
        name: 'Municipal Administrator',
        email: process.env.ADMIN_ID || 'admin@urbanreports.gov.in',
        notificationPreferences: { complaintUpdates: true, resolutionNotifications: true, assignmentUpdates: true },
      };
    }

    try {
      const res = await fetch(`${this.usersServiceUrl}/users/${userId}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.email) {
          return {
            name: data.name,
            email: data.email,
            notificationPreferences: data.notificationPreferences,
          };
        }
      }
    } catch (err: any) {
      this.logger.warn(`User Service lookup for ${userId} failed: ${err.message}`);
    }

    // Default fallback recipient to configured DEFAULT_NOTIFICATION_EMAIL or active user email
    return {
      name: 'Citizen Reporter',
      email: process.env.DEFAULT_NOTIFICATION_EMAIL || 'rokumar005@gmail.com',
      notificationPreferences: { complaintUpdates: true, resolutionNotifications: true, assignmentUpdates: true },
    };
  }
}
