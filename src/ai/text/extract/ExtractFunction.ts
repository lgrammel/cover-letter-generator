import { RunContext } from "../../run/RunContext";

export type ExtractFunction = (
  options: {
    text: string;
    topic: string;
  },
  context: RunContext
) => PromiseLike<string>;
