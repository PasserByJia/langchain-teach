import 'dotenv/config';
import { ChatOpenAI } from '@langchain/openai';
import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { HumanMessage, ToolMessage } from '@langchain/core/messages';

// 1. 定义模型
const llm = new ChatOpenAI({
  model: process.env.CHAT_MODEL_NAME,
  temperature: 0.7,
  configuration: {
    baseURL: process.env.API_BASE_URL,
    apiKey: process.env.API_KEY,
  },
});

// 2. 定义工具
const calculatorSchema = z.object({
  operation: z
    .enum(['add', 'subtract', 'multiply', 'divide'])
    .describe('The type of operation to execute.'),
  number1: z.number().describe('The first number to operate on.'),
  number2: z.number().describe('The second number to operate on.'),
});

const calculatorTool = tool(
  async ({ operation, number1, number2 }) => {
    if (operation === 'add') {
      return `${number1 + number2}`;
    } else if (operation === 'subtract') {
      return `${number1 - number2}`;
    } else if (operation === 'multiply') {
      return `${number1 * number2}`;
    } else if (operation === 'divide') {
      return `${number1 / number2}`;
    } else {
      throw new Error('Invalid operation.');
    }
  },
  {
    name: 'calculator',
    description: 'Can perform mathematical operations.',
    schema: calculatorSchema,
  },
);

async function main() {
  // 3. 绑定工具到模型
  const llmWithTools = llm.bindTools([calculatorTool]);
  // 4. 调用模型
  const messages = [new HumanMessage('What is 123 / 111')];
  const first_response = await llmWithTools.invoke(messages);

  console.log('First response (tool call):');
  console.log(JSON.stringify(first_response, null, 2));

  // 5. 执行工具并将结果返回给模型
  if (first_response.tool_calls && first_response.tool_calls.length > 0) {
    const toolCalls = first_response.tool_calls;
    const toolMessages = [];

    for (const call of toolCalls) {
      if (!call.id) {
        continue;
      }
      const toolOutput = await calculatorTool.invoke(call.args as any);
      toolMessages.push(
        new ToolMessage({
          tool_call_id: call.id,
          name: call.name,
          content: String(toolOutput),
        }),
      );
    }

    messages.push(first_response);
    messages.push(...toolMessages);

    const finalResponse = await llmWithTools.invoke(messages);

    console.log('\nFinal response (with content):');
    console.log(finalResponse.content);
    
  }
}

main();