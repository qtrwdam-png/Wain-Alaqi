/**
 * Fetch with automatic retry on transient errors (502, 503, network).
 * Helps survive Railway cold-start moments where the server is waking up.
 */
export async function fetchWithRetry(
  url: string,
  options?: RequestInit,
  retries = 2,
  delayMs = 800
): Promise<Response> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, options);
      if (res.status === 502 || res.status === 503 || res.status === 504) {
        if (attempt < retries) {
          await new Promise((r) => setTimeout(r, delayMs * (attempt + 1)));
          continue;
        }
      }
      return res;
    } catch (err) {
      lastError = err;
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, delayMs * (attempt + 1)));
        continue;
      }
      throw err;
    }
  }
  throw lastError ?? new Error("fetchWithRetry failed");
}
