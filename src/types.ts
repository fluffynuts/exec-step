export type Func<T> = () => T | Promise<T>;

export interface PartialStepConfig<T> {
  wait: T;
  ok: T;
  fail: T;
}

export interface ExecStepConfiguration {
  suppressErrorReporting?: boolean;
  asciiPrefixes?: boolean;
  prefixes?: PartialStepConfig<string>;
  colors?: PartialStepConfig<string>;
  throwErrors?: boolean;
  dumpErrorStacks?: boolean;
  ciMode?: boolean;
}
