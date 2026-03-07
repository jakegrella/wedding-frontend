import { useLoaderData, useNavigate } from "react-router";
import { Button } from "~/components/ui/button";
import { me } from "~/utils/auth";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "JLO - Save The Date" },
    { name: "description", content: "Save The Date for our wedding!" },
  ];
}

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  const { user } = await me(request);
  return { groupName: user.name };
}

export default function SaveTheDate() {
  const { groupName } = useLoaderData<typeof clientLoader>();
  const navigate = useNavigate();

  return (
    <main className="pt-20 flex flex-col gap-12 p-5 max-w-3xl my-0 mx-auto">
      <div>
        <p>Dear</p>
        <h2 className="text-primary text-3xl font-serif">{groupName}</h2>
      </div>
      <div>
        <p>Please save our wedding date:</p>
        <p className="text-primary">Thursday, July 2, 2026</p>
        <p className="text-primary">Santa Barbara, CA</p>
      </div>
      <i className="max-w-prose">
        We know traveling for a wedding is a big commitment. Please celebrate
        with us only if it makes sense for you. We understand this is a
        destination and short notice, and while your presence is a gift, so is
        your well-being and peace of mind. Please don't stretch yourself to
        attend. Your love and support mean the world to us either way.
      </i>
      <p className="max-w-prose">
        More information regarding travel, accommodations, and the weekend
        timeline can be found on the RSVP page.
      </p>
      <div>
        <Button
          onClick={() => {
            navigate(`/rsvp`);
          }}
        >
          RSVP
        </Button>
        <p className="text-xs pt-2">Please RSVP by June 1, 2026</p>
      </div>
    </main>
  );
}
