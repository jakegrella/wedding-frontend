import { useState } from "react";
import { Form, useLoaderData, useNavigation } from "react-router";
import Checkbox from "~/components/Checkbox";
import SpotifyLink from "~/components/SpotifyLink";
import { Button } from "~/components/ui/button";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
  FieldSet,
} from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { me } from "~/utils/auth";
import { getGroupInfo } from "~/utils/getGroupInfo";
import { updateGuestInfo } from "~/utils/updateGuestInfo";
import type { Route } from "./+types/home";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { toast } from "sonner";

type Guest = {
  id: string;
  name: string;
  rsvpStatus: string;
  dietaryRestrictions?: string;
  comment?: string;
};

type GuestGroup = {
  id: string | number;
  name: string;
  guests: Guest[];
};

type LoaderData = {
  guestGroup: GuestGroup;
};

export function meta({}: Route.MetaArgs) {
  return [
    { title: "JLO - RSVP" },
    { name: "description", content: "RSVP for the wedding!" },
  ];
}

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  const { user } = await me(request);
  const guestGroup = await getGroupInfo(request, user.id);
  return { guestGroup };
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  try {
    const formData = await request.formData();
    // separate form data into groups based on guest id
    const groupData = new Map();
    for (const [name, value] of formData) {
      const [guestId, fieldName] = name.split("-"); // name is in the format "guestId-fieldName"

      // if item exists, add onto it, otherwise create it
      if (groupData.has(guestId)) {
        const existingData = groupData.get(guestId);
        groupData.set(guestId, { ...existingData, [fieldName]: value });
      } else {
        groupData.set(guestId, { id: guestId, [fieldName]: value });
      }
    }

    // submit data for each guest to payload
    for (const [key, value] of groupData) {
      await updateGuestInfo(key, value);
    }

    toast.success("RSVP updated successfully.");
    return { success: true };
  } catch (error: any) {
    console.error("Error in action:", error.message);
    toast.error("An unexpected error occurred. Please try again.");
    return { error: "An unexpected error occurred. Please try again." };
  }
}

