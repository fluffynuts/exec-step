import { ExecStepContext } from "../src";

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
function instant() {
    // does nothing
}

(async () => {
    const ctx = new ExecStepContext();
    console.clear();
    await sleep(2000);
    await ctx.exec("initializing", () => sleep(2000));
    await ctx.exec("adding some numbers", instant);
    await ctx.exec("checking my mail", instant);
    await ctx.exec("reticulating splines", () => sleep(1500));
    await ctx.exec("making the world a better place", () => sleep(10000));
})();
