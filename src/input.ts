const readline = require("readline");

async function input(): Promise<string> {

  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question("Seleziona numero: ", (ans: any) => {
      rl.close();
      resolve(ans);
    });
    return;
  });
}

module.exports = input;