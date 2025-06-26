import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import { RunnableSequence } from "@langchain/core/runnables";
import 'dotenv/config';

const composedChainDemo = async () => {
  // 初始化一个 ChatOpenAI 模型实例
  const model = new ChatOpenAI({
    configuration: {
      baseURL: process.env.API_BASE_URL,
      apiKey: process.env.API_KEY,
    },
    model: process.env.CHAT_MODEL_NAME,
    temperature: 0,
  });

  // 第一步：创建一个生成笑话的链。
  // 这个链接收一个 `topic` 作为输入，并输出一个关于该主题的笑话。
  const jokePrompt = ChatPromptTemplate.fromTemplate(
    "给我讲一个关于{topic}的笑话"
  );
  const jokeChain = jokePrompt.pipe(model).pipe(new StringOutputParser());

  // 第二步：创建一个评估笑话趣味性的链。
  // 这个链接收一个 `joke` 作为输入，并输出对这个笑话的评价。
  const analysisPrompt = ChatPromptTemplate.fromTemplate(
    "输出笑话原文并回答：这个笑话好笑吗？ {joke}"
  );

  // 第三步：使用 RunnableSequence.from 将两个链组合成一个序列。
  // 1. `jokeChain` 首先被调用，生成一个笑话字符串。
  // 2. `(input) => ({ joke: input })` 是一个函数，它将 `jokeChain` 的输出（字符串）
  //    转换成一个对象 `{ joke: '...' }`，以匹配 `analysisPrompt` 的输入格式。
  // 3. `analysisPrompt` 接收这个对象，并生成一个新的提示。
  // 4. `model` 接收这个提示，并生成最终的评价。
  // 5. `StringOutputParser` 解析模型的输出，返回一个字符串。
  const composedChain = RunnableSequence.from([
    jokeChain,
    (input) => ({ joke: input }),
    analysisPrompt,
    model,
    new StringOutputParser(),
  ]);

  // 调用组合链，并传入初始主题 "bears"
  const result = await composedChain.invoke({
    topic: "bears",
  });

  // 打印最终结果
  console.log("--- 正在运行组合链 ---");
  console.log(result);
};

const main = async () => {
  await composedChainDemo();
};

main();