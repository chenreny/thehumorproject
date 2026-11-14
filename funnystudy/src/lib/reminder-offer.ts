type OfferStorage = Pick<Storage, "getItem" | "setItem">;

export function claimStudyExitOffer(storage: OfferStorage, userId: string) {
  const key = `funnystudy-study-exit-reminder:v1:${userId}`;
  if (storage.getItem(key) === "seen") return false;
  storage.setItem(key, "seen");
  return true;
}

export function reminderDraftKey(userId: string) {
  return `funnystudy-reminder-draft:${userId}`;
}
