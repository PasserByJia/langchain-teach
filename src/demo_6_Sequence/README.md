# 演示 6：序列 (RunnableSequence)

此演示展示了如何使用 LangChain 表达式语言 (LCEL) 中的 `RunnableSequence.from()` 方法将多个 `Runnable` 组件链接在一起，构建一个更复杂的调用链。

在这个示例中，我们创建了一个两步走的序列：
1.  **生成内容**：第一个链根据给定的主题（例如“熊”）生成一个笑话。
2.  **评估内容**：第二个链接收生成的笑话，并对其进行评价，判断它是否好笑。

## 关键概念

- **`RunnableSequence.from()`**: 允许你定义一个由多个步骤组成的序列。前一步的输出会作为后一步的输入，从而实现复杂的逻辑流。
- **链的组合 (Chain Composition)**: 演示了如何将一个简单的链（生成笑话）的输出，传递给另一个链（评估笑话），以完成更复杂的任务。
- **输入/输出格式化**: 在序列中，我们使用了一个简单的JavaScript函数 `(input) => ({ joke: input })` 来将第一个链的字符串输出，转换成第二个链提示所期望的对象格式。

## 如何运行

1.  确保您已在 `.env` 文件中设置了环境变量（例如 `OPENAI_API_KEY`）。
2.  主入口文件 `src/index.ts` 已配置为运行此演示。
3.  在终端中执行以下命令：

```bash
npx tsx src/demo_6_Sequence/index.ts
```

程序将输出一个关于熊的笑话，以及模型对这个笑话的评价。