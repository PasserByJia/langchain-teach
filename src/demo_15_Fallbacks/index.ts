import { ChatOpenAI, OpenAI } from "@langchain/openai";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate, PromptTemplate } from "@langchain/core/prompts";
import { z } from "zod";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { model } from "../model";

// 1. 处理 LLM API 错误
async function example1_llmApiError() {
  console.log("--- 示例 1: 处理 LLM API 错误 ---");
  // 使用一个将始终引发错误的假模型名称
  const fakeOpenAIModel = new ChatOpenAI({
    model: "potato!",
    maxRetries: 0,
  });

  const anthropicModel = model;

  const modelWithFallback = fakeOpenAIModel.withFallbacks([anthropicModel]);

  const result = await modelWithFallback.invoke("你的名字是什么？");

  console.log(result.content);
  
}

// 2. RunnableSequences 的回退
async function example2_runnableSequenceFallback() {
  console.log("\n--- 示例 2: RunnableSequences 的回退 ---");
  const chatPrompt = ChatPromptTemplate.fromMessages<{
    animal: string;
  }>([["system", "你是一个总是在回答中包含赞美的友好助手"], ["human", "为什么{animal}要过马路？"]]);

  // 使用一个将始终引发错误的假模型名称
  const fakeOpenAIChatModel = new ChatOpenAI({
    model: "potato!",
    maxRetries: 0,
  });

  const prompt = PromptTemplate.fromTemplate(
    `说明：你的回答中应始终包含一句赞美。\n问题：为什么{animal}要过马路？\n回答：`
  );

  const openAILLM = model;

  const outputParser = new StringOutputParser();

  const badChain = chatPrompt.pipe(fakeOpenAIChatModel).pipe(outputParser);

  const goodChain = prompt.pipe(openAILLM).pipe(outputParser);

  const chain = badChain.withFallbacks([goodChain]);

  const result = await chain.invoke({
    animal: "龙",
  });

  console.log(result);
  /*
  我不知道，但我相信那一定是一个令人印象深刻的景象。你一定有很棒的想象力才能想出这么有趣的问题！
  */
}

// 3. 处理长输入
async function example3_longInput() {
  console.log("\n--- 示例 3: 处理长输入 ---");
  // 使用一个上下文窗口较短的模型
  const shorterLlm = model;

  const longerLlm = model;

  const modelWithFallback = shorterLlm.withFallbacks([longerLlm]);

  const input = `下一个数字是什么: ${"一, 二, ".repeat(3000)}`;

  try {
    await shorterLlm.invoke(input);
  } catch (e) {
    // 长度错误
    console.log("shorterLlm 出错:", e);
  }

  const result = await modelWithFallback.invoke(input);

  console.log(result);
  /*
  AIMessage {
    content: '下一个数字是一。',
    name: undefined,
    additional_kwargs: { function_call: undefined }
  }
  */
}

// 4. 回退到更好的模型以进行结构化输出
async function example4_structuredOutput() {
  console.log("\n--- 示例 4: 回退到更好的模型以进行结构化输出 ---");
  const prompt = PromptTemplate.fromTemplate(
    `返回一个包含以下值的 JSON 对象，该值包装在 “input” 键中。不要返回任何其他内容：\n{input}`
  );

  const badModel = new OpenAI({
    maxRetries: 0,
    model: "gpt-3.5-turbo-instruct", // 此模型有时难以处理严格的 JSON 输出
  });

  const goodModel = model;

  const parser = StructuredOutputParser.fromZodSchema(
    z.object({
      input: z.string(),
    })
  );

  const badChain = prompt.pipe(badModel).pipe(parser);
  const goodChain = prompt.pipe(goodModel).pipe(parser);

  const chain = badChain.withFallbacks([goodChain]);

  const result = await chain.invoke({ input: "一个简单的字符串" });

  console.log(result);
  /*
  { input: '一个简单的字符串' }
  */
}

async function main() {
  await example1_llmApiError();
  await example2_runnableSequenceFallback();
  await example3_longInput();
  await example4_structuredOutput();
}

main();