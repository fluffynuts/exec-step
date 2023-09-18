import { ExecStepConfiguration, PartialStepConfig } from "./types";

export const utf8Prefixes: PartialStepConfig<string> = {
    wait: "⌛",
    ok: "✔",
    fail: "✖"
};

export const asciiPrefixes: PartialStepConfig<string> = {
    wait: "[ WAIT ]",
    ok: "[  OK  ]",
    fail: "[ FAIL ]"
}

export const defaultConfig: ExecStepConfiguration = {
    colors: {
        wait: "yellowBright",
        ok: "greenBright",
        fail: "redBright"
    },
    throwErrors: true,
    dumpErrorStacks: false
};

