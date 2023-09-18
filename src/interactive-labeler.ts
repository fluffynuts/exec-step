import * as colors from "ansi-colors";
import { Labeler } from "./labeler";
import { ExecStepConfiguration, PartialStepConfig } from "./types";
import { asciiPrefixes, defaultConfig } from "./defaults";
import { StyleFunction } from "ansi-colors";

export class InteractiveLabeler
    implements Labeler {
    private _current: string = "";
    private readonly _config: ExecStepConfiguration;
    private readonly _waitColor: StyleFunction;
    private readonly _okColor: StyleFunction;
    private readonly _failColor: StyleFunction;
    private readonly _prefixes: PartialStepConfig<string>;

    constructor(cfg: ExecStepConfiguration) {
        this._config = { ...cfg };
        if (this._config.asciiPrefixes) {
            this._config.prefixes = asciiPrefixes;
        }
        if (this._config.prefixes === undefined) {
            this._config.prefixes = defaultConfig.prefixes;
        }
        const defaultColors = defaultConfig.colors || {} as PartialStepConfig<string>
        this._waitColor = this.resolveColorFunction(
            this._config.colors?.wait,
            defaultColors.wait
        );
        this._okColor = this.resolveColorFunction(
            this._config.colors?.ok,
            defaultColors.ok
        );
        this._failColor = this.resolveColorFunction(
            this._config.colors?.fail,
            defaultColors.fail
        );
        this._prefixes = {
            wait: cfg.prefixes?.wait ?? defaultConfig.prefixes!.wait,
            ok: cfg.prefixes?.ok ?? defaultConfig.prefixes!.wait,
            fail: cfg.prefixes?.fail ?? defaultConfig.prefixes!.fail
        };
    }

    complete(label: string): void {
        const clear = this.createClear();
        const message = `${ this._okColor(this._prefixes.ok) } ${ label }`;
        this._current = "";
        process.stdout.write(`${ clear }${ message }\n`);
    }

    private createClear() {
        const priorLength = (this._current || "").length;
        return `\r${ " ".repeat(priorLength) }\r`;
    }

    fail(label: string, e: Error): void {
        const clear = this.createClear();

        const message = `${ this._failColor(this._prefixes.fail) } ${ label }`;
        this._current = "";
        process.stdout.write(`${ clear }${ message }\n`);
        if (!e || this._config.suppressErrorReporting) {
            return;
        }
        const errorMessage = this._config.dumpErrorStacks
            ? e.stack || e.toString()
            : e.message || e.toString();
        process.stderr.write(`${ this._failColor(errorMessage) }\n`);
    }

    start(label: string): void {
        const clear = this.createClear();
        this._current = `${ this._waitColor(this._prefixes.wait) } ${ label }`;
        process.stdout.write(`${ clear }${ this._current }`);
    }

    suppressErrors(): void {
        this._config.throwErrors = false;
    }

    enableErrors(): void {
        this._config.throwErrors = false;
    }

    private resolveColorFunction(fn: string | undefined, fallback: string): StyleFunction {
        const result = (colors as any)[fn || fallback] as StyleFunction;
        if (result === undefined) {
            console.warn(`${ fn } is not a known ansi-colors style function; falling back on ${ fallback }`);
            return (colors as any)[fallback] as StyleFunction;
        }
        return result;
    }

    enableErrorReporting(): void {
        this._config.suppressErrorReporting = false;
    }

    suppressErrorReporting(): void {
        this._config.suppressErrorReporting = true;
    }
}

