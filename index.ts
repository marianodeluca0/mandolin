const input = require("./src/input");
const select = require("./src/select");
const commands = require('./src/commands');

// Esempio d'uso
if (require.main === module) {
  (async () => {

    commands.clean();

    const choice = await select(["Opzione 1", "Opzione 2", "Opzione 3"]);
    console.log("Risultato:", choice);

    const choice2 = await select(["Opzione 1a", "Opzione 2a", "Opzione 3a"]);
    console.log("Risultato:", choice2);

    const text = await input();
    console.log("text result 1:", text);

    const text2 = await input();
    console.log("text result 2:", text2);

    commands.close();
  })();
}
