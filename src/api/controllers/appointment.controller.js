import express from "express";
import crypto from "crypto";
import qs from "qs";
import dateFormat from "dateformat";

const router = express.Router();

// Load config values from environment variables
const tmnCode = process.env.VNP_TMN_CODE;
const secretKey = process.env.VNP_HASH_SECRET;
const vnpUrl = process.env.VNP_URL;
const returnUrl = process.env.VNP_RETURN_URL;

export const createPaymentURL = async (req, res) => {
    const { appointmentId, amount } = req.body;
    const date = new Date();
    const createDate = dateFormat(date, "yyyymmddHHMMss");
    const orderId = dateFormat(date, "ddHHMMss");
    const ipAddr = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

    let vnp_Params = {
        vnp_Version: "2.1.0",
        vnp_Command: "pay",
        vnp_TmnCode: tmnCode,
        vnp_Locale: "vn",
        vnp_CurrCode: "VND",
        vnp_TxnRef: orderId,
        vnp_OrderInfo: `Thanh toan cho cuoc hen: ${appointmentId}`,
        vnp_OrderType: "other",
        vnp_Amount: amount * 100,
        vnp_ReturnUrl: returnUrl,
        vnp_IpAddr: ipAddr,
        vnp_CreateDate: createDate,
    };

    // Step 1: Sort parameters alphabetically
    vnp_Params = sortObject(vnp_Params);

    // Step 2: Generate signData (DO NOT ENCODE)
    const signData = qs.stringify(vnp_Params, { encode: false });

    // Step 3: Hash the signData with your secret key using HMAC SHA512
    const hmac = crypto.createHmac("sha512", secretKey);
    const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

    // Step 4: Attach the secure hash to vnp_Params
    vnp_Params.vnp_SecureHash = signed;

    // Step 5: Construct payment URL
    const paymentUrl = `${vnpUrl}?${qs.stringify(vnp_Params, { encode: false })}`;

    res.json({ paymentUrl });
};

export const VNPayIPN = async (req, res) => {
    let vnp_Params = req.query;
    const secureHash = vnp_Params["vnp_SecureHash"];
    delete vnp_Params["vnp_SecureHash"];
    delete vnp_Params["vnp_SecureHashType"];

    vnp_Params = sortObject(vnp_Params);
    const signData = qs.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac("sha512", secretKey);
    const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

    if (secureHash === signed) {
        const orderId = vnp_Params["vnp_TxnRef"];
        const rspCode = vnp_Params["vnp_ResponseCode"];
        if (rspCode === "00") {
            // Update appointment status in the database
            // await updateOrderStatus(orderId, "confirmed");
            res.status(200).json({ RspCode: "00", Message: "Success" });
        } else {
            res.status(200).json({ RspCode: "02", Message: "Transaction failed" });
        }
    } else {
        res.status(400).json({ RspCode: "97", Message: "Checksum failed" });
    }
};

export const VNPayReturn = (req, res) => {
    const vnp_Params = req.query;
    res.redirect(`/transaction-complete?code=${vnp_Params["vnp_ResponseCode"]}`);
};

const sortObject = (obj) => {
    let sorted = {};
    let str = [];
    let key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            str.push(encodeURIComponent(key));
        }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
};

export default { createPaymentURL, VNPayIPN, VNPayReturn };
