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

    if (request.method === "POST" && route === "validate-images") {
      return await validateImages(request);
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

async function validateImages(request) {
  const body = await request.json().catch(() => ({}));
  if (typeof body.content !== "string") {
    throw statusError("请求缺少 content 字段", 400);
  }

  const images = parseImageLines(body.content).slice(0, 50);
  const results = [];

  for (const entry of images) {
    results.push(await validateImage(entry));
  }

  return json({
    checkedAt: new Date().toISOString(),
    results,
    summary: {
      total: results.length,
      valid: results.filter((item) => item.status === "valid").length,
      invalid: results.filter((item) => item.status === "invalid").length,
      skipped: results.filter((item) => item.status === "skipped").length,
      unknown: results.filter((item) => item.status === "unknown").length,
    },
  });
}

function parseImageLines(content) {
  return content
    .split("\n")
    .map((rawLine, index) => ({ rawLine, lineNumber: index + 1, line: rawLine.trim() }))
    .filter((entry) => entry.line && !entry.line.startsWith("#"))
    .map((entry) => ({
      lineNumber: entry.lineNumber,
      raw: entry.line,
      image: entry.line.split(/\s+/).at(-1),
    }))
    .filter((entry) => entry.image);
}

async function validateImage(entry) {
  const parsed = parseImageReference(entry.image);
  if (!parsed.isDockerHub) {
    return {
      ...entry,
      status: "skipped",
      message: "非 Docker Hub 镜像，保存后由 GitHub Action 实际拉取。",
    };
  }

  try {
    const tokenResult = await fetchWithTimeout(
      `https://auth.docker.io/token?service=registry.docker.io&scope=repository:${encodeURIComponent(parsed.repository)}:pull`,
    );
    const tokenData = await tokenResult.json().catch(() => ({}));

    if (!tokenResult.ok || !tokenData.token) {
      return {
        ...entry,
        status: "unknown",
        message: `Docker Hub 鉴权检测失败：HTTP ${tokenResult.status}`,
      };
    }

    const manifestResult = await fetchWithTimeout(`https://registry-1.docker.io/v2/${parsed.repository}/manifests/${encodeURIComponent(parsed.reference)}`, {
      headers: {
        accept: [
          "application/vnd.docker.distribution.manifest.v2+json",
          "application/vnd.docker.distribution.manifest.list.v2+json",
          "application/vnd.oci.image.manifest.v1+json",
          "application/vnd.oci.image.index.v1+json",
        ].join(", "),
        authorization: `Bearer ${tokenData.token}`,
      },
    });

    if (manifestResult.ok) {
      return {
        ...entry,
        status: "valid",
        message: "Docker Hub 可公开拉取。",
      };
    }

    if ([401, 403, 404].includes(manifestResult.status)) {
      return {
        ...entry,
        status: "invalid",
        message: "Docker Hub 返回无权限或不存在，GitHub Action 大概率会 pull 失败。",
      };
    }

    return {
      ...entry,
      status: "unknown",
      message: `Docker Hub 暂时无法确认：HTTP ${manifestResult.status}`,
    };
  } catch (error) {
    return {
      ...entry,
      status: "unknown",
      message: `检测请求失败：${formatError(error)}`,
    };
  }
}

function formatError(error) {
  if (typeof error === "string") {
    return error;
  }

  return error?.cause?.message || error?.message || "未知错误";
}

function parseImageReference(image) {
  const imageWithoutDigest = image.split("@")[0];
  const digest = image.includes("@") ? image.split("@").at(-1) : "";
  const parts = imageWithoutDigest.split("/");
  const firstPart = parts[0] || "";
  const hasRegistry = firstPart.includes(".") || firstPart.includes(":") || firstPart === "localhost";
  const registry = hasRegistry ? firstPart : "docker.io";
  const pathParts = hasRegistry ? parts.slice(1) : parts;
  const isDockerHub = registry === "docker.io" || registry === "registry-1.docker.io";
  const lastPart = pathParts.at(-1) || "";
  const tagSeparator = lastPart.lastIndexOf(":");
  const hasTag = tagSeparator > -1;
  const tag = hasTag ? lastPart.slice(tagSeparator + 1) : "latest";
  const nameWithoutTag = hasTag ? lastPart.slice(0, tagSeparator) : lastPart;
  const repositoryParts = [...pathParts.slice(0, -1), nameWithoutTag].filter(Boolean);
  const repository = repositoryParts.length === 1 ? `library/${repositoryParts[0]}` : repositoryParts.join("/");

  return {
    isDockerHub,
    repository,
    reference: digest || tag,
  };
}

async function fetchWithTimeout(url, init = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort("timeout"), 8000);
  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
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
