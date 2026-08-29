# UrbanReports

UrbanReports is a civic issue reporting and management platform designed to allow citizens to report problems in their local areas, track submitted complaints, and provide authorities with structured information for resolving civic issues.

The platform is designed around a scalable microservice architecture with dedicated services for authentication, complaints, media, maps/geolocation, notifications, and future civic intelligence functionality.

---

## Project Status

UrbanReports is currently under active development.

The project has progressed beyond the initial frontend stage and currently includes the foundation for an end-to-end civic issue reporting workflow.

### Current Focus

- Professional frontend UI/UX
- User authentication
- JWT-based authorization
- Complaint reporting
- Complaint validation
- Complaint persistence
- Media upload
- Location and geolocation
- Map integration
- Microservice communication
- API Gateway
- PostgreSQL/Neon integration
- Responsive design
- Error handling
- Email notification foundation
- Production-readiness improvements

---

# Features

## User Authentication

UrbanReports provides a dedicated authentication system supporting:

- User registration
- User login
- JWT-based authentication
- Protected routes
- Authenticated API requests
- User-specific complaint ownership
- Logout/session handling

Authentication is isolated from complaint management to maintain clear service boundaries.

---

## User Registration

The registration system supports user account creation with validation.

Current validation includes:

- Name validation
- Email validation
- Password validation
- Confirm password validation
- Aadhaar format validation

Actual Aadhaar verification is intentionally not implemented at this stage.

The current implementation only validates the supplied Aadhaar value, including:

- Required digit length
- Numeric format
- Invalid/repeated digit patterns

Actual government identity verification can be introduced in a future phase.

---

# Complaint Reporting

The primary functionality of UrbanReports is civic issue reporting.

Users can create reports containing structured information about a civic problem.

A complaint can contain:

- Title
- Description
- Category
- Severity
- Latitude
- Longitude
- Address
- Uploaded media
- Reporter information
- Status
- Creation timestamp
- Update timestamp

The reporting interface is designed to work across desktop, tablet, and mobile devices.

---

# Complaint Categories

The complaint system supports categorized civic issues.

Potential categories include:

- Roads
- Potholes
- Street Lights
- Garbage
- Drainage
- Water Supply
- Electricity
- Public Infrastructure
- Traffic
- Sanitation
- Parks
- Public Safety
- Other

The actual accepted categories are controlled by backend validation.

---

# Complaint Severity

Complaints support severity classification.

Current conceptual levels include:

- Low
- Medium
- High
- Critical

Severity can later be used by authorities and automated systems to prioritize complaints.

---

# Location and Maps

UrbanReports supports location-aware complaint reporting.

The reporting interface can use the browser/device geolocation API to obtain the user's current position.

A complaint stores location information such as:

