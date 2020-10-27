exec-step
---
executes a step in a series with console feedback

![demo](demo.gif)

usage
---
```typescript
import { ExecStepContext } from "exec-step";

function takesAWhile() {
    return new Promise(resolve => setTimeout(resolve, 5000));
}

function isQuick() {
  // does nothing!
}

(async () => {
    const ctx = new ExecStepContext();
    ctx.exec("please wait", takesAWhile);
    ctx.exec("done quickly!", isQuick);
})();
```

options
----

construct with optional options of the shape:
```typescript
export interface ExecStepConfiguration {
    asciiPrefixes?: boolean;
    prefixes?: PartialStepConfig<string>;
    colors?: PartialStepConfig<string>;
    throwErrors?: boolean;
    dumpErrorStacks?: boolean;
}
```

defaults are: 
```typescript
const defaultConfig: ExecStepConfiguration = {
    colors: {
        wait: "yellowBright",
        ok: "greenBright",
        fail: "redBright"
    },
    throwErrors: true,
    dumpErrorStacks: false
};
```

by default, exec-step reports wait/ok/fail status with utf-8 characters:
```typescript
const utf8Prefixes: PartialStepConfig<string> = {
    wait: "⌛",
    ok: "✔",
    fail: "✖"
};
```

but can use ascii -- either via the `prefixes` part of the config, or by
observing the environment variable `ASCII_STEP_MARKERS` for a truthy value
like `1` or `true` -- useful at CI. If that's set, you get the following prefixes:

```typescript
const asciiPrefixes: PartialStepConfig<string> = {
    wait: "[ WAIT ]",
    ok: "[  OK  ]",
    fail: "[ FAIL ]"
}
```
