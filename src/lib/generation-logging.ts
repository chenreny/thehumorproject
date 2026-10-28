type WriteResult = { error: unknown | null };

/** Keep optional response logging from failing a paid generation request. */
export async function bestEffortGenerationLog(write: () => PromiseLike<WriteResult>): Promise<boolean> {
  try {
    const result = await write();
    return !result.error;
  } catch {
    return false;
  }
}
