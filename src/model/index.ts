import { ChatOpenAI } from "@langchain/openai";
import { config } from 'dotenv';

// 加载 .env 文件中的环境变量
config();

// 实例化一个 ChatOpenAI 模型
export const model = new ChatOpenAI({
    // 指定要使用的模型名称，从环境变量中读取
    model: process.env.CHAT_MODEL_NAME,
    // 配置 API 的连接信息
    configuration: {
        // API 的基础 URL，从环境变量中读取
        baseURL: process.env.API_BASE_URL,
        // API 密钥，从环境变量中读取
        apiKey: process.env.API_KEY,
    },
    // 设置温度参数，控制模型输出的随机性。较高的值会产生更多样、更具创意的输出。
    temperature: 0.7
})