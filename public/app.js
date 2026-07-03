const CDN = {
  jszip: "https://cdn.jsdelivr.net/npm/jszip@3.10.1/+esm",
  pdfLib: "https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/+esm",
  pdfjs: "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.mjs",
  pdfWorker: "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.worker.mjs",
};

const chars = {
  lower: "abcdefghijklmnopqrstuvwxyz",
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  digits: "0123456789",
  symbols: "!@#$%^&*()-_=+[]{};:,.?/",
};

const areaCodes = [
  "110101", "110102", "120101", "130102", "140105", "150102", "210102", "220102", "230102",
  "310101", "320102", "330102", "340102", "350102", "360102", "370102", "410102", "420102",
  "430102", "440103", "450102", "460105", "500101", "510104", "520102", "530102", "540102",
  "610102", "620102", "630102", "640104", "650102",
];

const phonePrefixes = [
  "130", "131", "132", "133", "135", "136", "137", "138", "139",
  "150", "151", "152", "155", "156", "157", "158", "159",
  "170", "171", "172", "173", "175", "176", "177", "178",
  "180", "181", "182", "183", "185", "186", "187", "188",
  "190", "191", "193", "195", "196", "197", "198", "199",
];

const state = {
  password: localStorage.getItem("docker-images-pusher-password") || "",
  exportSelections: new Map(),
  sha: null,
  originalContent: "",
  config: null,
  imageRows: [],
  nextImageRowId: 1,
  mergedImageUrl: "",
  processedImageUrl: "",
  resizeSource: null,
  connectingMirror: false,
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const elements = {
  pageTitle: $("#pageTitle"),
  connectionStatus: $("#connectionStatus"),
  toast: $("#toast"),
  loginPanel: $("#loginPanel"),
  loginForm: $("#loginForm"),
  password: $("#password"),
  workspace: $("#workspace"),
  mirrorStatus: $("#mirrorStatus"),
  repoLabel: $("#repoLabel"),
  imagesEditor: $("#imagesEditor"),
  imageRows: $("#imageRows"),
  addImageRowButton: $("#addImageRowButton"),
  imageSearchInput: $("#imageSearchInput"),
  imageCount: $("#imageCount"),
  refreshButton: $("#refreshButton"),
  saveButton: $("#saveButton"),
  runButton: $("#runButton"),
  exportButton: $("#exportButton"),
  downloadMeta: $("#downloadMeta"),
  selectAllExportsButton: $("#selectAllExportsButton"),
  clearExportsButton: $("#clearExportsButton"),
  exportImageList: $("#exportImageList"),
  downloadsRefreshButton: $("#downloadsRefreshButton"),
  downloadsList: $("#downloadsList"),
  validateButton: $("#validateButton"),
  validationList: $("#validationList"),
  runsRefreshButton: $("#runsRefreshButton"),
  runsList: $("#runsList"),
};

init();

function init() {
  setupNavigation();
  setupJsonTool();
  setupImageMergeTool();
  setupGenerators();
  setupBase64Tool();
  setupResizeTool();
  setupPdfTools();
  setupCryptoTool();
  setupMirrorTool();
  enhanceNativeControls();
}

function enhanceNativeControls() {
  $$('input[type="file"]').forEach((input) => {
    if (input.dataset.enhancedFile === "true") return;

    const control = document.createElement("label");
    control.className = "file-control";

    const action = document.createElement("span");
    action.className = "file-control-action";
    action.textContent = input.hasAttribute("webkitdirectory") ? "选择文件夹" : "选择文件";

    const label = document.createElement("span");
    label.className = "file-control-label";

    input.classList.add("file-control-input");
    input.dataset.enhancedFile = "true";
    input.parentNode.insertBefore(control, input);
    control.append(input, action, label);
    updateFileControlLabel(input);
    input.addEventListener("change", () => updateFileControlLabel(input));
  });
}

function updateFileControlLabel(input) {
  const label = input.closest(".file-control")?.querySelector(".file-control-label");
  if (!label) return;

  const files = [...input.files];
  if (!files.length) {
    label.textContent = input.hasAttribute("webkitdirectory") ? "未选择文件夹" : "未选择任何文件";
    return;
  }

  if (input.hasAttribute("webkitdirectory")) {
    const folderName = files[0]?.webkitRelativePath?.split("/")[0] || "已选择文件夹";
    label.textContent = `${folderName} · ${files.length} 个文件`;
    return;
  }

  label.textContent = files.length === 1 ? files[0].name : `已选择 ${files.length} 个文件`;
}

function setupNavigation() {
  $$(".nav-item").forEach((button) => {
    button.addEventListener("click", () => {
      const tool = button.dataset.tool;
      $$(".nav-item").forEach((item) => item.classList.toggle("is-active", item === button));
      $$(".tool-panel").forEach((panel) => panel.classList.toggle("is-active", panel.dataset.panel === tool));
      elements.pageTitle.textContent = button.textContent.trim();
      elements.connectionStatus.textContent = tool === "mirror" ? "镜像功能需密码" : "公开工具免登录";
      elements.connectionStatus.classList.toggle("ok", tool !== "mirror");
      if (tool === "mirror" && state.password && elements.workspace.classList.contains("is-hidden") && !state.connectingMirror) {
        connect();
      }
    });
  });
  elements.connectionStatus.classList.add("ok");
}

function setupJsonTool() {
  const input = $("#jsonInput");
  const tree = $("#jsonTree");
  $("#jsonFormatButton").addEventListener("click", () => {
    const data = parseJsonStrict(input.value);
    if (!data.ok) return showToast(data.error, true);
    input.value = JSON.stringify(data.value, null, 2);
    renderJsonTree(data.value, tree);
    showToast("JSON 已格式化");
  });
  $("#jsonMinifyButton").addEventListener("click", () => {
    const data = parseJsonStrict(input.value);
    if (!data.ok) return showToast(data.error, true);
    input.value = JSON.stringify(data.value);
    renderJsonTree(data.value, tree);
    showToast("JSON 已压缩");
  });
  $("#jsonCopyButton").addEventListener("click", () => copyText(input.value));
  $("#jsonClearButton").addEventListener("click", () => {
    input.value = "";
    tree.textContent = "等待输入 JSON";
  });
  input.addEventListener("input", () => {
    const data = parseJsonStrict(input.value);
    if (data.ok) renderJsonTree(data.value, tree);
  });
}

function renderJsonTree(value, target) {
  target.innerHTML = "";
  target.append(renderNode(value, "root"));
}

function renderNode(value, key) {
  const wrapper = document.createElement("div");
  const isObject = value && typeof value === "object";
  if (!isObject) {
    wrapper.className = "tree-leaf";
    wrapper.innerHTML = `<span class="tree-key">${escapeHtml(key)}</span>: <span>${escapeHtml(JSON.stringify(value))}</span>`;
    return wrapper;
  }

  const details = document.createElement("details");
  details.open = key === "root";
  const summary = document.createElement("summary");
  const type = Array.isArray(value) ? `Array(${value.length})` : `Object(${Object.keys(value).length})`;
  summary.innerHTML = `<span class="tree-key">${escapeHtml(key)}</span> <span class="tree-type">${type}</span>`;
  details.append(summary);
  Object.entries(value).forEach(([childKey, childValue]) => {
    const child = renderNode(childValue, childKey);
    child.classList.add("tree-child");
    details.append(child);
  });
  wrapper.append(details);
  return wrapper;
}

function setupImageMergeTool() {
  const input = $("#mergeImageFiles");
  const list = $("#mergeImageList");
  const canvas = $("#mergeCanvas");
  const meta = $("#mergeImageMeta");

  input.addEventListener("change", () => renderFileList(input.files, list));
  $("#mergeImagesButton").addEventListener("click", async () => {
    const files = [...input.files];
    if (!files.length) return showToast("请先选择图片", true);
    try {
      const images = await Promise.all(files.map(loadImageFile));
      const direction = document.querySelector("input[name='mergeDirection']:checked").value;
      const width = direction === "vertical" ? Math.max(...images.map((item) => item.width)) : images.reduce((sum, item) => sum + item.width, 0);
      const height = direction === "vertical" ? images.reduce((sum, item) => sum + item.height, 0) : Math.max(...images.map((item) => item.height));
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);
      let offset = 0;
      for (const item of images) {
        if (direction === "vertical") {
          ctx.drawImage(item.image, 0, offset);
          offset += item.height;
        } else {
          ctx.drawImage(item.image, offset, 0);
          offset += item.width;
        }
        URL.revokeObjectURL(item.url);
      }
      revokeUrl("mergedImageUrl");
      const type = $("#mergeOutputType").value;
      state.mergedImageUrl = canvas.toDataURL(type, 0.92);
      $("#downloadMergedImageButton").disabled = false;
      meta.textContent = `已生成 ${width} x ${height}，共 ${files.length} 张图片。`;
      showToast("图片合并完成");
    } catch (error) {
      showToast(error.message, true);
    }
  });
  $("#downloadMergedImageButton").addEventListener("click", () => {
    const type = $("#mergeOutputType").value.split("/").at(-1).replace("jpeg", "jpg");
    downloadUrl(state.mergedImageUrl, `merged-image.${type}`);
  });
}

