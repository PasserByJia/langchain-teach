import { START, END, MessagesAnnotation, StateGraph, MemorySaver } from "@langchain/langgraph";
import { v4 as uuidv4 } from "uuid";
import { model } from "../model";

async function main() {
  // 为了方便演示，我们在这里直接使用 OpenAI 模型
  // 在实际应用中，您可以替换成文档中提到的其他模型，如 ChatGroq
  const llm = model;

  // 定义图的状态。`MessagesAnnotation` 是一个内置的帮助类型，它会自动处理消息的聚合。

  // 定义调用模型的函数。这是图中的一个节点。
  const callModel = async (state: typeof MessagesAnnotation.State) => {
    const response = await llm.invoke(state.messages);
    // 返回单个消息，LangGraph 会自动将其附加到历史记录中
    return { messages: response };
  };

  // 定义一个新的图，并使用 `MessagesAnnotation` 作为状态定义
  const workflow = new StateGraph(MessagesAnnotation)
    // 定义图中的（单个）节点
    .addNode("model", callModel)
    // 定义图的入口点
    .addEdge(START, "model")
    // 定义图的终点
    .addEdge("model", END);

  // 添加内存以保存消息历史
  const memory = new MemorySaver();

  // 编译图，并传入检查点（checkpointer）以在运行之间存储消息
  const app = workflow.compile({ checkpointer: memory });

  // --- 第一次对话（线程 1） ---
  console.log("--- 对话开始 (用户 1) ---");
  const config1 = { configurable: { thread_id: uuidv4() } };

  const input1 = {
    messages: [
      {
        role: "user",
        content: "你好！我是 Bob。",
      },
    ],
  };
  const output1 = await app.invoke(input1, config1);
  console.log("AI:", output1.messages[output1.messages.length - 1].content);

  const input2 = {
    messages: [
      {
        role: "user",
        content: "我的名字是什么？",
      },
    ],
  };
  const output2 = await app.invoke(input2, config1);
  console.log("AI:", output2.messages[output2.messages.length - 1].content);

  // --- 第二次对话（线程 2） ---
  console.log("\n--- 新的对话 (用户 2) ---");
  const config2 = { configurable: { thread_id: uuidv4() } };

  const input3 = {
    messages: [
      {
        role: "user",
        content: "我的名字是什么？",
      },
    ],
  };
  const output3 = await app.invoke(input3, config2);
  console.log("AI:", output3.messages[output3.messages.length - 1].content);
}

main();