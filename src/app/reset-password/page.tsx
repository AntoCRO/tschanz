import { requireUser } from "@/lib/auth";
import { Card } from "@/components/ui";
import { ResetPasswordForm } from "@/components/PasswordResetForms";
import { LanguageProvider } from "@/components/LanguageProvider";
import { LanguageToggle } from "@/components/LanguageToggle";
import { getLocale, getServerT } from "@/lib/locale";

export default async function ResetPasswordPage() {
  await requireUser();
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
            {t("reset.title")}
          </h1>
          <p className="mt-1 mb-6 text-sm text-slate-500">
            {t("reset.subtitle")}
          </p>
          <ResetPasswordForm />
        </Card>
      </main>
    </LanguageProvider>
  );
}
