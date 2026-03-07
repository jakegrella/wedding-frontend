import { PayloadSDK } from "@payloadcms/sdk";
import getPayloadTokenCookie from "./getPayloadTokenCookie";

export async function updateGuestInfo(id: string, data: any, request?: Request) {
    const payload = new PayloadSDK({ baseURL: import.meta.env.VITE_BACKEND_URL || '' });

    const token = request ? getPayloadTokenCookie(request) : null;
    const cookieHeader = request
        ? request.headers.get("cookie") || request.headers.get("Cookie")
        : null;

    try {
        const headers: Record<string, string> = {};

        if (cookieHeader) {
            headers.cookie = cookieHeader;
        }

        if (token) {
            headers.Authorization = `JWT ${token}`;
        }

        await payload.update({
            collection: 'guests',
            id,
            data
        }, {
            credentials: "include",
            headers,
        });
    } catch (error: any) {
        throw new Error(`Error updating guest info: ${error.message}`);
    }
}
