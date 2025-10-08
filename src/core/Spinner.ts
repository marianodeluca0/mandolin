import commands from "../commands";
import { text } from "../helpers/text";
import stream from "../stream";
import { Styles } from "../types";
import * as readline from "readline";

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
