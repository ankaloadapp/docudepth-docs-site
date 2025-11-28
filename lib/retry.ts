/**
 * Retry utility with exponential backoff for S3 fetch operations
 */

export interface RetryOptions {
  maxAttempts: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
  retryableStatuses: number[];
  timeoutMs: number;
}

const DEFAULT_OPTIONS: RetryOptions = {
  maxAttempts: 3,
  initialDelayMs: 200,
  maxDelayMs: 2000,
  backoffMultiplier: 2,
  retryableStatuses: [408, 429, 500, 502, 503, 504],
  timeoutMs: 10000,
};

/**
 * Sleep for a specified duration
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetch with retry logic and exponential backoff
 */
export async function fetchWithRetry(
  url: string,
  fetchOptions: RequestInit = {},
  retryOptions: Partial<RetryOptions> = {}
): Promise<Response> {
  const config = { ...DEFAULT_OPTIONS, ...retryOptions };
  let lastError: Error | null = null;
  let delay = config.initialDelayMs;

  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      const response = await fetch(url, {
        ...fetchOptions,
        signal: AbortSignal.timeout(config.timeoutMs),
      });

      // Success or non-retryable status
      if (response.ok || !config.retryableStatuses.includes(response.status)) {
        return response;
      }

      // Retryable status code
      if (attempt < config.maxAttempts) {
        console.warn(
          `[Retry] Attempt ${attempt}/${config.maxAttempts} for ${url}: status ${response.status}`
        );
        await sleep(delay);
        delay = Math.min(delay * config.backoffMultiplier, config.maxDelayMs);
        continue;
      }

      // Final attempt - return the error response
      return response;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Network errors or timeouts are retryable
      if (attempt < config.maxAttempts) {
        console.warn(
          `[Retry] Attempt ${attempt}/${config.maxAttempts} for ${url}: ${lastError.message}`
        );
        await sleep(delay);
        delay = Math.min(delay * config.backoffMultiplier, config.maxDelayMs);
        continue;
      }
    }
  }

  // All retries exhausted
  throw lastError ?? new Error(`Max retry attempts (${config.maxAttempts}) exceeded for ${url}`);
}

/**
 * Measure async operation duration
 */
export async function measureAsync<T>(
  fn: () => Promise<T>,
  onComplete?: (durationMs: number) => void
): Promise<T> {
  const start = performance.now();
  try {
    return await fn();
  } finally {
    const duration = Math.round(performance.now() - start);
    onComplete?.(duration);
  }
}