function setupGenerators() {
  $("#generateIdButton").addEventListener("click", () => {
    const count = readNumber("#idCount", 1, 200, 10);
    const gender = $("#idGender").value;
    const birthday = $("#idBirthday").value;
    $("#idOutput").value = Array.from({ length: count }, () => createIdNumber(gender, birthday)).join("\n");
  });
  $("#generatePhoneButton").addEventListener("click", () => {
    const count = readNumber("#phoneCount", 1, 500, 20);
    const group = $("#phonePrefix").value;
    $("#phoneOutput").value = Array.from({ length: count }, () => createPhone(group)).join("\n");
  });
  $("#generateStringButton").addEventListener("click", () => {
    const pool = buildPool([
      ["#stringLower", chars.lower],
      ["#stringUpper", chars.upper],
      ["#stringDigits", chars.digits],
      ["#stringSymbols", chars.symbols],
    ]);
    if (!pool) return showToast("请至少选择一种字符集", true);
    const length = readNumber("#stringLength", 1, 10000, 32);
    const count = readNumber("#stringCount", 1, 500, 10);
    $("#stringOutput").value = Array.from({ length: count }, () => randomFromPool(pool, length)).join("\n");
  });
  $("#generatePasswordButton").addEventListener("click", () => {
    const sets = [
      ["#passwordLower", chars.lower],
      ["#passwordUpper", chars.upper],
      ["#passwordDigits", chars.digits],
      ["#passwordSymbols", chars.symbols],
    ].filter(([selector]) => $(selector).checked);
    if (!sets.length) return showToast("请至少选择一种字符集", true);
    const noSimilar = $("#passwordNoSimilar").checked;
    const normalizedSets = sets.map(([selector, value]) => [selector, noSimilar ? value.replace(/[0Ool1I]/g, "") : value]);
    const length = readNumber("#passwordLength", 6, 128, 16);
    if (length < normalizedSets.length) return showToast("密码长度不能小于字符集数量", true);
    const count = readNumber("#passwordCount", 1, 200, 10);
    $("#passwordOutput").value = Array.from({ length: count }, () => createPassword(normalizedSets, length)).join("\n");
  });
}

