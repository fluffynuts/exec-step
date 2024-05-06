import { type ExecStepConfiguration, type StepConfig } from "./types";

export const utf8Prefixes: StepConfig<string> = {
  wait: "🟡",
  ok: "🟢",
  fail: "🔴"
};

export const asciiPrefixes: StepConfig<string> = {
  wait: "[ WAIT ]",
  ok: "[  OK  ]",
  fail: "[ FAIL ]"
};

export const defaultConfig: ExecStepConfiguration = {
  colors: {
    wait: "yellowBright",
    ok: "greenBright",
    fail: "redBright"
  },
  throwErrors: true,
  dumpErrorStacks: false,
  suppressErrorReporting: false,
  asciiPrefixes: false,
  prefixes: { ...utf8Prefixes },
  ciMode: false,
  indent: 0
};
