
import { appendFile, mkdir } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentDirectory = path.dirname(
    fileURLToPath(import.meta.url)
);

const dataDirectory = path.join(currentDirectory, "../data");

const enquiryFile = path.join(
    dataDirectory,
    "enquiries.jsonl"
);

export async function submitEnquiry(req, res, next) {

    try {

        const {
            name,
            email,
            phone,
            projectType,
            location,
            eventDate,
            budget,
            details,
            consent
        } = req.body;

        if (
            typeof name !== "string" ||
            !name.trim() ||
            typeof projectType !== "string" ||
            !projectType.trim() ||
            typeof details !== "string" ||
            !details.trim()
        ) {
            return res.status(400).json({
                success: false,
                error: "Name, project type and details are required."
            });
        }

        if (
            name.length > 100 ||
            projectType.length > 100 ||
            details.length > 3000
        ) {
            return res.status(400).json({
                success: false,
                error: "One or more fields exceed the allowed length."
            });
        }

        const cleanEmail =
            typeof email === "string" ? email.trim() : "";

        const cleanPhone =
            typeof phone === "string" ? phone.trim() : "";

        if (!cleanEmail && !cleanPhone) {
            return res.status(400).json({
                success: false,
                error: "Provide an email address or phone number."
            });
        }

        if (
            cleanEmail &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)
        ) {
            return res.status(400).json({
                success: false,
                error: "Invalid email address."
            });
        }

        if (cleanPhone && !/^[+0-9()\s-]{7,20}$/.test(cleanPhone)) {
            return res.status(400).json({
                success: false,
                error: "Invalid phone number."
            });
        }

        if (consent !== true) {
            return res.status(400).json({
                success: false,
                error: "Customer consent is required."
            });
        }

        const enquiry = {
            id: randomUUID(),

            name: name.trim(),
            email: cleanEmail || null,
            phone: cleanPhone || null,

            projectType: projectType.trim(),

            location: typeof location === "string"
                ? location.trim().slice(0, 200)
                : null,

            eventDate: typeof eventDate === "string"
                ? eventDate.trim().slice(0, 100)
                : null,

            budget: typeof budget === "string"
                ? budget.trim().slice(0, 100)
                : null,

            details: details.trim(),

            createdAt: new Date().toISOString(),

            status: "pending"
        };

        await mkdir(dataDirectory, { recursive: true });

        await appendFile(
            enquiryFile,
            JSON.stringify(enquiry) + "\n",
            "utf8"
        );

        res.status(201).json({
            success: true,
            message: "Your enquiry has been recorded.",
            enquiryId: enquiry.id
        });

    } catch (error) {
        next(error);
    }
}