function setupBase64Tool() {
  const input = $("#base64ImageFile");
  const output = $("#base64Output");
  const preview = $("#base64Preview");
  input.addEventListener("change", async () => {
    const file = input.files[0];
    if (!file) return;
    const dataUrl = await readAsDataUrl(file);
    output.value = dataUrl;
    preview.src = dataUrl;
    preview.classList.add("is-visible");
    showToast("Base64 已生成");
  });
  $("#copyBase64Button").addEventListener("click", () => copyText(output.value));
  $("#downloadBase64Button").addEventListener("click", () => downloadBlob(new Blob([output.value], { type: "text/plain;charset=utf-8" }), "image-base64.txt"));
}

function setupResizeTool() {
  const input = $("#resizeImageFile");
  const canvas = $("#resizeCanvas");
  input.addEventListener("change", async () => {
    const file = input.files[0];
    if (!file) return;
    const item = await loadImageFile(file);
    state.resizeSource = item;
    $("#resizeWidth").value = item.width;
    $("#resizeHeight").value = item.height;
    $("#resizeScale").value = 100;
    $("#resizeMeta").textContent = `原始尺寸：${item.width} x ${item.height}，大小：${formatBytes(file.size)}。`;
  });
  $("#resizeQuality").addEventListener("input", () => {
    $("#resizeQualityLabel").textContent = $("#resizeQuality").value;
  });
  $("#resizeScale").addEventListener("input", () => {
    if (!state.resizeSource) return;
    const scale = readNumber("#resizeScale", 1, 500, 100) / 100;
    $("#resizeWidth").value = Math.max(1, Math.round(state.resizeSource.width * scale));
    $("#resizeHeight").value = Math.max(1, Math.round(state.resizeSource.height * scale));
  });
  $("#processImageButton").addEventListener("click", () => {
    if (!state.resizeSource) return showToast("请先选择图片", true);
    const width = readNumber("#resizeWidth", 1, 20000, state.resizeSource.width);
    const height = readNumber("#resizeHeight", 1, 20000, state.resizeSource.height);
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(state.resizeSource.image, 0, 0, width, height);
    revokeUrl("processedImageUrl");
    canvas.toBlob((blob) => {
      state.processedImageUrl = URL.createObjectURL(blob);
      $("#downloadProcessedImageButton").disabled = false;
      $("#resizeMeta").textContent = `处理后尺寸：${width} x ${height}，大小约：${formatBytes(blob.size)}。`;
      showToast("图片处理完成");
    }, $("#resizeOutputType").value, Number($("#resizeQuality").value));
  });
  $("#downloadProcessedImageButton").addEventListener("click", () => {
    const ext = $("#resizeOutputType").value.split("/").at(-1).replace("jpeg", "jpg");
    downloadUrl(state.processedImageUrl, `processed-image.${ext}`);
  });
}

