import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence, Runnable } from "@langchain/core/runnables";
import { model } from "../model";

async function main() {

  // 1. 分类链：用于判断用户问题的类别
  const classificationPrompt = ChatPromptTemplate.fromTemplate(
    `根据下面的用户问题，将其分类为关于 \`LangChain\`、\`Anthropic\` 或 \`Other\`。

请只用一个词回答。<question>{question}</question>

分类:`
  );

  const classificationChain = RunnableSequence.from([
    classificationPrompt,
    model,
    new StringOutputParser(),
  ]);

  // 2. 专家链：为每个类别创建专门的链
  const langChainChain = ChatPromptTemplate.fromTemplate(
    `你是一位 LangChain 专家。请总是用“正如 Harrison Chase 告诉我的那样”开头来回答问题。

请回答以下问题：
问题: {question}
回答:`
  ).pipe(model);

  const anthropicChain = ChatPromptTemplate.fromTemplate(
    `你是一位 Anthropic 专家。请总是用“正如 Dario Amodei 告诉我的那样”开头来回答问题。

请回答以下问题：
问题: {question}
回答:`
  ).pipe(model);

  const generalChain = ChatPromptTemplate.fromTemplate(
    `请回答以下问题：
问题: {question}
回答:`
  ).pipe(model);

  // 3. 路由函数：根据分类结果选择要执行的链
  const route = (input: { topic: string; question: string }) => {
    if (input.topic.toLowerCase().includes("langchain")) {
      return langChainChain;
    } else if (input.topic.toLowerCase().includes("anthropic")) {
      return anthropicChain;
    } else {
      return generalChain;
    }
  };

  // 4. 完整链：将所有部分组合在一起
  const fullChain = RunnableSequence.from([
    {
      topic: classificationChain,
      question: (input: { question: string }) => input.question,
    },
    route,
  ]);

  // --- 测试 --- 
  console.log("--- 提问关于 LangChain ---");
  const result1 = await fullChain.invoke({ question: "如何使用 LangChain？" });
  //@ts-ignore
  console.log(result1.content);

  console.log("\n--- 提问关于 Anthropic ---");
  const result2 = await fullChain.invoke({ question: "如何使用 Anthropic？" });
  //@ts-ignore
  console.log(result2.content);

  console.log("\n--- 提问其他问题 ---");
  const result3 = await fullChain.invoke({ question: "今天天气怎么样？" });
  //@ts-ignore
  console.log(result3.content);
}

main();