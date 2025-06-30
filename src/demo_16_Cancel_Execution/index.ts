import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import {
  RunnablePassthrough,
  RunnableSequence,
} from "@langchain/core/runnables";
import { model } from "../model";

// 定义提示模板
const prompt = ChatPromptTemplate.fromTemplate(
  `根据以下上下文尽力回答问题：\n<context>{context}</context>\n问题: {question}`
);

// 构建链
const chain = RunnableSequence.from([
  {
    context: () => `测试测试测试，非正常上下文`,
    question: new RunnablePassthrough(),
  },
  prompt,
  model,
  new StringOutputParser(),
]);

// 示例1: 正常调用链
async function example1_normalInvoke() {
  console.log("--- 示例 1: 正常调用 ---");
  const result = await chain.invoke("旧金山现在天气如何？");
  console.log(result);
}

// 示例2: 使用 AbortController 取消 invoke 调用
async function example2_cancelInvoke() {
  console.log("\n--- 示例 2: 使用 AbortController 取消 invoke 调用 ---");
  const controller = new AbortController();

  console.time("计时器1");
  setTimeout(() => controller.abort(), 10); // 10毫秒后取消

  try {
    await chain.invoke("旧金山现在天气如何？", {
      signal: controller.signal,
    });
  } catch (e) {
    console.log("捕获到错误:", e);
  }
  console.timeEnd("计时器1");
}

// 示例3: 在流式传输中使用 break (对比)
async function example3_streamWithBreak() {
  console.log("\n--- 示例 3: 在流式传输中使用 break (对比) ---");
  console.time("计时器2");
  const stream = await chain.stream("旧金山现在天气如何？");
  for await (const chunk of stream) {
    console.log("块", chunk);
    break; // 只获取第一个块就退出
  }
  console.timeEnd("计时器2");
}

// 示例4: 使用 AbortController 取消流式传输
async function example4_cancelStream() {
  console.log("\n--- 示例 4: 使用 AbortController 取消流式传输 ---");
  const controllerForStream = new AbortController();

  console.time("计时器3");
  setTimeout(() => controllerForStream.abort(), 10); // 10毫秒后取消

  try {
    const streamWithSignal = await chain.stream(
      "旧金山现在天气如何？",
      {
        signal: controllerForStream.signal,
      }
    );
    for await (const chunk of streamWithSignal) {
      console.log(chunk);
    }
  } catch (e) {
    console.log("捕获到错误:", e);
  }
  console.timeEnd("计时器3");
}

async function main() {
  await example1_normalInvoke();
  await example2_cancelInvoke();
  await example3_streamWithBreak();
  await example4_cancelStream();
}

main();