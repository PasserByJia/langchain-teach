# 示例 5：调试

本示例展示了如何通过启用详细日志来调试 LangChain.js 应用程序。当在 LangChain 组件（如模型或 Agent 执行器）上设置 `verbose: true` 时，它会将其内部操作的详细信息打印到控制台。

## 功能说明

本示例中的 `index.ts` 脚本演示了以下内容：

1.  **详细模式**：`ChatOpenAI` 模型和 `AgentExecutor` 都使用 `verbose: true` 选项进行实例化。这为 LLM 调用和 Agent 的执行步骤启用了详细的日志记录。
2.  **工具调用**：Agent 配备了 `Calculator` 工具来执行数学计算。
3.  **Agent 执行**：Agent 处理一个需要多个步骤的复杂查询：先乘法，然后除法。通过观察详细输出，您可以追踪 Agent 如何识别对计算器工具的需求，使用正确的参数调用它，并使用工具的输出来得出最终答案。

## 核心 API

-   `new ChatOpenAI({ verbose: true })`：为来自 OpenAI 模型的所有请求和响应启用日志记录。
-   `new AgentExecutor({ verbose: true })`：为 Agent 的决策过程启用日志记录，包括调用了哪些工具以及使用了哪些输入。
-   `createToolCallingAgent`：创建一个可以智能地决定何时使用所提供工具的 Agent。
-   `agentExecutor.invoke()`：使用给定的输入运行 Agent。

## 如何运行

1.  确保您已在 `.env` 文件中设置了您的 OpenAI API 密钥。
2.  使用以下命令运行脚本：

    ```bash
    npx tsx src/demo_5_Debugging/index.ts
    ```

3.  观察控制台输出。您将看到 Agent 执行的详细追踪，包括发送到模型的提示、进行的工具调用以及最终结果。