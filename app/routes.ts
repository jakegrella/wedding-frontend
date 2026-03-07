import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("save-the-date", "routes/saveTheDate.tsx"),
    route("rsvp", "routes/rsvp.tsx"),
] satisfies RouteConfig;
