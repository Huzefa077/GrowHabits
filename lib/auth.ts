import { cache } from "react";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

import { connectDatabase } from "@/lib/database";
import { User } from "@/database/entities/User";

/*
==========================================================
AUTHENTICATION HELPER

This file contains the reusable server-side logic for
finding the currently logged-in user.

Flow:

Browser
   ↓
auth_token cookie
   ↓
verify JWT
   ↓
extract userId
   ↓
find User in PostgreSQL
   ↓
return User

Other server-side pages/API routes can call:

const user = await getCurrentUser();

instead of repeating this logic.
==========================================================
*/

async function findCurrentUser() {
    /*
    Read the HTTP-only authentication cookie.

    Because the cookie is HTTP-only, browser JavaScript
    cannot directly access it.
    */
    const cookieStore = await cookies();

    const token =
        cookieStore.get("auth_token")?.value;

    // No cookie means the user is not authenticated.
    if (!token) {
        return null;
    }

    // JWT_SECRET must exist in the environment.
    const jwtSecret =
        process.env.JWT_SECRET;

    if (!jwtSecret) {
        throw new Error(
            "JWT_SECRET is not configured."
        );
    }

    try {
        /*
        Verify the JWT.

        If the token is:
        - expired
        - modified
        - signed with the wrong secret

        jwt.verify() will throw an error.
        */
        const decoded =
            jwt.verify(
                token,
                jwtSecret
            ) as {
                userId: number;
                iat?: number;
            };

        // Connect to PostgreSQL.
        const database =
            await connectDatabase();

        // Get the User repository.
        const userRepository =
            database.getRepository(User);

        /*
        Find the user represented by the token.

        We query the database instead of trusting all
        information stored inside the JWT.
        */
        const user =
            await userRepository.findOne({
                where: {
                    id: decoded.userId,
                },
            });

        /*
        A reset signs the user out everywhere.

        JWT's iat value is measured in seconds, so we compare
        it with the password-change time stored in PostgreSQL.
        */
        if (
            user?.passwordChangedAt &&
            (!decoded.iat ||
                decoded.iat * 1000 <
                user.passwordChangedAt.getTime())
        ) {
            return null;
        }

        return user ?? null;

    } catch (error) {

        /*
        An invalid/expired JWT means the user is not
        authenticated.

        We return null instead of exposing JWT errors
        to the page.
        */
        console.error(
            "Authentication check failed:",
            error
        );

        return null;
    }
}

/*
The root layout and the navbar both need the current user on every page.
React's cache() runs the cookie + database check once per request and
reuses the answer, instead of querying PostgreSQL twice.
*/
export const getCurrentUser = cache(findCurrentUser);
