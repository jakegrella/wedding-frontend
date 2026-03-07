import { PayloadSDK } from "@payloadcms/sdk";
import getPayloadTokenCookie from "./getPayloadTokenCookie";

export async function updateGuestInfo(request: Request, id: string, data: any) {
    const payload = new PayloadSDK({ baseURL: import.meta.env.VITE_BACKEND_URL || '' });
    const token = getPayloadTokenCookie(request);

    try {
        await payload.update({
            collection: 'guests',
            id,
            data
        }, {
            headers: {
                Authorization: `JWT ${token}`,
            },
        });
    } catch (error: any) {
        throw new Error(`Error updating guest info: ${error.message}`);
    }
}
