import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableMap } from "@langchain/core/runnables";
import { model } from "../model";
import { StringOutputParser } from "@langchain/core/output_parsers";

const parallelDemo = async () => {
  // 定义两个独立的链
  const jokeChain = ChatPromptTemplate.fromTemplate(
    "给我讲一个关于{topic}的笑话"
  )
    .pipe(model)
    .pipe(new StringOutputParser());

  const poemChain = ChatPromptTemplate.fromTemplate(
    "写一首关于{topic}的两行诗"
  )
    .pipe(model)
    .pipe(new StringOutputParser());

  // 创建一个 RunnableMap 来并行运行这些链
  const mapChain = RunnableMap.from({
    joke: jokeChain,
    poem: poemChain,
  });

  // 使用一个主题来调用 mapChain
  const result = await mapChain.invoke({ topic: "bear" });

  console.log(result);
};

const main = async () => {
  await parallelDemo();
};

main();