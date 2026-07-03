# Docker Images Pusher

使用Github Action将国外的Docker镜像转存到阿里云私有仓库，供国内服务器使用，免费易用<br>
- 支持DockerHub, gcr.io, k8s.io, ghcr.io等任意仓库<br>
- 支持最大40GB的大型镜像<br>
- 使用阿里云的官方线路，速度快<br>
- 新增 Cloudflare Pages 网页管理入口，可在网页中修改 images.txt 并触发 Action<br>

视频教程：https://www.bilibili.com/video/BV1Zn4y19743/

作者：**[技术爬爬虾](https://github.com/tech-shrimp/me)**<br>
B站，抖音，Youtube全网同名，转载请注明作者<br>

## 使用方式

### 方式一：Cloudflare Pages 网页管理

本仓库现在可以部署成 Cloudflare Pages。部署后可以直接在网页中修改 `images.txt`，无需每次进 GitHub 手动编辑文件。

核心文件：

- `public/`：网页编辑器
- `functions/api/[[path]].js`：Cloudflare Pages Functions API
- `images.txt`：镜像列表
- `.github/workflows/docker.yaml`：原有镜像转存流程

Cloudflare Pages 构建设置：

- Framework preset: `None`
- Build command: 留空
- Build output directory: `public`

Cloudflare Pages 环境变量：

| 变量名 | 说明 |
| --- | --- |
| `APP_PASSWORD` | 登录网页的访问密码 |
| `GITHUB_TOKEN` | GitHub token，需要能读写仓库内容并触发 Actions |
| `GITHUB_OWNER` | GitHub 仓库拥有者，例如 `Smithereensun` |
| `GITHUB_REPO` | GitHub 仓库名，例如 `docker_image_pusher` |
| `GITHUB_BRANCH` | 分支，默认 `main` |
| `IMAGE_FILE_PATH` | 镜像列表文件，默认 `images.txt` |
| `WORKFLOW_FILE` | workflow 文件名，默认 `docker.yaml` |
| `EXPORT_WORKFLOW_FILE` | 镜像包导出 workflow 文件名，默认 `export-images.yaml` |

GitHub token 推荐使用 fine-grained token，并授予本仓库 `Contents: Read and write`、`Actions: Read and write`。完整步骤见 [docs/cloudflare-pages.md](docs/cloudflare-pages.md)。

部署完成后，网页还可以触发 `export-images.yaml` 生成浏览器可下载的镜像包。GitHub Action 会从阿里云镜像仓库拉取镜像，执行 `docker save` 生成 `docker-images.tar.gz`，再上传为 GitHub Actions artifact。下载后可用 `docker load -i docker-images.tar.gz` 导入。


### 配置阿里云
登录阿里云容器镜像服务<br>
https://cr.console.aliyun.com/<br>
启用个人实例，创建一个命名空间（**ALIYUN_NAME_SPACE**）
![](/doc/命名空间.png)

访问凭证–>获取环境变量<br>
用户名（**ALIYUN_REGISTRY_USER**)<br>
密码（**ALIYUN_REGISTRY_PASSWORD**)<br>
仓库地址（**ALIYUN_REGISTRY**）<br>

![](/doc/用户名密码.png)


### Fork本项目
Fork本项目<br>
#### 启动Action
进入您自己的项目，点击Action，启用Github Action功能<br>
#### 配置环境变量
进入Settings->Secret and variables->Actions->New Repository secret
![](doc/配置环境变量.png)
将上一步的**四个值**<br>
ALIYUN_NAME_SPACE,ALIYUN_REGISTRY_USER，ALIYUN_REGISTRY_PASSWORD，ALIYUN_REGISTRY<br>
配置成环境变量

### 添加镜像
打开images.txt文件，添加你想要的镜像 
可以加tag，也可以不用(默认latest)<br>
可添加 --platform=xxxxx 的参数指定镜像架构<br>
可使用 k8s.gcr.io/kube-state-metrics/kube-state-metrics 格式指定私库<br>
可使用 #开头作为注释<br>
![](doc/images.png)
文件提交后，自动进入Github Action构建

### 使用镜像
回到阿里云，镜像仓库，点击任意镜像，可查看镜像状态。(可以改成公开，拉取镜像免登录)
![](doc/开始使用.png)

在国内服务器pull镜像, 例如：<br>
```
docker pull registry.cn-hangzhou.aliyuncs.com/shrimp-images/alpine
```
registry.cn-hangzhou.aliyuncs.com 即 ALIYUN_REGISTRY(阿里云仓库地址)<br>
shrimp-images 即 ALIYUN_NAME_SPACE(阿里云命名空间)<br>
alpine 即 阿里云中显示的镜像名<br>

### 多架构
需要在images.txt中用 --platform=xxxxx手动指定镜像架构
指定后的架构会以前缀的形式放在镜像名字前面
![](doc/多架构.png)

### 镜像重名
程序自动判断是否存在名称相同, 但是属于不同命名空间的情况。
如果存在，会把命名空间作为前缀加在镜像名称前。
例如:
```
xhofe/alist
xiaoyaliu/alist
```
![](doc/镜像重名.png)

### 定时执行
修改/.github/workflows/docker.yaml文件
添加 schedule即可定时执行(此处cron使用UTC时区)
![](doc/定时执行.png)
