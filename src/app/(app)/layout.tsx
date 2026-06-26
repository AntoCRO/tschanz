import { requireUser, isAdmin } from "@/lib/auth";
import { getLocale } from "@/lib/locale";
import { LanguageProvider } from "@/components/LanguageProvider";
import { Header } from "@/components/Header";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ctx = await requireUser();
  const locale = await getLocale();
  const name = ctx.profile?.full_name || ctx.user.email || "";

  return (
    <LanguageProvider initialLocale={locale}>
      <div className="min-h-screen">
        <Header name={name} isAdmin={isAdmin(ctx)} />
        <main className="mx-auto max-w-4xl px-4 py-6">{children}</main>
      </div>
    </LanguageProvider>
  );
}
