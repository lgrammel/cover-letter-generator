import axios from "axios";
import { RetryFunction } from "./RetryFunction";

export const retryWithExponentialBackoff =
  ({ maxTries = 5, delay = 2000 } = {}): RetryFunction =>
  async <T>(f: () => PromiseLike<T>) =>
    _retryWithExponentialBackoff(f, { maxTries, delay });

export const retryNever = () => retryWithExponentialBackoff({ maxTries: 1 });

async function _retryWithExponentialBackoff<T>(
  f: () => PromiseLike<T>,
  { maxTries = 5, delay = 2000 } = {},
  tryNumber = 1
): Promise<
  {
    tries: number;
  } & (
    | {
        success: true;
        result: T;
      }
    | {
        success: false;
        error: unknown;
      }
  )
> {
  try {
    return {
      success: true,
      tries: tryNumber,
      result: await f(),
    };
  } catch (error) {
    if (
      axios.isAxiosError(error) &&
      (error.response?.status === 429 || // too many requests
        error.response?.status === 502 ||
        error.response?.status === 520) && // cloudflare error
      maxTries > tryNumber
    ) {
      await new Promise((resolve) => setTimeout(resolve, delay));
      return _retryWithExponentialBackoff(
        f,
        { maxTries, delay: 2 * delay },
        tryNumber + 1
      );
    }

    return {
      success: false,
      tries: tryNumber,
      error,
    };
  }
}
