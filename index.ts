import { input, select } from "./src/inputs";
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

if (require.main === module) {

	(async () => {

		commands.clean();

		const startLine = MlinBuilder
			.text('➤ ')
			.color(theme.secondary)
			.build();

		const name = MlinBuilder
			.text('Choose a name: ')
			.build();

		const nameResult = await input();
		
		const template = MlinBuilder
			.text('Choose a name: ')
			.build();

		const selection = await select(['TS', 'JS', 'React']);

		console.log(nameResult);
		console.log(selection);
		
		commands.close();

	})();

}
