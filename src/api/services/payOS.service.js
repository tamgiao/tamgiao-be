import PayOS from "@payos/node";
import dotenv from "dotenv";

dotenv.config();

const clientId = process.env.PAYOS_CLIENT_ID;
const apiKey = process.env.PAYOS_API_KEY;
const checksumKey = process.env.PAYOS_CHECKSUM_KEY;

const payOS = new PayOS(clientId, apiKey, checksumKey);

export const createPaymentLink = async ({ amount, description, items, expiredAt, returnUrl, cancelUrl }) => {
    try {
        const orderCode = Number(String(Date.now()).slice(-6));

        // Validate required fields
        if (!amount || !description || !items || items.length === 0) {
            throw new Error("Missing required fields");
        }

        const body = {
            orderCode,
            amount,
            description,
            items,
            expiredAt,
            returnUrl: "https://tamgiao.github.io/tamgiao/",
            cancelUrl: "https://tamgiao.github.io/tamgiao/#/CategoryTestSelected",
        };

        // Create payment link
        const paymentResponse = await payOS.createPaymentLink(body);

        if (!paymentResponse || !paymentResponse.checkoutUrl) {
            throw new Error("Failed to generate payment link");
        }

        return {
            orderCode,
            description,
            expiredAt,
            checkoutUrl: paymentResponse.checkoutUrl,
        };
    } catch (error) {
        console.error("Error creating payment link:", error);
        throw error; // Propagate error to caller
    }
};

export const cancelPaymentLink = async (orderCode) => {
    try {
        // Validate required fields
        if (!orderCode) {
            throw new Error("Missing orderId");
        }

        console.log(`Canceling payment link for orderId: ${orderCode}`);

        // Call the PayOS API to cancel the payment link
        const cancelledPaymentLink = await payOS.cancelPaymentLink(orderCode);

        console.log("Payment link canceled successfully:", cancelledPaymentLink);

        // Return the response to the caller
        return cancelledPaymentLink;
    } catch (error) {
        console.error("Error canceling payment link:", error);

        // Throw a structured error for better debugging
        throw new Error(error.message || "Failed to cancel payment link");
    }
};

export const checkPaymentStatus = async (orderCode) => {
    try {
        if (!orderCode) {
            throw new Error("Missing orderCode");
        }

        const paymentStatus = await payOS.getPaymentLinkInformation(orderCode);

        if (!paymentStatus) {
            throw new Error("Payment not found");
        }

        return { status: paymentStatus.status };
    } catch (error) {
        console.error("Error checking payment status:", error);
        throw new Error(error.message || "Server error");
    }
};
