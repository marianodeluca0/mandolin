import { AnsiEffects } from "./ansiiStyles";

export interface Styles {
    color?: string | number;
    bgcolor?: string | number;
    effect?: AnsiEffects[];
}

export type Line<S> = (string | ((state: S) => Promise<Partial<S>>));

export type Key = { name?: string; ctrl?: boolean };

export interface SelectConfig {
    noTTYFallbackText?: string;
    onAfterSelection?(value: string): void;
    onCancel?(): void;
}

export type InputPromptType = (question?: string, onAfterEnter?: (text: string) => void) => Promise<string>;

export type StateAdapter<S> = ((result: string, state: S) => S);
