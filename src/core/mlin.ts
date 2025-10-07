
import errors from "../shared/errors";
import * as readline from 'readline';
import { SelectConfig } from '../types';
import { ValuesOf } from '@virtual-registry/ts-utils';

export type InputPromptType = (question?: string, onAfterEnter?: (text: string) => void) => Promise<string>;

export const InputPrompt: InputPromptType = async (question, onAfterEnter) => {

    return new Promise((resolve) => {

        if (process.stdin.isTTY) {
            process.stdin.setRawMode(false);
            process.stdin.resume();
        }

        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });

        rl.question(question || '', (ans: string) => {
            onAfterEnter?.(ans);
            rl.close();
            process.stdin.pause();
            resolve(ans);
        });
    });
}

function paintRow(options: (string | number | boolean)[], row: number, selected: boolean) {

    readline.moveCursor(process.stdout, 0, -(options.length - row));
    readline.cursorTo(process.stdout, 0);      // set cursor position
    readline.clearLine(process.stdout, 0);
    const option = options[row];
    if (option) {

        const line = selected ? `\x1b[47;30m  ${option}  \x1b[0m` : `  ${options[row]}`;
        process.stdout.write(line);
        readline.moveCursor(process.stdout, 0, options.length - row);   // go to the baseline
    } else {

        throw new Error(errors.invalidOptions);
    }
    readline.cursorTo(process.stdout, 0);      // set cursor position
}

export async function SelectPrompt(options: (string | number | boolean)[], config?: SelectConfig): Promise<string> {
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
                resolve(String(options[n - 1] ?? ''));
            });
            return;
        }

        readline.emitKeypressEvents(process.stdin);
        process.stdin.removeAllListeners("keypress");
        if (process.stdin.isTTY) {
            process.stdin.setRawMode(true);
            process.stdin.resume();
        }

        process.stdout.write("\x1b[?25l")

        // initial render
        options.forEach((opt, i) => {
            const line = i === 0 ? `\x1b[47;30m  ${opt}  \x1b[0m` : `  ${opt}`;
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
                const text = String(options[index] ?? '');
                config?.onAfterSelection?.(text);
                resolve(text);
            } else if (key?.ctrl && key?.name === "c") {
                teardown();
                close();
                process.stdout.write(errors.aborted);
                config?.onCancel?.();
                reject(new Error(errors.aborted));
            }
        };

        const teardown = () => {
            process.stdout.write("\x1b[?25h");
            if (process.stdin.isTTY) {
                process.stdin.setRawMode(false);
                process.stdin.pause();
            }
            process.stdin.off("keypress", onKeypress);
        };
        process.stdin.on("keypress", onKeypress);
    });
}

type TextEffect =
    | 'reset'
    | 'bold'
    | 'dim'
    | 'italic'
    | 'underline'
    | 'blink'
    | 'inverse'
    | 'hidden'
    | 'strike';

const EFFECT_CODES = {
    reset: 0,
    bold: 1,
    dim: 2,
    italic: 3,
    underline: 4,
    blink: 5,
    inverse: 7,
    hidden: 8,
    strike: 9,
} as const;

export interface Styles {
    color?: string | number;
    bgcolor?: string | number;
    effect?: TextEffect;
}

type Line<S> = (string | ((state: S) => Promise<Partial<S>>));

function ansiStyle(code: 38 | 48 | ValuesOf<typeof EFFECT_CODES>, type: string | TextEffect, close: boolean = true) {
    return `\x1b[${code};5;${type}m${text}${close ? '\x1b[0m' : ''}`;
}

function color(text: string, color: string | number) {
    return `\x1b[38;5;${color}m${text}\x1b[0m`;
}

function bgcolor(text: string, color: string | number) {
    return `\x1b[48;5;${color}m${text}\x1b[0m`;
}

function effect(text: string, type: TextEffect) {
    return `\x1b[${EFFECT_CODES[type]}m${text}`;
}

function clean() {
    process.stdout.write("\x1Bc");
}

function close() {
    process.stdin.pause();
}

export function text(text: string, styles?: Styles) {

    let result = text;
    if (styles?.effect) result = effect(result, styles.effect);
    if (styles?.color) result = color(result, styles.color);
    if (styles?.bgcolor) result = bgcolor(result, styles.bgcolor);
    return result;
}

type StateAdapter<S> = ((result: string, state: S) => S);

export class Terminal<S> {

    private lines: Line<S>[] = [];
    state: S | null = null;

    color = color;
    bgcolor = bgcolor;
    effect = effect;
    clean = clean;
    close = close;
    text = text;

    constructor(props?: Line<S>[]) {
        this.lines = props || [];
    }

    newLine(line: Line<S>, styles?: Styles) {
        this.lines.push(typeof line === 'string' ? this.text(line, styles) : line);
    }

    newInputLine(stateAdapter: StateAdapter<S>) {
        this.newLine(async (state) => {
            const result = await InputPrompt();
            return stateAdapter(result, this.state || {} as S);
        })
    }

    newSelectLine(options: (number | string | boolean)[], stateAdapter: StateAdapter<S>) {
        this.newLine(async (state) => {
            const result = await SelectPrompt(options);
            return stateAdapter(result, this.state || {} as S);
        })
    }

    initState(state: S) {
        this.state = state;
    }

    async draw(opt?: { clean?: boolean, closeStream?: boolean }) {

        if (opt?.clean) this.clean();

        for (const line of this.lines) {
            if (typeof line === 'string') {
                console.log(line);
            } else {
                const asyncLineResult = await line(this.state || {} as S);
                this.state = { ...(this.state || {} as S), ...asyncLineResult };
            }
        }
        if (opt?.closeStream) this.close();
    }
} 
