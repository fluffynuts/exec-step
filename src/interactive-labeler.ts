import * as colors from "ansi-colors";
import { type Labeler } from "./labeler";
import { type ExecStepConfiguration, type StepConfig } from "./types";
import { asciiPrefixes, defaultConfig } from "./defaults";
import { type StyleFunction } from "ansi-colors";

type ColorTransform = (s: string) => string;

export class InteractiveLabeler
implements Labeler {
  public get lastLineLength(): number {
    return (this._current || "").length;
  }

  private _current: string = "";
  private readonly _config: ExecStepConfiguration;
  private readonly _waitColor: ColorTransform;
  private readonly _okColor: ColorTransform;
  private readonly _failColor: ColorTransform;
  private readonly _prefixes: StepConfig<string>;
  private _indentChars: string = "";

  public get indent(): number {
    return this._indentChars.split("").length;
  }

  public set indent(value) {
    this._indentChars = " ".repeat(value);
  }

  constructor(cfg: ExecStepConfiguration) {
    this._config = { ...cfg };
    if (this._config.asciiPrefixes) {
      this._config.prefixes = asciiPrefixes;
    }
    if (this._config.prefixes === undefined) {
      this._config.prefixes = defaultConfig.prefixes;
    }
    const defaultColors = defaultConfig.colors as StepConfig<string>;
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
      wait: cfg.prefixes?.wait ?? defaultConfig.prefixes?.wait ?? "-wait-",
      ok: cfg.prefixes?.ok ?? defaultConfig.prefixes?.wait ?? "-ok-",
      fail: cfg.prefixes?.fail ?? defaultConfig.prefixes?.fail ?? "-fail-"
    };
    this.indent = cfg.indent;
  }

  start(label: string): void {
    const clear = this.createClear();
    this._current = `${this._waitColor(this._prefixes.wait)}  ${label}`;
    process.stdout.write(`${clear}${this._current}`);
  }

  complete(label: string): void {
    const clear = this.createClear();
    const message = `${this._okColor(this._prefixes.ok)}  ${label}`;
    this._current = "";
    process.stdout.write(`${clear}${message}\n`);
  }

  fail(label: string, e: Error): void {
    const clear = this.createClear();
    const message = `${this._failColor(this._prefixes.fail)}  ${label}`;
    this._current = "";
    process.stdout.write(`${clear}${message}\n`);
    if (!e || this._config.suppressErrorReporting) {
      return;
    }
    const errorMessage = this._config.dumpErrorStacks
      ? e.stack ?? e.toString()
      : e.message ?? e.toString();
    process.stderr.write(`${this._failColor(errorMessage)}\n`);
  }

  private createClear(): string {
    return `\r${" ".repeat(this.lastLineLength)}\r${this._indentChars}`;
  }

  suppressErrors(): void {
    this._config.throwErrors = false;
  }

  enableErrors(): void {
    this._config.throwErrors = false;
  }

  private resolveColorFunction(fn: string | undefined, fallback: string): ColorTransform {
    if (process.env.NO_COLOR) {
      return s => s;
    }
    const result = (colors as any)[fn ?? fallback] as ColorTransform;
    if (result === undefined) {
      console.warn(`${fn} is not a known ansi-colors style function; falling back on ${fallback}`);
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
