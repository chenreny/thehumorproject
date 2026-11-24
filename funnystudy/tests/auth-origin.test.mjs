import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { NextRequest, NextResponse } from "next/server.js";
import { findPagesDir } from "next/dist/lib/find-pages-dir.js";
import ts from "typescript";

const { outputText } = ts.transpileModule(readFileSync("src/proxy.ts", "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
});

test("Next.js discovers the proxy beside the actual app directory", () => {
  const { appDir } = findPagesDir(process.cwd());
  assert.ok(appDir);
  assert.equal(join(dirname(appDir), "proxy.ts"), join(process.cwd(), "src/proxy.ts"));
  assert.ok(existsSync(join(dirname(appDir), "proxy.ts")));
  assert.equal(existsSync("proxy.ts"), false);
});

async function run(environment, url, method = "GET", siteUrl = "https://study.example.test", headers = {}) {
  const previous = {
    NODE_ENV: process.env.NODE_ENV,
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
    process.env.NODE_ENV = environment === "development" ? "development" : "production";
    if (environment === undefined) delete process.env.VERCEL_ENV;
    else process.env.VERCEL_ENV = environment;
    if (siteUrl === null) delete process.env.NEXT_PUBLIC_SITE_URL;
    else process.env.NEXT_PUBLIC_SITE_URL = siteUrl;
    const response = await loadedModule.exports.proxy(new NextRequest(url, { method, headers }));
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

test("production canonicalization does not depend on Vercel system variables", async () => {
  const { response, authCalls } = await run(undefined, "https://deployment.example.test/login");
  assert.equal(response.headers.get("location"), "https://study.example.test/login");
  assert.equal(authCalls, 0);
});

test("canonicalization checks the browser's Host header even when the request URL is normalized", async () => {
  const { response, authCalls } = await run("production", "https://study.example.test/login", "GET", "https://study.example.test", { host: "deployment.example.test" });
  assert.equal(response.headers.get("location"), "https://study.example.test/login");
  assert.equal(authCalls, 0);
});

test("local login, previews without a configured origin, and API callbacks remain unchanged", async () => {
  for (const environment of ["development", "preview"]) {
    const { response, authCalls } = await run(environment, "http://localhost:3014/auth/login", "POST", environment === "preview" ? null : "https://study.example.test");
    assert.equal(response.headers.get("location"), null);
    assert.equal(authCalls, 1);
  }
  const { response, authCalls } = await run("production", "https://deployment.example.test/api/telnyx/voice/fallback", "POST");
  assert.equal(response.headers.get("location"), null);
  assert.equal(authCalls, 0);
});
