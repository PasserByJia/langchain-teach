import { model } from "../model";
import { HumanMessage, ToolMessage } from "@langchain/core/messages";

const bindingToolDemo = async () => {
  console.log("--- 工具绑定演示 ---");
  const tools = [
    {
      type: "function",
      function: {
        name: "get_current_weather",
        description: "获取给定位置的当前天气",
        parameters: {
          type: "object",
          properties: {
            location: {
              type: "string",
              description: "城市和州，例如 旧金山, 纽约",
            },
            unit: { type: "string", enum: ["celsius", "fahrenheit"] },
          },
          required: ["location"],
        },
      },
    },
  ];

  // 定义一个执行工具调用的函数
  const toolExecutor = (toolCall: any) => {
    if (toolCall.name === "get_current_weather") {
      const { location, unit } = toolCall.args;
      let temperature;
      if (location.toLowerCase().includes("旧金山")) {
        temperature = "22";
      } else if (location.toLowerCase().includes("纽约")) {
        temperature = "27";
      } else if (location.toLowerCase().includes("洛杉矶")) {
        temperature = "32";
      } else {
        temperature = "unknown";
      }
      return JSON.stringify({ location, temperature, unit: unit || "celsius" });
    }
  };

  const modelWithTools = model.withConfig({
    tools,
  });

  const messages = [new HumanMessage("旧金山、纽约和洛杉矶的天气怎么样？")];

  // 第一次调用模型，获取工具调用请求
  const response = await modelWithTools.invoke(messages);
  messages.push(response);

  if (response.tool_calls && response.tool_calls.length > 0) {
    // 执行工具调用
    const toolMessages = response.tool_calls.map((toolCall) => {
      const toolOutput = toolExecutor(toolCall);
      return new ToolMessage({
        content: toolOutput || "",
        tool_call_id: toolCall.id!,
      });
    });
    messages.push(...toolMessages);

    // 第二次调用模型，传入工具调用的结果
    const finalResponse = await modelWithTools.invoke(messages);
    console.log("调用工具后的最终结果：");
    console.log(finalResponse.content);
  } else {
    // 如果没有工具调用，直接输出结果
    console.log("最终结果：");
    console.log(response.content);
  }
};

const bindingStopSequenceDemo = async () => {
  console.log("\n--- 绑定停止序列演示 ---");
  const modelWithStopSequence = model.withConfig({
    stop: ["答案："],
  });

  const result = await modelWithStopSequence.invoke(
    "x^3 + 7 = 12, 解是什么？ 答案："
  );

  console.log("带有停止序列的调用结果：");
  console.log(result.content);
};

const main = async () => {
  await bindingToolDemo();
  await bindingStopSequenceDemo();
};

main();