export default function Rsvp() {
  const { guestGroup } = useLoaderData<LoaderData>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  type GuestFormState = {
    id: string;
    name: string;
    rsvpStatus: string;
    dietaryRestrictions: string;
    comment: string;
  };

  const [formState, setFormState] = useState<GuestFormState[]>(
    guestGroup.guests.map((guest: any) => ({
      id: guest.id,
      name: guest.name,
      rsvpStatus: guest.rsvpStatus,
      dietaryRestrictions: guest.dietaryRestrictions || "",
      comment: guest.comment || "",
    })),
  );

  function updateGuestAttendanceState(
    guestId: string,
    rsvpStatus: string,
    currentlyChecked: boolean,
  ) {
    const updatedGuests = formState.map((g) =>
      g.id === guestId
        ? { ...g, rsvpStatus: currentlyChecked ? rsvpStatus : "pending" }
        : g,
    );
    setFormState(updatedGuests);
  }

  const accordionItems = [
    {
      value: "destination",
      trigger: "Where is Santa Barbara?",
      content:
        "Santa Barbara is a coastal city in California, located about 100 miles north of Los Angeles.",
    },
    {
      value: "travel",
      trigger: "How do I get there?",
      content:
        "The closest airport to Santa Barbara is the Santa Barbara Airport (SBA), which has direct flights from several major cities, including Chicago (ORD). Alternatively, you can fly into LAX, LGB, or BUR. The airport with the most nonstop flight options into Southern California is Los Angeles International Airport (LAX), and is about a 2 hour scenic drive north up the coast to Santa Barbara.",
    },
    {
      value: "accommodation",
      trigger: "Where should I stay?",
      content:
        "We are not booking any specific group accommodations. We have not booked our own stay yet, but will update here when we do. Staying near State Street will give you the best access to local attractions and dining options. There are also many great Airbnbs in the area. If you have any trouble booking or need assistance, please let us know.",
    },
    {
      value: "ceremony",
      trigger: "Where is the ceremony?",
      content:
        "The ceremony and reception will be held at the Palm Park Beach House, which is located just outside downtown Santa Barbara along the waterfront. The address is 236 E Cabrillo Blvd, Santa Barbara, CA 93101. There is street parking in front of the venue and a public parking lot next door.",
    },
    {
      value: "attire",
      trigger: "What should I wear?",
      content:
        "The dress code for the wedding is beachy, colorful, and semi-formal. Feel free to express your style and have fun with it! We recommend bringing a light jacket or sweater for the evening, as it can get cool by the water.",
    },
    {
      value: "itinerary",
      trigger: "What does the rest of the weekend look like?",
      content:
        "We are still working on complete details, but we will be in Santa Barbara from Wednesday until Sunday. Our current plan is to have welcome drinks on Wednesday night at a local bar, meet for brunch on Friday, and have a hike and a beach outing in there as well. There will be evening fireworks on Saturday for the 4th of July. You are welcome to join us for any, all, or none of the events. Other fun things to do in Santa Barbara include strolling along State Street, taking a scenic drive in the mountains, or visiting the Santa Barbara Zoo, Stearns Wharf, Santa Barbara Botanic Garden, or Santa Barbara Mission. We will be sharing more itinerary details as we get closer to the date.",
    },
  ];

  return (
    <main className="pt-20 flex flex-col gap-12 p-5 max-w-3xl my-0 mx-auto">
      <div>
        <p>RSVP for</p>
        <h1 className="text-primary text-3xl font-serif">{guestGroup.name}</h1>
        <p className="text-xs">Please RSVP by May 15, 2026</p>
      </div>

      <Form method="post" className="w-full">
        <FieldGroup>
          {formState.map((guest, index) => {
            return (
              <FieldSet key={guest.id}>
                <h2 className="font-serif text-primary text-xl">
                  <b>{guest.name}</b>
                </h2>
                <Field>
                  <FieldLabel htmlFor={`${guest.id}-rsvpStatus`}>
                    Will you be in attendance?
                  </FieldLabel>
                  <div className="flex gap-2 pt-1">
                    <Checkbox
                      id={`${guest.id}-rsvpStatus`}
                      name={`${guest.id}-rsvpStatus`}
                      value="accepted"
                      checked={guest.rsvpStatus === "accepted"}
                      disabled={isSubmitting}
                      onChange={(e) => {
                        updateGuestAttendanceState(
                          guest.id,
                          e.target.value,
                          e.target.checked,
                        );
                      }}
                    >
                      Yes
                    </Checkbox>
                    <Checkbox
                      id={`${guest.id}-rsvpStatus`}
                      name={`${guest.id}-rsvpStatus`}
                      value="declined"
                      checked={guest.rsvpStatus === "declined"}
                      disabled={isSubmitting}
                      onChange={(e) => {
                        updateGuestAttendanceState(
                          guest.id,
                          e.target.value,
                          e.target.checked,
                        );
                      }}
                    >
                      No
                    </Checkbox>
                  </div>
                </Field>
                {guest.rsvpStatus === "accepted" && (
                  <div className="flex flex-col gap-4">
                    <Field>
                      <FieldLabel htmlFor={`${guest.id}-dietaryRestrictions`}>
                        Dietary Restrictions
                      </FieldLabel>
                      <Input
                        type="text"
                        placeholder="Dietary restrictions..."
                        id={`${guest.id}-dietaryRestrictions`}
                        name={`${guest.id}-dietaryRestrictions`}
                        value={guest.dietaryRestrictions}
                        disabled={isSubmitting}
                        onChange={(e) => {
                          const updatedGuests = formState.map((g) =>
                            g.id === guest.id
                              ? { ...g, dietaryRestrictions: e.target.value }
                              : g,
                          );
                          setFormState(updatedGuests);
                        }}
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor={`${guest.id}-comment`}>
                        Comment
                      </FieldLabel>
                      <Textarea
                        id={`${guest.id}-comment`}
                        name={`${guest.id}-comment`}
                        value={guest.comment}
                        placeholder="Leave a comment for us..."
                        disabled={isSubmitting}
                        onChange={(e) => {
                          const updatedGuests = formState.map((g) =>
                            g.id === guest.id
                              ? { ...g, comment: e.target.value }
                              : g,
                          );
                          setFormState(updatedGuests);
                        }}
                      />
                    </Field>
                  </div>
                )}
                {index !== formState.length - 1 && <FieldSeparator />}
                {index === formState.length - 1 && <br />}
              </FieldSet>
            );
          })}
        </FieldGroup>
        <Button type="submit" loading={isSubmitting}>
          Update RSVP
        </Button>
      </Form>
      <div>
        <h2 className="text-xl">FAQ</h2>
        <Accordion
          type="multiple"
          defaultValue={["destination"]}
          className="w-full"
        >
          {accordionItems.map((item) => (
            <AccordionItem key={item.value} value={item.value}>
              <AccordionTrigger>{item.trigger}</AccordionTrigger>
              <AccordionContent>{item.content}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
      {/* <SpotifyLink /> */}
    </main>
  );
}
