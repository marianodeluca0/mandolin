import { Components, InputPrompt, SelectPrompt, Spinner, Styles, Terminal, text } from "./src/core/mlin";

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

		// Stato del wizard
		interface WizardState {
			name: string;
			language: string;
		}

		// Istanziamo il terminale
		const UIComponents = new Components();

		const wizard = new Terminal<WizardState>();
		wizard.initState({ name: '', language: '' });

		// Step 1 — Intro
		wizard.newLine(text("🎩 Welcome to the Mandolin Wizard!", { effect: 'bold', color: 117 }));
		wizard.newLine(text("Let's create your developer profile...\n"));

		// Step 2 — Input: nome utente
		wizard.newLine("What's your name?");
		wizard.newInputLine((input, state) => ({
			...state,
			name: input || 'Anonymous'
		}));

		// Step 3 — Select: linguaggio preferito
		wizard.newLine("\nChoose your favorite programming language:");
		wizard.newSelectLine(["TypeScript", "Python", "Rust", "Go"], (selected, state) => ({
			...state,
			language: String(selected)
		}));

		// Step 4 — Spinner + output finale
		wizard.newLine(async (state) => {
			const spinner = new Spinner({ color: 33 }, "Creating profile");
			spinner.start();
			await new Promise((r) => setTimeout(r, 2000)); // Simula elaborazione
			console.log(UIComponents.br());
			spinner.stop(text("✔  Profile created successfully!", { color: 82 }));
			return state;
		});

		// Step 5 — Riepilogo finale
		wizard.newLine(async (state) => {
			console.log(UIComponents.divider());
			
			console.log(
				text("\n🎉 Setup complete!", { effect: 'bold', color: 82 })
			);
			console.log(
				text(`User: ${state.name}`, { color: 81 })
			);
			console.log(
				text(`Language: ${state.language}`, { color: 226 })
			);
			console.log(
				text("\nThanks for using Mandolin!")
			);
			return state;
		});

		// Eseguiamo il wizard
		await wizard.draw({ clean: true, closeStream: true });

	})();

}
