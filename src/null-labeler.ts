import type { Labeler } from "./labeler";

export class NullLabeler
implements Labeler {
  start(_: string): void {
  }

  complete(_: string): void {
  }

  fail(_: string, __: Error | undefined): void {
  }

  suppressErrors(): void {
  }

  suppressErrorReporting(): void {
  }

  enableErrorReporting(): void {
  }

  enableErrors(): void {
  }

  public indent = 0;
  public iconPadding = 0;
  public lastLineLength = 0;
}
