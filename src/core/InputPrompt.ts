import stream from "../stream";
import { InputPromptType } from "../types";
import * as readline from 'readline';

export const InputPrompt: InputPromptType = async (question, onAfterEnter) => {

    return new Promise((resolve) => {

        if (stream.in.isTTY) {
            stream.in.setRawMode(false);
            stream.in.resume();
        }

        const rl = readline.createInterface({
            input: stream.in,
            output: stream.out,
        });

        rl.question(question || '', (ans: string) => {
            onAfterEnter?.(ans);
            rl.close();
            stream.in.pause();
            resolve(ans);
        });
    });
}
