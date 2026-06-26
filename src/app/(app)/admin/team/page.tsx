import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getServerT } from "@/lib/locale";
import { TeamManager } from "@/components/TeamManager";

export default async function TeamPage() {
  await requireUser();
  const t = await getServerT();
  const supabase = await createClient();
  const { data: members } = await supabase
    .from("profiles")
    .select("id, full_name, email, role")
    .order("role")
    .order("full_name");

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          {t("team.title")}
        </h1>
        <p className="text-sm text-slate-500">{t("team.subtitle")}</p>
      </div>
      <TeamManager members={members ?? []} />
    </div>
  );
}
