import { useState } from "react";
import { Form, useLoaderData } from "react-router";
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

export async function loader({ request }: Route.LoaderArgs) {
  const { user } = await me(request);
  const guestGroup = await getGroupInfo(request, user.id);
  return { guestGroup };
}

export async function action({ request }: Route.ActionArgs) {
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
      await updateGuestInfo(request, key, value);
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error in action:", error.message);
    return { error: "An unexpected error occurred. Please try again." };
  }
}

export default function Rsvp() {
  const { guestGroup } = useLoaderData<LoaderData>();

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
        "The closest airport to Santa Barbara is the Santa Barbara Airport (SBA), which has direct flights from several major cities, including Chicago (ORD). Alternatively, you can fly into . The airport with the most nonstop flight options into Southern California is Los Angeles International Airport (LAX), and is about a 2 hour drive north up the coast to Santa Barbara.",
    },
    {
      value: "accommodation",
      trigger: "Where should I stay?",
      content:
        "We are not booking any specific accommodations. If you have any trouble booking or need assistance, please let us know!",
    },
    {
      value: "ceremony",
      trigger: "Where is the ceremony?",
      content:
        "The ceremony and reception will be held at the Palm Park Beach House, which is located just outside downtown Santa Barbara along the waterfront. The address is 236 E Cabrillo Blvd, Santa Barbara, CA 93101.",
    },
    {
      value: "attire",
      trigger: "What should I wear?",
      content: "The dress code for the wedding is beachy and semi-formal. ",
    },
  ];

  return (
    <main className="pt-20 flex flex-col gap-12 p-5 max-w-3xl my-0 mx-auto">
      <div>
        <p>RSVP for</p>
        <h1 className="text-primary text-3xl font-serif">{guestGroup.name}</h1>
        <p className="text-xs">Please RSVP by June 1, 2026</p>
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
        <Button type="submit">Update RSVP</Button>
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
