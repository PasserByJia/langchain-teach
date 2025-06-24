# 示例 3：工具调用

本示例演示了如何让大型语言模型（LLM）能够使用自定义工具。示例展示了一个完整的工作流程：首先，模型决定使用哪个工具以及需要哪些参数；然后，应用程序执行该工具；最后，将执行结果返回给模型，以生成最终的用户友好响应。

## 如何运行

1.  **设置环境变量**：确保项目根目录下的 `.env` 文件包含您的 `OPENAI_API_KEY` 和正确的 `API_BASE_URL`。

2.  **运行脚本**：

    ```bash
    npx tsx ./src/demo_3_Tool_Calling/index.ts
    ```

    您将在控制台中看到输出，首先显示模型调用工具的决定，然后在工具执行后显示最终答案。

## 关键代码解释

核心逻辑位于 `index.ts` 文件中，演示了端到端的工具调用过程。

### 1. 定义工具

我们定义了一个可以执行算术运算的 `calculatorTool`。我们使用 `zod` 库为工具的输入参数定义了一个严格的模式（schema），以确保类型安全和清晰的验证。

```typescript
import { tool } from '@langchain/core/tools';
import { z } from 'zod';

const calculatorTool = tool(
  async ({ number1, number2, operation }) => {
    // ... 工具逻辑 ...
  },
  {
    name: 'calculator',
    description: '一个可以执行加、减、乘、除运算的计算器工具。',
    schema: z.object({
      number1: z.number(),
      number2: z.number(),
      operation: z.enum(['add', 'subtract', 'multiply', 'divide']),
    }),
  },
);
```

-   **`tool(func, options)`**: 这是 `@langchain/core/tools` 提供的一个辅助函数，用于创建工具。第一个参数是要执行的异步函数，第二个参数是包含工具 `name`（名称）、`description`（描述）和 `schema`（模式）的对象。
-   **`zod` 模式**: 定义了预期的输入（`number1`、`number2`、`operation`）及其类型。模型将使用此模式来生成正确的参数。

### 2. 将工具绑定到模型

为了让模型知道有哪些可用的工具，我们使用 `.bindTools()` 方法。

```typescript
const llmWithTools = llm.bindTools([calculatorTool]);
```

-   **`.bindTools(tools)`**: 此方法将提供的工具列表附加到模型的配置中。当调用此模型时，它可以选择调用这些工具中的任何一个。

### 3. 调用流程

该过程涉及与模型的多步骤对话。

**第一步：初始模型调用以获取工具调用指令**

我们将用户的查询发送给模型。模型不会直接回答，而是返回一个包含 `tool_calls` 的特殊 `AIMessage`。

```typescript
import { HumanMessage, ToolMessage } from '@langchain/core/messages';

const messages = [new HumanMessage('3 * 12 等于多少？')];
const first_response = await llmWithTools.invoke(messages);
```

-   **`HumanMessage`**: 代表来自用户的消息。
-   `first_response.tool_calls`: 此数组包含模型想要调用的工具，包括每个工具的 `name` 和 `args`。

**第二步：执行工具并返回结果**

我们的应用程序代码会遍历 `tool_calls`，使用提供的参数执行相应的工具函数，并创建包含结果的 `ToolMessage` 实例。

```typescript
const toolCalls = first_response.tool_calls;
const toolMessages = [];
for (const call of toolCalls) {
  const toolOutput = await calculatorTool.invoke(call.args as any);
  toolMessages.push(
    new ToolMessage({
      tool_call_id: call.id,
      name: call.name,
      content: String(toolOutput),
    }),
  );
}
```

-   **`ToolMessage`**: 代表工具执行的输出。包含 `tool_call_id` 至关重要，以便将结果与模型请求的特定工具调用关联起来。

**第三步：最终模型调用以获取答案**

我们再次调用模型，这次提供完整的对话历史记录：原始用户查询、模型的第一个响应（工具调用）以及包含结果的新工具消息。

```typescript
messages.push(first_response);
messages.push(...toolMessages);

const finalResponse = await llmWithTools.invoke(messages);
```

现在，模型拥有了综合生成最终自然语言答案所需的所有上下文，该答案将位于 `finalResponse` 的 `content` 字段中。