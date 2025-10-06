import { start } from "repl";
import { InputPromptType } from "../inputs";

export type TextEffect =
    | 'reset'
    | 'bold'
    | 'dim'
    | 'italic'
    | 'underline'
    | 'blink'
    | 'inverse'
    | 'hidden'
    | 'strike';

export const EFFECT_CODES: Record<TextEffect, number> = {
    reset: 0,
    bold: 1,
    dim: 2,
    italic: 3,
    underline: 4,
    blink: 5,
    inverse: 7,
    hidden: 8,
    strike: 9,
};

export class MlinBuilder {

    private textValue = '';
    private fg?: string;
    private bg?: string;
    private effects: TextEffect[] = [];

    static text(text: string) {
        const builder = new MlinBuilder();
        builder.textValue = text;
        return builder;
    }

    color(color: string) {
        this.fg = color;
        return this;
    }

    bgcolor(color: string) {
        this.bg = color;
        return this;
    }

    add(effect: TextEffect) {
        this.effects.push(effect);
        return this;
    }

    build() {
        const seq: string[] = [];

        for (const e of this.effects) seq.push(`\x1b[${EFFECT_CODES[e]}m`);
        if (this.fg) seq.push(`\x1b[38;5;${this.fg}m`);
        if (this.bg) seq.push(`\x1b[48;5;${this.bg}m`);

        return `${seq.join('')}${this.textValue}\x1b[0m`;
    }

    toString() {
        return this.build();
    }
}
