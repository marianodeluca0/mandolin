import commands from "../commands";
import { formatError } from "../errors";
import stream from "../stream";
import { SelectConfig } from "../types";
import * as readline from 'readline';

function paintRow(options: (string | number | boolean)[], row: number, selected: boolean) {

    readline.moveCursor(stream.out, 0, -(options.length - row));
    readline.cursorTo(stream.out, 0);      // set cursor position
    readline.clearLine(stream.out, 0);
    const option = options[row];
    if (option) {

        const line = selected ? `\x1b[47;30m  ${option}  \x1b[0m` : `  ${options[row]}`;
        stream.out.write(line);
        readline.moveCursor(stream.out, 0, options.length - row);   // go to the baseline
    } else {

        const error = formatError.error("row drawing", "invalid options provided!");
        throw new Error(error.message);
    }
    readline.cursorTo(stream.out, 0);      // set cursor position
}

export async function SelectPrompt(options: (string | number | boolean)[], config?: SelectConfig): Promise<string> {

    if (options.length === 0) {
        const error = formatError.error("SelectPromp initialization", "invalid options provided!");
        throw new Error(error.message);
    }

    return new Promise((resolve, reject) => {
        const isTTY = !!(stream.in.isTTY && stream.out.isTTY);

        if (!isTTY) {
            const rl = readline.createInterface({ input: stream.in, output: stream.out });
            options.forEach((o, i) => stream.out.write(`${i + 1}. ${o}\n`));
            rl.question(config?.noTTYFallbackText ?? '', (ans: string) => {
                rl.close();
                stream.in.pause();
                const n = Math.max(1, Math.min(options.length, parseInt(ans, 10) || 1));
                resolve(String(options[n - 1] ?? ''));
            });
            return;
        }

        readline.emitKeypressEvents(stream.in);
        stream.in.removeAllListeners("keypress");
        if (stream.in.isTTY) {
            stream.in.setRawMode(true);
            stream.in.resume();
        }

        stream.out.write("\x1b[?25l")

        // initial render
        options.forEach((opt, i) => {
            const line = i === 0 ? `\x1b[47;30m  ${opt}  \x1b[0m` : `  ${opt}`;
            stream.out.write(line + "\n");
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
                const text = String(options[index] ?? '');
                config?.onAfterSelection?.(text);
                resolve(text);
            } else if (key?.ctrl && key?.name === "c") {

                const error = formatError.warning("SelectPromp cancel", "Operation canceled");

                teardown();
                commands.close();
                stream.out.write(error.message);
                config?.onCancel?.();
                reject(new Error(error.message));
            }
        };

        const teardown = () => {
            stream.out.write("\x1b[?25h");
            if (stream.in.isTTY) {
                stream.in.setRawMode(false);
                stream.in.pause();
            }
            stream.in.off("keypress", onKeypress);
        };
        stream.in.on("keypress", onKeypress);
    });
}
