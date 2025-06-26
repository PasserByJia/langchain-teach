import 'dotenv/config';
import { ChatOpenAI } from '@langchain/openai';
import { z } from 'zod';
import { model } from '../model';

// 使用 Zod 定义我们期望的输出模式
const jokeSchema = z.object({
  setup: z.string().describe('The setup of the joke'),
  punchline: z.string().describe('The punchline to the joke'),
  rating: z.number().optional().nullable().describe('How funny the joke is, from 1 to 10'),
});

async function main() {
  // 使用 withStructuredOutput 方法将模型与我们的模式绑定
  const structuredLlm = model.withStructuredOutput(jokeSchema, {
    name: 'joke',  //并非强制要求，但我们可以为模式传递一个名称，以便为模型提供有关模式所代表内容的额外上下文，从而提高性能
    method: 'json_mode',
  });

  // 调用模型并获取结构化输出
  const result = await structuredLlm.invoke('Tell me a joke about cats');

  // 打印结果
  console.log(result);
}

main();