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

    if (request.method === "POST" && route === "export") {
      return await dispatchExportWorkflow(request, env);
    }

    if (request.method === "GET" && route === "exports") {
      return await listExportRuns(env);
    }

    if (request.method === "GET" && route === "export-artifacts") {
      return await listExportArtifacts(env);
    }

    const artifactMatch = route.match(/^export-artifacts\/(\d+)\/download$/);
    if (request.method === "GET" && artifactMatch) {
      return await downloadExportArtifact(env, artifactMatch[1]);
    }

    const artifactDeleteMatch = route.match(/^export-artifacts\/(\d+)$/);
    if (request.method === "DELETE" && artifactDeleteMatch) {
      return await deleteExportArtifact(env, artifactDeleteMatch[1]);
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
    message: env.COMMIT_MESSAGE || "通过网页更新镜像列表",
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
    throw statusError(data.message || "触发转存任务失败", result.status);
  }

  return json({ ok: true }, 202);
}

async function dispatchExportWorkflow(request, env) {
  const body = await request.json().catch(() => ({}));
  const content = typeof body.content === "string" ? body.content.trim() : "";
  if (!content) {
    throw statusError("请先选择至少一个要导出的镜像", 400);
  }

  if (content.length > 60000) {
    throw statusError("选择的镜像列表过长，请减少数量后重试", 400);
  }

  const result = await github(env, `/repos/${repoPath(env)}/actions/workflows/${encodeURIComponent(exportWorkflowFile(env))}/dispatches`, {
    method: "POST",
    body: JSON.stringify({
      ref: branch(env),
      inputs: {
        images_b64: toBase64(content.endsWith("\n") ? content : `${content}\n`),
      },
    }),
  });

  if (!result.ok) {
    const data = await result.json().catch(() => ({}));
    throw statusError(data.message || "触发镜像包导出失败", result.status);
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

async function listExportRuns(env) {
  const result = await github(env, `/repos/${repoPath(env)}/actions/workflows/${encodeURIComponent(exportWorkflowFile(env))}/runs?branch=${encodeURIComponent(branch(env))}&per_page=6`);
  const data = await result.json();

  if (!result.ok) {
    throw statusError(data.message || "读取镜像包导出记录失败", result.status);
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

async function listExportArtifacts(env) {
  const result = await github(env, `/repos/${repoPath(env)}/actions/artifacts?per_page=30`);
  const data = await result.json();

  if (!result.ok) {
    throw statusError(data.message || "读取镜像包下载链接失败", result.status);
  }

  return json({
    artifacts: (data.artifacts || [])
      .filter((artifact) => artifact.workflow_run?.head_branch === branch(env))
      .filter((artifact) => artifact.name === "docker-images" || artifact.name.startsWith("docker-images-"))
      .slice(0, 6)
      .map((artifact) => ({
        id: artifact.id,
        name: artifact.name,
        filename: artifactFilename(artifact.name),
        size_in_bytes: artifact.size_in_bytes,
        expired: artifact.expired,
        created_at: artifact.created_at,
        expires_at: artifact.expires_at,
        download_url: `/api/export-artifacts/${artifact.id}/download`,
        workflow_run: artifact.workflow_run
          ? {
              id: artifact.workflow_run.id,
              html_url: artifact.workflow_run.html_url,
            }
          : null,
      })),
  });
}

async function downloadExportArtifact(env, artifactId) {
  const artifact = await getArtifact(env, artifactId);
  assertExportArtifact(artifact, env);
  const result = await github(env, `/repos/${repoPath(env)}/actions/artifacts/${encodeURIComponent(artifactId)}/zip`);

  if (!result.ok) {
    const data = await result.json().catch(() => ({}));
    throw statusError(data.message || "下载镜像包失败", result.status);
  }

  return new Response(result.body, {
    status: result.status,
    headers: {
      "content-type": result.headers.get("content-type") || "application/zip",
      "content-disposition": `attachment; filename="${artifactFilename(artifact.name)}"`,
      "cache-control": "no-store",
    },
  });
}

async function deleteExportArtifact(env, artifactId) {
  const artifact = await getArtifact(env, artifactId);
  assertExportArtifact(artifact, env);
  const result = await github(env, `/repos/${repoPath(env)}/actions/artifacts/${encodeURIComponent(artifactId)}`, {
    method: "DELETE",
  });

  if (!result.ok) {
    const data = await result.json().catch(() => ({}));
    throw statusError(data.message || "删除镜像包失败，请确认 GitHub Token 有 Actions 写权限", result.status);
  }

  return json({ ok: true });
}

async function getArtifact(env, artifactId) {
  const result = await github(env, `/repos/${repoPath(env)}/actions/artifacts/${encodeURIComponent(artifactId)}`);
  const data = await result.json().catch(() => ({}));

  if (!result.ok) {
    throw statusError(data.message || "读取镜像包信息失败", result.status);
  }

  return data;
}

function assertExportArtifact(artifact, env) {
  const isExportName = artifact?.name === "docker-images" || String(artifact?.name || "").startsWith("docker-images-");
  const isCurrentBranch = !artifact?.workflow_run?.head_branch || artifact.workflow_run.head_branch === branch(env);

  if (!isExportName || !isCurrentBranch) {
    throw statusError("只能操作当前分支生成的镜像包", 403);
  }
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
      message: "非公共仓库镜像，保存后由转存任务实际拉取。",
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
        message: `公共仓库鉴权检测失败：HTTP ${tokenResult.status}`,
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
        message: "公共仓库可拉取。",
      };
    }

    if ([401, 403, 404].includes(manifestResult.status)) {
      return {
        ...entry,
        status: "invalid",
        message: "公共仓库返回无权限或不存在，转存任务大概率会拉取失败。",
      };
    }

    return {
      ...entry,
      status: "unknown",
      message: `公共仓库暂时无法确认：HTTP ${manifestResult.status}`,
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

function exportWorkflowFile(env) {
  return env.EXPORT_WORKFLOW_FILE || "export-images.yaml";
}

function artifactFilename(name) {
  const safeName = String(name || "docker-images")
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120);
  return `${safeName || "docker-images"}.zip`;
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
