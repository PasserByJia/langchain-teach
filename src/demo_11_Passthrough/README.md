# Demo 11: 使用 `RunnablePassthrough` 传递数据

这个示例演示了如何在 LangChain 中使用 `RunnablePassthrough` 来将数据从一个步骤传递到另一个步骤，而无需进行任何修改。这在构建复杂的链时非常有用，特别是当一个步骤的输出需要作为后续多个步骤的输入时。

## 文件结构

```
.
├── README.md
└── index.ts
```

## 核心概念

### `RunnablePassthrough`

`RunnablePassthrough` 是一个特殊的 `Runnable`，它的作用是“按原样”传递其输入。当与 `RunnableParallel` 结合使用时，它可以将原始输入或中间步骤的输出传递给链中的后续步骤。

- **使用场景**:
  - **保留原始输入**: 在一个链中，某个步骤需要原始的用户输入，而其他步骤则需要经过处理的数据。`RunnablePassthrough` 可以确保原始输入在整个链的生命周期中都可用。
  - **组合来自不同来源的数据**: 在构建复杂的提示词时，你可能需要从多个来源获取数据。例如，一个部分来自用户的提问，另一部分来自向量数据库的检索结果。`RunnablePassthrough` 可以将用户的提问直接传递给提示词模板。
  - **简化数据流**: 在复杂的链中，`RunnablePassthrough` 可以使数据流更清晰、更易于理解，因为它明确地表示了哪些数据是直接传递的。

## 示例详解

### 1. 简单的 `RunnablePassthrough` 示例

这个示例展示了 `RunnablePassthrough` 的基本用法。我们创建了一个并行的 `Runnable`，其中：

- `passed` 键使用 `RunnablePassthrough`，因此它会直接传递输入的 `{ num: 1 }`。
- `modified` 键使用一个匿名函数，将输入的 `num` 值加 1。

```typescript
const runnable = RunnableParallel.from({
  passed: new RunnablePassthrough<{ num: number }>(),
  modified: (input: { num: number }) => input.num + 1,
});

const result = await runnable.invoke({ num: 1 });
// result: { passed: { num: 1 }, modified: 2 }
```

#### 适用场景

- **数据扩充**: 当你需要在一个数据流中添加新的字段，同时保留所有原始字段时，这个模式非常有用。例如，在处理用户信息时，你可能想在保留原始用户对象的同时，计算并添加一个 `age` 字段。
- **并行处理**: 当你需要对同一个输入并行执行多个独立的操作，并将所有结果合并时，可以使用 `RunnableParallel` 和 `RunnablePassthrough`。一个分支可以直接传递原始输入，而其他分支可以进行各种计算和转换。

### 2. 上下文问答示例

在这个例子中，我们构建一个更通用的问答链。它会根据是否提供了上下文来决定如何处理问题。如果提供了上下文，它会直接使用该上下文来回答问题。如果没有提供上下文，它会首先尝试根据聊天记录（在这个简化示例中为空）生成一个独立的问题，然后再去回答。

这个示例展示了如何使用 `RunnablePassthrough` 和自定义函数来动态地构建链，使其能够处理不同的输入情况。

```typescript
const chain = RunnableSequence.from([
  {
    context: (input: { question: string; context: string }) => input.context,
    question: contextualizedQuestion, // 这是一个根据输入动态返回 Runnable 的函数
  },
  qaPrompt,
  model,
  new StringOutputParser(),
]);
```

- `context: (input) => input.context`: 我们使用一个简单的函数来从输入中提取 `context`。
- `question: contextualizedQuestion`: 这里我们使用了一个自定义函数 `contextualizedQuestion`。这个函数会检查输入中是否存在 `context`。如果存在，它会返回一个 `Runnable` (即 `contextualizeQChain`) 来重新生成问题；如果不存在，它会直接返回原始问题。这使得我们的链更加灵活和智能。

#### 适用场景

- **需要根据条件执行不同逻辑的链**: 当你的链需要根据输入的不同而采取不同的行为时，可以将 `RunnablePassthrough` 与自定义函数结合使用，动态地构建或选择链的分支。
- **处理可选的输入**: 在某些情况下，用户的输入可能包含可选的字段（例如，可选的上下文、可选的聊天记录）。你可以使用这种模式来优雅地处理这些可选输入，为不同的情况提供不同的处理逻辑。
- **简化复杂的 RAG**: 即使在 RAG 场景下，这种模式也很有用。你可以用它来处理“如果检索不到任何相关文档，就直接回答问题”的逻辑，而不需要在链的外部编写 `if/else` 判断。

## 如何运行

1.  确保你已经安装了所有依赖：

    ```bash
    npm install
    ```

2.  确保你的 `.env` 文件中已经配置了 `OPENAI_API_KEY`。

3.  运行示例：

    ```bash
    npx ts-node src/demo_11_Passthrough/index.ts
    ```

## 预期输出

运行后，你将看到两个部分的输出，分别对应上面介绍的两个示例。每个部分都会有清晰的日志信息，展示了链的执行过程和结果。