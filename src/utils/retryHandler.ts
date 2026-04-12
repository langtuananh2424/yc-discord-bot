/**
 * Retry Strategy với exponential backoff
 * Hữu ích cho database queries, API calls, etc.
 */

export interface RetryOptions {
    maxAttempts?: number;      // Số lần thử lại (mặc định: 3)
    delay?: number;            // Delay ban đầu (ms) - mặc định: 1000
    maxDelay?: number;         // Delay tối đa (ms) - mặc định: 10000
    backoffMultiplier?: number; // Nhân delay (mặc định: 2)
    onRetry?: (attempt: number, error: Error) => void; // Callback mỗi lần thử lại
}

/**
 * Thử lại một function với exponential backoff
 * @param fn Function cần thử lại
 * @param options Cấu hình retry
 * @returns Result of function hoặc throw error
 */
export async function retry<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {}
): Promise<T> {
    const {
        maxAttempts = 3,
        delay = 1000,
        maxDelay = 10000,
        backoffMultiplier = 2,
        onRetry
    } = options;

    let lastError: Error | null = null;
    let currentDelay = delay;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));

            // Nếu là lần cuối, throw ngay
            if (attempt === maxAttempts) {
                throw lastError;
            }

            // Callback nếu có
            if (onRetry) {
                onRetry(attempt, lastError);
            }

            console.warn(
                `⏱️  Retry attempt ${attempt}/${maxAttempts} in ${currentDelay}ms...`
            );

            // Chờ trước lần retry
            await new Promise(resolve => setTimeout(resolve, currentDelay));

            // Tăng delay theo exponential backoff
            currentDelay = Math.min(currentDelay * backoffMultiplier, maxDelay);
        }
    }

    throw lastError;
}

/**
 * Wrapper cho async function với retry
 * Sử dụng: retryAsync(database.user.findUnique, {...})
 */
export async function retryAsync<T, Args extends any[]>(
    fn: (...args: Args) => Promise<T>,
    args: Args,
    options?: RetryOptions
): Promise<T> {
    return retry(() => fn(...args), options);
}

/**
 * Thử lại mãi cho đến khi thành công (không giới hạn)
 * ⚠️  Cẩn thận sử dụng!
 */
export async function retryUntilSuccess<T>(
    fn: () => Promise<T>,
    delayMs: number = 5000,
    timeoutMs?: number
): Promise<T> {
    const startTime = Date.now();

    while (true) {
        try {
            return await fn();
        } catch (error) {
            if (timeoutMs && Date.now() - startTime > timeoutMs) {
                throw new Error(
                    `Retry timeout reached (${timeoutMs}ms): ${error instanceof Error ? error.message : String(error)}`
                );
            }

            console.warn(
                `⏱️  Retrying in ${delayMs}ms... (${Math.round((Date.now() - startTime) / 1000)}s elapsed)`
            );

            await new Promise(resolve => setTimeout(resolve, delayMs));
        }
    }
}

/**
 * Thử lại với callback để quyết định có retry tiếp không
 */
export async function retryUntil<T>(
    fn: () => Promise<T>,
    shouldRetry: (error: Error) => boolean,
    options: RetryOptions = {}
): Promise<T> {
    const { maxAttempts = 5, delay = 1000 } = options;

    let lastError: Error | null = null;
    let currentDelay = delay;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));

            if (!shouldRetry(lastError) || attempt === maxAttempts) {
                throw lastError;
            }

            console.warn(`⏱️  Retrying attempt ${attempt}/${maxAttempts}...`);
            await new Promise(resolve => setTimeout(resolve, currentDelay));
            currentDelay *= 2;
        }
    }

    throw lastError;
}
