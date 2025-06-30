import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableLambda, RunnableSequence, type RunnableConfig } from "@langchain/core/runnables";
import { model } from "../model";

// 1. 使用 RunnableLambda.from 包装自定义函数
const lengthFunction = (input: { foo: string }): { length: string } => {
  console.log('Input to lengthFunction:', input);
  return {
    length: input.foo.length.toString(),
  };
};

const prompt = ChatPromptTemplate.fromTemplate("计算 {length} 的平方");

const chainWithRunnableLambda = RunnableLambda.from(lengthFunction)
  .pipe(prompt)
  .pipe(model)
  .pipe(new StringOutputParser());

// 2. 在链中自动转换自定义函数
const storyPrompt = ChatPromptTemplate.fromTemplate(
  "给我讲一个关于{topic}的短篇故事"
);
const storyModel = model;
const chainWithCoercedFunction = RunnableSequence.from([
  storyPrompt,
  storyModel,
  (input) => input.content.slice(0, 50), // 自动转换为 RunnableLambda
]);

// 3. 在自定义函数中接收和使用 RunnableConfig
const echo = (text: string, config: RunnableConfig) => {
  console.log('RunnableConfig:', config);
  const prompt = ChatPromptTemplate.fromTemplate(
    "反转以下文本: {text}"
  );
  const chain = prompt.pipe(model).pipe(new StringOutputParser());
  return chain.invoke({ text }, config);
};

const chainWithConfig = RunnableLambda.from(echo);

// 4. 在链中使用生成器函数进行流式处理
const streamingPrompt = ChatPromptTemplate.fromTemplate(
  "写一个与{animal}类似的5种动物的逗号分隔列表。不要包含数字"
);
const streamingChain = streamingPrompt.pipe(model).pipe(new StringOutputParser());

// 这是一个自定义解析器，它将llm令牌的迭代器拆分为逗号分隔的字符串列表
async function* splitIntoList(input: AsyncGenerator<string>) {
  let buffer = "";
  for await (const chunk of input) {
    buffer += chunk;
    while (buffer.includes(",")) {
      const list = buffer.split(",");
      buffer = list.pop() || "";
      for (const item of list) {
        yield item.trim();
      }
    }
  }
  if (buffer) {
    yield buffer.trim();
  }
}
//@ts-ignore
const streamingParserChain = streamingChain.pipe(splitIntoList);

async function main() {
  console.log("--- 1. 运行带有 RunnableLambda.from 的链 ---");
  const result1 = await chainWithRunnableLambda.invoke({ foo: "bar" });
  console.log(result1);

  console.log("\n--- 2. 运行带有强制转换函数的链 ---");
  const result2 = await chainWithCoercedFunction.invoke({ topic: "bears" });
  console.log(result2);

  console.log("\n--- 3. 运行带有 RunnableConfig 的链 ---");
  const result3 = await chainWithConfig.invoke("foo", {
    tags: ["my-tag"],
    callbacks: [
      {
        handleLLMEnd: (output) => console.log('LLM 输出:', JSON.stringify(output, null, 2)),
      },
    ],
  });
  console.log(result3);

  console.log("\n--- 4. 运行流式链 ---");
  const stream = await streamingParserChain.stream({ animal: "bear" });
  for await (const chunk of stream) {
    console.log(chunk);
  }
}

main();