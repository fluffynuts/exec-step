// noinspection PointlessBooleanExpressionJS
import { type ExecStepConfiguration, type Func } from "./types";
import { asciiPrefixes, defaultConfig, utf8Prefixes } from "./defaults";
import { InteractiveLabeler } from "./interactive-labeler";
import { type Labeler, Labelers } from "./labeler";
import { CiLabeler } from "./ci-labeler";
import { NullLabeler } from "./null-labeler";

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
  public get config(): ExecStepConfiguration {
    return { ...this._config };
  }

  public get lastLineLength(): number {
    return this._labeler.lastLineLength;
  }

  public get iconPadding(): number {
    return this._labeler.iconPadding;
  }

  public set iconPadding(value: number) {
    this._labeler.iconPadding = value;
  }

  private readonly _config: ExecStepConfiguration;

  private readonly _labeler: Labeler;

  public get indent(): number {
    return this._labeler.indent;
  }

  public set indent(value: number) {
    this._labeler.indent = value;
  }

  constructor(config?: Partial<ExecStepConfiguration> | "ascii") {
    const conf = this._config = this._resolveConfig(config);
    if (conf.labeler === undefined) {
      if (conf.ciMode) {
        this._labeler = new CiLabeler(conf);
      } else {
        this._labeler = new InteractiveLabeler(conf);
      }
    } else {
      switch (conf.labeler) {
        case Labelers.interactive:
        case undefined:
        case null:
          this._labeler = new InteractiveLabeler(conf);
          break;
        case Labelers.ci:
          this._labeler = new CiLabeler(conf);
          break;
        case Labelers.none:
          this._labeler = new NullLabeler();
      }
    }
  }

  private _resolveConfig(config?: Partial<ExecStepConfiguration> | "ascii"): ExecStepConfiguration {
    const defaults = { ...defaultConfig };
    defaults.prefixes = envFlag("ASCII_STEP_MARKERS", false)
      ? asciiPrefixes
      : utf8Prefixes;

    let result: ExecStepConfiguration;
    if (config === "ascii") {
      result = {
        ...defaults,
        prefixes: asciiPrefixes
      };
      if (process.env.ASCII_STEP_MARKERS !== undefined) {
        // env overrides always
        result.prefixes = defaults.prefixes;
      }
    } else {
      result = { ...config } as ExecStepConfiguration;
      if (!!config) {
        if (config.ciMode === true && config.asciiPrefixes === undefined) {
          result.asciiPrefixes = true;
        }
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-boolean-literal-compare
        if (result.asciiPrefixes === true) {
          result.prefixes = asciiPrefixes;
        }
      } else {
        result = { ...defaults };
      }
    }
    return Object.assign({}, defaults, result) as ExecStepConfiguration;
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

export const ctx = new ExecStepContext();
