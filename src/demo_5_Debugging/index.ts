import 'dotenv/config';
import { ChatOpenAI } from '@langchain/openai';
import { Calculator } from '@langchain/community/tools/calculator';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { AgentExecutor, createToolCallingAgent } from 'langchain/agents';

// 实例化模型，开启 verbose 模式
// 开启 verbose 模式后，模型在处理请求时会打印详细的日志，包括输入的提示、工具的调用、输出的结果等
const llm = new ChatOpenAI({
  configuration: {
    baseURL: process.env.API_BASE_URL,
    apiKey: process.env.API_KEY,
  },
  model: process.env.CHAT_MODEL_NAME,
  temperature: 0,
  verbose: true, // 开启 verbose 模式
});

// 定义工具
const tools = [new Calculator()];

// 定义提示模板
const prompt = ChatPromptTemplate.fromMessages([
  ['system', '你是一个乐于助人的助手'],
  ['human', '{input}'],
  ['placeholder', '{agent_scratchpad}'],
]);

async function main() {
  // 创建 Agent
  const agent = await createToolCallingAgent({
    llm,
    tools,
    prompt,
  });

  // 创建 Agent 执行器
  const agentExecutor = new AgentExecutor({
    agent,
    tools,
    verbose: true, // 开启 verbose 模式
  });

  // 执行 Agent
  const result = await agentExecutor.invoke({
    input:
      '298 乘以 382，然后除以 2.5 的结果是多少？',
  });

  // 打印结果
  console.log(result);
}

main();