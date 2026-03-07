export default function getPayloadTokenCookie(request: Request): string | null {
    const token = request.headers
        .get("Cookie")
        ?.split("; ")
        .find((cookie) => cookie.startsWith("payload-token="))
        ?.split("=")[1] || null;
    return token;
}