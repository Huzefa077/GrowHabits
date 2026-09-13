import "server-only";
import nodemailer from "nodemailer";

function escapeHtml(value: string) {
    return value.replace(/[&<>"']/g, (character) => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    })[character]!);
}

// Resolve settings only when sending; builds do not need SMTP credentials.
function getEmailService() {
    const project = process.env.PROJECT_NAME?.trim() || "GrowHabits";
    const owner = process.env.PROJECT_OWNER_NAME?.trim() || "Huzaifa Sheikh";
    const portfolio = new URL(process.env.PROJECT_PORTFOLIO_URL?.trim() || "https://huzaifasheikh.dev");
    if (!["https:", "http:"].includes(portfolio.protocol)) {
        throw new Error("PROJECT_PORTFOLIO_URL must use HTTP or HTTPS.");
    }

    // Keep existing deployments working until they migrate to SMTP variables.
    // Never combine a new SMTP user with the legacy account's password.
    const usesSmtpCredentials = process.env.SMTP_USER !== undefined || process.env.SMTP_PASS !== undefined;
    const user = usesSmtpCredentials ? process.env.SMTP_USER?.trim() : process.env.GMAIL_USER?.trim();
    const pass = usesSmtpCredentials ? process.env.SMTP_PASS : process.env.GMAIL_APP_PASSWORD;
    if (!user || !pass) {
        throw new Error("Email sender credentials are not configured.");
    }

    const port = Number(process.env.SMTP_PORT || "465");
    const secure = process.env.SMTP_SECURE || "true";
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
        throw new Error("SMTP_PORT must be a valid port number.");
    }
    if (secure !== "true" && secure !== "false") {
        throw new Error("SMTP_SECURE must be true or false.");
    }

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST?.trim() || "smtp.gmail.com",
        port,
        secure: secure === "true",
        requireTLS: secure === "false",
        auth: { user, pass },
    });
    const attribution = `${project} is a portfolio project by ${owner}.`;
    return {
        transporter,
        project,
        from: process.env.EMAIL_FROM?.trim() || { name: `${project} — ${owner}`, address: user },
        textFooter: `\n\n${attribution}\nPortfolio: ${portfolio.href}`,
        htmlFooter: `<hr><p>${escapeHtml(attribution)}<br>Portfolio: <a href="${escapeHtml(portfolio.href)}">${escapeHtml(portfolio.href)}</a></p>`,
    };
}

export async function sendPasswordResetEmail({
    recipient,
    resetUrl,
}: {
    recipient: string;
    resetUrl: string;
}) {
    const email = getEmailService();
    await email.transporter.sendMail({
        from: email.from,
        to: recipient,
        subject: `Reset your ${email.project} password`,
        text: `We received a request to reset your ${email.project} password. Open this link within 15 minutes: ${resetUrl}\n\nIf you did not request this, you can safely ignore this email.${email.textFooter}`,
        html: `<p>We received a request to reset your ${escapeHtml(email.project)} password.</p><p><a href="${escapeHtml(resetUrl)}">Reset your password</a></p><p>This link expires in 15 minutes. If you did not request it, you can safely ignore this email.</p>${email.htmlFooter}`,
    });
}

export async function sendEmailVerificationEmail({
    recipient,
    verificationUrl,
}: {
    recipient: string;
    verificationUrl: string;
}) {
    const email = getEmailService();
    await email.transporter.sendMail({
        from: email.from,
        to: recipient,
        subject: `Verify your ${email.project} email`,
        text: `Welcome to ${email.project}. Verify your email within 24 hours: ${verificationUrl}${email.textFooter}`,
        html: `<p>Welcome to ${escapeHtml(email.project)}.</p><p><a href="${escapeHtml(verificationUrl)}">Verify your email address</a></p><p>This link expires in 24 hours.</p>${email.htmlFooter}`,
    });
}