function setupPdfTools() {
  $("#mergePdfFiles").addEventListener("change", (event) => renderFileList(event.target.files, $("#mergePdfList")));
  $("#mergePdfButton").addEventListener("click", mergePdfs);
  $("#pdfToImagesButton").addEventListener("click", pdfToImages);
}

async function mergePdfs() {
  const files = [...$("#mergePdfFiles").files];
  if (files.length < 2) return showToast("请至少选择两个 PDF", true);
  try {
    showToast("正在加载 PDF 合并库...");
    const { PDFDocument } = await import(CDN.pdfLib);
    const merged = await PDFDocument.create();
    for (const file of files) {
      const source = await PDFDocument.load(await file.arrayBuffer());
      const pages = await merged.copyPages(source, source.getPageIndices());
      pages.forEach((page) => merged.addPage(page));
    }
    const bytes = await merged.save();
    downloadBlob(new Blob([bytes], { type: "application/pdf" }), "merged.pdf");
    showToast("PDF 已合并");
  } catch (error) {
    showToast(`PDF 合并失败：${error.message}`, true);
  }
}

async function pdfToImages() {
  const file = $("#pdfImageFile").files[0];
  if (!file) return showToast("请先选择 PDF", true);
  const log = $("#pdfImagesLog");
  try {
    log.textContent = "正在加载 PDF 处理库...";
    const [pdfjs, { default: JSZip }] = await Promise.all([import(CDN.pdfjs), import(CDN.jszip)]);
    pdfjs.GlobalWorkerOptions.workerSrc = CDN.pdfWorker;
    const pdf = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
    const scale = readNumber("#pdfImageScale", 1, 4, 2);
    const zip = new JSZip();
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      log.textContent = `正在转换第 ${pageNumber}/${pdf.numPages} 页...`;
      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await page.render({ canvasContext: canvas.getContext("2d"), viewport }).promise;
      const blob = await canvasToBlob(canvas, "image/png");
      zip.file(`page-${String(pageNumber).padStart(3, "0")}.png`, blob);
    }
    log.textContent = "正在打包图片...";
    const zipBlob = await zip.generateAsync({ type: "blob" });
    downloadBlob(zipBlob, "pdf-images.zip");
    log.textContent = `完成，共转换 ${pdf.numPages} 页。`;
    showToast("PDF 图片包已生成");
  } catch (error) {
    log.textContent = error.message;
    showToast(`PDF 转图片失败：${error.message}`, true);
  }
}

function setupCryptoTool() {
  $("#encryptFolderButton").addEventListener("click", encryptFolder);
  $("#decryptFolderButton").addEventListener("click", decryptFolder);
}

async function encryptFolder() {
  const files = [...$("#folderInput").files];
  const password = $("#folderPassword").value;
  const log = $("#cryptoLog");
  if (!files.length) return showToast("请先选择文件夹", true);
  if (!password) return showToast("请输入加密密码", true);
  try {
    log.textContent = "正在打包文件夹...";
    const { default: JSZip } = await import(CDN.jszip);
    const zip = new JSZip();
    files.forEach((file) => zip.file(file.webkitRelativePath || file.name, file));
    const zipBytes = await zip.generateAsync({ type: "uint8array" });
    log.textContent = "正在加密...";
    const encrypted = await encryptBytes(zipBytes, password);
    downloadBlob(new Blob([encrypted], { type: "application/octet-stream" }), "folder.toolbox.enc");
    log.textContent = `完成，已加密 ${files.length} 个文件。`;
    showToast("加密包已生成");
  } catch (error) {
    log.textContent = error.message;
    showToast(`加密失败：${error.message}`, true);
  }
}

async function decryptFolder() {
  const file = $("#encryptedFileInput").files[0];
  const password = $("#decryptPassword").value;
  const log = $("#cryptoLog");
  if (!file) return showToast("请选择 .enc 文件", true);
  if (!password) return showToast("请输入解密密码", true);
  try {
    log.textContent = "正在解密...";
    const decrypted = await decryptBytes(new Uint8Array(await file.arrayBuffer()), password);
    downloadBlob(new Blob([decrypted], { type: "application/zip" }), "decrypted-folder.zip");
    log.textContent = "解密完成，已生成 zip。";
    showToast("解密完成");
  } catch (error) {
    log.textContent = "解密失败，请检查文件和密码。";
    showToast("解密失败，请检查密码是否正确", true);
  }
}

