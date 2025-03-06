import dotenv from "dotenv";

dotenv.config();

const ESMS_API_URL = "https://rest.esms.vn/MainService.svc/json/SendMultipleMessage_V4_post_json/";
const ESMS_API_KEY = process.env.ESMS_API_KEY; // Your API key from eSMS.vn
const ESMS_SECRET_KEY = process.env.ESMS_SECRET_KEY; // Your secret key from eSMS.vn
const ESMS_BRAND_NAME = "Baotrixemay";

export const sendVerificationSMS = async (phoneNumber, verificationCode) => {
    try {
        const requestBody = {
            ApiKey: ESMS_API_KEY,
            SecretKey: ESMS_SECRET_KEY,
            Phone: phoneNumber, // Must be in international format (+84xxxxxxxxx for Vietnam)
            Content: `${verificationCode} la ma xac minh dang ky Baotrixemay cua ban`, // Customizable message
            Brandname: ESMS_BRAND_NAME,
            SmsType: "2", // 2 = Brandname SMS, 4 = Regular SMS
            IsUnicode: "0", // 0 = Non-Unicode, 1 = Unicode
            RequestId: crypto.randomUUID(), // Generate a unique request ID
        };

        const response = await fetch(ESMS_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        });

        const responseData = await response.json();

        if (responseData.CodeResult === "100") {
            console.log("SMS sent successfully:", responseData);
            return { success: true, response: responseData };
        } else {
            console.error("Failed to send SMS:", responseData);
            return { success: false, error: responseData };
        }
    } catch (error) {
        console.error("Error sending SMS:", error);
        return { success: false, error: error.message };
    }
};
