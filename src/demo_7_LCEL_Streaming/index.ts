import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { model } from "../model";

const streamingDemo = async () => {

  // 创建一个提示模板
  const prompt = ChatPromptTemplate.fromTemplate(
    "给我讲一个关于{topic}的笑话"
  );

  // 使用 LCEL 创建一个链
  const chain = prompt.pipe(model).pipe(new StringOutputParser());

  // 调用链的 .stream() 方法来获取一个可读流
  const stream = await chain.stream({
    topic: "parrot",
  });

  // 迭代流并打印每个数据块
  console.log("--- 正在流式输出 ---");
  for await (const chunk of stream) {
    // 使用 process.stdout.write 来避免每次都换行，使输出更像打字机效果
    process.stdout.write(chunk);
  }
  console.log(); // 最后输出一个换行符
};

const streamEventsDemo = async () => {
  // 创建一个提示模板
  const prompt = ChatPromptTemplate.fromTemplate(
    "给我讲一个关于{topic}的笑话"
  );

  // 使用 LCEL 创建一个链
  const chain = prompt.pipe(model).pipe(new StringOutputParser());

  // 调用链的 .streamEvents() 方法来获取一个事件流
  const eventStream = await chain.streamEvents(
    {
      topic: "cat",
    },
    { version: "v1" }
  );

  // 迭代流并打印每个事件
  console.log("--- 正在流式输出事件 ---");
  for await (const event of eventStream) {
    console.log(JSON.stringify(event, null, 2));
  }
};

const streamLogDemo = async () => {
  // 创建一个提示模板
  const prompt = ChatPromptTemplate.fromTemplate(
    "给我讲一个关于{topic}的笑话"
  );

  // 使用 LCEL 创建一个链
  const chain = prompt.pipe(model).pipe(new StringOutputParser());

  // 调用链的 .streamLog() 方法来获取一个日志流
  const logStream = await chain.streamLog({
    topic: "dog",
  });

  // 迭代流并打印每个日志块
  console.log("--- 正在流式输出日志 ---");
  for await (const chunk of logStream) {
    console.log(JSON.stringify(chunk, null, 2));
  }
};

const main = async () => {
  await streamingDemo();
  await streamEventsDemo();
  await streamLogDemo();
};

main();