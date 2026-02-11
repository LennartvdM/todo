import type { Context } from "@netlify/functions";

interface Task {
  name: string;
  category: string;
  deadline: string | null;
  recurringDays: number | null;
  deferCount: number;
  lastCompleted: string | null;
  dateAdded: string;
}

interface RequestBody {
  tasks?: Task[];
  time_of_day?: "morning" | "afternoon";
}

const DEFAULT_TASKS: Task[] = [
  {
    name: "Finish renovation",
    category: "household",
    deadline: null,
    recurringDays: null,
    deferCount: 0,
    lastCompleted: null,
    dateAdded: new Date().toISOString(),
  },
  {
    name: "Finish bedroom",
    category: "household",
    deadline: null,
    recurringDays: null,
    deferCount: 0,
    lastCompleted: null,
    dateAdded: new Date().toISOString(),
  },
  {
    name: "Hang BESTA drawers",
    category: "household",
    deadline: null,
    recurringDays: null,
    deferCount: 0,
    lastCompleted: null,
    dateAdded: new Date().toISOString(),
  },
  {
    name: "Sort and put away laundry in guest room",
    category: "household",
    deadline: null,
    recurringDays: null,
    deferCount: 0,
    lastCompleted: null,
    dateAdded: new Date().toISOString(),
  },
  {
    name: "Write novel",
    category: "hobbies",
    deadline: null,
    recurringDays: 2,
    deferCount: 0,
    lastCompleted: null,
    dateAdded: new Date().toISOString(),
  },
  {
    name: "Set up new desk",
    category: "household",
    deadline: null,
    recurringDays: null,
    deferCount: 0,
    lastCompleted: null,
    dateAdded: new Date().toISOString(),
  },
];

const SYSTEM_PROMPT = `You are a task check-in assistant. Your job is to analyze someone's task list and give them a brief, useful check-in.

Analyze the tasks by:
- Urgency: tasks with deadlines approaching come first
- Neglect: how many days since the task was last completed or added with no action
- Defer count: tasks that keep getting deferred signal avoidance
- Category balance: notice if one category is dominating or being ignored
- Recurring tasks: flag any that are overdue based on their recurringDays interval

Be direct and conversational. No corporate speak, no bullet-point soup. Talk like a straightforward friend who actually wants you to get stuff done.

Give your top 3 recommendations with brief reasoning for each. If you see patterns of avoidance (high defer counts, tasks sitting untouched for a long time, one category always ignored), call them out honestly but without being harsh.

Adapt your tone based on the time of day:
- Morning: planning mode. Help them pick what to focus on today. Be energizing.
- Afternoon: progress check. Acknowledge what's realistic for the rest of the day. Be pragmatic.

Keep it concise — this is a check-in, not an essay.`;

export default async (req: Request, _context: Context) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const webhookSecret = Netlify.env.get("WEBHOOK_SECRET");
  if (!webhookSecret) {
    return new Response(
      JSON.stringify({ error: "Server misconfigured: missing WEBHOOK_SECRET" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader || authHeader !== `Bearer ${webhookSecret}`) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const apiKey = Netlify.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) {
    return new Response(
      JSON.stringify({
        error: "Server misconfigured: missing ANTHROPIC_API_KEY",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  let body: RequestBody = {};
  try {
    const text = await req.text();
    if (text) {
      body = JSON.parse(text);
    }
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const tasks = body.tasks ?? DEFAULT_TASKS;
  const timeOfDay = body.time_of_day ?? "morning";
  const now = new Date();

  const userMessage = `Here is my current task list:

${JSON.stringify(tasks, null, 2)}

Current date/time: ${now.toISOString()}
Time of day: ${timeOfDay}`;

  const anthropicResponse = await fetch(
    "https://api.anthropic.com/v1/messages",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: userMessage }],
      }),
    }
  );

  if (!anthropicResponse.ok) {
    const errorText = await anthropicResponse.text();
    return new Response(
      JSON.stringify({
        error: "Anthropic API error",
        status: anthropicResponse.status,
        details: errorText,
      }),
      { status: 502, headers: { "Content-Type": "application/json" } }
    );
  }

  const anthropicData = await anthropicResponse.json();
  const briefing =
    anthropicData.content?.[0]?.text ?? "No response generated.";

  return new Response(
    JSON.stringify({
      briefing,
      timestamp: now.toISOString(),
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
};
