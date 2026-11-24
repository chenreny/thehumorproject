import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { NextRequest, NextResponse } from "next/server.js";
import ts from "typescript";

const { outputText } = ts.transpileModule(readFileSync("proxy.ts", "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
});

async function run(environment, url, method = "GET") {
  const previous = {
    VERCEL_ENV: process.env.VERCEL_ENV,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  };
  let authCalls = 0;
  const loadedModule = { exports: {} };
  const imports = {
    "next/server": { NextResponse },
    "@supabase/ssr": {
      createServerClient: () => {
        authCalls++;
        return { auth: { getSession: async () => ({ data: { session: null } }) } };
      },
    },
    "@/lib/supabase/authCookies": { getSupabaseAuthCookieOptions: () => ({ name: "fixture-auth" }) },
    "@/lib/supabase/env": { getSupabasePublicEnv: () => ({ supabaseUrl: "https://fixture.supabase.test", supabasePublicKey: "fixture-key" }) },
  };
  new Function("require", "module", "exports", outputText)(name => {
    assert.ok(Object.hasOwn(imports, name), `Unexpected import: ${name}`);
    return imports[name];
  }, loadedModule, loadedModule.exports);
  try {
    process.env.VERCEL_ENV = environment;
    process.env.NEXT_PUBLIC_SITE_URL = "https://study.example.test";
    const response = await loadedModule.exports.proxy(new NextRequest(url, { method }));
    return { response, authCalls };
  } finally {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
  }
}

test("production login moves to the callback host before creating Auth cookies", async () => {
  for (const method of ["GET", "POST"]) {
    const { response, authCalls } = await run("production", "https://deployment.example.test/auth/login?next=%2Fstudy%2F24", method);
    assert.equal(response.status, 307);
    assert.equal(response.headers.get("location"), "https://study.example.test/auth/login?next=%2Fstudy%2F24");
    assert.equal(authCalls, 0);
    assert.equal(response.headers.get("set-cookie"), null);
  }
});

test("production entry pages and callbacks preserve their path and query on the canonical host", async () => {
  for (const path of ["/", "/login", "/privacy", "/auth/callback?code=fixture-code"]) {
    const { response, authCalls } = await run("production", `https://deployment.example.test${path}`);
    assert.equal(response.headers.get("location"), `https://study.example.test${path}`);
    assert.equal(authCalls, 0);
  }
});

test("canonical login proceeds normally without a redirect loop", async () => {
  const { response, authCalls } = await run("production", "https://study.example.test/auth/login", "POST");
  assert.equal(response.headers.get("location"), null);
  assert.equal(authCalls, 1);
});

test("local and preview login origins and API callbacks remain unchanged", async () => {
  for (const environment of ["development", "preview"]) {
    const { response, authCalls } = await run(environment, "http://localhost:3014/auth/login", "POST");
    assert.equal(response.headers.get("location"), null);
    assert.equal(authCalls, 1);
  }
  const { response, authCalls } = await run("production", "https://deployment.example.test/api/telnyx/voice/fallback", "POST");
  assert.equal(response.headers.get("location"), null);
  assert.equal(authCalls, 0);
});