```text
latitude
longitude
address

Coordinates are handled according to the requirements of the map implementation.

For map coordinate arrays, the correct format is:

[longitude, latitude]

and not:

[latitude, longitude]

Future geospatial capabilities include:

Nearby complaints
Complaint clustering
Map-based browsing
Geographic filtering
Complaint heatmaps
Area-based statistics
Ward/zone filtering
Location-based prioritization
Media Upload

UrbanReports includes a dedicated Media Service for complaint images and other uploaded files.

The current media workflow is:

Frontend
    |
    v
Media API
    |
    v
Media Service
    |
    v
Media Storage

The Media Service is responsible for:

File upload
File validation
Media processing
Media ownership
Media identifiers
Complaint-media association

The media upload workflow has been tested successfully with actual uploads.

Future media functionality may include:

Multiple images per complaint
Video uploads
Image compression
Image metadata
Image moderation
Duplicate image detection
Cloud object storage
CDN delivery
Complaint Persistence

Complaint data is stored using PostgreSQL.

The project is designed to use Neon PostgreSQL for the relational database layer.

The database stores structured complaint information such as:

Complaint ID
Reporter
Category
Title
Description
Severity
Status
Latitude
Longitude
Address
Media references
Creation time
Update time

Complaint data is expected to survive:

Browser refresh
Frontend restart
Backend restart
Service restart
Architecture

UrbanReports follows a microservice-oriented architecture.

High-level architecture:

                         +----------------+
                         |    Frontend    |
                         |    Next.js     |
                         +-------+--------+
                                 |
                                 v
                         +----------------+
                         |   API Gateway  |
                         |     NestJS     |
                         +-------+--------+
                                 |
              +------------------+------------------+
              |                  |                  |
              v                  v                  v
       +-------------+    +-------------+    +-------------+
       |    Users    |    | Complaints  |    |    Media    |
       |   Service   |    |   Service   |    |   Service   |
       +------+------+    +------+------+    +------+------+
              |                  |                  |
              v                  v                  v
        User Database      PostgreSQL          Media Storage

                                 |
                                 v
                         +---------------+
                         | Maps / Geo    |
                         | Functionality |
                         +---------------+

                                 |
                                 v
                         +---------------+
                         | Notification  |
                         | Service       |
                         +---------------+
                                 |
                                 v
                              Email
                           (Nodemailer)

Service boundaries are intentionally kept separate so that each domain can evolve independently.

Services
Frontend

The frontend is responsible for:

User interface
Authentication pages
Registration
Login
Complaint reporting
Complaint listing
Complaint details
Map interaction
Geolocation
Media upload
Navigation
Loading states
Skeleton states
Empty states
Error states
Responsive behavior

The frontend is built with Next.js, React, and TypeScript.

API Gateway

The API Gateway is the main entry point for frontend API requests.

Example:

Frontend
   |
   v
/api/complaints
   |
   v
API Gateway
   |
   v
Complaints Service

The gateway is responsible for:

Request routing
Authentication integration
Service communication
Request/response handling
Centralized error handling
API abstraction
Users Service

The Users Service manages user-related functionality.

Responsibilities include:

Registration
Login
User information
Authentication
JWT generation
User identity
User profile information
Complaints Service

The Complaints Service manages the core civic issue domain.

Responsibilities include:

Complaint creation
Complaint retrieval
Complaint validation
Complaint persistence
Complaint status
Complaint severity
Complaint categories
Complaint location
Reporter association
Media association
Complaint filtering
Complaint sorting

Example:

POST /api/complaints

Retrieve complaints:

GET /api/complaints

Retrieve newest complaints:

GET /api/complaints?sortBy=newest
Media Service

The Media Service handles uploaded files.

Responsibilities include:

Upload validation
Media processing
Media storage
Media ownership
Media identifiers
Complaint-media association

Example:

POST /api/media
Maps and Geospatial Functionality

The maps layer is responsible for location-related functionality.

Responsibilities include:

Current user location
Latitude and longitude
Address information
Map visualization
Geographic positioning
Future geographic queries

The system is designed to support more advanced geospatial features later.

Notification Service

UrbanReports uses email notifications for system notifications.

Nodemailer is used for email delivery.

Potential notifications include:

Complaint Created
Complaint Received
Complaint Assigned
Complaint Status Changed
Complaint Resolved
Complaint Reopened

Email notification functionality will be expanded in future development phases.

Technology Stack
Frontend
Next.js
React
TypeScript
CSS
Responsive UI
Map integration
Backend
NestJS
TypeScript
REST APIs
Passport
JWT
class-validator
Microservices
Databases
PostgreSQL / Neon

Used for structured relational data such as:

Complaints
Complaint status
Categories
Severity
Relationships
Location information
MongoDB

MongoDB is intended for flexible document-oriented data where appropriate, particularly areas such as:

Flexible user-related data
Media metadata
Other document-oriented records

Database responsibility remains service-specific.

Notifications
Nodemailer
SMTP
Email notifications
Deployment

The project is being developed with Render deployment in mind.

Deployment Architecture

A possible production deployment architecture is:

                    Internet
                       |
                       v
                +-------------+
                |   Frontend  |
                |   Next.js   |
                +------+------+
                       |
                       v
                +-------------+
                | API Gateway |
                +------+------+
                       |
        +--------------+--------------+
        |              |              |
        v              v              v
   Users Service  Complaints      Media Service
                      Service
                       |
                       v
                 Neon PostgreSQL

        +-----------------------------+
        | MongoDB / Document Storage  |
        +-----------------------------+

        +-----------------------------+
        | External Media Storage      |
        +-----------------------------+

        +-----------------------------+
        | SMTP / Nodemailer           |
        +-----------------------------+

The final production architecture may change based on deployment requirements.

Environment Variables

Sensitive configuration must be supplied through environment variables.

Example:

NODE_ENV=development

DATABASE_URL=

JWT_SECRET=

MONGODB_URI=

SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=

MAP_API_KEY=

Never commit actual credentials.

The repository should provide an .env.example file containing variable names without secrets.

Installation
Requirements

Install:

Node.js
pnpm
Git
PostgreSQL/Neon access
MongoDB access
Clone the Repository
git clone <repository-url>

cd UrbanReport
Install Dependencies
pnpm install
Configure Environment

Create the appropriate environment files.

For example:

cp .env.example .env

Configure the required values.

Do not commit .env.

Running the Project

Start the development environment using the project's configured scripts.

pnpm dev

Individual services may also be started independently.

The current development architecture includes services such as:

Frontend
Gateway
Users
Complaints
Media
Notifications

Ports are environment-specific and should be taken from the current project configuration.

Complaint Reporting Flow

The current complaint workflow is approximately:

User
 |
 v
Open Report Page
 |
 v
Enter Complaint Information
 |
 +---- Category
 |
 +---- Title
 |
 +---- Description
 |
 +---- Severity
 |
 +---- Location
 |
 +---- Address
 |
 +---- Image
 |
 v
Upload Media
 |
 v
Media Service
 |
 v
Receive Media ID
 |
 v
Create Complaint
 |
 v
API Gateway
 |
 v
Complaints Service
 |
 v
PostgreSQL
 |
 v
Complaint Created
 |
 v
Frontend Confirmation
Location Flow
User
 |
 v
Allow Location Access
 |
 v
Browser Geolocation API
 |
 v
Latitude + Longitude
 |
 v
Address / Reverse Geocoding
 |
 v
Complaint
 |
 v
PostgreSQL
 |
 v
Map Visualization

The application should use real device/browser location where permission is available.

The system should not silently replace unavailable location information with fake coordinates.

Authentication Flow
User
 |
 v
Login
 |
 v
Users Service
 |
 v
Credential Validation
 |
 v
JWT
 |
 v
Frontend
 |
 v
Authenticated API Request
 |
 v
API Gateway
 |
 v
Protected Service

Protected resources must use the established JWT authentication mechanism.

The backend remains responsible for validating the authenticated user.

Validation

Backend validation is authoritative.

The complaint API validates:

Required fields
Data types
String lengths
Category values
Severity values
Latitude
Longitude
Address
Authentication
Media references

Geographic constraints:

-90 <= latitude <= 90

-180 <= longitude <= 180

Frontend validation is used for user experience, but backend validation must always remain enabled.

Error Handling

UrbanReports uses centralized error handling where appropriate.

Errors should be:

Structured
Understandable
Safe
Logged server-side
Free of credentials and secrets

The application must never expose:

Passwords
JWT secrets
Database credentials
SMTP passwords
API keys
Internal stack traces to users
Responsive Design

UrbanReports is designed for:

Mobile phones
Tablets
Laptops
Desktop computers
Large displays

Important viewport targets include:

320px
375px
390px
430px
768px
1024px
1280px
1366px
1440px
1920px

Both portrait and landscape orientations should be supported.

The UI should not introduce:

Horizontal overflow
Overlapping navigation
Cut-off buttons
Broken forms
Text collisions
Unusable touch targets
UI and UX

UrbanReports follows a modern civic-tech design direction.

The interface aims to be:

Professional
Trustworthy
Clean
Accessible
Responsive
Modern
Consistent

The UrbanReports logo forms part of the application's visual identity.

Current UI refinement work includes:

Login page
Registration page
Navigation
Floating navigation dock
Typography
Spacing
Cards
Buttons
Inputs
Loading states
Empty states
Error states
Micro-interactions
Floating Navigation Dock

UrbanReports uses a floating navigation dock for primary navigation.

The dock is designed to provide:

Clear active states
Larger touch targets
Responsive behavior
Hover states
Press feedback
Smooth transitions
Mobile safe-area support

The navigation should remain accessible without obstructing application content.

Accessibility

Accessibility is part of the frontend development process.

The application should support:

Semantic HTML
Keyboard navigation
Visible focus states
Accessible labels
Appropriate ARIA attributes
Sufficient contrast
Reduced motion preferences
Accessible validation messages
Touch-friendly controls
Loading States

The application uses loading states to communicate asynchronous operations.

Relevant operations include:

Login
Registration
Complaint retrieval
Complaint creation
Media upload
Map loading

Loading states should prevent accidental duplicate submissions.

Empty States

Empty data should be represented intentionally.

For example:

No complaints yet

should provide a clear explanation and, where appropriate, an action such as:

Report an Issue

Blank screens should be avoided.

Security

Security is a major consideration for the project.

The application should protect against:

Unauthorized API access
Invalid authentication
Malicious file uploads
SQL injection
NoSQL injection
XSS
API abuse
Credential exposure
Unauthorized complaint modification

Sensitive information must never be hardcoded.

Secrets

Never commit:

.env
.env.local
JWT secrets
Database passwords
SMTP credentials
API keys
Private credentials

Use environment variables and deployment secret management.

Current Development Roadmap

UrbanReports is planned across approximately ten major development phases.

Phase 1
Basic Frontend Foundation
        |
        v
Phase 2
Authentication and User Foundation
        |
        v
Phase 3
Microservice and API Foundation
        |
        v
Phase 4
Complaint Reporting
        |
        v
Phase 5
Media and Geolocation
        |
        v
Phase 6
Complaint Tracking and Status Management
        |
        v
Phase 7
Notifications
        |
        v
Phase 8
Authority and Admin Dashboard
        |
        v
Phase 9
Analytics and Geospatial Intelligence
        |
        v
Phase 10
AI, Optimization and Production Scaling

The exact boundaries may evolve as implementation continues.

Future Scope
1. Advanced Complaint Tracking

Users will eventually be able to track the complete lifecycle of a complaint.

Example:

Submitted
    |
    v
Under Review
    |
    v
Assigned
    |
    v
In Progress
    |
    v
Resolved
    |
    v
Closed

Users can eventually see:

Current status
Status history
Assigned department
Resolution information
Important timestamps
2. Authority Dashboard

A dedicated authority dashboard can manage complaints.

Potential features:

Complaint management
Complaint assignment
Status management
Priority management
Department management
User management
Analytics
Geographic visualization
Resolution tracking
3. Role-Based Access Control

Future roles may include:

Citizen
Authority
Department Admin
Super Admin

Example:

Citizen
  -> Create complaint
  -> View own complaints

Authority
  -> View assigned complaints
  -> Update complaint status

Admin
  -> Manage departments
  -> Manage users
  -> View analytics
4. Real-Time Updates

Future versions can support real-time complaint status updates using technologies such as:

WebSockets
Server-Sent Events
Event-driven architecture

Example:

Authority changes status
        |
        v
Backend Event
        |
        v
User receives update
5. Email Notifications

Nodemailer can be expanded into a complete notification system.

Possible events:

Complaint Created
Complaint Received
Complaint Assigned
Complaint Status Changed
Complaint Resolved
Complaint Reopened

Email templates can eventually be customized.

6. Advanced Geospatial Intelligence

The maps layer can eventually provide:

Nearby complaints
Radius searches
Complaint clustering
Heatmaps
Ward filtering
Area statistics
Geographic prioritization
Duplicate detection

Example:

User Location
      |
      v
Search Radius
      |
      v
Nearby Complaints
      |
      v
Map Visualization
7. Complaint Heatmaps

Authorities can eventually visualize complaint density.

Potential use cases:

Pothole hotspots
Garbage hotspots
Flood-prone areas
Street-light problems
Water issues

This can help authorities prioritize infrastructure work.

8. Duplicate Complaint Detection

Multiple citizens may report the same problem.

Future duplicate detection can use:

Geographic proximity
Complaint category
Text similarity
Time proximity
Image similarity

Example:

Complaint A
Location X

Complaint B
Nearby Location X

        |
        v

Potential Duplicate
9. Image Intelligence

The Media Service can eventually support:

Image compression
Image classification
Damage detection
Duplicate detection
Content moderation
Metadata extraction

Example:

Uploaded Image
      |
      v
Image Processing
      |
      v
Potential Road Damage
      |
      v
Complaint Metadata
10. AI-Assisted Classification

An AI service could eventually assist in automatically classifying complaints.

Example:

"Large pothole near the main gate"

        |
        v

Category:
Roads

Severity:
High

Possible Department:
Road Maintenance

AI should assist the system rather than bypass deterministic backend validation.

11. Smart Severity Detection

Future severity estimation could consider:

Description
Category
Location
Number of reports
Images
Historical data

Authorities should retain the ability to override automated classification.

12. Automatic Department Routing

Complaints can eventually be routed automatically.

Example:

Complaint
    |
    v
Classification
    |
    v
Department
    |
    v
Assigned Authority

Possible departments include:

Roads
Sanitation
Electricity
Water
Drainage
Parks
Traffic
13. Analytics Dashboard

Future analytics may include:

Total complaints
Open complaints
Resolved complaints
Pending complaints
Average resolution time
Complaints by category
Complaints by severity
Complaints by area
Department performance
Monthly trends
14. Citizen Contribution Metrics

Future versions may provide non-financial contribution metrics.

Examples:

Reports submitted
Valid reports
Issues resolved
Community contribution score

This must be implemented carefully to avoid encouraging spam or fraudulent reporting.

15. Complaint Comments

Citizens and authorities could communicate through complaint-specific comments.

Example:

Citizen
   |
   | Comment
   v
Complaint
   |
   | Response
   v
Authority
16. Complaint Reopening

Users could request reopening of a complaint if they believe an issue was not properly resolved.

Example:

Resolved
   |
   v
Citizen Review
   |
   +---- Accept
   |
   +---- Reopen
17. Public Transparency

A future public complaint map could display anonymized civic issues.

Potential information:

Category
General location
Status
Severity
Date reported

Personal information must never be exposed publicly.

18. Department SLA Tracking

Authorities can eventually define service-level targets.

Example:

Critical
    -> 24 hours

High
    -> 48 hours

Medium
    -> 5 days

Low
    -> 10 days

Actual SLA values would depend on the municipality.

19. Automated Escalation

Complaints exceeding their SLA can automatically escalate.

Example:

Complaint
   |
   v
SLA exceeded
   |
   v
Department Escalation
   |
   v
Senior Authority
20. Mobile Application

The responsive web application can eventually be complemented by native mobile applications.

Possible technologies:

React Native
Expo
Flutter

Potential mobile-specific functionality:

Better GPS integration
Native camera access
Push notifications
Offline reporting
Improved media handling
21. Offline Reporting

Future mobile applications could support offline complaint creation.

Example:

Create Report
      |
      v
Store Locally
      |
      v
Network Available
      |
      v
Synchronize
      |
      v
Server
22. Push Notifications

In addition to email, future versions can support:

Browser notifications
Mobile push notifications

Users could eventually choose their preferred notification channels.

23. Multi-Language Support

UrbanReports can eventually support:

English
Hindi
Regional Languages

The frontend should be structured so that localization can be introduced without rewriting the application.

24. Advanced Accessibility

Future versions should continue improving:

Screen-reader support
Keyboard navigation
Contrast
Focus management
Reduced motion
Accessible map interactions
Accessible error messages
25. Production Security

Before full production deployment, the project should undergo a security review covering:

Authentication
Authorization
JWT handling
Rate limiting
CORS
Input validation
File validation
File size limits
SQL injection prevention
NoSQL injection prevention
XSS prevention
Secure headers
Secret management
API abuse prevention
26. Rate Limiting

Production APIs should eventually implement rate limiting for:

Login
Registration
Complaint creation
Media uploads
API requests
27. File Security

Future media security improvements may include:

MIME type validation
File extension validation
File size limits
Malware scanning
Image processing
Storage isolation
Signed URLs
28. Observability

Production infrastructure should eventually include:

Structured logging
Request IDs
Error tracking
Metrics
Health checks
Service monitoring
Database monitoring

Example:

Frontend
   |
Gateway
   |
Service
   |
Database

Request ID
   |
   +---- Gateway logs
   +---- Service logs
   +---- Database logs
29. Testing Strategy

UrbanReports should progressively introduce multiple levels of testing.

Unit Testing

Test:

Services
Repositories
Validation
Utilities
Components
Integration Testing

Test:

Gateway
   |
Service
   |
Database
End-to-End Testing

Test complete workflows:

Register
   |
Login
   |
Create Report
   |
Upload Media
   |
Submit
   |
Retrieve
   |
Update Status
   |
Resolve
30. CI/CD

Future development should introduce automated CI/CD pipelines.

Potential pipeline:

Git Push
   |
   v
CI
   |
   +---- Install
   |
   +---- Lint
   |
   +---- Typecheck
   |
   +---- Unit Tests
   |
   +---- Integration Tests
   |
   +---- Build
   |
   v
Deployment
Development Principles
Separation of Responsibilities

Every service should have a clearly defined responsibility.

Backend Validation

Frontend validation improves UX, but backend validation remains authoritative.

No Hardcoded Secrets

Credentials must always be provided through environment variables or deployment secret management.

Secure Authentication

Protected resources must use the established authentication mechanism.

Responsive First

The interface must work across device sizes, orientations, and viewport heights.

Accessible UI

Accessibility should be considered during implementation rather than added at the end.

Real Data

Production functionality must use real persistence rather than hidden hardcoded data.

Graceful Errors

Service and database failures should produce meaningful errors instead of unexplained crashes.

Maintainability

Prefer reusable components and clearly defined service boundaries.

Git Commit Guidelines

Commits should represent meaningful implementation work.

Good examples:

add complaint persistence workflow
fix complaints database connection
implement complaint media association
add complaint status validation
polish authentication and navigation UI

Avoid meaningless commits such as:

update
changes
fix stuff
final
done
Development Workflow

When implementing a new feature:

Inspect the existing architecture.
Identify the correct service boundary.
Review existing implementations.
Implement backend validation.
Implement service logic.
Implement database interaction where required.
Implement frontend integration.
Test the complete workflow.
Test responsive behavior.
Check browser console.
Run typecheck.
Run lint.
Run tests.
Review the final diff.
Create meaningful commits.

Avoid unrelated refactoring during feature development.

Current Milestone

At the current milestone, UrbanReports contains the foundation required for an end-to-end civic reporting platform.

The current major workflow is:

User
 |
 +---- Register
 |
 +---- Login
 |
 +---- JWT Authentication
 |
 +---- Open Report
 |
 +---- Select Category
 |
 +---- Select Severity
 |
 +---- Enter Title
 |
 +---- Enter Description
 |
 +---- Select Location
 |
 +---- Upload Image
 |
 +---- Submit Complaint
 |
 v
API Gateway
 |
 v
Complaints Service
 |
 v
PostgreSQL
 |
 v
Persisted Complaint
 |
 v
Complaint List
 |
 v
Complaint Details
 |
 v
Map Location

The frontend is also undergoing a professional UI/UX refinement pass focused on:

Authentication pages
Branding
Logo integration
Floating navigation
Typography
Spacing
Responsive layouts
Cards
Buttons
Inputs
Loading states
Error states
Empty states
Micro-interactions
Future Vision

UrbanReports aims to become a complete civic technology platform connecting citizens and local authorities.

The long-term vision is:

Citizen
   |
   v
Report Civic Issue
   |
   v
Automatic Classification
   |
   v
Geospatial Analysis
   |
   v
Correct Department
   |
   v
Authority Assignment
   |
   v
Resolution
   |
   v
Citizen Notification
   |
   v
Citizen Verification
   |
   v
Analytics
   |
   v
Better Civic Infrastructure

The platform can eventually evolve from a basic reporting application into an intelligent civic issue management system.

Project Goals

UrbanReports is ultimately intended to:

Make civic issue reporting simple.
Make complaint information structured.
Connect reports to real-world locations.
Help authorities prioritize issues.
Improve communication between citizens and authorities.
Provide transparent complaint tracking.
Reduce duplicate complaints.
Provide geographic and statistical insights.
Support automated notifications.
Provide a scalable foundation for intelligent civic infrastructure management.
License

The project license should be selected according to the project's ownership and distribution requirements.

Example:

MIT License
UrbanReports

UrbanReports is a civic issue reporting platform designed to make reporting, tracking, and resolving urban problems more structured, transparent, and accessible.

Report.
Track.
Improve your city.