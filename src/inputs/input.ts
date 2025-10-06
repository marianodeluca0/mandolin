import * as readline from "readline";

export type InputPromptType = (question?: string, onAfterEnter?: (text: string) => void) => Promise<string>;

export const inputPrompt: InputPromptType = async (question, onAfterEnter) => {

	return new Promise((resolve) => {
		if (process.stdin.isTTY) {
			process.stdin.setRawMode(false);
			process.stdin.resume();
		}

		const rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout,
		});

		rl.question(question || '', (ans: string) => {
			onAfterEnter?.(ans);
			rl.close();
			process.stdin.pause();
			resolve(ans);
		});
	});
}
