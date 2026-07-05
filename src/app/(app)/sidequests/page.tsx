import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getServerT } from "@/lib/locale";
import { SidequestManager } from "@/components/SidequestManager";

export default async function SidequestsPage() {
  await requireUser();
  const t = await getServerT();
  const supabase = await createClient();

  const { data: sidequests } = await supabase
    .from("sidequests")
    .select("id, title, description, due_date, due_time, done")
    .order("done", { ascending: true })
    .order("due_date", { ascending: true })
    .order("due_time", { ascending: true });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          {t("sq.title")}
        </h1>
        <p className="text-sm text-slate-500">{t("sq.subtitle")}</p>
      </div>
      <SidequestManager sidequests={sidequests ?? []} />
    </div>
  );
}
