import { Components } from "./src/core/Components";
import { Spinner } from "./src/core/Spinner";
import { Terminal } from "./src/core/Terminal";
import { text } from "./src/helpers/text";

if (require.main === module) {

	(async () => {

		// Wizard State definition
		interface WizardState {
			name: string;
			language: string;
		}

		const wizard = new Terminal<WizardState>();

		wizard.initState({ name: '', language: '' });

		// Step 1 — CLI intro
		wizard.newLine(text("🎩 Welcome to the Mandolin Wizard!", { effect: ['bold', 'underline', 'italic'], color: 117 }));
		wizard.newLine(text("Let's create your developer profile...\n"));

		// Step 2 — Input Field
		wizard.newLine("What's your name?");
		wizard.newInputLine((input, state) => ({
			...state,
			name: input || 'Anonymous'
		}));

		// Step 3 — Select Field
		wizard.newLine("\nChoose your favorite programming language:");
		wizard.newSelectLine(["TypeScript", "Python", "Rust", "Go"], (selected, state) => ({
			...state,
			language: String(selected)
		}));

		// Step 4 — Spinner + output
		wizard.newLine(async (state) => {
			const spinner = new Spinner({ color: 33 }, "Creating profile");
			spinner.start();
			await new Promise((r) => setTimeout(r, 2000)); // Simula elaborazione
			spinner.stop(text("✔  Profile created successfully!", { color: 82 }));
			return state;
		});

		// Step 5 — Composition
		wizard.newLine(async (state) => {
			text(Components.divider());

			console.log(
				text("\n🎉 Setup complete!", { effect: ['bold'], color: 82 })
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
