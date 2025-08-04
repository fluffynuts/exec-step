import type { Labelers } from "./labeler";

export type Func<T> = () => T;

export interface StepConfig<T> {
  wait: T;
  ok: T;
  fail: T;
}

export type PartialStepConfig<T> = Partial<StepConfig<T>>;

export interface ExecStepConfiguration {
  suppressErrorReporting: boolean;
  asciiPrefixes: boolean;
  prefixes: PartialStepConfig<string>;
  colors: PartialStepConfig<string>;
  throwErrors: boolean;
  dumpErrorStacks: boolean;
  /**
   * deprecated - rather use the labeller property
   */
  ciMode: boolean;
  labeler?: Labelers;
  indent: number;
}

export interface IExecStepContext {
  readonly config: ExecStepConfiguration;
  readonly lastLineLength: number;
  iconPadding: number;
  indent: number;

  exec<T>(label: string, fn: () => T): T;

  mute(): void;
  unmute(): void;
  suppressErrors(): void;
  enableErrors(): void;
  suppressErrorReporting(): void;
  enableErrorReporting(): void;
}
