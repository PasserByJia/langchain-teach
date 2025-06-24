# 演示 1：Hello World

本演示展示了一个使用 LangChain.js 和 OpenAI 兼容模型的基本“Hello World”示例。

## 如何运行

1.  **安装依赖：**

    ```bash
    npm install
    ```

2.  **设置环境变量：**

    在项目根目录创建一个 `.env` 文件，并添加以下变量：

    ```
    CHAT_MODEL_NAME="你的模型名称"
    API_BASE_URL="你的API基础URL"
    API_KEY="你的API密钥"
    ```

3.  **运行脚本：**

    ```bash
    npx tsx ./src/demo_1_Hello_World/index.ts   
    ```

    这将执行 `src/demo1_Hello_World/index.ts` 文件，该文件会初始化一个 `ChatOpenAI` 模型，发送一句问候，并将模型的响应打印到控制台。

## `ChatOpenAI` 参数说明

在 `index.ts` 中，我们这样初始化 `ChatOpenAI`：

```typescript
const model = new ChatOpenAI({
    model: process.env.CHAT_MODEL_NAME, // 指定要使用的模型名称
    configuration: {
        baseURL: process.env.API_BASE_URL, // API 的基础 URL
        apiKey: process.env.API_KEY, // API 密钥
    },
    cache: true, // 启用缓存以提高重复查询的响应速度
    temperature: 0.7 // 控制生成文本的随机性，值越高越随机
})
```

- `model`: 指定了您希望使用的具体模型，例如 `gpt-3.5-turbo`。
- `configuration`: 这是一个对象，用于配置 API 的连接信息。详细参数如下表所示：

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `apiKey` | `string` | (可选) 您的 OpenAI API 密钥。默认为 `process.env['OPENAI_API_KEY']`。 |
| `organization` | `string` | (可选) 您的 OpenAI 组织 ID。默认为 `process.env['OPENAI_ORG_ID']`。 |
| `project` | `string` | (可选) 您的 OpenAI 项目 ID。默认为 `process.env['OPENAI_PROJECT_ID']`。 |
| `baseURL` | `string` | (可选) API 的基础 URL。如果您使用的是自定义的 OpenAI 兼容服务，则需要设置此项。默认为 `process.env['OPENAI_BASE_URL']`。 |
| `timeout` | `number` | (可选) 单个请求的超时时间（毫秒）。 |
| `httpAgent` | `Agent` | (可选) 用于管理 HTTP(S) 连接的 `http.Agent`。 |
| `fetch` | `function` | (可选) 自定义的 `fetch` 函数实现。 |
| `maxRetries` | `number` | (可选) 请求失败时的最大重试次数，默认为 2。 |
| `defaultHeaders` | `object` | (可选) 每个请求都包含的默认请求头。 |
| `defaultQuery` | `object` | (可选) 每个请求都包含的默认查询参数。 |
| `dangerouslyAllowBrowser` | `boolean` | (可选) 是否允许在浏览器环境中使用，默认为 `false`。开启此选项可能会暴露您的 API 密钥，请谨慎使用。 |
- `cache`: 设置为 `true` 可以将模型的响应缓存起来。当后续有完全相同的请求时，可以直接从缓存中返回结果，而无需再次调用 API，这样可以节省时间和成本。
- `temperature`: 这个参数控制模型输出的创造性或随机性。值在 0 到 1 之间。较低的值（如 0.2）会使输出更具确定性和一致性，而较高的值（如 0.8）则会使输出更加多样和富有创意。