const OAUTH_BASE = "https://oauth.reddit.com";
const REDDIT_AGENT = "web:redditwrapped:0.1.0 (by /u/redditwrapped_dev)";

function getAccessToken() {
  return import.meta.env.VITE_REDDIT_TOKEN;
}

function buildHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
    "User-Agent": REDDIT_AGENT
  };
}

async function redditRequest(path, token, logCall) {
  const url = `${OAUTH_BASE}${path}`;
  logCall?.(`GET ${path}`);

  const response = await fetch(url, {
    method: "GET",
    headers: buildHeaders(token)
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Reddit ${response.status}: ${body.slice(0, 140)}`);
  }

  return response.json();
}

export async function fetchRedditBootstrap(logCall) {
  const token = getAccessToken();

  if (!token) {
    throw new Error("Missing VITE_REDDIT_TOKEN. Add a Reddit OAuth token to run live API calls.");
  }

  const username = import.meta.env.VITE_REDDIT_USERNAME || "me";
  const randomSubs = ["technology", "programming", "dataisbeautiful", "fitness", "movies"];
  const randomSub = randomSubs[Math.floor(Math.random() * randomSubs.length)];

  const [profile, overview, subscriptions, randomProbe] = await Promise.all([
    redditRequest("/api/v1/me", token, logCall),
    redditRequest(`/user/${username}/overview?limit=8`, token, logCall),
    redditRequest("/subreddits/mine/subscriber?limit=8", token, logCall),
    redditRequest(`/r/${randomSub}/hot?limit=5`, token, logCall)
  ]);

  return {
    profile,
    overview,
    subscriptions,
    randomProbe,
    randomSub
  };
}
