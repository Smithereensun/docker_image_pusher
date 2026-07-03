const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
};

export async function onRequest(context) {
  try {
    const { request, env } = context;
    const route = new URL(request.url).pathname.replace(/^\/api\/?/, "");

    assertConfigured(env);
    assertAuthorized(request, env);

    if (request.method === "GET" && route === "config") {
      return json({
        owner: env.GITHUB_OWNER,
        repo: env.GITHUB_REPO,
        branch: branch(env),
        filePath: imageFilePath(env),
        workflow: workflowFile(env),
      });
    }

    if (request.method === "GET" && route === "images") {
      return await getImages(env);
    }

    if (request.method === "PUT" && route === "images") {
      return await updateImages(request, env);
    }

    if (request.method === "POST" && route === "run") {
      return await dispatchWorkflow(env);
    }

    if (request.method === "GET" && route === "runs") {
      return await listRuns(env);
    }

    return json({ error: "接口不存在" }, 404);
  } catch (error) {
    return json({ error: error.message || "服务器错误" }, error.status || 500);
  }
}

async function getImages(env) {
  const result = await github(env, `/repos/${repoPath(env)}/contents/${encodePath(imageFilePath(env))}?ref=${encodeURIComponent(branch(env))}`);

  if (result.status === 404) {
    return json({ content: "", sha: null });
  }

  const data = await result.json();
  if (!result.ok) {
    throw statusError(data.message || "读取 images.txt 失败", result.status);
  }

  return json({
    content: fromBase64(data.content || ""),
    sha: data.sha || null,
  });
}

async function updateImages(request, env) {
  const body = await request.json().catch(() => ({}));
  if (typeof body.content !== "string") {
    throw statusError("请求缺少 content 字段", 400);
  }

  const existingSha = await resolveSha(env, body.sha);
  const payload = {
    message: env.COMMIT_MESSAGE || "Update images.txt from Cloudflare Pages",
    content: toBase64(body.content.endsWith("\n") ? body.content : `${body.content}\n`),
    branch: branch(env),
  };

  if (existingSha) {
    payload.sha = existingSha;
  }

  const result = await github(env, `/repos/${repoPath(env)}/contents/${encodePath(imageFilePath(env))}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  const data = await result.json();

  if (!result.ok) {
    throw statusError(data.message || "提交 images.txt 失败", result.status);
  }

  return json({
    sha: data.content?.sha || null,
    commit: data.commit?.html_url || null,
  });
}

async function dispatchWorkflow(env) {
  const result = await github(env, `/repos/${repoPath(env)}/actions/workflows/${encodeURIComponent(workflowFile(env))}/dispatches`, {
    method: "POST",
    body: JSON.stringify({ ref: branch(env) }),
  });

  if (!result.ok) {
    const data = await result.json().catch(() => ({}));
    throw statusError(data.message || "触发 workflow 失败", result.status);
  }

  return json({ ok: true }, 202);
}

async function listRuns(env) {
  const result = await github(env, `/repos/${repoPath(env)}/actions/workflows/${encodeURIComponent(workflowFile(env))}/runs?branch=${encodeURIComponent(branch(env))}&per_page=6`);
  const data = await result.json();

  if (!result.ok) {
    throw statusError(data.message || "读取运行记录失败", result.status);
  }

  return json({
    runs: (data.workflow_runs || []).map((run) => ({
      id: run.id,
      run_number: run.run_number,
      status: run.status,
      conclusion: run.conclusion,
      event: run.event,
      created_at: run.created_at,
      html_url: run.html_url,
    })),
  });
}

async function resolveSha(env, submittedSha) {
  if (submittedSha) {
    return submittedSha;
  }

  const result = await github(env, `/repos/${repoPath(env)}/contents/${encodePath(imageFilePath(env))}?ref=${encodeURIComponent(branch(env))}`);
  if (result.status === 404) {
    return null;
  }

  const data = await result.json();
  if (!result.ok) {
    throw statusError(data.message || "读取当前文件版本失败", result.status);
  }
  return data.sha || null;
}

async function github(env, path, init = {}) {
  return fetch(`https://api.github.com${path}`, {
    ...init,
    headers: {
      accept: "application/vnd.github+json",
      authorization: `Bearer ${env.GITHUB_TOKEN}`,
      "content-type": "application/json",
      "user-agent": "docker-image-pusher-cloudflare",
      "x-github-api-version": "2022-11-28",
      ...(init.headers || {}),
    },
  });
}

function assertConfigured(env) {
  const missing = ["APP_PASSWORD", "GITHUB_TOKEN", "GITHUB_OWNER", "GITHUB_REPO"].filter((key) => !env[key]);
  if (missing.length) {
    throw statusError(`缺少 Cloudflare 环境变量：${missing.join(", ")}`, 500);
  }
}

function assertAuthorized(request, env) {
  const header = request.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!safeEqual(token, env.APP_PASSWORD)) {
    throw statusError("访问密码不正确", 401);
  }
}

function safeEqual(left, right) {
  if (!left || !right || left.length !== right.length) {
    return false;
  }

  let result = 0;
  for (let index = 0; index < left.length; index += 1) {
    result |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return result === 0;
}

function repoPath(env) {
  return `${env.GITHUB_OWNER}/${env.GITHUB_REPO}`;
}

function branch(env) {
  return env.GITHUB_BRANCH || "main";
}

function imageFilePath(env) {
  return env.IMAGE_FILE_PATH || "images.txt";
}

function workflowFile(env) {
  return env.WORKFLOW_FILE || "docker.yaml";
}

function encodePath(path) {
  return path.split("/").map(encodeURIComponent).join("/");
}

function toBase64(value) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  for (let index = 0; index < bytes.length; index += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
  }
  return btoa(binary);
}

function fromBase64(value) {
  const clean = value.replace(/\s/g, "");
  const binary = atob(clean);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: JSON_HEADERS,
  });
}

function statusError(message, status) {
  const error = new Error(message);
  error.status = status;
  return error;
}
