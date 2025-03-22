import "dotenv/config";
import axios from "axios";

const ZOOM_ACCOUNT_ID = process.env.ZOOM_ACCOUNT_ID;
const ZOOM_CLIENT_ID = process.env.ZOOM_CLIENT_ID;
const ZOOM_CLIENT_SECRET = process.env.ZOOM_CLIENT_SECRET;

async function getZoomAccessToken() {
    try {
        const response = await axios.post(
            `https://zoom.us/oauth/token`,
            new URLSearchParams({
                grant_type: "account_credentials",
                account_id: ZOOM_ACCOUNT_ID,
            }).toString(),
            {
                headers: {
                    Authorization: `Basic ${Buffer.from(`${ZOOM_CLIENT_ID}:${ZOOM_CLIENT_SECRET}`).toString("base64")}`,
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            }
        );
        return response.data.access_token;
    } catch (error) {
        console.error("Error getting Zoom access token:", error.response?.data);
        throw new Error("Failed to get Zoom access token");
    }
}

export async function createZoomMeeting(topic, startTime, duration) {
    const ISOStartTime = convertToICTISOString(startTime);

    try {
        const accessToken = await getZoomAccessToken();

        const response = await axios.post(
            `https://api.zoom.us/v2/users/me/meetings`,
            {
                topic: topic || "New Meeting",
                type: 2, // Scheduled Meeting
                start_time: ISOStartTime,
                duration: duration || 30, // Default 30 minutes
                timezone: "Asia/Ho_Chi_Minh",
                settings: {
                    host_video: true,
                    participant_video: true,
                    join_before_host: false,
                    mute_upon_entry: true,
                    waiting_room: true,
                    approval_type: 2,
                    allow_multiple_devices: true,
                    auto_recording: "none",
                    in_meeting: true,
                },
            },
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            }
        );

        return response.data;
    } catch (error) {
        console.error("Error creating Zoom meeting:", error.response?.data);
        throw new Error("Failed to create meeting");
    }
}

export function convertToICTISOString(utcISOString) {
    const dateUTC = new Date(utcISOString);

    const ICT_OFFSET_MS = 7 * 60 * 60 * 1000;

    const dateInICT = new Date(dateUTC.getTime() + ICT_OFFSET_MS);

    return dateInICT.toISOString();
}

function convertToBrowserJoinUrl(joinUrl) {
    return joinUrl.replace(/\/j\/(\d+)/, "/wc/join/$1");
}
