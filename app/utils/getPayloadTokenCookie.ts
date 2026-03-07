export default function getPayloadTokenCookie(request: Request): string | null {
    const cookieHeader = request.headers.get("cookie") || request.headers.get("Cookie");
    if (!cookieHeader) return null;

    // Payload may use a secure-prefixed auth cookie in production.
    const cookieNames = ["payload-token", "__Secure-payload-token"];
    const cookies = cookieHeader.split(";");

    for (const rawCookie of cookies) {
        const cookie = rawCookie.trim();
        for (const name of cookieNames) {
            const prefix = `${name}=`;
            if (cookie.startsWith(prefix)) {
                return cookie.slice(prefix.length);
            }
        }
    }

    return null;
}