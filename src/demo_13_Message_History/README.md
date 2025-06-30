# Demo 13: 使用 LangGraph 添加消息历史记录

这个 `demo` 展示了如何使用 `LangGraph` 来为 LangChain 的 `runnables` 添加持久化的消息历史记录。这对于构建能够记住之前交互的多轮对话机器人至关重要。

## 功能

与之前使用 `RunnableWithMessageHistory` 的方法不同，`LangGraph` 提供了一个更强大和灵活的方式来管理链的状态，包括但不限于消息历史。它内置了持久化层，可以轻松地将对话状态保存在内存中或外部数据库（如 SQLite、Postgres、Redis）中。

这个 `demo` 的核心步骤如下：

1.  **定义图的状态**: 我们使用 `LangGraph` 内置的 `MessagesState` 来定义图的状态，它专门用于存储消息列表。
2.  **创建图节点**: 定义一个调用语言模型（LLM）的函数作为图中的一个节点。
3.  **构建图**: 使用 `StateGraph` 将节点连接起来，定义工作流的开始和结束。
4.  **添加内存**: 创建一个 `MemorySaver` 实例，用于在内存中保存对话状态。
5.  **编译图**: 将图与 `MemorySaver` 编译在一起，生成一个可执行的应用。
6.  **多线程对话**: 通过为每次调用提供唯一的 `thread_id`，演示了应用如何为不同的用户或会话维护独立的对话历史。

## 如何运行

1.  确保你已经安装了所有必要的依赖项。特别注意，这个 `demo` 需要 `@langchain/langgraph`。

    ```bash
    npm install
    npm install @langchain/langgraph uuid
    ```

2.  执行 `index.ts` 文件：

    ```bash
    npx ts-node src/demo_13_Message_History/index.ts
    ```

## 适用场景

- **构建聊天机器人**: 这是最直接的应用场景。任何需要与用户进行多轮对话的应用，都需要一个机制来保存和检索对话历史，以便在后续的交互中提供上下文。
- **需要状态管理的应用**: `LangGraph` 不仅仅能保存消息。你可以定义更复杂的状态，包括用户的偏好、之前的计算结果、API 调用次数等。这使得它非常适合构建需要长期记忆或复杂状态管理的智能体（Agent）。
- **多用户/多会话服务**: `LangGraph` 的 `thread_id` 机制使得构建能够同时为多个用户提供服务的应用变得非常简单。每个用户的对话状态都是隔离的，不会相互干扰，非常适合用于构建 SaaS 应用或在线客服机器人。