import commands from '../shared/commands';
import errors from "../shared/errors";
import * as readline from 'readline';
import { SelectConfig } from '../types';

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
export async function select(options: string[], config?: SelectConfig): Promise<string> {
    if (options.length === 0) throw new Error(errors.invalidOptions);

    return new Promise((resolve, reject) => {
        const isTTY = !!(process.stdin.isTTY && process.stdout.isTTY);

        if (!isTTY) {
            const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
            options.forEach((o, i) => process.stdout.write(`${i + 1}. ${o}\n`));
            rl.question(config?.noTTYFallbackText ?? '', (ans: string) => {
                rl.close();
                process.stdin.pause();
                const n = Math.max(1, Math.min(options.length, parseInt(ans, 10) || 1));
                resolve(options[n - 1] ?? '');
            });
            return;
        }

        readline.emitKeypressEvents(process.stdin);
        process.stdin.removeAllListeners("keypress");
        if (process.stdin.isTTY) {
            process.stdin.setRawMode(true);
            process.stdin.resume();
        }

        commands.hideCursor();

        // initial render
        options.forEach((opt, i) => {
            const line = i === 0 ? commands.highLightLine(opt) : `  ${opt}`;
            process.stdout.write(line + "\n");
        });

        let index = 0;
        const onKeypress = (_: string, key: readline.Key) => {
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
            if (process.stdin.isTTY) {
                process.stdin.setRawMode(false);
                process.stdin.pause();
            }
            process.stdin.off("keypress", onKeypress);
        };

        process.stdin.on("keypress", onKeypress);
    });
}
