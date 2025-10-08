import { ValuesOf } from "@virtual-registry/ts-utils";

export type AnsiEffects =
    | 'reset'
    | 'bold'
    | 'dim'
    | 'italic'
    | 'underline'
    | 'blink'
    | 'inverse'
    | 'hidden'
    | 'strike';

export const ansiEffects = {
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

export const ansiCodes = {

    // Foreground standard (30–37)
    black: 30,
    red: 31,
    green: 32,
    yellow: 33,
    blue: 34,
    magenta: 35,
    cyan: 36,
    white: 37,

    // Background standard (40–47)
    bgBlack: 40,
    bgRed: 41,
    bgGreen: 42,
    bgYellow: 43,
    bgBlue: 44,
    bgMagenta: 45,
    bgCyan: 46,
    bgWhite: 47,

    // Foreground bright (90–97)
    brightBlack: 90,
    brightRed: 91,
    brightGreen: 92,
    brightYellow: 93,
    brightBlue: 94,
    brightMagenta: 95,
    brightCyan: 96,
    brightWhite: 97,

    // Background bright (100–107)
    bgBrightBlack: 100,
    bgBrightRed: 101,
    bgBrightGreen: 102,
    bgBrightYellow: 103,
    bgBrightBlue: 104,
    bgBrightMagenta: 105,
    bgBrightCyan: 106,
    bgBrightWhite: 107,
};

export function ansistyle(type: ValuesOf<typeof ansiEffects> | 38 | 48, text: string, color?: string | number) {

    switch (type) {

        case 38:
        case 48:
            return `\x1b[${type};5;${color || 0}m${text}\x1b[0m`;

        default:
            return `\x1b[${type}m${text}`;
    }
}
