
import * as readline from 'readline';
import { ansiEffects, ansistyle } from '../ansiiStyles';
import commands from '../commands';
import { formatError } from '../errors';
import stream from '../stream';
import { InputPromptType, Line, SelectConfig, StateAdapter, Styles } from '../types';
import setup from '../setup';

/**
 * initialize sigint / exit fallback events
 */
setup();

export const InputPrompt: InputPromptType = async (question, onAfterEnter) => {

    return new Promise((resolve) => {

        if (stream.in.isTTY) {
            stream.in.setRawMode(false);
            stream.in.resume();
        }

        const rl = readline.createInterface({
            input: stream.in,
            output: stream.out,
        });

        rl.question(question || '', (ans: string) => {
            onAfterEnter?.(ans);
            rl.close();
            stream.in.pause();
            resolve(ans);
        });
    });
}

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

export function text(text: string, styles?: Styles) {

    let result = text;
    if (styles?.effect) result = ansistyle(ansiEffects[styles.effect], result);
    if (styles?.color) result = ansistyle(38, result, styles.color);
    if (styles?.bgcolor) result = ansistyle(48, result, styles.bgcolor);
    return result;
}


async function draw<S>(opt: { clean?: boolean, closeStream?: boolean, state?: S, lines: Line<S>[] }) {

    let state = opt?.state;
    let lines = opt?.lines;

    if (opt?.clean) commands.clearScreen();

    for (const line of lines) {
        if (typeof line === 'string') {
            console.log(line);
        } else {
            const asyncLineResult = await line(state || {} as S);
            state = { ...(state || {} as S), ...asyncLineResult };
        }
    }
    if (opt?.closeStream) commands.close();

    return state;
}


export class Terminal<S> {

    private lines: Line<S>[] = [];

    state: S | null = null;

    constructor(props?: Line<S>[]) {
        this.lines = props || [];
    }

    newLine(line: Line<S>, styles?: Styles) {
        this.lines.push(typeof line === 'string' ? text(line, styles) : line);
    }

    newInputLine(stateAdapter: StateAdapter<S>) {
        this.newLine(async () => {
            const result = await InputPrompt();
            return stateAdapter(result, this.state || {} as S);
        })
    }

    newSelectLine(options: (number | string | boolean)[], stateAdapter: StateAdapter<S>) {
        this.newLine(async () => {
            const result = await SelectPrompt(options);
            return stateAdapter(result, this.state || {} as S);
        })
    }

    initState(state: S) {
        this.state = state;
    }

    async draw(opt?: { clean?: boolean, closeStream?: boolean }) {

        this.state = await draw<S>({ ...opt, state: this.state || {} as S, lines: this.lines }) || {} as S;
    }
}
