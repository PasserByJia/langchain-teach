import 'dotenv/config';
import { ChatOpenAI } from '@langchain/openai';
import { StringOutputParser, JsonOutputParser } from '@langchain/core/output_parsers';
import { model } from "../model";

// 支持 JSON 输出的模型实例
const jsonModel = new ChatOpenAI({
  configuration: {
    baseURL: process.env.API_BASE_URL,
    apiKey: process.env.API_KEY,
  },
  model: process.env.CHAT_MODEL_NAME,
  temperature: 0,
  modelKwargs: {
    response_format: {
      type: 'json_object',
    },
  },
});

/**
 * 演示如何流式处理字符串输出
 */
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

/**
 * 演示如何流式处理 JSON 输出
 */
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

async function main() {
  await streamStringOutput();
  await streamJsonOutput();
}

main().catch(console.error);