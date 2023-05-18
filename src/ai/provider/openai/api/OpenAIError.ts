import { AxiosError } from "axios";
import zod from "zod";

export const OpenAIErrorDataSchema = zod.object({
  error: zod.object({
    message: zod.string(),
    type: zod.string(),
    param: zod.any().nullable(),
    code: zod.string().nullable(),
  }),
});

export type OpenAIErrorData = zod.infer<typeof OpenAIErrorDataSchema>;

export class OpenAIError extends Error {
  public readonly code: OpenAIErrorData["error"]["code"];
  public readonly type: OpenAIErrorData["error"]["type"];

  constructor({ error: { message, code, type } }: OpenAIErrorData) {
    super(message);
    this.code = code;
    this.type = type;
  }
}

export const withOpenAIErrorHandler = async <T>(fn: () => PromiseLike<T>) => {
  try {
    return await fn();
  } catch (error) {
    if (error instanceof AxiosError) {
      const parsedError = OpenAIErrorDataSchema.safeParse(
        error?.response?.data
      );

      if (parsedError.success) {
        throw new OpenAIError(parsedError.data);
      }
    }

    throw error;
  }
};
