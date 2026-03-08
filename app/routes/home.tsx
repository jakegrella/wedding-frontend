import { Form, redirect, useActionData, useNavigation } from "react-router";
import { Button } from "~/components/ui/button";
import { login, me } from "~/utils/auth";
import type { Route } from "./+types/home";
import { Input } from "~/components/ui/input";
import { Field, FieldError, FieldLabel } from "~/components/ui/field";
import { toast } from "sonner";

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
    toast.success("Successfully logged in");

    return redirect(`/save-the-date`);
  } catch (error: any) {
    toast.error("An error occurred.");
    return { error: error.message };
  }
}

export default function Home() {
  const actionData = useActionData<{ error?: string }>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <main className="flex flex-col gap-20 items-center justify-center h-full">
      <Form
        method="post"
        className="flex flex-col sm:flex-row items-center gap-4"
      >
        <Field>
          <FieldLabel htmlFor="code" className="sr-only">
            Code
          </FieldLabel>
          <Input
            id="code"
            name="code"
            type="text"
            placeholder="Enter your code"
            autoComplete="off"
            disabled={isSubmitting}
            required
          />
        </Field>
        <Button type="submit" loading={isSubmitting}>
          Enter
        </Button>
        {actionData?.error && <FieldError>{actionData.error}</FieldError>}
      </Form>
    </main>
  );
}
