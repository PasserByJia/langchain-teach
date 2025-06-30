import { RunnableParallel, RunnablePassthrough} from "@langchain/core/runnables";

async function main() {
  // 示例 1: 基本用法
  console.log('--- 基本用法 ---');
  const runnable = RunnableParallel.from({
    extra: RunnablePassthrough.assign({
      mult: (input: { num: number }) => input.num * 3,
      modified: (input: { num: number }) => input.num + 1,
    }),
  });
  const result1 = await runnable.invoke({ num: 1 });
  console.log(result1);
  // 期望输出: { extra: { num: 1, mult: 3, modified: 2 } }
}

main();