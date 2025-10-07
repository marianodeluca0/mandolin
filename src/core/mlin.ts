
import { ValuesOf } from '@virtual-registry/ts-utils';
import * as readline from 'readline';

export type Key = { name?: string; ctrl?: boolean };

export interface SelectConfig {
    noTTYFallbackText?: string;
    onAfterSelection?(value: string): void;
    onCancel?(): void;
}

const errors = {
    invalidOptions: "\ninvalid options provided\n",
    aborted: "\nopeation cancelled\n"
}

const stream = {
    in: process.stdin,
    out: process.stdout,
}

const commands = {
    close: () => stream.in.pause(),
    clean: () => stream.out.write("\x1Bc"),
    showCursor: () => stream.out.write("\x1b[?25h"),
    hideCursor: () => stream.out.write("\x1b[?25l"),
    highLightLine: (text: string | number | boolean) => `\x1b[47;30m  ${text}  \x1b[0m`,
    cursorTo: (stream: NodeJS.WriteStream) => readline.cursorTo(stream, 0),
    clearLine: () => readline.clearLine(stream.out, 0),
    cursorToStart: () => readline.cursorTo(stream.out, 0),
};

export type InputPromptType = (question?: string, onAfterEnter?: (text: string) => void) => Promise<string>;

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

        throw new Error(errors.invalidOptions);
    }
    readline.cursorTo(stream.out, 0);      // set cursor position
}

export async function SelectPrompt(options: (string | number | boolean)[], config?: SelectConfig): Promise<string> {
    if (options.length === 0) throw new Error(errors.invalidOptions);

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

                teardown();
                commands.close();
                stream.out.write(errors.aborted);
                config?.onCancel?.();
                reject(new Error(errors.aborted));
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

function ansistyle(type: ValuesOf<typeof EFFECT_CODES> | 38 | 48, text: string, color?: string | number) {

    switch (type) {

        case 38:
        case 48:
            return `\x1b[${type};5;${color || 0}m${text}\x1b[0m`;

        default:
            return `\x1b[${type}m${text}`;
    }
}

export function text(text: string, styles?: Styles) {

    let result = text;
    if (styles?.effect) result = ansistyle(EFFECT_CODES[styles.effect], result);
    if (styles?.color) result = ansistyle(38, result, styles.color);
    if (styles?.bgcolor) result = ansistyle(48, result, styles.bgcolor);
    return result;
}


async function draw<S>(opt: { clean?: boolean, closeStream?: boolean, state?: S, lines: Line<S>[] }) {

    let state = opt?.state;
    let lines = opt?.lines;

    if (opt?.clean) commands.clean();

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

export class Components {
    divider() {
        return text("===============================================================");
    }
    br() {
        return text("\n");
    }
}

export class Spinner {

    private style?: Styles;
    private frames: (string | number)[] = ["⠋", "⠙", "⠸", "⠴", "⠦", "⠇"];
    private interval?: NodeJS.Timeout;
    private active = false;
    private prefix: string = "Loading"

    constructor(style?: Styles, prefix?: string, frames?: (string | number)[]) {
        if (frames) this.frames = frames;
        if (style) this.style = style;
        if (prefix) this.prefix = prefix;
    }

    start() {
        if (this.active) return;
        this.active = true;
        let i = 0;
        commands.hideCursor();

        this.interval = setInterval(() => {
            const frame = this.frames[i = (i + 1) % this.frames.length];
            const line = `${this.prefix} ${frame}`;
            readline.cursorTo(stream.out, 0);
            stream.out.write(text(line, this.style));
            stream.out.clearLine(1);
        }, 100);
    }

    stop(message?: string) {
        if (!this.active) return;
        clearInterval(this.interval);
        this.active = false;
        readline.clearLine(stream.out, 0);
        readline.cursorTo(stream.out, 0);
        commands.showCursor();
        if (message) stream.out.write(`${message}\n`);
    }
}

type StateAdapter<S> = ((result: string, state: S) => S);

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

        this.state = await draw<S>({ ...opt, state: this.state || {} as S, lines: this.lines }) || {} as S;
    }
}

process.on('exit', commands.showCursor);

process.on('SIGINT', () => {
    commands.showCursor();
    stream.in.setRawMode?.(false);
    stream.in.pause();
});
