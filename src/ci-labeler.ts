import { type Labeler } from "./labeler";
import { type ExecStepConfiguration } from "./types";
import { defaultConfig } from "./defaults";

function write (s: string): void {
  process.stdout.write(s);
}

export class CiLabeler
implements Labeler {
  private readonly _ok: string;
  private readonly _fail: string;

  constructor (private readonly _options: ExecStepConfiguration) {
    this._ok = this._options?.prefixes?.ok ?? defaultConfig.prefixes?.ok ?? "ok";
    this._fail = this._options?.prefixes?.fail ?? defaultConfig.prefixes?.fail ?? "fail";
  }

  complete (_: string): void {
    write(`${this._ok}\n`);
  }

  enableErrorReporting (): void {
    this._options.suppressErrorReporting = false;
  }

  enableErrors (): void {
    this._options.throwErrors = true;
  }

  fail (_: string, e: Error): void {
    write(`${this._fail}\n`);
    if (!!this._options.throwErrors) {
      throw e;
    }
  }

  start (label: string): void {
    write(`${label}...`);
  }

  suppressErrorReporting (): void {
    this._options.suppressErrorReporting = true;
  }

  suppressErrors (): void {
    this._options.throwErrors = true;
  }
}
