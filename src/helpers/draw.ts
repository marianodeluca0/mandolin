import commands from "../commands";
import { Line } from "../types";

export async function draw<S>(opt: { clean?: boolean, closeStream?: boolean, state?: S, lines: Line<S>[] }) {

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
