import * as readline from "readline";
// colors.ts

export async function input(
	question?: string,
	onAfterEnter?: (text: string) => void
): Promise<string> {

	return new Promise((resolve) => {

		const rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout
		});

		rl.question(question || '', (ans: string) => {

			// rl.close();
			onAfterEnter?.(ans);
			resolve(ans);
		});

		return;
	});
}

