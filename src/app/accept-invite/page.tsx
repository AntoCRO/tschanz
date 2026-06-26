import { redirect } from "next/navigation";
import { getAuth } from "@/lib/auth";
import { getLocale, getServerT } from "@/lib/locale";
import { Card } from "@/components/ui";
import { AcceptInviteForm } from "@/components/AcceptInviteForm";
import { LanguageProvider } from "@/components/LanguageProvider";
import { LanguageToggle } from "@/components/LanguageToggle";

export default async function AcceptInvitePage() {
  const ctx = await getAuth();
  if (!ctx) redirect("/login");
  const locale = await getLocale();
  const t = await getServerT();

  return (
    <LanguageProvider initialLocale={locale}>
      <main className="relative flex min-h-screen items-center justify-center p-4">
        <div className="absolute right-4 top-4">
          <LanguageToggle />
        </div>
        <Card className="w-full max-w-sm p-6 sm:p-8">
          <h1 className="text-xl font-semibold text-slate-900">
            {t("invite.title")}
          </h1>
          <p className="mt-1 mb-6 text-sm text-slate-500">
            {t("invite.subtitle", { email: ctx.user.email ?? "" })}
          </p>
          <AcceptInviteForm defaultName={ctx.profile?.full_name ?? ""} />
        </Card>
      </main>
    </LanguageProvider>
  );
}
