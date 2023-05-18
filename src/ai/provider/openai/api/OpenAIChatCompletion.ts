import zod from "zod";

export const OpenAIChatCompletionSchema = zod.object({
  id: zod.string(),
  object: zod.literal("chat.completion"),
  created: zod.number(),
  model: zod.string(),
  choices: zod.array(
    zod.object({
      message: zod.object({
        role: zod.literal("assistant"),
        content: zod.string(),
      }),
      index: zod.number(),
      logprobs: zod.nullable(zod.any()),
      finish_reason: zod.string(),
    })
  ),
  usage: zod.object({
    prompt_tokens: zod.number(),
    completion_tokens: zod.number(),
    total_tokens: zod.number(),
  }),
});

export type OpenAIChatCompletion = zod.infer<typeof OpenAIChatCompletionSchema>;

export type OpenAIChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

export type OpenAIChatCompletionModel = "gpt-4" | "gpt-3.5-turbo";
