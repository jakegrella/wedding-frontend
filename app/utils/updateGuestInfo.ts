import { PayloadSDK } from "@payloadcms/sdk";
import getPayloadTokenCookie from "./getPayloadTokenCookie";

export async function updateGuestInfo(request: Request, id: string, data: any) {
    const payload = new PayloadSDK({ baseURL: import.meta.env.VITE_BACKEND_URL || '' });
    const token = getPayloadTokenCookie(request);
    const cookieHeader = request.headers.get("cookie") || request.headers.get("Cookie");

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
