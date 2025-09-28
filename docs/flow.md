# Application Structure and User Flow

This document outlines the basic structure of the Nexus Events application and the intended user flows for different roles.

## 1. Roles

There are three main roles in this application:

1.  **User**: The end-user who browses, registers for, and attends events.
2.  **Organizer/Admin**: A representative from an organization who creates and manages events, and configures their organization's branding.
3.  **Platform Admin**: (Implicit) A superuser who would manage the overall platform (not implemented in the current scope).

---

## 2. Application File Structure

-   `/src/app/` - The main Next.js App Router directory.
    -   `/page.tsx`: The homepage where all events are listed (User view).
    -   `/events/[id]/page.tsx`: The detailed view for a single event.
    -   `/profile/page.tsx`: The user's profile page, showing their details and event history.
    -   `/dashboard/page.tsx`: The main dashboard for Organizers/Admins to view event analytics and manage their created events.
    -   `/dashboard/branding/page.tsx`: The page for Organizers/Admins to manage their organization's branding (logo, watermark, etc.).
-   `/src/components/`: Contains reusable React components.
    -   `header.tsx`: The main application header.
    -   `event-card.tsx`: The card component used to display an event on the homepage.
    -   `/ui/`: ShadCN UI components.
-   `/src/lib/`: Contains library functions and data definitions.
    -   `placeholder-data.ts`: Contains the static data for events and users.
    -   `placeholder-images.json`: Contains URLs for placeholder images used throughout the app.
-   `/docs/`: Contains documentation.
    -   `flow.md`: This file.

---

## 3. User Flows

### a) User Flow

1.  **Discover Events**:
    -   A user lands on the homepage (`/`).
    -   They see a list of all available events from various organizations.
    -   They can use the search and filter controls to narrow down events by name, organization, department, or price.

2.  **View Event Details**:
    -   The user clicks on an event card.
    -   They are navigated to the event details page (`/events/[id]`).
    -   This page shows the event title, description, image, date, location, and organizer details.

3.  **Register for an Event**:
    -   On the event details page, the user clicks the "Register" or "Book" button.
    -   A dialog opens to confirm the booking.
    -   If the event is paid, a (mock) payment step is shown.
    -   Upon successful registration, a confirmation/ticket dialog with a QR code is displayed.

4.  **Manage Profile & History**:
    -   The user navigates to their profile (`/profile`).
    -   They can view their personal details.
    -   They can see a history of all events they have booked.
    -   They have options to download individual event certificates (as PDF) or their entire event history (as CSV or PDF).

### b) Organizer/Admin Flow

1.  **Access Dashboard**:
    -   An organizer logs in and navigates to the Organizer Dashboard (`/dashboard`).

2.  **Manage Branding**:
    -   From the dashboard or header menu, they navigate to the "Manage Branding" page (`/dashboard/branding`).
    -   Here, they can:
        -   Upload/update their organization's logo.
        -   Upload an optional watermark image for certificates.
        -   Add/manage department-specific logos.
        -   Update the organization name and tagline.

3.  **Create an Event**:
    -   On the dashboard, they click the "Create Event" button.
    -   A comprehensive dialog appears with fields for event title, description, date, location, type, and price.
    -   They fill out the form and submit it to create a new event, which will then appear on the main event listing for users.

4.  **Manage Events**:
    -   The "My Events" tab on the dashboard lists all events created by that organizer.
    -   They have options to **Edit** or **Delete** their events.

5.  **View Analytics**:
    -   The "Analytics" tab shows charts and stats about their events, such as total revenue and total registrations.
