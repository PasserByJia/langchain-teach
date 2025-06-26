import { ChatOpenAI } from "@langchain/openai";
import { config } from 'dotenv';
import { model } from '../model';

// 加载 .env 文件中的环境变量
config();

/**
 * 主函数，演示如何使用 ChatOpenAI
 */
async function main() {
    
    // 调用模型的 invoke 方法
    const res = await model.invoke("你好");

    // 将模型的响应内容打印到控制台
    console.log(res.content);
}

// 执行主函数
main();
