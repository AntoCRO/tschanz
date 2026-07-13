import Link from "next/link";
import { Card } from "@/components/ui";
import { ForgotPasswordForm } from "@/components/PasswordResetForms";
import { LanguageProvider } from "@/components/LanguageProvider";
import { LanguageToggle } from "@/components/LanguageToggle";
import { getLocale, getServerT } from "@/lib/locale";

export default async function ForgotPasswordPage() {
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
            {t("forgot.title")}
          </h1>
          <p className="mt-1 mb-6 text-sm text-slate-500">
            {t("forgot.subtitle")}
          </p>
          <ForgotPasswordForm />
          <p className="mt-4 text-center text-sm">
            <Link href="/login" className="text-slate-500 hover:underline">
              {t("forgot.backToLogin")}
            </Link>
          </p>
        </Card>
      </main>
    </LanguageProvider>
  );
}
