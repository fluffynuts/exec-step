export interface Labeler {
    start(label: string): void;

    complete(label: string): void;

    fail(label: string, e: Error): void;

    suppressErrors(): void;

    suppressErrorReporting(): void;
    enableErrorReporting(): void;

    enableErrors(): void;
}

