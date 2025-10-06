import { inputPrompt, select } from "./src/inputs";
import commands from "./src/shared/commands";
import { MlinBuilder } from "./src/core/mlin";

export interface Theme {
	primary: string;
	accent: string;
	secondary: string;
	contrastText: string;
}

const theme: Theme = {
	primary: '129',
	accent: '135',
	secondary: '90',
	contrastText: '246'
}

const color = (text: string, color: string | number) => `\x1b[38;5;${color}m ${text} \x1b[0m`

const bgcolor = (text: string, color: string | number) => `\x1b[48;5;${color}m ${text} \x1b[0m`

const effect = (type: string | number) => `\x1b[${type}m`

export type TextEffect =
    | 'reset'
    | 'bold'
    | 'dim'
    | 'italic'
    | 'underline'
    | 'blink'
    | 'inverse'
    | 'hidden'
    | 'strike';

export const EFFECT_CODES: Record<TextEffect, number> = {
	reset: 0,
	bold: 1,
	dim: 2,
	italic: 3,
	underline: 4,
	blink: 5,
	inverse: 7,
	hidden: 8,
	strike: 9,
};

if (require.main === module) {

	(async () => {

		commands.clean();

		const text = "➤  Choose a name: ";

		console.log(text);
		
		// background color
		console.log(bgcolor(text, 129));

		// background color
		console.log(color(text, 246));
		

		console.log(effect(4) + bgcolor(color(text, 129), 90));

		const nameResult = await inputPrompt();
		
		console.log("➤  Choose a type: ");

		const selection = await select(['TS', 'JS', 'React']);

		console.log(nameResult);
		console.log(selection);
		
		commands.close();

	})();

}
