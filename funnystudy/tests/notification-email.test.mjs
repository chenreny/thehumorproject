import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

function scenario({ signedIn = true, writeError = false } = {}) {
  const rows = [
    { id: "participant-a", notification_email: null, notify_new_study_email: false },
    { id: "participant-b", notification_email: null, notify_new_study_email: true },
  ];
  const writes = [];
  const invalidations = [];
  const client = {
    auth: { getUser: async () => ({ data: { user: signedIn ? { id: "participant-a", email: "signin@example.test" } : null } }) },
    from: (table) => {
      assert.equal(table, "profiles");
      let update, id;
      const query = {
        update(value) { update = value; return query; },
        eq(key, value) { assert.equal(key, "id"); id = value; return query; },
        select(column) { assert.equal(column, "notification_email"); return query; },
        async single() {
          if (writeError) return { data: null, error: new Error("write failed") };
          const row = rows.find(item => item.id === id);
          if (row) Object.assign(row, update);
          writes.push({ id, update });
          return { data: row ? { notification_email: row.notification_email } : null, error: null };
        },
      };
      return query;
    },
  };
  const source = readFileSync("src/app/settings/email-actions.ts", "utf8");
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } });
  const module = { exports: {} };
  new Function("require", "module", "exports", outputText)((name) => {
    if (name === "next/cache") return { revalidatePath: (...args) => invalidations.push(args) };
    if (name === "next/navigation") return { redirect: (path) => { throw new Error(`redirect:${path}`); } };
    if (name === "@/lib/supabase/server") return { createClient: async () => client };
    throw new Error(`Unexpected import: ${name}`);
  }, module, module.exports);
  const previous = { status: "idle", message: "", notificationEmail: null };
  return { rows, writes, invalidations, save: data => module.exports.updateNotificationEmail(previous, data) };
}

test("notification address saves independently of sign-in and opt-in", async () => {
  const app = scenario();
  const data = new FormData();
  data.set("notification_email", "  reminders@example.org  ");
  const saved = await app.save(data);
  assert.equal(saved.status, "success");
  assert.equal(saved.notificationEmail, "reminders@example.org");
  assert.equal(app.rows[0].notification_email, "reminders@example.org");
  assert.equal(app.rows[0].notify_new_study_email, false);
  assert.equal(app.rows[1].notification_email, null);
  assert.deepEqual(app.writes[0], { id: "participant-a", update: { notification_email: "reminders@example.org", modified_by_user_id: "participant-a" } });
  assert.deepEqual(app.invalidations, [["/", "layout"]]);

  data.set("notification_email", "SIGNIN@example.test");
  assert.equal((await app.save(data)).notificationEmail, null);
  assert.equal(app.rows[0].notification_email, null);
});

test("notification address rejects malformed, duplicate, and unauthenticated writes", async () => {
  const app = scenario();
  const data = new FormData();
  data.set("notification_email", "invalid-address");
  assert.equal((await app.save(data)).status, "error");
  data.set("notification_email", "one@example.org");
  data.append("notification_email", "two@example.org");
  assert.equal((await app.save(data)).status, "error");
  assert.equal(app.writes.length, 0);
  await assert.rejects(scenario({ signedIn: false }).save(data), /redirect:\/login/);
});
