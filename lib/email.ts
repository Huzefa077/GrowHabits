import "server-only";
import nodemailer from "nodemailer";

// Sends a password-reset link through the dedicated Gmail account stored in environment variables.
export async function sendPasswordResetEmail({
    recipient,
    resetUrl,
}: {
    recipient: string;
    resetUrl: string;
}) {
    const gmailUser = process.env.GMAIL_USER;
    const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;

    if (!gmailUser || !gmailAppPassword) {
        throw new Error("Gmail password-reset variables are not configured.");
    }

    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: gmailUser,
            pass: gmailAppPassword,
        },
    });

    await transporter.sendMail({
        from: `GrowHabits <${gmailUser}>`,
        to: recipient,
        subject: "Reset your GrowHabits password",
        text: `We received a request to reset your GrowHabits password. Open this link within 15 minutes: ${resetUrl}\n\nIf you did not request this, you can safely ignore this email.`,
        html: `<p>We received a request to reset your GrowHabits password.</p><p><a href="${resetUrl}">Reset your password</a></p><p>This link expires in 15 minutes. If you did not request it, you can safely ignore this email.</p>`,
    });
}

// Sends the link that proves a new password-account owner can access their email address.
export async function sendEmailVerificationEmail({
    recipient,
    verificationUrl,
}: {
    recipient: string;
    verificationUrl: string;
}) {
    const gmailUser = process.env.GMAIL_USER;
    const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;

    if (!gmailUser || !gmailAppPassword) {
        throw new Error("Gmail email-verification variables are not configured.");
    }

    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: gmailUser,
            pass: gmailAppPassword,
        },
    });

    await transporter.sendMail({
        from: `GrowHabits <${gmailUser}>`,
        to: recipient,
        subject: "Verify your GrowHabits email",
        text: `Welcome to GrowHabits. Verify your email within 24 hours: ${verificationUrl}`,
        html: `<p>Welcome to GrowHabits.</p><p><a href="${verificationUrl}">Verify your email address</a></p><p>This link expires in 24 hours.</p>`,
    });
}
