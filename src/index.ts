import * as colors from "ansi-colors";
import { type StyleFunction } from "ansi-colors";
import { type ExecStepConfiguration, type Func } from "./types";
import { asciiPrefixes, defaultConfig, utf8Prefixes } from "./defaults";
import { InteractiveLabeler } from "./interactive-labeler";
import { type Labeler } from "./labeler";
import { CiLabeler } from "./ci-labeler";

function envFlag(name: string, fallback: boolean = false): boolean {
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
  ].includes(envValue.toLowerCase());
}

export class ExecStepContext {
  private readonly _config: ExecStepConfiguration;
  private readonly _labeler: Labeler;

  constructor(config?: ExecStepConfiguration | "ascii") {
    const defaults = { ...defaultConfig };
    defaults.prefixes = envFlag("ASCII_STEP_MARKERS", false)
      ? asciiPrefixes
      : utf8Prefixes;

    if (config === "ascii") {
      config = {
        ...defaults,
        prefixes: asciiPrefixes
      };
      if (process.env.ASCII_STEP_MARKERS !== undefined) {
        // env overrides always
        config.prefixes = defaults.prefixes;
      }
    } else {
      if (!!config) {
        if (config.ciMode === true && config.asciiPrefixes === undefined) {
          config.asciiPrefixes = true;
        }
        if (config.asciiPrefixes === true) {
          config.prefixes = asciiPrefixes;
        }
      } else {
        config = { ...defaults };
      }
    }

    const conf = this._config = Object.assign({}, defaults, config) as ExecStepConfiguration;
    if (config.ciMode) {
      this._labeler = new CiLabeler(conf);
    } else {
      this._labeler = new InteractiveLabeler(conf);
    }
  }

  private resolveColorFunction(fn: string | undefined, fallback: string): StyleFunction {
    const result = (colors as any)[fn ?? fallback] as StyleFunction;
    if (result === undefined) {
      console.warn(`${fn} is not a known ansi-colors style function; falling back on ${fallback}`);
      return (colors as any)[fallback] as StyleFunction;
    }
    return result;
  }

  private start(label: string): void {
    this._labeler.start(label);
  }

  private complete(label: string): void {
    this._labeler.complete(label);
  }

  private fail(label: string, e: Error): void {
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
