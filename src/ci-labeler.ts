import { type Labeler, LabelerBase } from "./labeler";
import { type ExecStepConfiguration } from "./types";
import { defaultConfig } from "./defaults";

function write(s: string): number {
  process.stdout.write(s);
  return s.length;
}

export class CiLabeler
  extends LabelerBase
  implements Labeler {
  private readonly _ok: string;
  private readonly _fail: string;
  private _indent: string;
  private _lastLineLength: number = 0;

  constructor(private readonly _options: ExecStepConfiguration) {
    super();
    this._ok = this._options?.prefixes?.ok ?? defaultConfig.prefixes?.ok ?? "ok";
    this._fail = this._options?.prefixes?.fail ?? defaultConfig.prefixes?.fail ?? "fail";
    this._indent = " ".repeat(this._options.indent);
  }

  public get lastLineLength(): number {
    return this._lastLineLength;
  }

  public get indent(): number {
    return this._indent.split("").length;
  }

  public set indent(value) {
    this._indent = " ".repeat(value);
  }

  complete(_: string): void {
    this._lastLineLength = 0;
    write(`${this._indent}${this._ok}\n`);
  }

  enableErrorReporting(): void {
    this._options.suppressErrorReporting = false;
  }

  enableErrors(): void {
    this._options.throwErrors = true;
  }

  fail(_: string, e: Error): void {
    this._lastLineLength = 0;
    write(`${this._indent}${this._fail}\n`);
    if (this._options.throwErrors) {
      throw e;
    }
  }

  start(label: string): void {
    this._lastLineLength = write(`${this._indent}${label}...${this._iconPaddingChars}`);
  }

  suppressErrorReporting(): void {
    this._options.suppressErrorReporting = true;
  }

  suppressErrors(): void {
    this._options.throwErrors = true;
  }
}
