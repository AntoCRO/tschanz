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
  const ctx = await requireUser();
  const locale = await getLocale();
  const name = ctx.profile?.full_name || ctx.user.email || "";

  // Open orders → badge on the Bestellungen tab.
  const supabase = await createClient();
  const { count } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("done", false);

  return (
    <LanguageProvider initialLocale={locale}>
      <div className="min-h-screen">
        <Header name={name} isAdmin={isAdmin(ctx)} openOrders={count ?? 0} />
        <main className="mx-auto max-w-4xl px-4 py-6">{children}</main>
      </div>
    </LanguageProvider>
  );
}
