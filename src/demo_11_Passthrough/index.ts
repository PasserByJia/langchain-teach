import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import {
  RunnableParallel,
  RunnablePassthrough,
  RunnableSequence,
} from "@langchain/core/runnables";
import { model } from "../model";

/**
 * 演示 RunnablePassthrough 的基本用法
 */
async function simplePassthrough() {
  console.log("--- 1. 简单的 Passthrough 示例 ---");

  // 创建一个并行的 Runnable。RunnableParallel 允许我们同时运行多个 Runnable，
  // 并将它们的输出合并到一个对象中。
  const runnable = RunnableParallel.from({
    // `passed` 字段使用 RunnablePassthrough，它会按原样传递输入。
    // 也就是说，如果我们输入 { num: 1 }，这个字段的输出就是 { num: 1 }。
    passed: new RunnablePassthrough<{ num: number }>(),
    // `modified` 字段使用一个函数，它接收输入并返回 input.num + 1。
    // 如果我们输入 { num: 1 }，这个字段的输出就是 2。
    modified: (input: { num: number }) => input.num + 1,
  });

  // 调用这个并行 Runnable，输入为 { num: 1 }。
  const result = await runnable.invoke({ num: 1 });

  // 预期输出: { passed: { num: 1 }, modified: 2 }
  console.log(result);
}

/**
 * 演示一个更复杂的上下文问答场景，
 * 其中 RunnablePassthrough 用于动态地构建和执行链。
 */
async function contextualizeQuestionExample() {
  console.log("\n--- 2. 上下文问答示例 ---");

  // --- 第一部分：构建一个用于“问题重构”的链 --- //

  // 这个提示词用于指导模型：如何根据对话历史和新问题，生成一个独立的、无需上下文就能理解的问题。
  const contextualizeQSystemPrompt = `根据聊天记录和最新的用户问题，生成一个独立的问题。
如果聊天记录为空，就直接使用用户问题。`;

  // 创建一个提示词模板
  const contextualizeQPrompt = ChatPromptTemplate.fromMessages([
    ["system", contextualizeQSystemPrompt],
    // 这里的 {question} 将被替换为用户的实际问题。
    ["human", "{question}"],
  ]);

  // 将提示词模板、模型和输出解析器连接起来，形成一个完整的“问题重构”链。
  const contextualizeQChain = contextualizeQPrompt
    .pipe(model)
    .pipe(new StringOutputParser());

  // --- 第二部分：构建一个用于“问答”的链 --- //

  // 这个提示词用于指导模型：如何根据提供的上下文来回答问题。
  const qaSystemPrompt = `你是一个问答机器人。
请根据下面的上下文来回答问题：

{context}`;

  // 创建问答的提示词模板
  const qaPrompt = ChatPromptTemplate.fromMessages([
    ["system", qaSystemPrompt],
    // 这里的 {question} 将被替换为（可能经过重构的）问题。
    ["human", "{question}"],
  ]);

  // --- 第三部分：动态选择执行路径 --- //

  // 这是一个关键的函数。它根据输入中是否存在 `context` 来决定下一步做什么。
  const contextualizedQuestion = (input: { question: string; context: string }) => {
    // 如果输入中包含 `context`，我们假设问题可能需要结合上下文来理解，
    // 因此返回 `contextualizeQChain` 来重构问题。
    if (input.context) {
      return contextualizeQChain;
    }
    // 如果没有 `context`，我们直接返回原始问题字符串。
    return input.question;
  };

  // --- 第四部分：将所有部分组合成最终的链 --- //

  // 使用 RunnableSequence.from 来创建一个顺序执行的链。
  const chain = RunnableSequence.from([
    // 步骤 1: 准备进入问答环节的输入。
    // 这是一个并行操作，它会生成一个包含 `context` 和 `question` 的对象。
    {
      // `context` 字段直接从原始输入中获取。
      context: (input: { question: string; context: string }) => input.context,
      // `question` 字段的值由 `contextualizedQuestion` 函数动态决定。
      // LangChain 会自动执行这个函数（如果它是一个 Runnable），或者直接使用它的返回值。
      question: contextualizedQuestion,
    },
    // 步骤 2: 将上一步的输出（{ context: ..., question: ... }）填充到问答提示词模板中。
    qaPrompt,
    // 步骤 3: 将填充好的提示词发送给模型进行处理。
    model,
    // 步骤 4: 将模型的输出（通常是一个 AIMessage 对象）解析为纯字符串。
    new StringOutputParser(),
  ]);

  // --- 第五部分：调用链并观察结果 --- //

  // 案例一：提供了上下文。
  // 链的执行流程：
  // 1. `contextualizedQuestion` 返回 `contextualizeQChain`。
  // 2. `contextualizeQChain` 被执行，问题被重构（虽然在这个例子中可能变化不大）。
  // 3. 重构后的问题和原始上下文被送入 `qaPrompt`。
  // 4. 模型根据上下文回答问题。
  const result1 = await chain.invoke({
    context: "LangChain 是一个用于开发由语言模型驱动的应用程序的框架。",
    question: "它有什么功能？",
  });
  console.log("有上下文的回答：", result1);

  // 案例二：没有提供上下文。
  // 链的执行流程：
  // 1. `contextualizedQuestion` 直接返回原始问题字符串 "LangChain 是什么？"。
  // 2. 原始问题和空的上下文被送入 `qaPrompt`。
  // 3. 模型在没有上下文的情况下，依靠自己的知识来回答问题。
  const result2 = await chain.invoke({
    context: "",
    question: "LangChain 是什么？",
  });
  console.log("没有上下文的回答：", result2);
}

/**
 * 主函数，程序的入口点
 */
async function main() {
  // 依次执行两个示例函数
  await simplePassthrough();
  await contextualizeQuestionExample();
}

// 运行主函数
main();