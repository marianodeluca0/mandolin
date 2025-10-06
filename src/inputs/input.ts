import * as readline from "readline";

export async function input(
	question?: string,
	onAfterEnter?: (text: string) => void
): Promise<string> {

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
