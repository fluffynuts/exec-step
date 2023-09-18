import { ExecStepContext } from "../src";

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function instant() {
    // does nothing
}

const
    initTime = 2000,
    splineTime = 1500,
    betterTime = 3000;

async function defaultDemo() {
    console.clear();
    console.log(" ---- default demo ----");
    const ctx = new ExecStepContext();
    await ctx.exec("initializing", () => sleep(initTime));
    await ctx.exec("adding some numbers", instant);
    await ctx.exec("checking my mail", instant);
    await ctx.exec("reticulating splines", () => sleep(splineTime));
    await ctx.exec("making the world a better place", () => sleep(betterTime));
}

async function ciDemo() {
    console.clear();
    console.log(" ---- ci demo ----");
    const ctx = new ExecStepContext({ ciMode: true });
    await ctx.exec("initializing", () => sleep(initTime));
    await ctx.exec("adding some numbers", instant);
    await ctx.exec("checking my mail", instant);
    await ctx.exec("reticulating splines", () => sleep(splineTime));
    await ctx.exec("making the world a better place", () => sleep(betterTime));
}

(async () => {
    await defaultDemo();
    await ciDemo();
})();
