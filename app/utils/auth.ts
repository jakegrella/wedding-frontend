import { PayloadSDK } from "@payloadcms/sdk";
import { redirect } from "react-router";
import getPayloadTokenCookie from "./getPayloadTokenCookie";

export async function login(code: string) {
    const payload = new PayloadSDK({ baseURL: import.meta.env.VITE_BACKEND_URL || '' });
    const loginRes = await payload.login(
        {
            // @ts-ignore: PayloadSDK types missing for loginWithUsername
            data: { username: code, password: code },
            collection: "guest-groups",
        },
        {
            credentials: "include",
        },
    );
    return loginRes;
}

export default async function logout() {
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/guest-groups/logout?allSessions=true`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' } }
    );

    if (!res.ok) {
        // throw new Error('Logout failed');
    }
}

export async function me(request: Request, redirectOnFail = true): Promise<any | undefined> {
    const payload = new PayloadSDK({ baseURL: import.meta.env.VITE_BACKEND_URL || '' });
    const token = getPayloadTokenCookie(request);

    try {
        const res = await payload.me(
            { collection: "guest-groups" },
            {
                headers: {
                    Authorization: `JWT ${token}`,
                },
            },
        );

        if (res.user === null && redirectOnFail) {
            throw redirect("/");
        }

        return res
    } catch (error: any) {
        // If it's a redirect (Response), re-throw it to let React Router handle it
        if (error instanceof Response) throw error;

        if (redirectOnFail) throw redirect("/404");
    }
}
