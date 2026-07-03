const state = {
  password: localStorage.getItem("docker-images-pusher-password") || "",
  sha: null,
  originalContent: "",
  config: null,
  busy: false,
};

const elements = {
  connectionStatus: document.querySelector("#connectionStatus"),
  loginPanel: document.querySelector("#loginPanel"),
  loginForm: document.querySelector("#loginForm"),
  password: document.querySelector("#password"),
  workspace: document.querySelector("#workspace"),
  repoLabel: document.querySelector("#repoLabel"),
  imagesEditor: document.querySelector("#imagesEditor"),
  imageCount: document.querySelector("#imageCount"),
  refreshButton: document.querySelector("#refreshButton"),
  saveButton: document.querySelector("#saveButton"),
  runButton: document.querySelector("#runButton"),
  exportButton: document.querySelector("#exportButton"),
  downloadMeta: document.querySelector("#downloadMeta"),
  downloadsList: document.querySelector("#downloadsList"),
  validateButton: document.querySelector("#validateButton"),
  validationList: document.querySelector("#validationList"),
  runsRefreshButton: document.querySelector("#runsRefreshButton"),
  runsList: document.querySelector("#runsList"),
  toast: document.querySelector("#toast"),
};

elements.password.value = state.password;

elements.loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  state.password = elements.password.value.trim();
  localStorage.setItem("docker-images-pusher-password", state.password);
  await connect();
});

elements.refreshButton.addEventListener("click", () => loadImages());
elements.saveButton.addEventListener("click", () => saveImages());
elements.runButton.addEventListener("click", () => runWorkflow());
elements.exportButton.addEventListener("click", () => exportImages());
elements.validateButton.addEventListener("click", () => validateCurrentImages(true));
elements.runsRefreshButton.addEventListener("click", () => loadRuns());
elements.downloadsList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-download-url]");
  if (!button) {
    return;
  }
  downloadArtifact(button.dataset.downloadUrl);
});
elements.imagesEditor.addEventListener("input", () => {
  updateCount();
  renderDownloadMeta();
  elements.validationList.textContent = "内容已修改，保存前会重新检测。";
});

if (state.password) {
  connect();
}

async function connect() {
  try {
    setBusy(true);
    state.config = await api("/api/config");
    elements.repoLabel.textContent = `${state.config.owner}/${state.config.repo} · ${state.config.branch}`;
    elements.connectionStatus.textContent = "已连接";
    elements.connectionStatus.classList.add("ok");
    elements.loginPanel.classList.add("is-hidden");
    elements.workspace.classList.remove("is-hidden");
    await Promise.all([loadImages(), loadRuns(), loadDownloads()]);
  } catch (error) {
    showToast(error.message, true);
    elements.connectionStatus.textContent = "连接失败";
    elements.connectionStatus.classList.remove("ok");
  } finally {
    setBusy(false);
  }
}

async function loadImages() {
  try {
    setBusy(true);
    const data = await api("/api/images");
    state.sha = data.sha;
    state.originalContent = data.content || "";
    elements.imagesEditor.value = state.originalContent;
    updateCount();
    renderDownloadMeta();
    showToast("已读取 images.txt");
  } catch (error) {
    showToast(error.message, true);
  } finally {
    setBusy(false);
  }
}

