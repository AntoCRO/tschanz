import { Card } from "@/components/ui";
import { LoginForm } from "@/components/LoginForm";
import { LanguageProvider } from "@/components/LanguageProvider";
import { LanguageToggle } from "@/components/LanguageToggle";
import { getLocale, getServerT } from "@/lib/locale";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
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
            {t("app.name")}
          </h1>
          <p className="mt-1 mb-6 text-sm text-slate-500">
            {t("login.subtitle")}
          </p>
          {error === "invalid_link" && (
            <p className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
              {t("login.invalidLink")}
            </p>
          )}
          <LoginForm />
        </Card>
      </main>
    </LanguageProvider>
  );
}
