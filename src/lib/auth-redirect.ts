export function safeAuthDestination(value: string | null | undefined, fallback = "/members") {
  return value && (["/", "/create", "/profile", "/members", "/welcome"].includes(value)
    || /^\/captions\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value))
    ? value : fallback;
}
