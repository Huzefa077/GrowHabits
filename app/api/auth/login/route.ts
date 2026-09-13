import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { z } from "zod";
import { connectDatabase } from "@/lib/database";
import { User } from "@/database/entities/User";

/*
==========================================================
LOGIN API

POST /api/auth/login

Flow:

1. Receive email + password
2. Validate input with Zod
3. Find the user in PostgreSQL
4. Compare password with bcrypt
5. Create a JWT
6. Store JWT in an HTTP-only cookie
7. Return safe user information

The password and JWT are never returned to the browser
as normal JSON data.
==========================================================
*/

// --------------------------------------------------------
// 1. Login validation schema
// --------------------------------------------------------

const loginSchema = z.object({
    email: z
        .string()
        .trim()
        .email("Please enter a valid email address"),

    password: z
        .string()
        .min(1, "Password is required"),
});


// --------------------------------------------------------
// 2. Handle POST /api/auth/login
// --------------------------------------------------------

export async function POST(request: Request) {
    try {
        // Read JSON sent by the login page.
        const body = await request.json();

        // Validate the request.
        const result = loginSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                {
                    success: false,
                    message: result.error.issues[0].message,
                },
                {
                    status: 400,
                }
            );
        }

        const {
            email,
            password,
        } = result.data;


        // ------------------------------------------------
        // 3. Connect to PostgreSQL
        // ------------------------------------------------

        const database =
            await connectDatabase();


        // ------------------------------------------------
        // 4. Get User repository
        // ------------------------------------------------

        const userRepository =
            database.getRepository(User);


        // ------------------------------------------------
        // 5. Find user by email
        // ------------------------------------------------

        const user =
            await userRepository.findOne({
                where: { email },
            });

        /*
        We deliberately use the same helpful message for:
        - email not found
        - incorrect password

        This prevents someone from testing email addresses
        to discover which people have accounts here.
        */
        // Google-only accounts have no password and cannot use password login.
        if (!user || !user.password) {
            return NextResponse.json(
                {
                    success: false,
                    message: "We couldn’t sign you in with those details. Check your email and password, or create an account.",
                },
                {
                    status: 401,
                }
            );
        }


        // ------------------------------------------------
        // 6. Compare password with stored bcrypt hash
        // ------------------------------------------------

        const passwordMatches =
            await bcrypt.compare(
                password,
                user.password
            );

        if (!passwordMatches) {
            return NextResponse.json(
                {
                    success: false,
                    message: "We couldn’t sign you in with those details. Check your email and password, or create an account.",
                },
                {
                    status: 401,
                }
            );
        }

        // New password accounts must prove they control their email before receiving a session.
        if (!user.emailVerifiedAt && user.emailVerificationTokenHash) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Complete your sign-up by verifying your email address before signing in. Check your inbox for the verification link.",
                    needsEmailVerification: true,
                },
                { status: 403 }
            );
        }


        // ------------------------------------------------
        // 7. Create JWT
        // ------------------------------------------------

        /*
        JWT_SECRET must be stored in .env.

        Example:

        JWT_SECRET=some-long-random-secret

        Never hard-code the secret in source code.
        */
        const jwtSecret =
            process.env.JWT_SECRET;

        if (!jwtSecret) {
            console.error(
                "JWT_SECRET is not configured."
            );

            return NextResponse.json(
                {
                    success: false,
                    message: "Authentication is not configured.",
                },
                {
                    status: 500,
                }
            );
        }

        /*
        The token contains only the user's ID.

        We do not put:
        - password
        - password hash
        - unnecessary personal data

        inside the JWT.
        */
        const token =
            jwt.sign(
                {
                    userId: user.id,
                },
                jwtSecret,
                {
                    expiresIn: "7d",
                }
            );


        // ------------------------------------------------
        // 8. Create response
        // ------------------------------------------------

        const response =
            NextResponse.json(
                {
                    success: true,
                    message: "Login successful.",
                    user: {
                        id: user.id,
                        fullName: user.fullName,
                        email: user.email,
                    },
                },
                {
                    status: 200,
                }
            );


        // ------------------------------------------------
        // 9. Store JWT in an HTTP-only cookie
        // ------------------------------------------------

        /*
        httpOnly:
            JavaScript running in the browser cannot read
            the cookie.

        secure:
            Cookie is sent only over HTTPS in production.

        sameSite:
            Helps protect against CSRF.

        maxAge:
            Cookie expires after 7 days.
        */
        response.cookies.set(
            "auth_token",
            token,
            {
                httpOnly: true,
                secure:
                    process.env.NODE_ENV ===
                    "production",
                sameSite: "lax",
                path: "/",
                maxAge: 60 * 60 * 24 * 7,
            }
        );


        return response;

    } catch (error) {

        /*
        Log the real error on the server,
        but don't expose internal details to the client.
        */

        console.error(
            "Login error:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message: "Something went wrong while logging in.",
            },
            {
                status: 500,
            }
        );
    }
}
