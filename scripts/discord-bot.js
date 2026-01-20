// Discord bot that watches a specific channel and extracts tasks using LLM.
// Usage: node scripts/discord-bot.js (requires env vars below and discord.js installed)

/* eslint-disable @typescript-eslint/no-require-imports */
const { Client, GatewayIntentBits } = require("discord.js");

const {
  DISCORD_BOT_TOKEN,
  DISCORD_WATCH_CHANNEL_ID,
  DISCORD_INTEGRATION_URL = "http://localhost:3000/api/integrations/discord",
  DISCORD_INTEGRATION_TOKEN,
  OPENAI_API_KEY,
} = process.env;

if (
  !DISCORD_BOT_TOKEN ||
  !DISCORD_WATCH_CHANNEL_ID ||
  !DISCORD_INTEGRATION_TOKEN
) {
  console.error(
    "Missing env: DISCORD_BOT_TOKEN, DISCORD_WATCH_CHANNEL_ID, DISCORD_INTEGRATION_TOKEN",
  );
  process.exit(1);
}

if (!OPENAI_API_KEY) {
  console.error("Missing env: OPENAI_API_KEY (required for task extraction)");
  process.exit(1);
}

/**
 * Use LLM to determine if a message contains a task/todo item.
 * Returns { isTask: boolean, title?: string }
 */
async function analyzeMessage(content) {
  const systemPrompt = `あなたはメッセージからタスクを抽出するアシスタントです。
ユーザーのメッセージを読んで、それがタスク・TODO・やるべきこと・依頼・作業項目を含むかどうか判断してください。

判断基準:
- 「〜する」「〜やる」「〜対応」「〜修正」「〜追加」などの行動を示す内容はタスク
- そうでない場合も、内容がタスクに見受けられる場合も追加
- 質問、雑談、感想、報告だけの場合はタスクではない
- 「〜してほしい」「〜お願い」などの依頼もタスク

JSON形式で回答してください:
{"isTask": true/false, "title": "タスクの場合は簡潔なタイトル(30文字以内)"}`;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content },
        ],
        max_tokens: 100,
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      console.error("OpenAI API error:", res.status);
      return { isTask: false };
    }

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content ?? "{}";
    const result = JSON.parse(text);
    return {
      isTask: result.isTask === true,
      title: result.title || null,
    };
  } catch (error) {
    console.error("LLM analysis failed:", error.message);
    return { isTask: false };
  }
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
  console.log(`Watching channel: ${DISCORD_WATCH_CHANNEL_ID}`);
  console.log("Mode: LLM task extraction");
});

client.on("messageCreate", async (message) => {
  // Ignore bot messages
  if (message.author.bot) return;

  // Only watch the specified channel
  if (message.channel.id !== DISCORD_WATCH_CHANNEL_ID) return;

  const content = message.content.trim();
  if (!content) return;

  // Analyze with LLM
  const analysis = await analyzeMessage(content);

  if (!analysis.isTask) {
    console.log(`[Skip] Not a task: ${content.slice(0, 50)}...`);
    return;
  }

  console.log(`[Task] Detected: ${analysis.title}`);

  try {
    const res = await fetch(DISCORD_INTEGRATION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DISCORD_INTEGRATION_TOKEN}`,
      },
      body: JSON.stringify({
        title: analysis.title,
        body: content,
        source: "discord",
        author: message.author.username,
        channel: message.channel.name,
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      console.error(`Failed to create intake: ${data.error ?? res.status}`);
      await message.react("❌");
      return;
    }

    const data = await res.json();
    console.log(`Created intake item ${data.itemId}: ${analysis.title}`);
    await message.react("📝");
  } catch (error) {
    console.error("Create intake failed", error);
    await message.react("❌");
  }
});

client.login(DISCORD_BOT_TOKEN);
