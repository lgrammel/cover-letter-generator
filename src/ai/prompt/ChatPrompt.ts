import { OpenAIChatMessage } from "../provider/openai/api/OpenAIChatCompletion";
import { Prompt } from "./Prompt";

export type ChatPrompt<INPUT> = Prompt<INPUT, Array<OpenAIChatMessage>>;
