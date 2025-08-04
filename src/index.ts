// noinspection PointlessBooleanExpressionJS
import type { ExecStepConfiguration, Func, IExecStepContext } from "./types";
import { asciiPrefixes, defaultConfig, utf8Prefixes } from "./defaults";
import { InteractiveLabeler } from "./interactive-labeler";
import { type Labeler, Labelers } from "./labeler";
import { CiLabeler } from "./ci-labeler";
import { NullLabeler } from "./null-labeler";

export { Labelers } from "./labeler";

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

export class ExecStepContext implements IExecStepContext {
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

  private _labeler: Labeler;

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

  private _originalLabeler: Labeler | undefined;

  public mute(): void {
    if (this._labeler instanceof NullLabeler) {
      return; // already muted
    }
    this._originalLabeler = this._labeler;
    this._labeler = new NullLabeler();
  }

  public unmute(): void {
    if (!this._originalLabeler) {
      // not muted
      return;
    }
    this._labeler = this._originalLabeler;
    this._originalLabeler = undefined;
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
        // TS and WebStorm really want me to drop the === here,
        // but the reality is that the caller could be coming
        // in from the wicky-wild-west of JS-land and asciiPrefixes
        // could be absolutely anything.
        if ((result.asciiPrefixes as any) === true) {
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

  private fail(label: string, e: Error | undefined): void {
    this._labeler.fail(label, e);
  }

  public exec<T>(
    label: string,
    func: Func<T>
  ): T {
    try {
      this.start(label);
      const funcResult = func() as any;
      if (funcResult === undefined ||
        typeof funcResult.then !== "function") {
        this.complete(label);
        return funcResult as T;
      } else {
        return funcResult.then((result: T) => {
          this.complete(label);
          return result;
        })
        .catch((err: any) => {
          if (err instanceof ExecStepOverrideMessage) {
            this.fail(err.message, undefined);
            if (err.rethrow !== undefined && !err.rethrow) {
              return;
            }
          } else {
            this.fail(label, err);
          }
          if (this._config.throwErrors) {
            throw err;
          }
        });
      }
    } catch (e) {
      let err = e;
      if (err instanceof ExecStepOverrideMessage) {
        this.fail(err.message, undefined);
        if (err.rethrow !== undefined && !err.rethrow) {
          return undefined as unknown as T;
        }
        err = err.originalError;
      } else {
        this.fail(label, err as Error);
      }
      if (this._config.throwErrors) {
        throw err;
      }
      // if the caller has suppressed errors,
      // then getting an unexpected undefined
      // shouldn't matter
      // -> I'm just trying to keep the interface simple
      return undefined as unknown as T;
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

export const ctx = new ExecStepContext() as IExecStepContext;

export class ExecStepOverrideMessage
  extends Error {
  constructor(
    message: string,
    public originalError: Error,
    public rethrow: boolean
  ) {
    super(message);
  }
}
