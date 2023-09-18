import * as colors from "ansi-colors";
import { StyleFunction } from "ansi-colors";
import { ExecStepConfiguration, Func, PartialStepConfig } from "./types";
import { asciiPrefixes, defaultConfig, utf8Prefixes } from "./defaults";
import { InteractiveLabeler } from "./interactive-labeler";
import { Labeler } from "./labeler";

function envFlag(name: string, fallback: boolean = false) {
    const envValue = process.env[name];
    if (envValue === undefined) {
        return fallback;
    }
    return [
               "1",
               "true",
               "yes",
               "on",
               "ok"
           ].indexOf(envValue.toLowerCase()) > -1;
}

export class ExecStepContext {
    private _config: ExecStepConfiguration;
    private _labeler: Labeler;

    constructor(config?: ExecStepConfiguration | "ascii") {

        const defaults = { ...defaultConfig };
        defaults.prefixes = envFlag("ASCII_STEP_MARKERS", false)
            ? asciiPrefixes
            : utf8Prefixes;

        if (!config) {
            throw new Error(`config has gone missing`);
        }
        if (config === "ascii") {
            config = {
                ...defaults,
                prefixes: asciiPrefixes
            }
            if (process.env.ASCII_STEP_MARKERS !== undefined) {
                // env overrides always
                config.prefixes = defaults.prefixes;
            }
        } else if (config.asciiPrefixes) {
            config.prefixes = asciiPrefixes;
        }

        const conf = this._config = Object.assign({}, defaults, config) as ExecStepConfiguration;
        if (config.ciMode) {
            this._labeler = {} as Labeler;
        } else {
            this._labeler = new InteractiveLabeler(conf);
        }
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
        this._labeler.start(label);
    }

    private complete(label: string) {
        this._labeler.complete(label);
    }

    private fail(label: string, e: Error) {
        this._labeler.fail(label, e);
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
            this.fail(label, e as Error);
            if (this._config.throwErrors) {
                throw e;
            }
        }
    }

    public suppressErrors(): void {
        this._labeler.suppressErrors();
    }

    public enableErrors(): void {
        this._labeler.enableErrors();
    }

    public suppressErrorReporting(): void {
        this._labeler.suppressErrorReporting();
    }

    public enableErrorReporting(): void {
        this._labeler.enableErrorReporting();
    }

}

