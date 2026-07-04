const CDN = {
  jszip: "https://cdn.jsdelivr.net/npm/jszip@3.10.1/+esm",
  zipjs: "https://cdn.jsdelivr.net/npm/@zip.js/zip.js@2.8.26/+esm",
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

const idRegions = [
  { name: "北京市", cities: [{ name: "北京市", counties: [["东城区", "110101"], ["西城区", "110102"], ["朝阳区", "110105"], ["海淀区", "110108"]] }] },
  { name: "上海市", cities: [{ name: "上海市", counties: [["黄浦区", "310101"], ["徐汇区", "310104"], ["静安区", "310106"], ["浦东新区", "310115"]] }] },
  { name: "天津市", cities: [{ name: "天津市", counties: [["和平区", "120101"], ["河东区", "120102"], ["南开区", "120104"], ["滨海新区", "120116"]] }] },
  { name: "重庆市", cities: [{ name: "重庆市", counties: [["万州区", "500101"], ["渝中区", "500103"], ["江北区", "500105"], ["渝北区", "500112"]] }] },
  { name: "河北省", cities: [{ name: "石家庄市", counties: [["长安区", "130102"], ["桥西区", "130104"], ["新华区", "130105"]] }, { name: "唐山市", counties: [["路南区", "130202"], ["路北区", "130203"]] }] },
  { name: "山西省", cities: [{ name: "太原市", counties: [["小店区", "140105"], ["迎泽区", "140106"], ["杏花岭区", "140107"]] }] },
  { name: "内蒙古自治区", cities: [{ name: "呼和浩特市", counties: [["新城区", "150102"], ["回民区", "150103"], ["玉泉区", "150104"]] }] },
  { name: "辽宁省", cities: [{ name: "沈阳市", counties: [["和平区", "210102"], ["沈河区", "210103"], ["大东区", "210104"]] }] },
  { name: "吉林省", cities: [{ name: "长春市", counties: [["南关区", "220102"], ["宽城区", "220103"], ["朝阳区", "220104"]] }] },
  { name: "黑龙江省", cities: [{ name: "哈尔滨市", counties: [["道里区", "230102"], ["南岗区", "230103"], ["道外区", "230104"]] }] },
  { name: "江苏省", cities: [{ name: "南京市", counties: [["玄武区", "320102"], ["秦淮区", "320104"], ["建邺区", "320105"]] }, { name: "苏州市", counties: [["姑苏区", "320508"], ["吴中区", "320506"]] }] },
  { name: "浙江省", cities: [{ name: "杭州市", counties: [["上城区", "330102"], ["拱墅区", "330105"], ["西湖区", "330106"]] }, { name: "宁波市", counties: [["海曙区", "330203"], ["江北区", "330205"]] }] },
  { name: "安徽省", cities: [{ name: "合肥市", counties: [["瑶海区", "340102"], ["庐阳区", "340103"], ["蜀山区", "340104"]] }] },
  { name: "福建省", cities: [{ name: "福州市", counties: [["鼓楼区", "350102"], ["台江区", "350103"], ["仓山区", "350104"]] }, { name: "厦门市", counties: [["思明区", "350203"], ["湖里区", "350206"]] }] },
  { name: "江西省", cities: [{ name: "南昌市", counties: [["东湖区", "360102"], ["西湖区", "360103"], ["青云谱区", "360104"]] }] },
  { name: "山东省", cities: [{ name: "济南市", counties: [["历下区", "370102"], ["市中区", "370103"], ["槐荫区", "370104"]] }, { name: "青岛市", counties: [["市南区", "370202"], ["市北区", "370203"]] }] },
  { name: "河南省", cities: [{ name: "郑州市", counties: [["中原区", "410102"], ["二七区", "410103"], ["金水区", "410105"]] }] },
  { name: "湖北省", cities: [{ name: "武汉市", counties: [["江岸区", "420102"], ["江汉区", "420103"], ["硚口区", "420104"]] }] },
  { name: "湖南省", cities: [{ name: "长沙市", counties: [["芙蓉区", "430102"], ["天心区", "430103"], ["岳麓区", "430104"]] }] },
  { name: "广东省", cities: [{ name: "广州市", counties: [["荔湾区", "440103"], ["越秀区", "440104"], ["天河区", "440106"]] }, { name: "深圳市", counties: [["罗湖区", "440303"], ["福田区", "440304"], ["南山区", "440305"]] }] },
  { name: "广西壮族自治区", cities: [{ name: "南宁市", counties: [["兴宁区", "450102"], ["青秀区", "450103"], ["江南区", "450105"]] }] },
  { name: "海南省", cities: [{ name: "海口市", counties: [["秀英区", "460105"], ["龙华区", "460106"], ["美兰区", "460108"]] }] },
  { name: "四川省", cities: [{ name: "成都市", counties: [["锦江区", "510104"], ["青羊区", "510105"], ["武侯区", "510107"]] }] },
  { name: "贵州省", cities: [{ name: "贵阳市", counties: [["南明区", "520102"], ["云岩区", "520103"], ["花溪区", "520111"]] }] },
  { name: "云南省", cities: [{ name: "昆明市", counties: [["五华区", "530102"], ["盘龙区", "530103"], ["官渡区", "530111"]] }] },
  { name: "西藏自治区", cities: [{ name: "拉萨市", counties: [["城关区", "540102"], ["堆龙德庆区", "540103"]] }] },
  { name: "陕西省", cities: [{ name: "西安市", counties: [["新城区", "610102"], ["碑林区", "610103"], ["莲湖区", "610104"]] }] },
  { name: "甘肃省", cities: [{ name: "兰州市", counties: [["城关区", "620102"], ["七里河区", "620103"], ["西固区", "620104"]] }] },
  { name: "青海省", cities: [{ name: "西宁市", counties: [["城东区", "630102"], ["城中区", "630103"], ["城西区", "630104"]] }] },
  { name: "宁夏回族自治区", cities: [{ name: "银川市", counties: [["兴庆区", "640104"], ["西夏区", "640105"], ["金凤区", "640106"]] }] },
  { name: "新疆维吾尔自治区", cities: [{ name: "乌鲁木齐市", counties: [["天山区", "650102"], ["沙依巴克区", "650103"], ["新市区", "650104"]] }] },
];

const phonePrefixGroups = [
  { carrier: "移动", prefixes: ["134", "135", "136", "137", "138", "139", "147", "150", "151", "152", "157", "158", "159", "165", "172", "178", "182", "183", "184", "187", "188", "198"] },
  { carrier: "联通", prefixes: ["130", "131", "132", "145", "155", "156", "166", "171", "175", "176", "185", "186"] },
  { carrier: "电信", prefixes: ["133", "149", "153", "173", "177", "180", "181", "189", "199"] },
];

const phonePrefixes = phonePrefixGroups.flatMap((group) => group.prefixes);
const familyNames = "赵钱孙李周吴郑王冯陈褚卫蒋沈韩杨朱秦尤许何吕施张孔曹严华金魏陶姜谢邹喻柏水窦章云苏潘葛范彭郎鲁韦昌马苗凤花方俞任袁柳鲍史唐费廉岑薛雷贺倪汤滕殷罗毕郝邬安常乐于时傅皮卞齐康伍余元卜顾孟平黄和穆萧尹姚邵汪祁毛禹狄米贝明臧计伏成戴谈宋庞熊纪舒项祝董梁杜阮蓝闵季贾路江童颜郭梅盛林钟徐邱骆高夏蔡田胡凌霍虞万柯管卢莫房裘解应宗丁宣邓杭洪包左石崔吉龚程邢裴陆荣翁荀惠甄曲封储靳段富巫焦巴牧山谷车侯全班仰秋仲伊宫宁仇栾甘厉祖武符刘景詹龙叶幸司郜黎薄印白怀蒲从索咸赖卓蔺屠蒙池乔阴胥苍双闻翟谭劳逄姬申扶冉宰雍桑桂牛寿通边燕浦尚农温庄晏柴瞿阎连茹习艾鱼容向古易慎戈廖庾居衡步都耿满弘匡国文寇广东殳利蔚越师巩厍聂晁勾敖融冷辛阚简饶曾沙养鞠丰巢关蒯相查荆红游竺权盖益桓公";
const givenNameChars = "一凡子文明华伟刚勇毅俊峰强军平保东力成康星光天达安岩中茂进林有坚和彪博诚先敬震振壮会思群豪心邦承乐绍功松善厚庆磊民友裕河哲江超浩亮政谦亨奇固之轮翰朗伯宏言若鸣朋斌梁栋维启克伦翔旭鹏泽晨辰士以建家致树炎德行时泰盛雄琛钧冠策腾榕风航弘义兴良飞彬富顺信杰涛昌贵福生龙元全国胜学祥才发武新利清飞彤霞香月莺媛艳瑞凡佳嘉琼勤珍贞莉兰凤洁梅琳素云莲真环雪荣爱妹惠珠翠雅芝玉萍红娥玲芬芳燕彩春菊勤晶妍茜秋珊莎锦黛青倩婷姣婉娴瑾颖露瑶怡婵雁蓓纨仪荷丹蓉眉君琴蕊薇菁梦岚苑婕馨瑗琰韵融园艺咏卿聪澜纯毓悦昭冰爽琬茗羽希宁欣飘育滢馥筠柔竹霭凝晓欢霄枫芸菲寒伊亚宜可姬舒影荔枝思丽秀娟英慧巧美娜静淑惠珠莹雪琳晗涵诗琪梦洁";

const jsonExample = {
  BigId: "12345678912345678",
  id2: 54321,
  username: "BeJson",
  email: "developer@bejson.com",
  isActive: true,
  isVerified: false,
  profile: {
    firstName: "小明",
    lastName: "李",
    fullName: "李小明",
    englishName: "Alex Li",
    age: 28,
    height: 175.5,
    weight: null,
    avatar: "https://example.com/avatars/user.jpg",
    bio: "我是一名热爱技术的全栈开发工程师，专注于前端和后端开发。拥有5年的开发经验，熟练掌握多种编程语言和框架。喜欢探索新技术，关注人工智能发展。业余时间喜欢阅读、写博客分享经验，也热爱摄影和旅行。",
    longDescription: "作为一名资深软件开发工程师，我在过去的几年中积累了丰富的项目经验。我的技术栈涵盖了现代Web开发的各个方面：前端方面精通主流框架，对现代构建工具有深入理解；后端方面熟练使用多种语言，对系统架构和性能优化有丰富实践经验。\n\n在工作中，我参与了多个大型项目的开发，负责核心功能的设计和实现。我注重代码质量和团队协作，善于解决复杂的技术问题。同时，我也是开源社区的积极参与者，维护着几个开源项目。\n\n除了技术工作，我还热衷于知识分享。我经常在技术博客上发表文章，分享开发经验和技术见解。我相信技术的力量能够改变世界，也相信持续学习是保持竞争力的关键。\n\n在个人生活方面，我喜欢平衡工作和生活。摄影让我学会观察美好，旅行让我开阔视野，阅读让我保持思考。我认为多元化的兴趣爱好能够为技术工作带来更多灵感。",
    location: {
      country: "中国",
      countryCode: "CN",
      province: "广东省",
      city: "深圳",
      district: "南山区",
      street: "科技园南区",
      postalCode: "518057",
      coordinates: {
        latitude: 22.5431,
        longitude: 113.9344,
      },
      timezone: "Asia/Shanghai",
      description: "位于深圳科技园区，周边有众多科技公司和创新企业",
    },
  },
  preferences: {
    theme: "dark",
    language: "zh-CN",
    secondaryLanguage: "en-US",
    notifications: {
      email: true,
      push: false,
      sms: true,
      wechat: true,
    },
    privacy: {
      profileVisible: true,
      showEmail: false,
      allowMessages: true,
      showPhoneNumber: false,
    },
  },
  tags: ["全栈开发", "前端专家", "技术分享", "开源贡献者", "摄影爱好者"],
};

const state = {
  password: localStorage.getItem("docker-images-pusher-password") || "",
  exportSelections: new Map(),
  sha: null,
  originalContent: "",
  config: null,
  imageRows: [],
  nextImageRowId: 1,
  mergeImages: [],
  nextMergeImageId: 1,
  fileQueues: {
    convertImages: [],
    imagesToPdf: [],
    mergePdf: [],
    folder: [],
  },
  nextFileQueueId: 1,
  mergedImageUrl: "",
  processedImageUrl: "",
  resizeSource: null,
  resizeOriginalBytes: 0,
  signatureMode: "typed",
  drawingSignature: false,
  lastSignaturePoint: null,
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
  refreshButton: $("#refreshButton"),
  saveButton: $("#saveButton"),
  runButton: $("#runButton"),
  exportButton: $("#exportButton"),
  downloadMeta: $("#downloadMeta"),
  selectAllExportsButton: $("#selectAllExportsButton"),
  clearExportsButton: $("#clearExportsButton"),
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
  setupSignatureTool();
  setupBase64Tool();
  setupImageConvertTool();
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

  if (input.dataset.fileQueueName) {
    const count = input.dataset.fileQueueName === "mergeImages"
      ? state.mergeImages.length
      : state.fileQueues[input.dataset.fileQueueName]?.length || 0;
    if (count) {
      label.textContent = `已添加 ${count} 个文件，可继续添加`;
      return;
    }
  }

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
  autoResizeTextarea(input);
  $("#jsonExampleButton").addEventListener("click", () => {
    input.value = JSON.stringify(jsonExample, null, 2);
    autoResizeTextarea(input);
    renderJsonTree(jsonExample, tree);
    showToast("已填入示例 JSON");
  });
  $("#jsonFormatButton").addEventListener("click", () => {
    const data = parseJsonStrict(input.value);
    if (!data.ok) return showToast(data.error, true);
    input.value = JSON.stringify(data.value, null, 2);
    autoResizeTextarea(input);
    renderJsonTree(data.value, tree);
    showToast("JSON 已格式化");
  });
  $("#jsonMinifyButton").addEventListener("click", () => {
    const data = parseJsonStrict(input.value);
    if (!data.ok) return showToast(data.error, true);
    input.value = JSON.stringify(data.value);
    autoResizeTextarea(input);
    renderJsonTree(data.value, tree);
    showToast("JSON 已压缩");
  });
  $("#jsonCopyButton").addEventListener("click", () => copyText(input.value));
  $("#jsonClearButton").addEventListener("click", () => {
    input.value = "";
    autoResizeTextarea(input);
    tree.textContent = "等待输入 JSON";
  });
  input.addEventListener("input", () => {
    autoResizeTextarea(input);
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
  input.dataset.fileQueueName = "mergeImages";

  input.addEventListener("change", () => {
    addMergeImages([...input.files]);
    input.value = "";
    updateFileControlLabel(input);
    const label = input.closest(".file-control")?.querySelector(".file-control-label");
    if (label && state.mergeImages.length) label.textContent = `已添加 ${state.mergeImages.length} 张图片，可继续添加`;
  });
  list.addEventListener("click", (event) => {
    const removeButton = event.target.closest("[data-remove-merge-image]");
    if (removeButton) {
      removeMergeImage(Number(removeButton.dataset.removeMergeImage));
      return;
    }

    const moveButton = event.target.closest("[data-move-merge-image]");
    if (moveButton) moveMergeImage(Number(moveButton.dataset.moveMergeImage), moveButton.dataset.moveDirection);
  });
  list.addEventListener("dragstart", (event) => {
    const row = event.target.closest("[data-merge-image-id]");
    if (!row) return;
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", row.dataset.mergeImageId);
    row.classList.add("is-dragging");
  });
  list.addEventListener("dragend", (event) => {
    event.target.closest("[data-merge-image-id]")?.classList.remove("is-dragging");
  });
  list.addEventListener("dragover", (event) => {
    const row = event.target.closest("[data-merge-image-id]");
    if (!row) return;
    event.preventDefault();
    row.classList.add("is-drop-target");
  });
  list.addEventListener("dragleave", (event) => {
    event.target.closest("[data-merge-image-id]")?.classList.remove("is-drop-target");
  });
  list.addEventListener("drop", (event) => {
    const row = event.target.closest("[data-merge-image-id]");
    if (!row) return;
    event.preventDefault();
    row.classList.remove("is-drop-target");
    reorderMergeImage(Number(event.dataTransfer.getData("text/plain")), Number(row.dataset.mergeImageId));
  });
  $("#mergeImagesButton").addEventListener("click", async () => {
    const files = state.mergeImages.map((item) => item.file);
    if (!files.length) return showToast("请先添加图片", true);
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

function addMergeImages(files) {
  const allowed = files.filter((file) => /^image\/(jpeg|png|gif|svg\+xml|webp)$/.test(file.type) || /\.(jpe?g|png|gif|svg|webp)$/i.test(file.name));
  if (!allowed.length) return;

  const remaining = Math.max(0, 100 - state.mergeImages.length);
  const accepted = allowed.slice(0, remaining);
  const skipped = allowed.length - accepted.length;
  state.mergeImages.push(...accepted.map((file) => ({
    id: state.nextMergeImageId++,
    file,
    previewUrl: URL.createObjectURL(file),
  })));
  renderMergeImageQueue();
  $("#mergeImageMeta").textContent = `已添加 ${state.mergeImages.length} 张图片，可拖拽排序后生成。`;
  $("#downloadMergedImageButton").disabled = true;
  revokeUrl("mergedImageUrl");
  if (skipped > 0) showToast("最多只能添加 100 张图片，超出的已忽略", true);
}

function removeMergeImage(id) {
  const index = state.mergeImages.findIndex((item) => item.id === id);
  if (index < 0) return;
  URL.revokeObjectURL(state.mergeImages[index].previewUrl);
  state.mergeImages.splice(index, 1);
  renderMergeImageQueue();
  $("#mergeImageMeta").textContent = state.mergeImages.length ? `已添加 ${state.mergeImages.length} 张图片。` : "生成后在这里预览。";
  updateFileControlLabel($("#mergeImageFiles"));
  $("#downloadMergedImageButton").disabled = true;
  revokeUrl("mergedImageUrl");
}

function reorderMergeImage(sourceId, targetId) {
  if (!sourceId || !targetId || sourceId === targetId) return;
  const sourceIndex = state.mergeImages.findIndex((item) => item.id === sourceId);
  const targetIndex = state.mergeImages.findIndex((item) => item.id === targetId);
  if (sourceIndex < 0 || targetIndex < 0) return;
  const [source] = state.mergeImages.splice(sourceIndex, 1);
  state.mergeImages.splice(targetIndex, 0, source);
  renderMergeImageQueue();
  $("#mergeImageMeta").textContent = "排序已更新，重新生成后可下载。";
  updateFileControlLabel($("#mergeImageFiles"));
  $("#downloadMergedImageButton").disabled = true;
  revokeUrl("mergedImageUrl");
}

function moveMergeImage(id, direction) {
  const index = state.mergeImages.findIndex((item) => item.id === id);
  if (index < 0) return;
  const nextIndex = direction === "up" ? index - 1 : index + 1;
  if (nextIndex < 0 || nextIndex >= state.mergeImages.length) return;
  [state.mergeImages[index], state.mergeImages[nextIndex]] = [state.mergeImages[nextIndex], state.mergeImages[index]];
  renderMergeImageQueue();
  $("#mergeImageMeta").textContent = "排序已更新，重新生成后可下载。";
  $("#downloadMergedImageButton").disabled = true;
  revokeUrl("mergedImageUrl");
}

function renderMergeImageQueue() {
  const list = $("#mergeImageList");
  if (!state.mergeImages.length) {
    list.textContent = "尚未选择图片";
    return;
  }

  list.innerHTML = state.mergeImages
    .map((item, index) => `
      <div class="merge-image-row" draggable="true" data-merge-image-id="${item.id}">
        <span class="merge-image-order">${index + 1}</span>
        <img src="${escapeHtml(item.previewUrl)}" alt="" />
        <div>
          <strong>${escapeHtml(item.file.name)}</strong>
          <span>${formatBytes(item.file.size)} · ${escapeHtml(formatImageType(item.file.type || imageTypeFromName(item.file.name)))}</span>
        </div>
        <div class="file-row-actions">
          <button class="row-action secondary" type="button" data-move-merge-image="${item.id}" data-move-direction="up" ${index === 0 ? "disabled" : ""}>上移</button>
          <button class="row-action secondary" type="button" data-move-merge-image="${item.id}" data-move-direction="down" ${index === state.mergeImages.length - 1 ? "disabled" : ""}>下移</button>
          <button class="row-action danger" type="button" data-remove-merge-image="${item.id}">删除</button>
        </div>
      </div>
    `)
    .join("");
}

function setupGenerators() {
  setupIdGeneratorControls();
  setupPhoneGeneratorControls();
  $("#generateIdButton").addEventListener("click", () => {
    const count = readNumber("#idCount", 1, 200, 10);
    const options = readIdOptions();
    const records = Array.from({ length: count }, () => createIdRecord(options));
    $("#idOutput").value = options.nameMode === "random"
      ? ["姓名\t性别\t出生地\t出生日期\t身份证号", ...records.map((item) => `${item.name}\t${item.genderLabel}\t${item.regionLabel}\t${formatBirthday(item.birthday)}\t${item.id}`)].join("\n")
      : records.map((item) => item.id).join("\n");
  });
  $("#generatePhoneButton").addEventListener("click", () => {
    const count = readNumber("#phoneCount", 1, 1000, 100);
    const prefixes = selectedPhonePrefixes();
    const region = $("#phoneRegion").value;
    const mode = document.querySelector('input[name="phoneOutputMode"]:checked')?.value || "number";
    const records = Array.from({ length: count }, () => createPhone(prefixes, region));
    $("#phoneOutput").value = mode === "full"
      ? ["手机号\t运营商\t归属地省份", ...records.map((item) => `${item.number}\t${item.carrier}\t${item.place}`)].join("\n")
      : records.map((item) => item.number).join("\n");
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

function setupSignatureTool() {
  const signatureInputs = ["#signatureName", "#signatureStyle", "#signatureColor", "#signatureSize", "#signatureSlant", "#signatureUnderline"];
  signatureInputs.forEach((selector) => {
    const input = $(selector);
    input.addEventListener("input", () => {
      updateSignatureLabels();
      renderTypedSignature();
    });
    input.addEventListener("change", () => {
      updateSignatureLabels();
      renderTypedSignature();
    });
  });

  $("#drawStrokeWidth").addEventListener("input", () => {
    $("#drawStrokeWidthLabel").textContent = $("#drawStrokeWidth").value;
  });
  $("#generateSignatureButton").addEventListener("click", () => renderTypedSignature(true));
  $("#downloadSignatureButton").addEventListener("click", () => downloadSignature());
  $("#clearDrawSignatureButton").addEventListener("click", () => clearDrawSignature());
  $$("[data-signature-mode]").forEach((button) => {
    button.addEventListener("click", () => setSignatureMode(button.dataset.signatureMode));
  });

  setupDrawSignatureCanvas();
  updateSignatureLabels();
  renderTypedSignature();
  clearDrawSignature(false);
}

function updateSignatureLabels() {
  $("#signatureSizeLabel").textContent = $("#signatureSize").value;
  $("#signatureSlantLabel").textContent = $("#signatureSlant").value;
  $("#drawStrokeWidthLabel").textContent = $("#drawStrokeWidth").value;
}

function setSignatureMode(mode) {
  state.signatureMode = mode;
  $$("[data-signature-mode]").forEach((button) => button.classList.toggle("is-active", button.dataset.signatureMode === mode));
  $$("[data-signature-stage]").forEach((stage) => stage.classList.toggle("is-active", stage.dataset.signatureStage === mode));
  $("#signatureMeta").textContent = mode === "typed" ? "透明背景 PNG，适合放到 Word、PDF、图片或邮件签名里。" : "手写内容只保存在当前浏览器画布中，不会上传。";
}

function renderTypedSignature(showToastAfter = false) {
  const canvas = $("#signatureCanvas");
  const ctx = canvas.getContext("2d");
  const name = ($("#signatureName").value.trim() || "签名").slice(0, 40);
  const color = $("#signatureColor").value;
  const size = Number($("#signatureSize").value);
  const slant = Number($("#signatureSlant").value);
  const style = signatureStyleConfig($("#signatureStyle").value);
  const dpr = window.devicePixelRatio || 1;
  const cssWidth = 900;
  const cssHeight = 320;
  canvas.width = cssWidth * dpr;
  canvas.height = cssHeight * dpr;
  canvas.style.width = "100%";
  canvas.style.height = "auto";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, cssWidth, cssHeight);
  ctx.save();
  ctx.translate(cssWidth / 2, cssHeight / 2 + style.yOffset);
  ctx.transform(1, 0, Math.tan((slant * Math.PI) / 180), 1, 0, 0);
  ctx.font = `${style.weight} ${size}px ${style.font}`;
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor = "rgba(15, 23, 42, 0.08)";
  ctx.shadowBlur = style.shadow;
  ctx.shadowOffsetY = 2;
  if (style.scriptVariant) {
    drawScriptSignatureText(ctx, name, 0, 0, style);
  } else if (style.letterSpacing) {
    drawSpacedText(ctx, name, 0, 0, style.letterSpacing);
  } else {
    ctx.fillText(name, 0, 0);
  }
  ctx.restore();

  if ($("#signatureUnderline").checked) {
    drawSignatureUnderline(ctx, color, cssWidth, cssHeight, style);
  }

  if (showToastAfter) showToast("签名已生成");
}

function signatureStyleConfig(value) {
  const styles = {
    flowing: {
      font: '"STXingkai", "Kaiti SC", "KaiTi", "Brush Script MT", cursive',
      weight: 500,
      shadow: 0,
      yOffset: -4,
      letterSpacing: 8,
      underline: 0.58,
    },
    business: {
      font: '"Kaiti SC", "KaiTi", "STKaiti", "Times New Roman", serif',
      weight: 700,
      shadow: 0,
      yOffset: -2,
      letterSpacing: 4,
      underline: 0.5,
    },
    bold: {
      font: '"STXingkai", "Kaiti SC", "KaiTi", cursive',
      weight: 800,
      shadow: 1,
      yOffset: -2,
      letterSpacing: 7,
      underline: 0.66,
    },
    minimal: {
      font: '"Kaiti SC", "KaiTi", "Songti SC", serif',
      weight: 400,
      shadow: 0,
      yOffset: 0,
      letterSpacing: 5,
      underline: 0.42,
    },
    xingkai: {
      font: '"STXingkai", "Kaiti SC", "STKaiti", "KaiTi", cursive',
      weight: 680,
      shadow: 1,
      yOffset: -5,
      letterSpacing: 7,
      underline: 0.62,
      scriptVariant: "xingkai",
    },
    caoshu: {
      font: '"STXingkai", "HanziPen SC", "Kaiti SC", "KaiTi", cursive',
      weight: 820,
      shadow: 1.5,
      yOffset: -9,
      letterSpacing: -2,
      underline: 0.78,
      scriptVariant: "caoshu",
    },
  };
  return styles[value] || styles.flowing;
}

function drawSpacedText(ctx, text, x, y, spacing) {
  const charsInText = [...text];
  const widths = charsInText.map((char) => ctx.measureText(char).width);
  const total = widths.reduce((sum, width) => sum + width, 0) + spacing * Math.max(0, charsInText.length - 1);
  let cursor = x - total / 2;
  charsInText.forEach((char, index) => {
    ctx.fillText(char, cursor + widths[index] / 2, y);
    cursor += widths[index] + spacing;
  });
}

function drawScriptSignatureText(ctx, text, x, y, style) {
  const charsInText = [...text];
  const spacing = style.letterSpacing || 0;
  const widths = charsInText.map((char) => ctx.measureText(char).width);
  const total = widths.reduce((sum, width) => sum + width, 0) + spacing * Math.max(0, charsInText.length - 1);
  let cursor = x - total / 2;
  charsInText.forEach((char, index) => {
    const isCaoshu = style.scriptVariant === "caoshu";
    const angle = isCaoshu ? ((index % 3) - 1) * 0.13 - 0.04 : ((index % 3) - 1) * 0.035;
    const lift = isCaoshu ? (index % 2 === 0 ? -8 : 5) : (index % 2 === 0 ? -3 : 2);
    const scaleX = isCaoshu ? (index === charsInText.length - 1 ? 1.16 : 1.06) : 1.02;
    const scaleY = isCaoshu ? 0.96 : 1;
    ctx.save();
    ctx.translate(cursor + widths[index] / 2, y + lift);
    ctx.rotate(angle);
    ctx.scale(scaleX, scaleY);
    ctx.fillText(char, 0, 0);
    ctx.restore();
    cursor += widths[index] + spacing;
  });
}

function drawSignatureUnderline(ctx, color, width, height, style) {
  const y = height * 0.68;
  const start = width * 0.22;
  const end = width * 0.78;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(2, Number($("#signatureSize").value) / 24);
  ctx.lineCap = "round";
  ctx.globalAlpha = style.underline;
  ctx.beginPath();
  ctx.moveTo(start, y);
  if (style.scriptVariant === "xingkai") {
    ctx.bezierCurveTo(width * 0.34, y + 24, width * 0.58, y - 2, end, y - 18);
  } else if (style.scriptVariant === "caoshu") {
    ctx.bezierCurveTo(width * 0.3, y + 30, width * 0.58, y - 16, width * 0.8, y - 22);
    ctx.bezierCurveTo(width * 0.88, y - 30, width * 0.86, y + 10, width * 0.74, y + 12);
    ctx.bezierCurveTo(width * 0.84, y - 25, width * 0.83, y + 4, width * 0.75, y + 8);
  } else {
    ctx.bezierCurveTo(width * 0.38, y + 18, width * 0.55, y + 8, end, y - 10);
  }
  ctx.stroke();
  ctx.restore();
}

function setupDrawSignatureCanvas() {
  const canvas = $("#drawSignatureCanvas");
  const ctx = canvas.getContext("2d");
  const resetSize = () => {
    const snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const dpr = window.devicePixelRatio || 1;
    canvas.width = 900 * dpr;
    canvas.height = 320 * dpr;
    canvas.style.width = "100%";
    canvas.style.height = "auto";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (snapshot.width && snapshot.height) {
      try {
        ctx.putImageData(snapshot, 0, 0);
      } catch {
        clearDrawSignature(false);
      }
    }
  };
  resetSize();
  canvas.addEventListener("pointerdown", (event) => {
    state.drawingSignature = true;
    state.lastSignaturePoint = signaturePointer(canvas, event);
    canvas.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener("pointermove", (event) => {
    if (!state.drawingSignature) return;
    const point = signaturePointer(canvas, event);
    drawSignatureStroke(state.lastSignaturePoint, point);
    state.lastSignaturePoint = point;
  });
  canvas.addEventListener("pointerup", () => {
    state.drawingSignature = false;
    state.lastSignaturePoint = null;
  });
  canvas.addEventListener("pointercancel", () => {
    state.drawingSignature = false;
    state.lastSignaturePoint = null;
  });
}

function signaturePointer(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * 900,
    y: ((event.clientY - rect.top) / rect.height) * 320,
  };
}

function drawSignatureStroke(from, to) {
  const canvas = $("#drawSignatureCanvas");
  const ctx = canvas.getContext("2d");
  ctx.save();
  ctx.strokeStyle = $("#signatureColor").value;
  ctx.lineWidth = Number($("#drawStrokeWidth").value);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.stroke();
  ctx.restore();
}

function clearDrawSignature(showToastAfter = true) {
  const canvas = $("#drawSignatureCanvas");
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (showToastAfter) showToast("手写画布已清空");
}

function downloadSignature() {
  const source = state.signatureMode === "draw" ? $("#drawSignatureCanvas") : $("#signatureCanvas");
  downloadUrl(source.toDataURL("image/png"), state.signatureMode === "draw" ? "handwritten-signature.png" : "signature.png");
}

function setupIdGeneratorControls() {
  const province = $("#idProvince");
  const city = $("#idCity");
  const county = $("#idCounty");
  province.innerHTML = `<option value="">请选择省</option>${idRegions.map((item, index) => `<option value="${index}">${escapeHtml(item.name)}</option>`).join("")}`;
  city.innerHTML = '<option value="">请选择市</option>';
  county.innerHTML = '<option value="">请选择县/区</option>';
  province.addEventListener("change", () => renderIdCities());
  city.addEventListener("change", () => renderIdCounties());
  $$('input[name="idDateMode"]').forEach((input) => input.addEventListener("change", updateIdDateFields));
  updateIdDateFields();
}

function renderIdCities() {
  const province = idRegions[Number($("#idProvince").value)];
  $("#idCity").innerHTML = '<option value="">请选择市</option>';
  $("#idCounty").innerHTML = '<option value="">请选择县/区</option>';
  if (!province) return;
  $("#idCity").innerHTML += province.cities.map((item, index) => `<option value="${index}">${escapeHtml(item.name)}</option>`).join("");
}

function renderIdCounties() {
  const province = idRegions[Number($("#idProvince").value)];
  const city = province?.cities[Number($("#idCity").value)];
  $("#idCounty").innerHTML = '<option value="">请选择县/区</option>';
  if (!city) return;
  $("#idCounty").innerHTML += city.counties.map(([name, code], index) => `<option value="${index}" data-code="${code}">${escapeHtml(name)}</option>`).join("");
}

function setupPhoneGeneratorControls() {
  const container = $("#phonePrefixGroups");
  container.innerHTML = phonePrefixGroups
    .map((group) => `
      <div class="prefix-group" data-carrier="${escapeHtml(group.carrier)}">
        <div class="prefix-group-title">
          <strong>${escapeHtml(group.carrier)}</strong>
          <button class="small-button secondary" type="button" data-prefix-all="${escapeHtml(group.carrier)}">全部</button>
        </div>
        <div class="prefix-checks">
          ${group.prefixes.map((prefix) => `<label><input type="checkbox" value="${prefix}" data-phone-prefix /> ${prefix}</label>`).join("")}
        </div>
      </div>
    `)
    .join("");
  container.addEventListener("click", (event) => {
    const button = event.target.closest("[data-prefix-all]");
    if (!button) return;
    const group = button.closest(".prefix-group");
    const checks = [...group.querySelectorAll("[data-phone-prefix]")];
    const shouldCheck = checks.some((input) => !input.checked);
    checks.forEach((input) => {
      input.checked = shouldCheck;
    });
  });
  $("#phoneRegion").innerHTML = '<option value="">所有区域</option>' + idRegions.map((item) => `<option value="${escapeHtml(item.name)}">${escapeHtml(item.name)}</option>`).join("");
}

function updateIdDateFields() {
  const mode = document.querySelector('input[name="idDateMode"]:checked')?.value || "random";
  const fields = $(".id-date-fields");
  fields.style.display = mode === "random" ? "none" : "grid";
  $("#idBirthday").classList.toggle("is-hidden", mode !== "date");
  $("#idAge").classList.toggle("is-hidden", mode !== "age");
}

function readIdOptions() {
  return {
    region: selectedIdRegion(),
    dateMode: document.querySelector('input[name="idDateMode"]:checked')?.value || "random",
    birthday: $("#idBirthday").value,
    age: readNumber("#idAge", 0, 120, 30),
    gender: document.querySelector('input[name="idGender"]:checked')?.value || "random",
    nameMode: document.querySelector('input[name="idNameMode"]:checked')?.value || "none",
  };
}

function selectedIdRegion() {
  const province = idRegions[Number($("#idProvince").value)];
  const city = province?.cities[Number($("#idCity").value)];
  const county = city?.counties[Number($("#idCounty").value)];
  if (province && city && county) {
    return { code: county[1], label: `${province.name}${city.name}${county[0]}` };
  }
  if (province && city) {
    const picked = pick(city.counties);
    return { code: picked[1], label: `${province.name}${city.name}${picked[0]}` };
  }
  if (province) {
    const pickedCity = pick(province.cities);
    const pickedCounty = pick(pickedCity.counties);
    return { code: pickedCounty[1], label: `${province.name}${pickedCity.name}${pickedCounty[0]}` };
  }
  const pickedProvince = pick(idRegions);
  const pickedCity = pick(pickedProvince.cities);
  const pickedCounty = pick(pickedCity.counties);
  return { code: pickedCounty[1], label: `${pickedProvince.name}${pickedCity.name}${pickedCounty[0]}` };
}

function selectedPhonePrefixes() {
  const checked = $$("[data-phone-prefix]:checked").map((input) => input.value);
  return checked.length ? checked : phonePrefixes;
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

function setupImageConvertTool() {
  setupFileQueue({
    queueName: "convertImages",
    inputSelector: "#convertImageFiles",
    listSelector: "#convertImageList",
    emptyText: "尚未选择图片",
    acceptFile: isSupportedImageFile,
    onChange: renderConvertPreview,
  });
  $("#convertOutputType").addEventListener("change", renderConvertPreview);
  $("#convertQuality").addEventListener("input", () => {
    $("#convertQualityLabel").textContent = $("#convertQuality").value;
  });
  $("#convertBackground").addEventListener("input", renderConvertPreview);
  $("#convertImagesButton").addEventListener("click", convertImages);
}

async function renderConvertPreview() {
  const file = fileQueueFiles("convertImages")[0];
  const canvas = $("#convertPreviewCanvas");
  const meta = $("#convertMeta");
  if (!file) {
    canvas.width = 0;
    canvas.height = 0;
    meta.textContent = "转换前可先选择图片和目标格式。";
    return;
  }

  try {
    const image = await loadImageFile(file);
    const maxWidth = 760;
    const scale = Math.min(1, maxWidth / image.width);
    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if ($("#convertOutputType").value === "image/jpeg") {
      ctx.fillStyle = $("#convertBackground").value;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.drawImage(image.image, 0, 0, canvas.width, canvas.height);
    URL.revokeObjectURL(image.url);
    meta.textContent = `预览：${file.name} · ${image.width} x ${image.height} · 将转换为 ${formatImageType($("#convertOutputType").value)}。`;
  } catch (error) {
    meta.textContent = error.message;
  }
}

async function convertImages() {
  const files = fileQueueFiles("convertImages");
  if (!files.length) return showToast("请先选择图片", true);

  try {
    const outputType = $("#convertOutputType").value;
    const quality = Number($("#convertQuality").value);
    const converted = [];
    for (const file of files) {
      converted.push(await convertImageFile(file, outputType, quality));
    }

    if (converted.length === 1) {
      downloadBlob(converted[0].blob, converted[0].name);
    } else {
      const { default: JSZip } = await import(CDN.jszip);
      const zip = new JSZip();
      converted.forEach((item) => zip.file(item.name, item.blob));
      downloadBlob(await zip.generateAsync({ type: "blob" }), "converted-images.zip");
    }
    $("#convertMeta").textContent = `转换完成：${converted.length} 个文件，目标格式 ${formatImageType(outputType)}。`;
    showToast("图片格式转换完成");
  } catch (error) {
    showToast(`转换失败：${error.message}`, true);
  }
}

async function convertImageFile(file, outputType, quality) {
  const extension = imageTypeExtension(outputType);
  const baseName = file.name.replace(/\.[^.]+$/, "") || "converted-image";
  const safeName = baseName.replace(/[\\/:*?"<>|]+/g, "-");

  if (outputType === "image/svg+xml") {
    if (file.type === "image/svg+xml") {
      return {
        name: `${safeName}.svg`,
        blob: new Blob([await file.text()], { type: "image/svg+xml;charset=utf-8" }),
      };
    }
    const source = await loadImageFile(file);
    const dataUrl = await readAsDataUrl(file);
    const svg = [
      `<svg xmlns="http://www.w3.org/2000/svg" width="${source.width}" height="${source.height}" viewBox="0 0 ${source.width} ${source.height}">`,
      `<image href="${escapeHtml(dataUrl)}" width="${source.width}" height="${source.height}" />`,
      "</svg>",
    ].join("");
    URL.revokeObjectURL(source.url);
    return {
      name: `${safeName}.svg`,
      blob: new Blob([svg], { type: "image/svg+xml;charset=utf-8" }),
    };
  }

  const source = await loadImageFile(file);
  const canvas = document.createElement("canvas");
  canvas.width = source.width;
  canvas.height = source.height;
  const ctx = canvas.getContext("2d");
  if (outputType === "image/jpeg") {
    ctx.fillStyle = $("#convertBackground").value;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.drawImage(source.image, 0, 0);
  URL.revokeObjectURL(source.url);
  const blob = await canvasToBlob(canvas, outputType, quality);
  if (!blob) throw new Error(`浏览器不支持导出 ${formatImageType(outputType)}`);
  return {
    name: `${safeName}.${extension}`,
    blob,
  };
}

function imageTypeExtension(type) {
  const extensions = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/webp": "webp",
    "image/svg+xml": "svg",
  };
  return extensions[type] || "png";
}

function formatImageType(type) {
  const labels = {
    "image/png": "PNG",
    "image/jpeg": "JPG",
    "image/gif": "GIF",
    "image/webp": "WEBP",
    "image/svg+xml": "SVG",
  };
  return labels[type] || type;
}

function imageTypeFromName(name) {
  const extension = String(name).split(".").pop()?.toLowerCase();
  const types = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    svg: "image/svg+xml",
  };
  return types[extension] || "image/*";
}

function isSupportedImageFile(file) {
  return /^image\/(jpeg|png|gif|svg\+xml|webp)$/.test(file.type) || /\.(jpe?g|png|gif|svg|webp)$/i.test(file.name);
}

function isPdfFile(file) {
  return file.type === "application/pdf" || /\.pdf$/i.test(file.name);
}

function setupResizeTool() {
  const input = $("#resizeImageFile");
  const canvas = $("#resizeCanvas");
  input.addEventListener("change", async () => {
    const file = input.files[0];
    if (!file) return;
    const item = await loadImageFile(file);
    state.resizeSource = item;
    state.resizeOriginalBytes = file.size;
    $("#resizeWidth").value = item.width;
    $("#resizeHeight").value = item.height;
    $("#resizeScale").value = 100;
    $("#resizeOriginalSize").textContent = `${item.width} x ${item.height}`;
    $("#resizeOriginalBytes").textContent = formatBytes(file.size);
    $("#resizeOutputSize").textContent = "-";
    $("#resizeOutputBytes").textContent = "-";
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
      $("#resizeOutputSize").textContent = `${width} x ${height}`;
      $("#resizeOutputBytes").textContent = formatBytes(blob.size);
      const delta = state.resizeOriginalBytes ? ((blob.size - state.resizeOriginalBytes) / state.resizeOriginalBytes) * 100 : 0;
      const deltaText = delta >= 0 ? `增加 ${delta.toFixed(1)}%` : `减少 ${Math.abs(delta).toFixed(1)}%`;
      $("#resizeMeta").textContent = `处理后尺寸：${width} x ${height}，大小约：${formatBytes(blob.size)}。`;
      $("#resizeMeta").textContent += ` 相比原图${deltaText}。`;
      showToast("图片处理完成");
    }, $("#resizeOutputType").value, Number($("#resizeQuality").value));
  });
  $("#downloadProcessedImageButton").addEventListener("click", () => {
    const ext = $("#resizeOutputType").value.split("/").at(-1).replace("jpeg", "jpg");
    downloadUrl(state.processedImageUrl, `processed-image.${ext}`);
  });
}

function setupPdfTools() {
  setupFileQueue({
    queueName: "mergePdf",
    inputSelector: "#mergePdfFiles",
    listSelector: "#mergePdfList",
    emptyText: "尚未选择 PDF。",
    acceptFile: isPdfFile,
  });
  $("#mergePdfButton").addEventListener("click", mergePdfs);
  $("#pdfToImagesButton").addEventListener("click", pdfToImages);
  setupFileQueue({
    queueName: "imagesToPdf",
    inputSelector: "#imagesToPdfFiles",
    listSelector: "#imagesToPdfList",
    emptyText: "尚未选择图片。",
    acceptFile: isSupportedImageFile,
  });
  $("#imagesToPdfMargin").addEventListener("input", () => {
    $("#imagesToPdfMarginLabel").textContent = $("#imagesToPdfMargin").value;
  });
  $("#imagesToPdfButton").addEventListener("click", imagesToPdf);
}

async function mergePdfs() {
  const files = fileQueueFiles("mergePdf");
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

async function imagesToPdf() {
  const files = fileQueueFiles("imagesToPdf");
  const log = $("#pdfImagesLog");
  if (!files.length) return showToast("请先选择图片", true);

  try {
    log.textContent = "正在加载 PDF 处理库...";
    const { PDFDocument } = await import(CDN.pdfLib);
    const pdf = await PDFDocument.create();
    const pageMode = $("#imagesToPdfPageMode").value;
    const margin = readNumber("#imagesToPdfMargin", 0, 72, 24);

    for (let index = 0; index < files.length; index += 1) {
      const file = files[index];
      log.textContent = `正在处理第 ${index + 1}/${files.length} 张图片...`;
      const source = await prepareImageForPdf(file);
      const image = source.type === "image/png"
        ? await pdf.embedPng(source.bytes)
        : await pdf.embedJpg(source.bytes);
      const imageWidth = image.width;
      const imageHeight = image.height;
      const pageSize = pdfPageSizeForImage(imageWidth, imageHeight, pageMode, margin);
      const page = pdf.addPage([pageSize.width, pageSize.height]);
      const placement = imagePlacement(imageWidth, imageHeight, pageSize.width, pageSize.height, pageMode, margin);
      page.drawImage(image, placement);
    }

    log.textContent = "正在生成 PDF...";
    const bytes = await pdf.save();
    downloadBlob(new Blob([bytes], { type: "application/pdf" }), "images.pdf");
    log.textContent = `完成，已将 ${files.length} 张图片生成 PDF。`;
    showToast("图片 PDF 已生成");
  } catch (error) {
    log.textContent = error.message;
    showToast(`图片转 PDF 失败：${error.message}`, true);
  }
}

async function prepareImageForPdf(file) {
  if (file.type === "image/jpeg" || /\.(jpe?g)$/i.test(file.name)) {
    return { bytes: await file.arrayBuffer(), type: "image/jpeg" };
  }

  const image = await loadImageFile(file);
  const canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image.image, 0, 0);
  URL.revokeObjectURL(image.url);
  const blob = await canvasToBlob(canvas, "image/png");
  return { bytes: await blob.arrayBuffer(), type: "image/png" };
}

function pdfPageSizeForImage(imageWidth, imageHeight, mode, margin) {
  if (mode === "image") {
    return { width: imageWidth, height: imageHeight };
  }
  const portrait = imageHeight >= imageWidth;
  return portrait ? { width: 595.28, height: 841.89 } : { width: 841.89, height: 595.28 };
}

function imagePlacement(imageWidth, imageHeight, pageWidth, pageHeight, mode, margin) {
  if (mode === "image") {
    return { x: 0, y: 0, width: pageWidth, height: pageHeight };
  }

  const availableWidth = Math.max(1, pageWidth - margin * 2);
  const availableHeight = Math.max(1, pageHeight - margin * 2);
  const scale = mode === "a4-fill"
    ? Math.max(availableWidth / imageWidth, availableHeight / imageHeight)
    : Math.min(availableWidth / imageWidth, availableHeight / imageHeight);
  const width = imageWidth * scale;
  const height = imageHeight * scale;
  return {
    x: (pageWidth - width) / 2,
    y: (pageHeight - height) / 2,
    width,
    height,
  };
}

function setupCryptoTool() {
  setupFileQueue({
    queueName: "folder",
    inputSelector: "#folderInput",
    listSelector: "#folderFileList",
    emptyText: "尚未选择文件夹。",
    describeFile: (file) => file.webkitRelativePath || file.name,
    max: 5000,
  });
  $("#encryptFolderButton").addEventListener("click", encryptFolder);
  $("#decryptFolderButton").addEventListener("click", decryptFolder);
}

async function encryptFolder() {
  const files = fileQueueFiles("folder");
  const password = $("#folderPassword").value;
  const log = $("#cryptoLog");
  if (!files.length) return showToast("请先选择文件夹", true);
  if (!password) return showToast("请输入加密密码", true);
  try {
    log.textContent = "正在生成标准密码 ZIP...";
    const { BlobReader, BlobWriter, ZipWriter } = await import(CDN.zipjs);
    const zipWriter = new ZipWriter(new BlobWriter("application/zip"), {
      password,
      encryptionStrength: 3,
      level: 6,
    });

    for (let index = 0; index < files.length; index += 1) {
      const file = files[index];
      log.textContent = `正在加密第 ${index + 1}/${files.length} 个文件...`;
      await zipWriter.add(safeZipEntryName(file.webkitRelativePath || file.name), new BlobReader(file), {
        lastModDate: new Date(file.lastModified || Date.now()),
      });
    }

    const zipBlob = await zipWriter.close();
    downloadBlob(zipBlob, "folder-encrypted.zip");
    log.textContent = `完成，已生成标准密码 ZIP，共 ${files.length} 个文件。可直接用 Keka 输入密码解压。`;
    showToast("标准密码 ZIP 已生成");
  } catch (error) {
    log.textContent = error.message;
    showToast(`加密失败：${error.message}`, true);
  }
}

async function decryptFolder() {
  const file = $("#encryptedFileInput").files[0];
  const password = $("#decryptPassword").value;
  const log = $("#cryptoLog");
  if (!file) return showToast("请选择加密 zip 包", true);
  if (!password) return showToast("请输入解密密码", true);
  try {
    log.textContent = "正在读取标准密码 ZIP...";
    const { BlobReader, BlobWriter, ZipReader, ZipWriter } = await import(CDN.zipjs);
    const reader = new ZipReader(new BlobReader(file), { password });
    const entries = await reader.getEntries();
    const writer = new ZipWriter(new BlobWriter("application/zip"));
    const fileEntries = entries.filter((entry) => !entry.directory);

    for (let index = 0; index < fileEntries.length; index += 1) {
      const entry = fileEntries[index];
      log.textContent = `正在解密第 ${index + 1}/${fileEntries.length} 个文件...`;
      const blob = await entry.getData(new BlobWriter(), { password });
      await writer.add(entry.filename, new BlobReader(blob), {
        lastModDate: entry.lastModDate,
      });
    }

    await reader.close();
    const outputBlob = await writer.close();
    downloadBlob(outputBlob, "decrypted-folder.zip");
    log.textContent = "解密完成，已生成不带密码的 zip。";
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
  elements.imageRows.addEventListener("change", (event) => {
    if (!event.target.matches("[data-export-key]")) return;
    state.exportSelections.set(event.target.dataset.exportKey, event.target.checked);
    renderDownloadMeta();
  });
  elements.downloadsList.addEventListener("click", (event) => {
    const downloadButton = event.target.closest("[data-download-url]");
    if (downloadButton) {
      downloadArtifact(downloadButton.dataset.downloadUrl, downloadButton.dataset.downloadFilename, downloadButton);
      return;
    }

    const deleteButton = event.target.closest("[data-delete-artifact]");
    if (deleteButton) deleteArtifact(deleteButton.dataset.deleteArtifact);
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
    updateImageRowDerivedUi(input, row);
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

function addImageRow(text = "nginx:latest") {
  elements.imageSearchInput.value = "";
  const row = {
    id: state.nextImageRowId++,
    text,
  };
  state.imageRows.push(row);
  syncImageEditorFromRows();
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

  syncImageEditorFromRows();
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
  renderDownloadMeta();
  elements.validationList.textContent = "内容已修改，保存前会重新检测。";
}

function renderImageRows() {
  syncExportSelections();
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
      const entry = imageRowExportEntry(row.text, index + 1);
      const exportKey = entry ? exportEntryKey(entry) : "";
      const checked = entry && state.exportSelections.get(exportKey) !== false;
      return `
        <div class="image-row ${kind.className}" data-row-id="${row.id}">
          <span class="image-row-number">${index + 1}</span>
          ${entry ? `<label class="image-row-export"><input type="checkbox" data-export-key="${escapeHtml(exportKey)}" ${checked ? "checked" : ""} /> 打包</label>` : '<span class="image-row-export is-disabled">不打包</span>'}
          <input class="image-row-input" data-image-row="${row.id}" type="text" value="${escapeHtml(row.text)}" placeholder="例如：nginx:1.25 或 --platform=linux/amd64 redis:7" />
          <div class="image-row-actions">
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

function updateImageRowDerivedUi(input, row) {
  const container = input.closest(".image-row");
  if (!container) return;
  const index = state.imageRows.findIndex((item) => item.id === row.id);
  if (index < 0) return;

  const kind = imageRowKind(row.text);
  container.classList.remove("is-image", "is-comment", "is-blank");
  container.classList.add(kind.className);

  const exportControl = container.querySelector(".image-row-export");
  if (!exportControl) return;
  const entry = imageRowExportEntry(row.text, index + 1);
  if (!entry) {
    exportControl.outerHTML = '<span class="image-row-export is-disabled">不打包</span>';
    return;
  }

  const key = exportEntryKey(entry);
  const checked = state.exportSelections.get(key) !== false;
  exportControl.outerHTML = `<label class="image-row-export"><input type="checkbox" data-export-key="${escapeHtml(key)}" ${checked ? "checked" : ""} /> 打包</label>`;
}

async function downloadArtifact(path, filename = "docker-images.zip", trigger) {
  const item = trigger?.closest(".download-item");
  const progress = item?.querySelector("[data-download-progress]");
  const progressFill = item?.querySelector("[data-download-progress-fill]");
  const progressText = item?.querySelector("[data-download-progress-text]");

  try {
    setApiBusy(true);
    updateDownloadProgress(progress, progressFill, progressText, { loaded: 0, total: 0, started: true });
    const response = await fetch(path, { headers: { authorization: `Bearer ${state.password}` } });
    if (!response.ok) {
      const text = await response.text();
      const data = text ? parseJson(text) : {};
      throw new Error(data.error || text || `下载失败：${response.status}`);
    }

    const blob = await responseToBlobWithProgress(response, (loaded, total) => {
      updateDownloadProgress(progress, progressFill, progressText, { loaded, total, started: true });
    });
    updateDownloadProgress(progress, progressFill, progressText, { loaded: blob.size, total: blob.size, started: true });
    downloadBlob(blob, safeDownloadFilename(filename));
    showToast("镜像包开始下载");
  } catch (error) {
    updateDownloadProgress(progress, progressFill, progressText, { error: error.message });
    showToast(error.message, true);
  } finally {
    setApiBusy(false);
  }
}

async function responseToBlobWithProgress(response, onProgress) {
  const total = Number(response.headers.get("content-length")) || 0;
  if (!response.body) {
    const blob = await response.blob();
    onProgress(blob.size, blob.size);
    return blob;
  }

  const reader = response.body.getReader();
  const chunks = [];
  let loaded = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    loaded += value.length;
    onProgress(loaded, total);
  }

  return new Blob(chunks, { type: response.headers.get("content-type") || "application/zip" });
}

function updateDownloadProgress(progress, fill, text, status) {
  if (!progress || !fill || !text) return;

  progress.hidden = false;
  progress.classList.toggle("is-indeterminate", status.started && !status.total && !status.error);

  if (status.error) {
    fill.style.width = "100%";
    text.textContent = `下载失败：${status.error}`;
    progress.classList.remove("is-indeterminate");
    progress.classList.add("is-error");
    return;
  }

  progress.classList.remove("is-error");
  if (status.total) {
    const percent = Math.min(100, Math.round((status.loaded / status.total) * 100));
    fill.style.width = `${percent}%`;
    text.textContent = `下载中 ${percent}% · ${formatBytes(status.loaded)} / ${formatBytes(status.total)}`;
    if (percent >= 100) text.textContent = `下载完成 · ${formatBytes(status.loaded)}`;
    return;
  }

  fill.style.width = "42%";
  text.textContent = status.loaded ? `下载中 · 已接收 ${formatBytes(status.loaded)}` : "准备下载...";
}

async function deleteArtifact(artifactId) {
  if (!artifactId || !confirm("确定删除这个镜像包下载记录吗？删除后需要重新生成才能再次下载。")) return;

  try {
    setApiBusy(true);
    await api(`/api/export-artifacts/${encodeURIComponent(artifactId)}`, { method: "DELETE" });
    showToast("已删除镜像包");
    await loadDownloads();
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
  const entries = syncExportSelections();
  const selectedCount = selectedExportEntries().length;
  elements.downloadMeta.textContent = entries.length ? `已选择 ${selectedCount}/${entries.length} 个镜像，生成完成后可直接下载。` : "当前没有可导出的有效镜像。";
}

function syncExportSelections() {
  const entries = parseManagedImageLines(elements.imagesEditor.value || "");
  const nextSelections = new Map();
  if (!entries.length) {
    state.exportSelections = nextSelections;
    return entries;
  }

  entries.forEach((entry) => {
    const key = exportEntryKey(entry);
    nextSelections.set(key, state.exportSelections.has(key) ? state.exportSelections.get(key) : true);
  });
  state.exportSelections = nextSelections;
  return entries;
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
      const filename = artifact.filename || artifactDownloadFilename(artifact.name);
      return `
        <div class="download-item">
          <div class="download-info">
            <strong>${escapeHtml(filename)}</strong>
            <span class="run-meta">${formatBytes(artifact.size_in_bytes)} · ${escapeHtml(new Date(artifact.created_at).toLocaleString())}</span>
            <div class="download-progress" data-download-progress hidden>
              <span class="download-progress-bar"><span data-download-progress-fill></span></span>
              <span class="download-progress-text" data-download-progress-text>准备下载...</span>
            </div>
          </div>
          <div class="download-actions">
            <button class="small-button secondary" type="button" data-download-url="${escapeHtml(artifact.download_url)}" data-download-filename="${escapeHtml(filename)}">下载</button>
            <button class="small-button danger" type="button" data-delete-artifact="${escapeHtml(artifact.id)}">删除</button>
          </div>
        </div>
      `;
    })
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

function createIdRecord(options) {
  const region = options.region || selectedIdRegion();
  const gender = options.gender === "random" ? pick(["male", "female"]) : options.gender;
  const birthday = birthdayByMode(options);
  let sequence = randomInt(1, 999);
  if (gender === "male" && sequence % 2 === 0) sequence += 1;
  if (gender === "female" && sequence % 2 === 1) sequence += 1;
  if (sequence > 999) sequence = gender === "female" ? 998 : 999;
  const body = `${region.code}${birthday}${String(sequence).padStart(3, "0")}`;
  return {
    id: `${body}${idChecksum(body)}`,
    name: options.nameMode === "random" ? randomChineseName() : "",
    gender,
    genderLabel: gender === "male" ? "男" : "女",
    birthday,
    regionLabel: region.label,
  };
}

function idChecksum(body) {
  const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
  const codes = "10X98765432";
  const sum = body.split("").reduce((total, digit, index) => total + Number(digit) * weights[index], 0);
  return codes[sum % 11];
}

function birthdayByMode(options) {
  if (options.dateMode === "date" && options.birthday) {
    return options.birthday.replaceAll("-", "");
  }
  if (options.dateMode === "age") {
    return randomBirthdayByAge(options.age);
  }
  return randomBirthday();
}

function randomBirthday() {
  const start = new Date(1960, 0, 1).getTime();
  const end = new Date(2006, 11, 31).getTime();
  const date = new Date(randomInt(start, end));
  return dateToCompact(date);
}

function randomBirthdayByAge(age) {
  const today = new Date();
  const start = new Date(today.getFullYear() - age - 1, today.getMonth(), today.getDate() + 1);
  const end = new Date(today.getFullYear() - age, today.getMonth(), today.getDate());
  return dateToCompact(new Date(randomInt(start.getTime(), end.getTime())));
}

function dateToCompact(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

function formatBirthday(value) {
  return `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;
}

function randomChineseName() {
  const length = randomInt(1, 2);
  return `${pick(familyNames)}${Array.from({ length }, () => pick(givenNameChars)).join("")}`;
}

function createPhone(prefixes, region) {
  const prefix = pick(prefixes);
  const carrier = phonePrefixGroups.find((group) => group.prefixes.includes(prefix))?.carrier || "未知";
  const place = region || pick(idRegions).name;
  return {
    number: `${prefix}${String(randomInt(0, 99999999)).padStart(8, "0")}`,
    carrier,
    place,
  };
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
  if (range > 0xffffffff) {
    return min + Math.floor(Math.random() * range);
  }
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

function safeZipEntryName(name) {
  return String(name || "file")
    .replace(/\\/g, "/")
    .split("/")
    .filter((part) => part && part !== "." && part !== "..")
    .join("/") || "file";
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

function setupFileQueue({ queueName, inputSelector, listSelector, emptyText, acceptFile, describeFile, onChange, max = 1000 }) {
  state.fileQueueOptions ||= {};
  state.fileQueueOptions[queueName] = {
    inputSelector,
    listSelector,
    emptyText,
    describeFile: describeFile || ((file) => file.name),
    onChange,
  };

  const input = $(inputSelector);
  const list = $(listSelector);
  input.dataset.fileQueueName = queueName;
  input.addEventListener("change", () => {
    addFileQueueItems(queueName, [...input.files], { acceptFile, max });
    input.value = "";
    updateFileQueueControlLabel(input, queueName);
  });

  list.addEventListener("click", (event) => {
    const button = event.target.closest("[data-file-queue-action]");
    if (!button) return;
    handleFileQueueAction(queueName, Number(button.dataset.fileQueueId), button.dataset.fileQueueAction);
  });

  list.addEventListener("dragstart", (event) => {
    const row = event.target.closest("[data-file-queue-id]");
    if (!row) return;
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", row.dataset.fileQueueId);
    row.classList.add("is-dragging");
  });
  list.addEventListener("dragend", (event) => {
    event.target.closest("[data-file-queue-id]")?.classList.remove("is-dragging");
  });
  list.addEventListener("dragover", (event) => {
    const row = event.target.closest("[data-file-queue-id]");
    if (!row) return;
    event.preventDefault();
    row.classList.add("is-drop-target");
  });
  list.addEventListener("dragleave", (event) => {
    event.target.closest("[data-file-queue-id]")?.classList.remove("is-drop-target");
  });
  list.addEventListener("drop", (event) => {
    const row = event.target.closest("[data-file-queue-id]");
    if (!row) return;
    event.preventDefault();
    row.classList.remove("is-drop-target");
    reorderFileQueueItem(queueName, Number(event.dataTransfer.getData("text/plain")), Number(row.dataset.fileQueueId));
  });

  renderFileQueue(queueName);
}

function addFileQueueItems(queueName, files, { acceptFile, max }) {
  const queue = state.fileQueues[queueName];
  const accepted = files.filter((file) => !acceptFile || acceptFile(file));
  const existingKeys = new Set(queue.map((item) => fileQueueItemKey(item.file)));
  const unique = accepted.filter((file) => !existingKeys.has(fileQueueItemKey(file)));
  const remaining = Math.max(0, max - queue.length);
  const added = unique.slice(0, remaining).map((file) => ({ id: state.nextFileQueueId++, file }));
  queue.push(...added);
  renderFileQueue(queueName);
  notifyFileQueueChanged(queueName);

  if (accepted.length !== files.length) showToast("部分文件类型不支持，已忽略", true);
  if (unique.length !== accepted.length) showToast("重复文件已忽略", true);
  if (unique.length > remaining) showToast(`最多只能添加 ${max} 个文件，超出的已忽略`, true);
}

function handleFileQueueAction(queueName, id, action) {
  const queue = state.fileQueues[queueName];
  const index = queue.findIndex((item) => item.id === id);
  if (index < 0) return;

  if (action === "delete") {
    queue.splice(index, 1);
  }

  if (action === "up" && index > 0) {
    [queue[index - 1], queue[index]] = [queue[index], queue[index - 1]];
  }

  if (action === "down" && index < queue.length - 1) {
    [queue[index + 1], queue[index]] = [queue[index], queue[index + 1]];
  }

  renderFileQueue(queueName);
  notifyFileQueueChanged(queueName);
}

function reorderFileQueueItem(queueName, sourceId, targetId) {
  if (!sourceId || !targetId || sourceId === targetId) return;
  const queue = state.fileQueues[queueName];
  const sourceIndex = queue.findIndex((item) => item.id === sourceId);
  const targetIndex = queue.findIndex((item) => item.id === targetId);
  if (sourceIndex < 0 || targetIndex < 0) return;
  const [source] = queue.splice(sourceIndex, 1);
  queue.splice(targetIndex, 0, source);
  renderFileQueue(queueName);
  notifyFileQueueChanged(queueName);
}

function renderFileQueue(queueName) {
  const options = state.fileQueueOptions?.[queueName];
  if (!options) return;
  const queue = state.fileQueues[queueName];
  const target = $(options.listSelector);
  if (!queue.length) {
    target.textContent = options.emptyText || "尚未选择文件";
    return;
  }

  target.innerHTML = queue
    .map((item, index) => {
      const title = options.describeFile(item.file);
      const meta = [formatBytes(item.file.size), item.file.type || fileExtensionLabel(item.file.name)].filter(Boolean).join(" · ");
      return `
        <div class="file-row file-queue-row" draggable="true" data-file-queue-id="${item.id}">
          <span class="merge-image-order">${index + 1}</span>
          <div>
            <strong>${escapeHtml(title)}</strong>
            <span>${escapeHtml(meta)}</span>
          </div>
          <div class="file-row-actions">
            <button class="row-action secondary" type="button" data-file-queue-action="up" data-file-queue-id="${item.id}" ${index === 0 ? "disabled" : ""}>上移</button>
            <button class="row-action secondary" type="button" data-file-queue-action="down" data-file-queue-id="${item.id}" ${index === queue.length - 1 ? "disabled" : ""}>下移</button>
            <button class="row-action danger" type="button" data-file-queue-action="delete" data-file-queue-id="${item.id}">删除</button>
          </div>
        </div>
      `;
    })
    .join("");
}

function notifyFileQueueChanged(queueName) {
  const options = state.fileQueueOptions?.[queueName];
  if (!options) return;
  updateFileControlLabel($(options.inputSelector));
  options.onChange?.(state.fileQueues[queueName].map((item) => item.file));
}

function updateFileQueueControlLabel(input, queueName) {
  const label = input.closest(".file-control")?.querySelector(".file-control-label");
  if (!label) return;
  const count = state.fileQueues[queueName].length;
  label.textContent = count ? `已添加 ${count} 个文件，可继续添加` : (input.hasAttribute("webkitdirectory") ? "未选择文件夹" : "未选择任何文件");
}

function fileQueueFiles(queueName) {
  return state.fileQueues[queueName].map((item) => item.file);
}

function fileQueueItemKey(file) {
  return `${file.webkitRelativePath || file.name}:${file.size}:${file.lastModified}`;
}

function fileExtensionLabel(name) {
  const extension = String(name || "").split(".").pop();
  return extension && extension !== name ? extension.toUpperCase() : "";
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

function autoResizeTextarea(textarea) {
  textarea.style.height = "auto";
  const minHeight = Number(textarea.dataset.minHeight || 420);
  const maxHeight = Number(textarea.dataset.maxHeight || 1400);
  const nextHeight = Math.max(minHeight, Math.min(maxHeight, textarea.scrollHeight + 2));
  textarea.style.height = `${nextHeight}px`;
  textarea.style.overflowY = textarea.scrollHeight > maxHeight ? "auto" : "hidden";
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
  renderDownloadMeta();
}

function setAllExportSelections(checked) {
  syncExportSelections();
  for (const key of state.exportSelections.keys()) state.exportSelections.set(key, checked);
  elements.imageRows.querySelectorAll("[data-export-key]").forEach((input) => {
    input.checked = checked;
  });
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

function imageRowExportEntry(text, lineNumber) {
  const line = String(text || "").trim();
  if (!line || line.startsWith("#")) return null;
  const image = line.split(/\s+/).at(-1);
  if (!image) return null;
  return {
    lineNumber,
    raw: line,
    image,
    platform: parsePlatform(line),
  };
}

function selectedExportEntries() {
  return syncExportSelections().filter((entry) => state.exportSelections.get(exportEntryKey(entry)) !== false);
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

function artifactDownloadFilename(name) {
  const safeName = String(name || "docker-images")
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120);
  return `${safeName || "docker-images"}.zip`;
}

function safeDownloadFilename(filename) {
  return String(filename || "docker-images.zip")
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 124) || "docker-images.zip";
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
