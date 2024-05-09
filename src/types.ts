import type { Labelers } from "./labeler";

export type Func<T> = () => T | Promise<T>;

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
