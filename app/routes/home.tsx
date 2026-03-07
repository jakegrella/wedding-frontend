import { useState } from "react";
import { Form, redirect, useActionData } from "react-router";
import { Button } from "~/components/ui/button";
import { login, me } from "~/utils/auth";
import type { Route } from "./+types/home";
import { Input } from "~/components/ui/input";
import { Field, FieldError, FieldLabel } from "~/components/ui/field";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "~/components/ui/input-otp";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "JLO - Lauren & Jake's Wedding" },
    { name: "description", content: "You're invited to our wedding!" },
  ];
}

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  try {
    const { user } = await me(request, false);
    if (user) return redirect(`/save-the-date`);
  } catch (error: any) {
    console.error("Error checking authentication");
  }
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  try {
    const formData = await request.formData();

    const code = formData.get("code");
    if (!code) throw new Error("Code is required");
    await login(String(code));

    return redirect(`/save-the-date`);
  } catch (error: any) {
    return { error: error.message };
  }
}

export default function Home() {
  const actionData = useActionData<{ error?: string }>();

  return (
    <main className="flex flex-col gap-20 items-center justify-center h-full">
      <Form method="post" className="flex flex-col items-center gap-4">
        <Field orientation="horizontal">
          <FieldLabel htmlFor="code" className="sr-only">
            Code
          </FieldLabel>
          <Input
            id="code"
            name="code"
            type="text"
            placeholder="Enter your code"
            autoComplete="off"
            required
          />
          <Button type="submit">Enter</Button>
        </Field>
        {actionData?.error && <FieldError>{actionData.error}</FieldError>}
      </Form>
    </main>
  );
}
