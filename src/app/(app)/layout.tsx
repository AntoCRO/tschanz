import { requireUser, isAdmin } from "@/lib/auth";
import { getLocale } from "@/lib/locale";
import { createClient } from "@/lib/supabase/server";
import { LanguageProvider } from "@/components/LanguageProvider";
import { Header } from "@/components/Header";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  // Auth check, locale cookie and badge count in parallel.
  const [ctx, locale, { count }] = await Promise.all([
    requireUser(),
    getLocale(),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("done", false),
  ]);
  const name = ctx.profile?.full_name || ctx.user.email || "";

  return (
    <LanguageProvider initialLocale={locale}>
      <div className="min-h-screen">
        <Header name={name} isAdmin={isAdmin(ctx)} openOrders={count ?? 0} />
        <main className="mx-auto max-w-4xl px-4 py-6">{children}</main>
      </div>
    </LanguageProvider>
  );
}