function setupMirrorTool() {
  if (!elements.loginForm) return;
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
  elements.selectAllExportsButton.addEventListener("click", () => setAllExportSelections(true));
  elements.clearExportsButton.addEventListener("click", () => setAllExportSelections(false));
  elements.validateButton.addEventListener("click", () => validateCurrentImages(true));
  elements.runsRefreshButton.addEventListener("click", () => loadRuns());
  elements.downloadsRefreshButton.addEventListener("click", () => loadDownloads());
  elements.exportImageList.addEventListener("change", (event) => {
    if (!event.target.matches("[data-export-key]")) return;
    state.exportSelections.set(event.target.dataset.exportKey, event.target.checked);
    renderDownloadMeta();
  });
  elements.downloadsList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-download-url]");
    if (button) downloadArtifact(button.dataset.downloadUrl);
  });
  elements.addImageRowButton.addEventListener("click", () => addImageRow());
  elements.imageSearchInput.addEventListener("input", () => renderImageRows());
  elements.imageRows.addEventListener("input", (event) => {
    const input = event.target.closest("[data-image-row]");
    if (!input) return;
    const row = state.imageRows.find((item) => String(item.id) === input.dataset.imageRow);
    if (!row) return;
    row.text = input.value;
    markImageRowsChanged();
  });
  elements.imageRows.addEventListener("click", (event) => {
    const button = event.target.closest("[data-row-action]");
    if (!button) return;
    handleImageRowAction(button.dataset.rowAction, Number(button.dataset.rowId));
  });
  if (state.password) elements.mirrorStatus.textContent = "已保存密码";
}

async function connect() {
  try {
    state.connectingMirror = true;
    setApiBusy(true);
    state.config = await api("/api/config");
    elements.repoLabel.textContent = `${state.config.owner}/${state.config.repo} · ${state.config.branch}`;
    elements.mirrorStatus.textContent = "已登录";
    elements.mirrorStatus.classList.add("ok");
    elements.loginPanel.classList.add("is-hidden");
    elements.workspace.classList.remove("is-hidden");
    await Promise.all([loadImages(), loadRuns(), loadDownloads()]);
  } catch (error) {
    showToast(error.message, true);
    elements.mirrorStatus.textContent = "登录失败";
    elements.mirrorStatus.classList.remove("ok");
  } finally {
    state.connectingMirror = false;
    setApiBusy(false);
  }
}

async function loadImages() {
  try {
    setApiBusy(true);
    const data = await api("/api/images");
    state.sha = data.sha;
    state.originalContent = data.content || "";
    setImageRowsFromContent(state.originalContent);
    updateCount();
    renderExportImageList();
    renderDownloadMeta();
    showToast("已读取镜像列表");
  } catch (error) {
    showToast(error.message, true);
  } finally {
    setApiBusy(false);
  }
}

async function saveImages() {
  try {
    setApiBusy(true);
    syncImageEditorFromRows();
    const content = elements.imagesEditor.value.replace(/\r\n/g, "\n");
    if (normalizeImageContent(content) === normalizeImageContent(state.originalContent)) return showToast("内容没有变化，无需提交");
    const validation = await validateImages(content);
    renderValidation(validation.results || []);
    if ((validation.summary?.invalid || 0) > 0) return showToast("发现无法公开拉取的镜像，请处理后再保存", true);
    const data = await api("/api/images", {
      method: "PUT",
      body: JSON.stringify({ content, sha: state.sha }),
    });
    state.sha = data.sha;
    state.originalContent = content.endsWith("\n") ? content : `${content}\n`;
    showToast("已提交到仓库，转存任务会自动开始");
    await loadRuns();
  } catch (error) {
    showToast(error.message, true);
  } finally {
    setApiBusy(false);
  }
}

async function validateCurrentImages(showSuccessToast = false) {
  try {
    setApiBusy(true);
    syncImageEditorFromRows();
    const validation = await validateImages(elements.imagesEditor.value.replace(/\r\n/g, "\n"));
    renderValidation(validation.results || []);
    if ((validation.summary?.invalid || 0) > 0) {
      showToast("发现无法公开拉取的镜像", true);
      return validation;
    }
    if (showSuccessToast) showToast("检测完成，未发现阻断项");
    return validation;
  } catch (error) {
    showToast(error.message, true);
    return null;
  } finally {
    setApiBusy(false);
  }
}

function validateImages(content) {
  return api("/api/validate-images", {
    method: "POST",
    body: JSON.stringify({ content }),
  });
}

async function runWorkflow() {
  try {
    setApiBusy(true);
    await api("/api/run", { method: "POST" });
    showToast("已触发转存任务");
    setTimeout(loadRuns, 1200);
  } catch (error) {
    showToast(error.message, true);
  } finally {
    setApiBusy(false);
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
    setApiBusy(true);
    syncImageEditorFromRows();
    const selectedContent = selectedExportContent();
    if (!selectedContent) return showToast("请先选择至少一个要打包的镜像", true);
    await api("/api/export", {
      method: "POST",
      body: JSON.stringify({ content: selectedContent }),
    });
    showToast("已开始生成选中的镜像包，完成后会出现下载链接");
    setTimeout(loadDownloads, 2500);
  } catch (error) {
    showToast(error.message, true);
  } finally {
    setApiBusy(false);
  }
}

