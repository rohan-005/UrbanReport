import { Injectable } from '@nestjs/common';

export interface EmailTemplateData {
  complaintId: string;
  title: string;
  category: string;
  status: string;
  address: string;
  recipientName?: string;
  notes?: string;
  rejectionReason?: string;
  departmentName?: string;
  appBaseUrl?: string;
}

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

@Injectable()
export class TemplateService {
  private readonly appUrl: string = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  renderTemplate(eventType: string, data: EmailTemplateData): RenderedEmail {
    const complaintLink = `${data.appBaseUrl || this.appUrl}/complaints/${data.complaintId}`;
    const name = data.recipientName || 'Citizen';

    switch (eventType) {
      case 'ComplaintCreated':
        return {
          subject: `UrbanReports — Incident Report Received [${data.complaintId}]`,
          text: `Hello ${name},\n\nYour civic issue report "${data.title}" (${data.category}) has been successfully received.\nTracking Ref ID: ${data.complaintId}\nStatus: SUBMITTED\nLocation: ${data.address}\n\nView dossier: ${complaintLink}\n\nThank you for helping improve your city.\nUrbanReports Ward Control`,
          html: this.wrapHtml(`
            <h2>Civic Issue Report Received</h2>
            <p>Hello <strong>${name}</strong>,</p>
            <p>Your civic incident report has been registered into the municipal triage system.</p>
            <div style="background-color: #f5f3ee; padding: 16px; border-left: 4px solid #09090b; margin: 16px 0;">
              <p style="margin: 0 0 8px 0;"><strong>Tracking Reference ID:</strong> <span style="font-family: monospace;">${data.complaintId}</span></p>
              <p style="margin: 0 0 8px 0;"><strong>Title:</strong> ${data.title}</p>
              <p style="margin: 0 0 8px 0;"><strong>Category:</strong> ${data.category}</p>
              <p style="margin: 0 0 8px 0;"><strong>Status:</strong> <span style="background-color: #e4e4e7; padding: 2px 6px;">SUBMITTED</span></p>
              <p style="margin: 0;"><strong>Location:</strong> ${data.address}</p>
            </div>
            <p><a href="${complaintLink}" style="background-color: #09090b; color: #ffffff; padding: 10px 18px; text-decoration: none; font-weight: bold; display: inline-block;">Track Complaint Status →</a></p>
          `),
        };

      case 'ComplaintVerified':
        return {
          subject: `UrbanReports — Incident Verified [${data.complaintId}]`,
          text: `Hello ${name},\n\nYour report "${data.title}" [${data.complaintId}] has been verified by municipal inspection.\nStatus: VERIFIED\n\nView dossier: ${complaintLink}\n\nUrbanReports Control`,
          html: this.wrapHtml(`
            <h2>Incident Verified by Inspection</h2>
            <p>Hello <strong>${name}</strong>,</p>
            <p>Good news! Municipal authorities have inspected and verified your complaint.</p>
            <div style="background-color: #f0fdf4; padding: 16px; border-left: 4px solid #166534; margin: 16px 0;">
              <p style="margin: 0 0 8px 0;"><strong>Tracking Reference ID:</strong> ${data.complaintId}</p>
              <p style="margin: 0 0 8px 0;"><strong>Title:</strong> ${data.title}</p>
              <p style="margin: 0;"><strong>Status:</strong> <span style="color: #166534; font-weight: bold;">VERIFIED</span></p>
            </div>
            <p><a href="${complaintLink}" style="background-color: #09090b; color: #ffffff; padding: 10px 18px; text-decoration: none; font-weight: bold; display: inline-block;">View Verified Dossier →</a></p>
          `),
        };

      case 'ComplaintRejected':
        return {
          subject: `UrbanReports — Incident Update [${data.complaintId}]`,
          text: `Hello ${name},\n\nYour report "${data.title}" [${data.complaintId}] was reviewed and closed.\nStatus: REJECTED\nReason: ${data.rejectionReason || data.notes || 'Did not meet civic intervention criteria.'}\n\nView dossier: ${complaintLink}`,
          html: this.wrapHtml(`
            <h2>Incident Review Notice</h2>
            <p>Hello <strong>${name}</strong>,</p>
            <p>Your report has been reviewed by municipal administration.</p>
            <div style="background-color: #fef2f2; padding: 16px; border-left: 4px solid #dc2626; margin: 16px 0;">
              <p style="margin: 0 0 8px 0;"><strong>Tracking Reference ID:</strong> ${data.complaintId}</p>
              <p style="margin: 0 0 8px 0;"><strong>Status:</strong> <span style="color: #dc2626; font-weight: bold;">REJECTED</span></p>
              <p style="margin: 0;"><strong>Reason:</strong> ${data.rejectionReason || data.notes || 'Did not meet civic intervention criteria.'}</p>
            </div>
            <p><a href="${complaintLink}" style="color: #09090b; font-weight: bold;">View Complaint Record →</a></p>
          `),
        };

      case 'ComplaintAssigned':
        return {
          subject: `UrbanReports — Assigned to Department [${data.complaintId}]`,
          text: `Hello ${name},\n\nYour report "${data.title}" [${data.complaintId}] has been assigned to ${data.departmentName || 'Department'}.\nStatus: ASSIGNED\n\nView dossier: ${complaintLink}`,
          html: this.wrapHtml(`
            <h2>Assigned to Department Crew</h2>
            <p>Hello <strong>${name}</strong>,</p>
            <p>Your complaint has been assigned for field remediation.</p>
            <div style="background-color: #eff6ff; padding: 16px; border-left: 4px solid #2563eb; margin: 16px 0;">
              <p style="margin: 0 0 8px 0;"><strong>Tracking Reference ID:</strong> ${data.complaintId}</p>
              <p style="margin: 0 0 8px 0;"><strong>Department:</strong> ${data.departmentName || 'Municipal Operations Crew'}</p>
              <p style="margin: 0;"><strong>Status:</strong> <span style="color: #2563eb; font-weight: bold;">ASSIGNED</span></p>
            </div>
            <p><a href="${complaintLink}" style="background-color: #09090b; color: #ffffff; padding: 10px 18px; text-decoration: none; font-weight: bold; display: inline-block;">View Assignment Details →</a></p>
          `),
        };

      case 'ComplaintInProgress':
        return {
          subject: `UrbanReports — Field Repair In Progress [${data.complaintId}]`,
          text: `Hello ${name},\n\nWork has commenced on your report "${data.title}" [${data.complaintId}].\nStatus: IN_PROGRESS\n\nView dossier: ${complaintLink}`,
          html: this.wrapHtml(`
            <h2>Field Work In Progress</h2>
            <p>Hello <strong>${name}</strong>,</p>
            <p>Municipal repair crews are actively working on your reported issue.</p>
            <div style="background-color: #eff6ff; padding: 16px; border-left: 4px solid #1d4ed8; margin: 16px 0;">
              <p style="margin: 0 0 8px 0;"><strong>Tracking Reference ID:</strong> ${data.complaintId}</p>
              <p style="margin: 0;"><strong>Status:</strong> <span style="color: #1d4ed8; font-weight: bold;">IN_PROGRESS</span></p>
            </div>
            <p><a href="${complaintLink}" style="background-color: #09090b; color: #ffffff; padding: 10px 18px; text-decoration: none; font-weight: bold; display: inline-block;">Track Work Progress →</a></p>
          `),
        };

      case 'ComplaintResolved':
        return {
          subject: `UrbanReports — Issue Resolved & Completed [${data.complaintId}]`,
          text: `Hello ${name},\n\nYour reported issue "${data.title}" [${data.complaintId}] has been resolved!\nStatus: RESOLVED\nNotes: ${data.notes || 'Work verified and completed.'}\n\nView dossier & after evidence: ${complaintLink}`,
          html: this.wrapHtml(`
            <h2>Civic Incident Resolved!</h2>
            <p>Hello <strong>${name}</strong>,</p>
            <p>Great news! The reported issue has been successfully repaired and verified.</p>
            <div style="background-color: #f0fdf4; padding: 16px; border-left: 4px solid #15803d; margin: 16px 0;">
              <p style="margin: 0 0 8px 0;"><strong>Tracking Reference ID:</strong> ${data.complaintId}</p>
              <p style="margin: 0 0 8px 0;"><strong>Status:</strong> <span style="color: #15803d; font-weight: bold;">RESOLVED</span></p>
              <p style="margin: 0;"><strong>Resolution Notes:</strong> ${data.notes || 'Work completed and verified by municipal officer.'}</p>
            </div>
            <p><a href="${complaintLink}" style="background-color: #15803d; color: #ffffff; padding: 10px 18px; text-decoration: none; font-weight: bold; display: inline-block;">View Resolution Proof →</a></p>
          `),
        };

      case 'ComplaintReopened':
        return {
          subject: `UrbanReports — Incident Reopened [${data.complaintId}]`,
          text: `Hello ${name},\n\nYour report "${data.title}" [${data.complaintId}] has been reopened for further inspection.\nStatus: REOPENED\nNotes: ${data.notes || 'Reopened for field inspection.'}\n\nView dossier: ${complaintLink}`,
          html: this.wrapHtml(`
            <h2>Incident Reopened for Inspection</h2>
            <p>Hello <strong>${name}</strong>,</p>
            <p>Your complaint has been reopened for further field verification.</p>
            <div style="background-color: #fffbeb; padding: 16px; border-left: 4px solid #d97706; margin: 16px 0;">
              <p style="margin: 0 0 8px 0;"><strong>Tracking Reference ID:</strong> ${data.complaintId}</p>
              <p style="margin: 0 0 8px 0;"><strong>Status:</strong> <span style="color: #b45309; font-weight: bold;">REOPENED</span></p>
              <p style="margin: 0;"><strong>Reopen Reason:</strong> ${data.notes || 'Reopened for inspection.'}</p>
            </div>
            <p><a href="${complaintLink}" style="background-color: #09090b; color: #ffffff; padding: 10px 18px; text-decoration: none; font-weight: bold; display: inline-block;">View Complaint Status →</a></p>
          `),
        };

      default:
        return {
          subject: `UrbanReports Notification [${data.complaintId}]`,
          text: `Hello ${name},\n\nStatus update for complaint ${data.complaintId}: ${data.status}.\nView: ${complaintLink}`,
          html: this.wrapHtml(`
            <h2>UrbanReports Incident Update</h2>
            <p>Complaint <strong>${data.complaintId}</strong> status changed to <strong>${data.status}</strong>.</p>
            <p><a href="${complaintLink}">View Dossier →</a></p>
          `),
        };
    }
  }

  private wrapHtml(content: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #09090b; background-color: #f5f3ee; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e0d8; padding: 24px; }
          .header { font-size: 12px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; color: #71717a; border-bottom: 2px solid #09090b; padding-bottom: 12px; margin-bottom: 20px; }
          .footer { margin-top: 30px; font-size: 11px; color: #71717a; border-top: 1px solid #e4e4e7; padding-top: 12px; font-family: monospace; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">UrbanReports — Municipal Dispatch Notification</div>
          ${content}
          <div class="footer">
            Automated notification sent by UrbanReports Civic Infrastructure Platform.<br>
            Please do not reply directly to this email.
          </div>
        </div>
      </body>
      </html>
    `;
  }
}
