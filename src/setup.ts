import commands from "./commands";
import stream from "./stream";

export default () => {

    process.on('exit', commands.showCursor);

    process.on('SIGINT', () => {
        commands.showCursor();
        stream.in.removeAllListeners("keypress");
        stream.in.setRawMode(false);
        stream.in.pause();
    });
}