async function loadDownloads() {
  try {
    const [runsData, artifactsData] = await Promise.all([api("/api/exports"), api("/api/export-artifacts")]);
    renderDownloads(runsData.runs || [], artifactsData.artifacts || []);
  } catch (error) {
    elements.downloadsList.textContent = error.message;
  }
}

function setImageRowsFromContent(content) {
  const normalized = String(content || "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const lines = normalized.split("\n");
  if (lines.at(-1) === "") lines.pop();
  state.imageRows = lines.map((line) => ({
    id: state.nextImageRowId++,
    text: line,
  }));
  syncImageEditorFromRows();
  renderImageRows();
}

function syncImageEditorFromRows() {
  elements.imagesEditor.value = state.imageRows.map((row) => row.text).join("\n");
}

function addImageRow(text = "") {
  elements.imageSearchInput.value = "";
  const row = {
    id: state.nextImageRowId++,
    text,
  };
  state.imageRows.push(row);
  renderImageRows();
  markImageRowsChanged();
  requestAnimationFrame(() => {
    const input = elements.imageRows.querySelector(`[data-image-row="${row.id}"]`);
    input?.focus();
  });
}

function handleImageRowAction(action, rowId) {
  const index = state.imageRows.findIndex((row) => row.id === rowId);
  if (index < 0) return;

  if (action === "delete") {
    state.imageRows.splice(index, 1);
  }

  if (action === "move-up" && index > 0) {
    [state.imageRows[index - 1], state.imageRows[index]] = [state.imageRows[index], state.imageRows[index - 1]];
  }

  if (action === "move-down" && index < state.imageRows.length - 1) {
    [state.imageRows[index + 1], state.imageRows[index]] = [state.imageRows[index], state.imageRows[index + 1]];
  }

  renderImageRows();
  markImageRowsChanged();
  requestAnimationFrame(() => {
    const input = elements.imageRows.querySelector(`[data-image-row="${rowId}"]`);
    input?.focus();
  });
}

function markImageRowsChanged() {
  syncImageEditorFromRows();
  updateCount();
  renderExportImageList();
  renderDownloadMeta();
  elements.validationList.textContent = "内容已修改，保存前会重新检测。";
}

function renderImageRows() {
  const keyword = elements.imageSearchInput.value.trim().toLowerCase();
  if (!state.imageRows.length) {
    elements.imageRows.innerHTML = '<div class="empty-state">暂无镜像，点击“新增镜像”开始添加。</div>';
    return;
  }

  const rows = state.imageRows
    .map((row, index) => ({ row, index }))
    .filter(({ row }) => !keyword || row.text.toLowerCase().includes(keyword));

  if (!rows.length) {
    elements.imageRows.innerHTML = '<div class="empty-state">没有匹配的镜像条目。</div>';
    return;
  }

  elements.imageRows.innerHTML = rows
    .map(({ row, index }) => {
      const kind = imageRowKind(row.text);
      const isFirst = index === 0;
      const isLast = index === state.imageRows.length - 1;
      return `
        <div class="image-row ${kind.className}" data-row-id="${row.id}">
          <span class="image-row-number">${index + 1}</span>
          <span class="image-row-kind">${kind.label}</span>
          <input class="image-row-input" data-image-row="${row.id}" type="text" value="${escapeHtml(row.text)}" placeholder="例如：nginx:1.25 或 --platform=linux/amd64 redis:7" />
          <div class="image-row-actions">
            <button class="row-action secondary" type="button" data-row-action="move-up" data-row-id="${row.id}" ${isFirst ? "disabled" : ""}>上移</button>
            <button class="row-action secondary" type="button" data-row-action="move-down" data-row-id="${row.id}" ${isLast ? "disabled" : ""}>下移</button>
            <button class="row-action danger" type="button" data-row-action="delete" data-row-id="${row.id}">删除</button>
          </div>
        </div>
      `;
    })
    .join("");
}

function imageRowKind(text) {
  const trimmed = text.trim();
  if (!trimmed) return { label: "空行", className: "is-blank" };
  if (trimmed.startsWith("#")) return { label: "注释", className: "is-comment" };
  return { label: "镜像", className: "is-image" };
}

async function downloadArtifact(path) {
  try {
    setApiBusy(true);
    const response = await fetch(path, { headers: { authorization: `Bearer ${state.password}` } });
    if (!response.ok) {
      const text = await response.text();
      const data = text ? parseJson(text) : {};
      throw new Error(data.error || text || `下载失败：${response.status}`);
    }
    downloadBlob(await response.blob(), "镜像包.zip");
    showToast("镜像包开始下载");
  } catch (error) {
    showToast(error.message, true);
  } finally {
    setApiBusy(false);
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
    elements.validationList.innerHTML = '<div class="validation-item ok"><strong>检测通过</strong><span class="validation-meta">公共镜像均可拉取。</span></div>';
    return;
  }
  elements.validationList.innerHTML = visibleResults
    .map((item) => {
      const className = item.status === "invalid" ? "error" : item.status === "valid" ? "ok" : "";
      return `<div class="validation-item ${className}"><strong>第 ${escapeHtml(item.lineNumber)} 行：${escapeHtml(item.image)}</strong><span class="validation-meta">${escapeHtml(item.message)}</span></div>`;
    })
    .join("");
}

function renderDownloadMeta() {
  const entries = parseManagedImageLines(elements.imagesEditor.value || "");
  const selectedCount = selectedExportEntries().length;
  elements.downloadMeta.textContent = entries.length ? `已选择 ${selectedCount}/${entries.length} 个镜像，生成完成后可直接下载。` : "当前没有可导出的有效镜像。";
}

function renderExportImageList() {
  const entries = parseManagedImageLines(elements.imagesEditor.value || "");
  const nextSelections = new Map();
  if (!entries.length) {
    state.exportSelections = nextSelections;
    elements.exportImageList.textContent = "暂无可选镜像";
    return;
  }
  elements.exportImageList.innerHTML = entries
    .map((entry) => {
      const key = exportEntryKey(entry);
      const checked = state.exportSelections.has(key) ? state.exportSelections.get(key) : true;
      nextSelections.set(key, checked);
      return `<label class="export-image-item"><input type="checkbox" data-export-key="${escapeHtml(key)}" ${checked ? "checked" : ""} /><span><span class="export-image-name">${escapeHtml(entry.image)}</span><span class="export-image-meta">第 ${escapeHtml(entry.lineNumber)} 行${entry.platform ? ` · ${escapeHtml(entry.platform)}` : ""}</span></span></label>`;
    })
    .join("");
  state.exportSelections = nextSelections;
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
    .map((artifact) => `<div class="download-item"><button class="link-button" type="button" data-download-url="${escapeHtml(artifact.download_url)}">下载镜像包</button><span class="run-meta">${formatBytes(artifact.size_in_bytes)} · ${escapeHtml(new Date(artifact.created_at).toLocaleString())}</span></div>`)
    .join("");
  elements.downloadsList.innerHTML = `
    ${latestRun ? `<div class="download-item"><a href="${escapeHtml(latestRun.html_url)}" target="_blank" rel="noreferrer">导出任务 #${escapeHtml(latestRun.run_number)} ${escapeHtml(formatRunStatus(runStatus))}</a><span class="run-meta">${escapeHtml(formatRunEvent(latestRun.event))} · ${escapeHtml(new Date(latestRun.created_at).toLocaleString())}</span></div>` : ""}
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
      return `<div class="run-item"><a href="${escapeHtml(run.html_url)}" target="_blank" rel="noreferrer">#${run.run_number} ${escapeHtml(formatRunStatus(status))}</a><span class="run-meta">${escapeHtml(formatRunEvent(run.event))} · ${escapeHtml(new Date(run.created_at).toLocaleString())}</span></div>`;
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
  if (!response.ok) throw new Error(data.error || text || `请求失败：${response.status}`);
  return data;
}

function createIdNumber(gender, fixedBirthday) {
  const area = pick(areaCodes);
  const birthday = fixedBirthday ? fixedBirthday.replaceAll("-", "") : randomBirthday();
  let sequence = randomInt(1, 999);
  if (gender === "male" && sequence % 2 === 0) sequence += 1;
  if (gender === "female" && sequence % 2 === 1) sequence += 1;
  if (sequence > 999) sequence = gender === "female" ? 998 : 999;
  const body = `${area}${birthday}${String(sequence).padStart(3, "0")}`;
  return `${body}${idChecksum(body)}`;
}

function idChecksum(body) {
  const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
  const codes = "10X98765432";
  const sum = body.split("").reduce((total, digit, index) => total + Number(digit) * weights[index], 0);
  return codes[sum % 11];
}

function randomBirthday() {
  const start = new Date(1960, 0, 1).getTime();
  const end = new Date(2006, 11, 31).getTime();
  const date = new Date(randomInt(start, end));
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

function createPhone(group) {
  const candidates = group === "random" ? phonePrefixes : phonePrefixes.filter((prefix) => prefix.startsWith(group));
  return `${pick(candidates)}${String(randomInt(0, 99999999)).padStart(8, "0")}`;
}

function createPassword(sets, length) {
  const required = sets.map(([, value]) => pick(value));
  const pool = sets.map(([, value]) => value).join("");
  const rest = randomFromPool(pool, length - required.length).split("");
  return shuffle([...required, ...rest]).join("");
}

function buildPool(items) {
  return items.filter(([selector]) => $(selector).checked).map(([, value]) => value).join("");
}

function randomFromPool(pool, length) {
  return Array.from({ length }, () => pick(pool)).join("");
}

function pick(value) {
  return value[randomInt(0, value.length - 1)];
}

function randomInt(min, max) {
  const range = max - min + 1;
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return min + (array[0] % range);
}

function shuffle(items) {
  for (let index = items.length - 1; index > 0; index -= 1) {
    const swapIndex = randomInt(0, index);
    [items[index], items[swapIndex]] = [items[swapIndex], items[index]];
  }
  return items;
}

async function encryptBytes(bytes, password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);
  const encrypted = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, bytes));
  const output = new Uint8Array(4 + salt.length + iv.length + encrypted.length);
  output.set(new TextEncoder().encode("TBX1"), 0);
  output.set(salt, 4);
  output.set(iv, 20);
  output.set(encrypted, 32);
  return output;
}

