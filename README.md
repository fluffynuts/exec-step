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

error handling
---

by default, exec-step will print out the task label with the failure marker
of your choosing and re-throw the error, however, you can take complete control
by handling errors within your task and throwing an ExecStepOverrideMessage error, 
eg:

```typescript
await ctx.exec("do the thing", async () => {
    try {
        await attemptToDoTheThing();
    } catch (e) {
        throw new ExecStepOverrideMessage(
            // overrides the error label
            `Error whilst attempting to do the thing: ${e.message}`,
            // original error, rethrown if allowed
            e,
            // suppress the error being thrown with false, or 
            // set this true to rethrow the original error
            // if the context's default behavior is to throw
            false
        );
    }
});
```

testing
---

to avoid output in your tests, do something like:

```
import { ctx } from "exec-step"

describe("the thing", () => {
    beforeEach(() => {
        ctx.mute();
    });
});
```
