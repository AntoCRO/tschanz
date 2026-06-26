import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getServerT } from "@/lib/locale";
import { RecruitManager } from "@/components/RecruitManager";

export default async function RecruitsPage() {
  await requireUser();
  const t = await getServerT();
  const supabase = await createClient();
  const { data: recruits } = await supabase
    .from("recruits")
    .select("id, name, language, is_active")
    .order("is_active", { ascending: false })
    .order("name");

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          {t("recruits.title")}
        </h1>
        <p className="text-sm text-slate-500">{t("recruits.subtitle")}</p>
      </div>
      <RecruitManager recruits={recruits ?? []} />
    </div>
  );
}
