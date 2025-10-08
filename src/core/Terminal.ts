
import { draw } from '../helpers/draw';
import { text } from '../helpers/text';
import setup from '../setup';
import { Line, StateAdapter, Styles } from '../types';
import { InputPrompt } from './InputPrompt';
import { SelectPrompt } from './SelectPrompt';

/**
 * initialize sigint / exit fallback events
 */
setup();

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
