import { InputPrompt, SelectPrompt, Styles, Terminal, text } from "./src/core/mlin";

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

const style: Styles = {
	color: 129,
	bgcolor: 90,
	effect: 'underline'
};

const style2: Styles = {
	color: 90,
	bgcolor: 129,
	effect: 'bold'
};

if (require.main === module) {

	(async () => {

		// const terminal = new Terminal();
		// terminal.newLine("➤  Simple design:  ", style);
		// terminal.newLine("➤  Simple text:  ", style);
		// terminal.draw();

		// const advancedTerminal = new Terminal();
		// advancedTerminal.newLine("➤  Enter name:  ", style2);
		// advancedTerminal.newLine(async () => await InputPrompt());
		// advancedTerminal.newLine("➤  Select one option:  ", style2);
		// advancedTerminal.newLine(async () => await SelectPrompt([1, 2, 3]));
		// advancedTerminal.newLine("nice", style2);
		// await advancedTerminal.draw({ closeStream: true });

		// await new Terminal([
		// 	"text inline",
		// 	"new terminal definition",
		// 	"Its simple?",
		// 	async () => await InputPrompt(),
		// 	"yes very easy",
		// 	async () => await SelectPrompt([1, 2, 3])
		// ]).draw({ closeStream: true });

		// await new Terminal([
		// 	text("yes and customizzable", style),
		// 	text("yes and customizzable", style2),
		// 	async () => await InputPrompt(),
		// 	"yes very customizzable",
		// 	async () => await SelectPrompt([1, 2, 3])
		// ]).draw({ closeStream: true });


		// testing state injection

		// interface T {
		// 	name: string,
		// 	type: string,
		// }

		// const interminal = new Terminal<T>();

		// interminal.initState({ name: '', type: '' });

		// interminal.newLine("Enter Name: ");
		// interminal.newLine(async (state) => {
		// 	state.name = await InputPrompt();
		// 	return state;
		// });

		// interminal.newLine("Type: ");
		// interminal.newLine(async (state) => {
		// 	state.type = await SelectPrompt([ "type 1", "type 2", "type 3" ]);
		// 	return state;
		// });

		// await interminal.draw({ closeStream: true });

		// console.log(interminal.state);

		// testing new promp api
		interface ApiT {
			name: string
			type: string
		}

		const apiTerminal = new Terminal<ApiT>();

		apiTerminal.newLine("new inputline api");
		apiTerminal.newInputLine((result, state) => ({ ...state, name: result }));
		apiTerminal.newSelectLine([1, 2, 3, 4], (result, state) => ({ ...state, type: result }));
		await apiTerminal.draw();

		console.log(apiTerminal.state);


	})();

}