async function decryptBytes(bytes, password) {
  const magic = new TextDecoder().decode(bytes.slice(0, 4));
  if (magic !== "TBX1") throw new Error("文件格式不正确");
  const salt = bytes.slice(4, 20);
  const iv = bytes.slice(20, 32);
  const payload = bytes.slice(32);
  const key = await deriveKey(password, salt);
  return new Uint8Array(await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, payload));
}

async function deriveKey(password, salt) {
  const baseKey = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 180000, hash: "SHA-256" },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

function loadImageFile(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => resolve({ image, url, width: image.naturalWidth, height: image.naturalHeight, file });
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`无法读取图片：${file.name}`));
    };
    image.src = url;
  });
}

function readAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

function renderFileList(files, target) {
  const list = [...files];
  target.innerHTML = list.length
    ? list.map((file, index) => `<div class="file-row"><strong>${index + 1}. ${escapeHtml(file.name)}</strong><span>${formatBytes(file.size)}</span></div>`).join("")
    : "尚未选择文件";
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  downloadUrl(url, filename);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function downloadUrl(url, filename) {
  if (!url) return showToast("没有可下载的文件", true);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
}

function revokeUrl(key) {
  if (state[key] && state[key].startsWith("blob:")) URL.revokeObjectURL(state[key]);
  state[key] = "";
}

function copyText(value) {
  if (!value) return showToast("没有可复制的内容", true);
  navigator.clipboard.writeText(value).then(() => showToast("已复制到剪贴板"), () => showToast("复制失败", true));
}

function parseJsonStrict(text) {
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch (error) {
    return { ok: false, error: `JSON 解析失败：${error.message}` };
  }
}

function parseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}

