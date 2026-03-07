import { PayloadSDK } from "@payloadcms/sdk";
import getPayloadTokenCookie from "./getPayloadTokenCookie";

export async function getGroupInfo(request: Request, id: number) {
    const payload = new PayloadSDK({ baseURL: import.meta.env.VITE_BACKEND_URL || '' });
    const token = getPayloadTokenCookie(request);

    try {
        const guestGroup = await payload.find(
            {
                collection: "guest-groups",
                where: {
                    id: {
                        equals: id
                    }
                },
            }, {
            headers: {
                Authorization: `JWT ${token}`,
            },
        },
        );

        const group = { ...guestGroup.docs[0], guests: guestGroup.docs[0].guests.docs || [] };
        if (!group) throw new Error('Group not found');

        return group;
    } catch (error: any) {
        throw new Error(`Error fetching guest group info: ${error.message}`);
    }
}