async function saveImages() {
  try {
    setBusy(true);
    const content = elements.imagesEditor.value.replace(/\r\n/g, "\n");
    if (content === state.originalContent) {
      showToast("内容没有变化，无需提交");
      return;
    }

    const validation = await validateImages(content);
    renderValidation(validation.results || []);
    if ((validation.summary?.invalid || 0) > 0) {
      showToast("发现无法公开拉取的镜像，请处理后再保存", true);
      return;
    }

    const payload = {
      content,
      sha: state.sha,
    };
    const data = await api("/api/images", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    state.sha = data.sha;
    state.originalContent = payload.content.endsWith("\n") ? payload.content : `${payload.content}\n`;
    showToast("已提交到 GitHub，Action 会自动开始运行");
    await loadRuns();
  } catch (error) {
    showToast(error.message, true);
  } finally {
    setBusy(false);
  }
}

async function validateCurrentImages(showSuccessToast = false) {
  try {
    setBusy(true);
    const validation = await validateImages(elements.imagesEditor.value.replace(/\r\n/g, "\n"));
    renderValidation(validation.results || []);
    if ((validation.summary?.invalid || 0) > 0) {
      showToast("发现无法公开拉取的镜像", true);
      return validation;
    }

    if (showSuccessToast) {
      showToast("检测完成，未发现阻断项");
    }
    return validation;
  } catch (error) {
    showToast(error.message, true);
    return null;
  } finally {
    setBusy(false);
  }
}

async function validateImages(content) {
  return api("/api/validate-images", {
    method: "POST",
    body: JSON.stringify({ content }),
  });
}

async function runWorkflow() {
  try {
    setBusy(true);
    await api("/api/run", { method: "POST" });
    showToast("已触发 GitHub Action");
    setTimeout(loadRuns, 1200);
  } catch (error) {
    showToast(error.message, true);
  } finally {
    setBusy(false);
  }
}

async function loadRuns() {
  try {
    const data = await api("/api/runs");
    renderRuns(data.runs || []);
  } catch (error) {
    elements.runsList.textContent = error.message;
  }
}

async function exportImages() {
  try {
    setBusy(true);
    await api("/api/export", { method: "POST" });
    showToast("已开始生成镜像包，完成后会出现下载链接");
    setTimeout(loadDownloads, 2500);
  } catch (error) {
    showToast(error.message, true);
  } finally {
    setBusy(false);
  }
}

async function loadDownloads() {
  try {
    const [runsData, artifactsData] = await Promise.all([
      api("/api/exports"),
      api("/api/export-artifacts"),
    ]);
    renderDownloads(runsData.runs || [], artifactsData.artifacts || []);
  } catch (error) {
    elements.downloadsList.textContent = error.message;
  }
}

async function downloadArtifact(path) {
  try {
    setBusy(true);
    const response = await fetch(path, {
      headers: {
        authorization: `Bearer ${state.password}`,
      },
    });

    if (!response.ok) {
      const text = await response.text();
      const data = text ? parseJson(text) : {};
      throw new Error(data.error || text || `下载失败：${response.status}`);
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "docker-images.zip";
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    showToast("镜像包开始下载");
  } catch (error) {
    showToast(error.message, true);
  } finally {
    setBusy(false);
  }
}

function renderValidation(results) {
  if (!results.length) {
    elements.validationList.textContent = "没有需要检测的有效镜像。";
    return;
  }

  const visibleResults = [
    ...results.filter((item) => item.status === "invalid"),
    ...results.filter((item) => item.status === "unknown"),
    ...results.filter((item) => item.status === "skipped").slice(0, 3),
  ];

  if (!visibleResults.length) {
    elements.validationList.innerHTML = '<div class="validation-item ok"><strong>检测通过</strong><span class="validation-meta">Docker Hub 公共镜像均可公开拉取。</span></div>';
    return;
  }

  elements.validationList.innerHTML = visibleResults
    .map((item) => {
      const className = item.status === "invalid" ? "error" : item.status === "valid" ? "ok" : "";
      return `
        <div class="validation-item ${className}">
          <strong>第 ${escapeHtml(item.lineNumber)} 行：${escapeHtml(item.image)}</strong>
          <span class="validation-meta">${escapeHtml(item.message)}</span>
        </div>
      `;
    })
    .join("");
}

function renderDownloadMeta() {
  const entries = parseManagedImageLines(elements.imagesEditor.value || "");

  if (!entries.length) {
    elements.downloadMeta.textContent = "当前没有可导出的有效镜像。";
    return;
  }

  elements.downloadMeta.textContent = `将为 ${entries.length} 个镜像生成 docker-images.tar.gz，完成后可用浏览器下载。`;
}

function renderDownloads(runs, artifacts) {
  const latestRun = runs[0];
  const availableArtifacts = artifacts.filter((artifact) => !artifact.expired);

  if (!latestRun && !availableArtifacts.length) {
    elements.downloadsList.textContent = "暂无镜像包";
    return;
  }

  const runStatus = latestRun ? latestRun.conclusion || latestRun.status || "unknown" : "";
  const artifactItems = availableArtifacts
    .map((artifact) => {
      const createdAt = new Date(artifact.created_at).toLocaleString();
      return `
        <div class="download-item">
          <button class="link-button" type="button" data-download-url="${escapeHtml(artifact.download_url)}">下载 docker-images.zip</button>
          <span class="run-meta">${formatBytes(artifact.size_in_bytes)} · ${escapeHtml(createdAt)}</span>
        </div>
      `;
    })
    .join("");

  elements.downloadsList.innerHTML = `
    ${latestRun ? `<div class="download-item"><a href="${escapeHtml(latestRun.html_url)}" target="_blank" rel="noreferrer">导出任务 #${escapeHtml(latestRun.run_number)} ${escapeHtml(runStatus)}</a><span class="run-meta">${escapeHtml(latestRun.event)} · ${escapeHtml(new Date(latestRun.created_at).toLocaleString())}</span></div>` : ""}
    ${artifactItems || '<div class="download-item"><span class="run-meta">镜像包生成中，稍后刷新页面查看下载链接。</span></div>'}
  `;
}

function renderRuns(runs) {
  if (!runs.length) {
    elements.runsList.textContent = "暂无数据";
    return;
  }

  elements.runsList.innerHTML = runs
    .map((run) => {
      const status = run.conclusion || run.status || "unknown";
      const createdAt = new Date(run.created_at).toLocaleString();
      return `
        <div class="run-item">
          <a href="${escapeHtml(run.html_url)}" target="_blank" rel="noreferrer">#${run.run_number} ${escapeHtml(status)}</a>
          <span class="run-meta">${escapeHtml(run.event)} · ${escapeHtml(createdAt)}</span>
        </div>
      `;
    })
    .join("");
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${state.password}`,
      ...(options.headers || {}),
    },
  });

  const text = await response.text();
  const data = text ? parseJson(text) : {};
  if (!response.ok) {
    throw new Error(data.error || text || `请求失败：${response.status}`);
  }
  return data;
}

function parseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}

function updateCount() {
  const count = parseManagedImageLines(elements.imagesEditor.value).length;
  elements.imageCount.textContent = String(count);
}

function setBusy(busy) {
  state.busy = busy;
  for (const button of document.querySelectorAll("button")) {
    button.disabled = busy;
  }
}

function showToast(message, isError = false) {
  elements.toast.textContent = message;
  elements.toast.classList.toggle("error", isError);
  elements.toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => elements.toast.classList.remove("show"), 3200);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function parseManagedImageLines(content) {
  return String(content)
    .split("\n")
    .map((rawLine, index) => ({ rawLine, lineNumber: index + 1, line: rawLine.trim() }))
    .filter((entry) => entry.line && !entry.line.startsWith("#"))
    .map((entry) => ({
      lineNumber: entry.lineNumber,
      raw: entry.line,
      image: entry.line.split(/\s+/).at(-1),
      platform: parsePlatform(entry.line),
    }))
    .filter((entry) => entry.image);
}

function parsePlatform(line) {
  const match = String(line).match(/(?:^|\s)--platform(?:=|\s+)(\S+)/);
  return match ? match[1] : "";
}

function formatBytes(value) {
  const bytes = Number(value) || 0;
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }
  return `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`;
}
