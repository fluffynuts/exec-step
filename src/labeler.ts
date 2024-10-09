export interface Labeler {
  start: (label: string) => void;
  complete: (label: string) => void;
  fail: (label: string, e: Error | undefined) => void;
  suppressErrors: () => void;
  suppressErrorReporting: () => void;
  enableErrorReporting: () => void;
  enableErrors: () => void;
  indent: number;
  iconPadding: number;
  readonly lastLineLength: number;
}

export abstract class LabelerBase {
  public get iconPadding(): number {
    return this._iconPaddingChars.length;
  }

  public set iconPadding(value: number) {
    this._iconPaddingChars = " ".repeat(value < 0 ? 0 : value);
  }

  protected _iconPaddingChars = " ";
}

export enum Labelers {
  none,
  interactive,
  ci
}
