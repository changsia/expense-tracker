import "clsx";
import { createClient } from "@supabase/supabase-js";
{
  console.warn("Supabase credentials not set — app will not connect to database.");
}
const supabase = createClient(
  "",
  ""
);
async function getExpenses() {
  const { data, error } = await supabase.from("expenses").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let expenses = [];
    let personSummaries = [];
    supabase.auth.onAuthStateChange((_event, session_) => {
      if (session_) {
        loadData();
      } else {
        expenses = [];
      }
    });
    async function loadData() {
      try {
        const data = await getExpenses();
        expenses = data;
        const map = /* @__PURE__ */ new Map();
        for (const e of data) {
          const key = `${e.person}::${e.currency}`;
          const existing = map.get(key);
          if (existing) {
            existing.total += e.amount;
          } else {
            map.set(key, { person: e.person, total: e.amount, currency: e.currency });
          }
        }
        personSummaries = Array.from(map.values());
      } catch (e) {
      }
    }
    {
      $$renderer2.push(`<!--[0--><p class="auth-info">Loading...</p>`);
    }
    $$renderer2.push(`<!--]-->`);
  });
}
export {
  _page as default
};
