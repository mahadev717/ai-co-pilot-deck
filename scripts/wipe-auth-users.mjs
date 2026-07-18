import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const env = {};
for (const line of readFileSync(".env", "utf8").split(/\r?\n/)) {
  const t = line.trim();
  if (!t || t.startsWith("#")) continue;
  const i = t.indexOf("=");
  if (i < 0) continue;
  let v = t.slice(i + 1).trim();
  if (
    (v.startsWith('"') && v.endsWith('"')) ||
    (v.startsWith("'") && v.endsWith("'"))
  ) {
    v = v.slice(1, -1);
  }
  env[t.slice(0, i).trim()] = v;
}

const url = env.VITE_SUPABASE_URL;
const key = env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
console.log(
  "urlLen",
  url?.length ?? 0,
  "keyLen",
  key?.length ?? 0,
  "urlHost",
  url ? new URL(url).host : null,
);
if (!url || !key) {
  console.error("Missing URL or secret");
  process.exit(1);
}

const admin = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

let deleted = 0;
for (let page = 1; page <= 50; page++) {
  const { data, error } = await admin.auth.admin.listUsers({
    page,
    perPage: 100,
  });
  if (error) {
    console.error("list error:", error.message);
    process.exit(1);
  }
  const users = data.users ?? [];
  console.log("page", page, "count", users.length);
  if (!users.length) break;
  for (const u of users) {
    const { error: delErr } = await admin.auth.admin.deleteUser(u.id);
    if (delErr) console.error("fail", u.email, delErr.message);
    else {
      deleted++;
      console.log("deleted", u.email ?? u.id);
    }
  }
  if (users.length < 100) break;
}
console.log("DONE deleted=", deleted);
