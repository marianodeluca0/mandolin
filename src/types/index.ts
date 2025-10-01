
export type Key = { name?: string; ctrl?: boolean };

export interface SelectConfig {
    noTTYFallbackText?: string;
    onAfterSelection?(value: string): void;
    onCancel?(): void;
}
