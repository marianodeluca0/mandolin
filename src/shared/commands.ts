const readline = require('readline');

export default {
    close: () => process.stdin.pause(),
    clean: () => process.stdout.write("\x1Bc"),
    showCursor: () => process.stdout.write("\x1b[?25h"),
    hideCursor: () => process.stdout.write("\x1b[?25l"),
    highLightLine: (text: string) => `\x1b[47;30m> ${text}\x1b[0m`,
    cursorTo: (stream: NodeJS.WriteStream) => readline.cursorTo(stream, 0),
};
