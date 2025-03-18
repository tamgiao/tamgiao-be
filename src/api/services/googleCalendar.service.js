import { google } from "googleapis";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

export async function createMeetURL() {
    const { OAuth2 } = google.auth;

    // Initialize OAuth2 Client
    let oAuth2Client = new OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET);
    oAuth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });

    // Create Google Calendar instance
    let calendar = google.calendar({ version: "v3", auth: oAuth2Client });

    // Define meeting start and end time (45-minute meeting)
    let startDateTime = new Date();
    let endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000);

    let formattedStart = startDateTime.toISOString();
    let formattedEnd = endDateTime.toISOString();

    // Create Google Calendar Event
    const event = {
        summary: "Google Meet Session",
        location: "Online",
        description: "Open access meeting.",
        visibility: "public", // Make event public
        attendees: [
            { email: "public@public.com" }, // Allows external users to join
        ],
        guestsCanInviteOthers: true, // Allow guests to invite others
        guestsCanModify: false, // Prevent guests from modifying event
        guestsCanSeeOtherGuests: true, // Allow guests to see each other
        conferenceData: {
            createRequest: {
                requestId: `meet-${Date.now()}`,
                conferenceSolutionKey: { type: "hangoutsMeet" },
            },
        },
        start: {
            dateTime: formattedStart,
            timeZone: "UTC", // Use UTC for global access
        },
        end: {
            dateTime: formattedEnd,
            timeZone: "UTC",
        },
    };

    try {
        let response = await calendar.events.insert({
            calendarId: "primary",
            conferenceDataVersion: 1,
            resource: event,
        });

        let meetLink = response.data.conferenceData?.entryPoints?.find((ep) => ep.entryPointType === "video")?.uri;

        console.log("Google Meet Link:", meetLink);
        return meetLink;
    } catch (error) {
        console.error("Error creating Google Meet link:", error);
        throw new Error("Failed to generate Meet URL");
    }
}
