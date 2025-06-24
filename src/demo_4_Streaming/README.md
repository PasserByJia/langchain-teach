# Demo 4: 流式处理（Streaming）

这个示例演示了如何使用 LangChain.js 从大型语言模型（LLM）中流式获取响应。流式处理对于构建交互式、响应迅速的 AI 应用至关重要，因为它允许用户在模型生成完整答案之前，就能实时看到逐字或逐词的输出，极大地提升了用户体验。

## 功能

此示例通过两个独立的函数 `streamStringOutput` 和 `streamJsonOutput` 展示了如何：

1.  **流式处理字符串**:
    -   使用 `StringOutputParser` 将模型的 `AIMessage` 输出转换为字符串。
    -   通过 `.stream()` 调用链，并使用 `for await...of` 循环逐块处理字符串数据，实现打字机效果。

2.  **流式处理 JSON**:
    -   配置一个专门的模型实例，通过 `modelKwargs` 强制其输出 JSON 格式。
    -   使用 `JsonOutputParser` 来处理流式数据。这个解析器能够智能地将零散的数据块逐步组合成一个有效的 JSON 对象。
    -   实时观察部分解析的 JSON 对象，直到最终形成一个完整的结构化数据。

## 关键代码解释

`index.ts` 中的代码被组织为两个核心函数，分别演示了不同的流式处理场景。

### `streamStringOutput()` - 流式处理纯文本

```typescript
async function streamStringOutput() {
  console.log('--- Streaming String Output ---');
  const parser = new StringOutputParser();
  const chain = model.pipe(parser);
  const stream = await chain.stream('你好！请你介绍一下你自己。');

  for await (const chunk of stream) {
    process.stdout.write(chunk);
  }
  console.log('\n--- String Output Finished ---\n');
}
```

- **代码逻辑**：这个函数构建了一个简单的处理链 `model.pipe(parser)`，其中 `StringOutputParser` 负责将模型输出的 `AIMessageChunk` 对象直接转换为字符串。`.stream()` 方法返回一个异步迭代器，我们通过 `for await...of` 循环消费这个迭代器，并将每个字符串块 (`chunk`) 直接打印到标准输出，从而实现了打字机效果。

### `streamJsonOutput()` - 流式处理 JSON

```typescript
async function streamJsonOutput() {
  console.log('--- Streaming JSON Output ---');
  const parser = new JsonOutputParser();
  const chain = jsonModel.pipe(parser);
  const stream = await chain.stream(
    '请给我讲一个关于程序员的笑话，并以 JSON 格式返回，包含 `setup` 和 `punchline` 两个字段。',
  );

  for await (const chunk of stream) {
    console.log(chunk);
  }
  console.log('--- JSON Output Finished ---');
}
```

- **代码逻辑**：这个函数使用了一个特殊配置的 `jsonModel`，它通过 `modelKwargs` 参数被强制要求返回 JSON 格式的响应。处理链中的 `JsonOutputParser` 是这里的关键。与 `StringOutputParser` 不同，它不会立即输出每个接收到的数据块。相反，它会在内部累积这些数据块，并尝试将它们解析为 JSON。只有当一个有效的 JSON 对象片段被识别出来时，它才会将这个部分解析的对象（`chunk`）输出。你会看到，控制台会逐步打印出越来越完整的 JSON 对象，直到最后输出一个完全成形的 JSON。

## 核心 API

这个示例主要使用了以下几个核心的 LangChain.js API：

-   `ChatOpenAI`: 这是与 OpenAI 模型进行交互的主要类。我们通过它来发送请求。

-   `StringOutputParser`:
    -   **作用**：一个输出解析器，它的任务是将模型输出的原始消息块（`AIMessageChunk` 对象）转换为简单的字符串。
    -   **为什么需要它**：模型直接返回的流数据是结构化的对象，包含了内容（`content`）、工具调用信息等。如果我们只关心文本内容，直接处理这些对象会很繁琐，并且容易出错（如本示例修复的类型错误）。`StringOutputParser` 简化了这一过程，让我们能直接处理文本流。

-   `.pipe()`:
    -   **作用**：这是 LangChain 表达式语言（LCEL）的核心方法之一，用于将不同的处理单元（Runnable）像管道一样连接起来，形成一个处理链。
    -   **在本示例中**：我们使用 `model.pipe(parser)` 创建了一个链。当数据流经这个链时，它首先被 `model` 处理，然后其输出会立即作为输入传递给 `parser`。这使得流式处理和解析可以无缝衔接。

-   `.stream()`:
    -   **作用**：这是所有 Runnable 对象都具备的方法，用于启动流式处理。它会返回一个异步迭代器（Async Iterator），你可以通过循环来消费模型实时生成的每一个数据块。

### 深入理解数据块 (AIMessageChunk)

当不使用 `StringOutputParser` 直接从模型进行流式处理时，我们得到的数据块是 `AIMessageChunk` 对象。理解它的结构对于进行更高级的操作至关重要。

一个原始的 `AIMessageChunk` 对象看起来像这样：

```json
{
  "content": "Hello",
  "additional_kwargs": {},
  "response_metadata": {},
  "tool_call_chunks": [],
  "id": "chatcmpl-xxxxxxxx"
}
```

这些数据块是**可累加的**。你可以通过 `.concat()` 方法将多个 `AIMessageChunk` 合并成一个，这在需要手动聚合结果或检查中间状态时非常有用。

例如，你可以这样做：

```typescript
let finalChunk = chunks[0];
for (const chunk of chunks.slice(1)) {
  finalChunk = finalChunk.concat(chunk);
}
// finalChunk 现在包含了所有块的聚合内容
```

虽然在我们的示例中，`StringOutputParser` 自动处理了这一切，但了解底层的数据结构能帮助你更好地应对复杂的流式场景。

### 更进一步：流式处理 JSON 输出

除了流式输出纯文本，LangChain 还支持流式输出 JSON 对象。这在需要模型生成结构化数据并实时展示部分结果时非常有用。此时，我们会用到 `JsonOutputParser`。

-   **`JsonOutputParser`**:
    -   **作用**：当模型被指示以 JSON 格式输出时，这个解析器可以从一个文本流中智能地解析出完整的 JSON 对象。
    -   **工作原理**：它会累积所有传入的字符串块，直到形成一个有效的、可以被解析的 JSON 字符串，然后它会一次性地将这个解析后的 JSON 对象作为最终结果输出。这意味着，与 `StringOutputParser` 逐块输出不同，`JsonOutputParser` 会在流的末尾产生一个完整的、已解析的对象。

这个功能对于那些需要实时生成并验证结构化数据的应用场景（例如，动态生成表单、实时更新配置等）非常有价值。

为了查看一个完整的、可运行的示例，请参考 <mcfolder name="demo_5_Json_Output" path="src/demo_5_Json_Output/"></mcfolder>。

## 如何运行

在项目根目录下，执行以下命令来运行此示例：

```bash
npx tsx src/demo_4_Streaming/index.ts
```

你将会在终端看到模型对“你好！请你介绍一下你自己。”这个问题的实时、逐字回答。