import * as colors from "ansi-colors";
import { StyleFunction } from "ansi-colors";

export type Func<T> = () => T | Promise<T>;

interface PartialStepConfig<T> {
    wait: T;
    ok: T;
    fail: T;
}

export interface ExecStepConfiguration {
    prefixes?: PartialStepConfig<string>;
    colors?: PartialStepConfig<string>;
    throwErrors?: boolean;
    dumpErrorStacks?: boolean;
}

const defaultConfig: ExecStepConfiguration = {
    prefixes: {
        wait: "[ WAIT ]",
        ok: "[  OK  ]",
        fail: "[ FAIL ]"
    },
    colors: {
        wait: "yellowBright",
        ok: "greenBright",
        fail: "redBright"
    },
    throwErrors: true,
    dumpErrorStacks: false
};

export class Context {
    private _config: ExecStepConfiguration;
    private readonly _waitColor: StyleFunction;
    private readonly _okColor: StyleFunction;
    private readonly _failColor: StyleFunction;

    private _current: string = "";
    private _prefixes: PartialStepConfig<string>;

    constructor(config?: ExecStepConfiguration) {
        if (defaultConfig.colors === undefined ||
            defaultConfig.prefixes === undefined) {
            throw new Error(`internal default config is fuxed`);
        }
        this._config = Object.assign({}, defaultConfig, config) as ExecStepConfiguration;
        if (this._config.prefixes === undefined) {
            this._config.prefixes = defaultConfig.prefixes;
        }
        this._waitColor = this.resolveColorFunction(
            this._config.colors?.wait,
            defaultConfig.colors.wait);
        this._okColor = this.resolveColorFunction(
            this._config.colors?.ok,
            defaultConfig.colors.ok);
        this._failColor = this.resolveColorFunction(
            this._config.colors?.fail,
            defaultConfig.colors.fail);
        this._prefixes = this._config.prefixes;
    }

    private resolveColorFunction(fn: string | undefined, fallback: string): StyleFunction {
        const result = (colors as any)[fn || fallback] as StyleFunction;
        if (result === undefined) {
            console.warn(`${ fn } is not a known ansi-colors style function; falling back on ${ fallback }`);
            return (colors as any)[fallback] as StyleFunction;
        }
        return result;
    }

    private start(label: string) {
        const clear = this.createClear();
        this._current = `${ this._waitColor(this._prefixes.wait) } ${ label }`;
        process.stdout.write(`${ clear }${ this._current }`);
    }

    private createClear() {
        const priorLength = (this._current || "").length;
        return `\r${ " ".repeat(priorLength) }\r`;
    }

    private complete(label: string) {
        const clear = this.createClear();
        const message = `${ this._okColor(this._prefixes.ok) } ${ label }`;
        this._current = "";
        process.stdout.write(`${ clear }${ message }\n`);
    }

    private fail(label: string, e: Error) {
        const clear = this.createClear();
        const message = `${ this._failColor(this._prefixes.fail) } ${ label }`;
        this._current = "";
        process.stdout.write(`${ clear }${ message }\n`);
        if (!e) {
            return;
        }
        const errorMessage = this._config.dumpErrorStacks
            ? e.stack || e.toString()
            : e.message || e.toString();
        process.stderr.write(`${ this._failColor(errorMessage) }\n`);
    }

    exec<T>(
        label: string,
        func: Func<T>
    ): T | Promise<T | void> | void {
        try {
            this.start(label);
            const funcResult = func() as Promise<T>;
            if (funcResult === undefined ||
                typeof funcResult.then !== "function") {
                this.complete(label);
                return funcResult;
            } else {
                return funcResult.then(result => {
                    this.complete(label);
                    return result;
                }).catch(err => {
                    this.fail(label, err);
                    if (this._config.throwErrors) {
                        throw err;
                    }
                });
            }
        } catch (e) {
            this.fail(label, e);
            if (this._config.throwErrors) {
                throw e;
            }
        }
    }

}