function readNumber(selector, min, max, fallback) {
  const value = Number($(selector).value);
  if (!Number.isFinite(value)) return fallback;
  return Math.max(min, Math.min(max, Math.round(value)));
}

function updateCount() {
  elements.imageCount.textContent = String(parseManagedImageLines(elements.imagesEditor.value).length);
}

function setAllExportSelections(checked) {
  for (const key of state.exportSelections.keys()) state.exportSelections.set(key, checked);
  renderExportImageList();
  renderDownloadMeta();
}

function setApiBusy(busy) {
  $$('[data-panel="mirror"] button').forEach((button) => {
    if (busy) {
      button.dataset.wasDisabled = button.disabled ? "true" : "false";
      button.disabled = true;
      return;
    }

    button.disabled = button.dataset.wasDisabled === "true";
    delete button.dataset.wasDisabled;
  });
}

function normalizeImageContent(content) {
  return String(content || "").replace(/\r\n/g, "\n").replace(/\r/g, "\n").replace(/\n+$/g, "");
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

function selectedExportEntries() {
  return parseManagedImageLines(elements.imagesEditor.value || "").filter((entry) => state.exportSelections.get(exportEntryKey(entry)) !== false);
}

function selectedExportContent() {
  return selectedExportEntries().map((entry) => entry.raw).join("\n");
}

function exportEntryKey(entry) {
  return `${entry.lineNumber}:${entry.raw}`;
}

function parsePlatform(line) {
  const match = String(line).match(/(?:^|\s)--platform(?:=|\s+)(\S+)/);
  return match ? match[1] : "";
}

function formatBytes(value) {
  const bytes = Number(value) || 0;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`;
}

function formatRunStatus(status) {
  const labels = {
    success: "成功",
    failure: "失败",
    cancelled: "已取消",
    skipped: "已跳过",
    timed_out: "超时",
    action_required: "需要处理",
    queued: "排队中",
    requested: "已请求",
    waiting: "等待中",
    pending: "等待中",
    in_progress: "运行中",
    completed: "已完成",
    neutral: "无变更",
    stale: "已过期",
    startup_failure: "启动失败",
    unknown: "未知状态",
  };
  return labels[status] || status || "未知状态";
}

function formatRunEvent(event) {
  const labels = {
    push: "提交触发",
    workflow_dispatch: "手动触发",
    schedule: "定时触发",
  };
  return labels[event] || event || "未知来源";
}
