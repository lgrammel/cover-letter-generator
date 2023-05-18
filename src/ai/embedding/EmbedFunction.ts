import { RunContext } from "../run/RunContext";

export type EmbedFunction<EMBEDDING> = (
  options: { value: string },
  context: RunContext
) => Promise<EMBEDDING>;
