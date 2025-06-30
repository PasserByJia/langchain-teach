# LangChain.js 教学示例

这个仓库包含一系列使用 LangChain.js 的示例，旨在帮助开发者快速入门和掌握 LangChain.js 的核心功能。

## 目录

- [LangChain.js 教学示例](#langchainjs-教学示例)
  - [目录](#目录)
  - [快速开始](#快速开始)
  - [示例说明](#示例说明)
    - [Demo 1: Hello World](#demo-1-hello-world)
    - [Demo 2: 结构化数据输出](#demo-2-结构化数据输出)
    - [Demo 3: 工具调用](#demo-3-工具调用)
    - [Demo 4: 流式输出](#demo-4-流式输出)
    - [Demo 5: 调试](#demo-5-调试)

## 快速开始

1. **克隆仓库**

   ```bash
   git clone https://github.com/your-username/langchain-teach.git
   cd langchain-teach
   ```

2. **安装依赖**

   ```bash
   npm install
   ```

3. **配置环境变量**

   将 `.env_emplate` 文件复制为 `.env`，并填入你的 OpenAI API 密钥。

   ```bash
   cp .env_emplate .env
   ```

   ```
   # .env
   OPENAI_API_KEY=sk-...
   ```

## 示例说明

### Demo 1: Hello World

- **文件**: `src/demo_1_Hello_World/index.ts`
- **功能**: 演示了如何使用 LangChain.js 发送一个简单的请求给大语言模型，并获取响应。

### Demo 2: 结构化数据输出

- **文件**: `src/demo_2_Structured_Data_Output/index.ts`
- **功能**: 展示了如何让大语言模型根据指定的 Zod Schema 输出结构化的 JSON 数据。

### Demo 3: 工具调用

- **文件**: `src/demo_3_Tool_Calling/index.ts`
- **功能**: 演示了如何定义和使用工具，让大语言模型能够调用外部工具来完成特定任务。

### Demo 4: 流式输出

- **文件**: `src/demo_4_Streaming/index.ts`
- **功能**: 展示了如何以流式的方式处理模型的输出，包括流式输出字符串和结构化的 JSON 对象。

### Demo 5: 调试

- **文件**: `src/demo_5_Debugging/index.ts`
- **功能**: 演示了如何通过设置 `verbose: true` 来启用详细的日志记录，以帮助调试和理解 LangChain.js 组件的内部执行流程。

### Demo 6: 序列（Sequence）

- **文件**: `src/demo_6_Sequence/index.ts`
- **功能**: 展示了如何将多个 LangChain 组件（如提示、模型、输出解析器）串联成一个序列，以实现更复杂的逻辑。

### Demo 7: LCEL 流式（Streaming）

- **文件**: `src/demo_7_LCEL_Streaming/index.ts`
- **功能**: 演示了如何利用 LangChain 表达式语言（LCEL）来实现对输出的流式处理，这对于实时应用非常有用。

### Demo 8: 并行（Parallel）

- **文件**: `src/demo_8_Parallel/index.ts`
- **功能**: 演示了如何使用 `RunnableParallel` 来并行执行多个任务，并将它们的输出合并到一个映射中。

### Demo 9: 绑定（Binding）

- **文件**: `src/demo_9_Binding/index.ts`
- **功能**: 展示了如何向模型运行时（runtime）绑定函数（工具）或停止序列，以更精确地控制模型的行为。

### Demo 10: 自定义函数

- **文件**: `src/demo_10_Custom_Function/index.ts`
- **功能**: 演示了如何使用 `RunnableLambda` 将自定义函数包装成可运行的组件，以及如何在序列中直接使用函数（函数强制转换）。

### Demo 11: Passthrough

- **文件**: `src/demo_11_Passthrough/index.ts`
- **功能**: 展示了如何使用 `RunnablePassthrough` 将输入数据原封不动地传递下去，或者在并行处理中添加新的键。

### Demo 12: Assign

- **文件**: `src/demo_12_Assign/index.ts`
- **功能**: 演示了如何使用 `RunnableAssign` 在链的中间动态地创建和添加新的字段到状态中。

### Demo 13: 消息历史

- **文件**: `src/demo_13_Message_History/index.ts`
- **功能**: 展示了如何使用 `LangGraph` 和 `MemorySaver` 来管理多轮对话的上下文，并为每个用户或会话维护独立的消息历史。

### Demo 14: 路由

- **文件**: `src/demo_14_Routing/index.ts`
- **功能**: 演示了如何根据用户问题的分类，非确定性地将请求路由到不同的专家链进行处理。

### Demo 15: 回退机制

- **文件**: `src/demo_15_Fallbacks/index.ts`
- **功能**: 展示了如何通过 `.withFallbacks()` 为链或模型设置回退机制，以处理 API 错误、模型能力不足或输入超长等问题，从而提高应用的鲁棒性。

### Demo 16: 取消执行

- **文件**: `src/demo_16_Cancel_Execution/index.ts`
- **功能**: 演示了如何使用 `AbortController` 来取消正在执行的 `invoke` 或 `stream` 调用，这对于控制长时间运行的任务或优化用户体验非常有用。