import type { Labeler } from "./labeler";

export class NullLabeler
implements Labeler {
  start(label: string): void {
  }

  complete(label: string): void {
  }

  fail(label: string, e: Error): void {
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
