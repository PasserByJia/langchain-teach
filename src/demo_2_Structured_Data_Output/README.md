# Demo 2: 从语言模型中获取结构化数据

这个示例演示了如何使用 LangChain.js 从语言模型（如 OpenAI 的 GPT 模型）中获取结构化的 JSON 输出。我们使用 `zod` 来定义我们期望的数据模式，然后将模型与该模式绑定，以确保模型返回我们需要的格式。

## 如何运行

1.  确保你已经在根目录的 `.env` 文件中设置了 `OPENAI_API_KEY`。

2.  在项目根目录下运行以下命令：

    ```bash
   npx tsx ./src/demo_2_Structured_Dat/index.ts
    ```

3.  你将在控制台中看到一个关于猫的笑话的结构化输出，格式如下：

    ```json
    {
      "setup": "Why was the cat sitting on the computer?",
      "punchline": "To keep an eye on the mouse!",
      "rating": 8
    }
    ```

## 关键代码解释

*   **`src/demo_2_Structured_Dat/index.ts`**

    *   **定义 Zod 模式**: 我们使用 `zod` 创建一个 `jokeSchema`，它定义了我们期望从模型获得的笑话的数据结构，包括 `setup`（字符串）、`punchline`（字符串）和一个可选的 `rating`（数字）。

        ```typescript
        const jokeSchema = z.object({
          setup: z.string().describe('The setup of the joke'),
          punchline: z.string().describe('The punchline of the joke'),
          rating: z.number().optional().nullable().describe('The rating of the joke'),
        });
        ```

    *   **绑定模型与模式**: 我们使用 `withStructuredOutput` 方法将 `ChatOpenAI` 模型与我们的 `jokeSchema` 绑定。我们还指定了 `method: 'json_mode'` 来强制模型输出有效的 JSON。

        ```typescript
        const structuredLlm = model.withStructuredOutput(jokeSchema, {
          name: 'joke',
          method: 'json_mode',
        });
        ```

    *   **调用模型**: 最后，我们调用这个绑定了模式的模型，并传入一个提示，要求它讲一个关于猫的笑话。模型将返回一个符合 `jokeSchema` 的 JSON 对象。

        ```typescript
        const result = await structuredLlm.invoke([
          ['human', 'Telle me a joke about cats'],
        ]);
        ```