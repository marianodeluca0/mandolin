const readline = require('readline');
const commands = require('./commands');
const errors = require('./errors');

type Key = { name?: string; ctrl?: boolean };

interface SelectConfig {
    nottyFallbackText?: string;
    onAfterSelection?(value: string): void;
    onCancel?(): void;
}

function paintRow(options: string[], row: number, selected: boolean) {

    readline.moveCursor(process.stdout, 0, -(options.length - row));
    commands.cursorTo(process.stdout);      // set cursor position
    readline.clearLine(process.stdout, 0);
    const option = options[row];
    if (option) {

        const line = selected ? commands.highLightLine(option) : `  ${options[row]}`;
        process.stdout.write(line);
        readline.moveCursor(process.stdout, 0, options.length - row);   // go to the baseline
    } else {

        throw new Error(errors.invalidOptions);
    }
    commands.cursorTo(process.stdout);      // set cursor position
}

function noTTYPaintRow(options: string[], stream: NodeJS.WriteStream) {
    options.forEach((o, i) => stream.write(`${i + 1}. ${o}`));
}

const selectLine = (opt: string, isSelected: boolean) => isSelected ? commands.highLightLine(opt) : `  ${opt}`;

async function select(
    options: string[],
    config?: SelectConfig
): Promise<string> {

    if (options.length === 0) throw new Error(errors.invalidOptions);

    return new Promise((resolve, reject) => {

        const isTTY = !!(process.stdin.isTTY && process.stdout.isTTY);

        if (!isTTY) {

            const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
            noTTYPaintRow(options, process.stdout);
            rl.question(config?.nottyFallbackText ?? '', (ans: string) => {
                rl.close();
                const n = Math.max(1, Math.min(options.length, parseInt(ans, 10) || 1));
                resolve(options[n - 1] ?? '');
            });
            return;
        }

        readline.emitKeypressEvents(process.stdin);
        process.stdin.setRawMode?.(true);
        commands.hideCursor();

        /** Initial render */
        options.forEach((opt, i) => {
            const line = selectLine(opt, i === 0);
            process.stdout.write(line + "\n");
        });
        process.stdout.write("");

        let index = 0;
        const onKeypress = (_: string, key: Key) => {

            if (key?.name === "up") {

                const old = index;
                index = (index - 1 + options.length) % options.length;
                paintRow(options, old, false);
                paintRow(options, index, true);

            } else if (key?.name === "down") {

                const old = index;
                index = (index + 1) % options.length;
                paintRow(options, old, false);
                paintRow(options, index, true);

            } else if (key?.name === "return" || key?.name === "enter") {

                teardown();
                const text = options[index] ?? '';
                config?.onAfterSelection?.(text);
                resolve(text);

            } else if (key?.ctrl && key?.name === "c") {

                teardown();
                commands.close();
                process.stdout.write(errors.aborted);
                config?.onCancel?.();
                reject(new Error(errors.aborted));
                
            }
        };

        const teardown = () => {
            commands.showCursor();
            process.stdin.setRawMode?.(false);
            process.stdin.off("keypress", onKeypress);
        };

        process.stdin.on("keypress", onKeypress);
    });
}

module.exports = select;
