import stream from "./stream";
import * as readline from "readline";

/**
 * Terminal command utilities.
 * Provides a consistent interface for controlling
 * terminal cursor, screen clearing, and formatting.
 */
export default {
    /**
     * Gracefully stops input stream reading.
     * Useful for ending interactive prompts or selections.
     */
    close: () => stream.in.pause(),

    /**
     * Clears the entire terminal screen.
     * Equivalent to running the `clear` command.
     */
    clearScreen: () => stream.out.write("\x1Bc"),

    /**
     * Shows the terminal cursor if it was hidden.
     */
    showCursor: () => stream.out.write("\x1b[?25h"),

    /**
     * Hides the terminal cursor — useful during animations or prompts.
     */
    hideCursor: () => stream.out.write("\x1b[?25l"),

    /**
     * Highlights text using white background and black foreground.
     * Returns a formatted string (does not write directly).
     */
    highlight: (text: string | number | boolean) => `\x1b[47;30m  ${text}  \x1b[0m`,

    /**
     * Moves the cursor to the beginning of a given stream line.
     * Default usage resets cursor to column 0.
     */
    cursorToStart: (target: NodeJS.WriteStream = stream.out) => readline.cursorTo(target, 0),

    /**
     * Clears the current line content.
     * Useful before re-printing an updated line (e.g., progress indicators).
     */
    clearLine: () => readline.clearLine(stream.out, 0),
};
