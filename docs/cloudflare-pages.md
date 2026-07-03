# Cloudflare Pages 部署说明

这个版本把原项目改成了 Cloudflare Pages + Pages Functions：

- `public/` 是网页编辑器。
- `functions/api/[[path]].js` 是后端 API，负责读写 GitHub 的 `images.txt` 并触发 GitHub Actions。
- `.github/workflows/docker.yaml` 继续负责把镜像拉取并推送到阿里云镜像仓库。

## 1. 准备 GitHub Token

创建一个 GitHub Personal Access Token，建议使用 fine-grained token，并授予你的仓库：

- Contents: Read and write
- Actions: Read and write

如果使用 classic token，需要有 `repo` 权限。

## 2. 配置 Cloudflare Pages

在 Cloudflare Pages 中连接你的 GitHub 仓库，构建设置：

- Framework preset: None
- Build command: 留空
- Build output directory: `public`

然后在 Pages 的 Environment variables 中配置：

| 变量名 | 示例 | 说明 |
| --- | --- | --- |
| `APP_PASSWORD` | `change-this-password` | 登录网页的访问密码 |
| `GITHUB_TOKEN` | `github_pat_...` | GitHub token |
| `GITHUB_OWNER` | `Smithereensun` | 仓库拥有者 |
| `GITHUB_REPO` | `docker_image_pusher` | 仓库名 |
| `GITHUB_BRANCH` | `main` | 分支，可不填 |
| `IMAGE_FILE_PATH` | `images.txt` | 镜像列表文件，可不填 |
| `WORKFLOW_FILE` | `docker.yaml` | workflow 文件名，可不填 |

## 3. 配置原有阿里云 Secrets

GitHub 仓库的 `Settings -> Secrets and variables -> Actions` 中仍然需要配置原项目要求的四个 secret：

- `ALIYUN_NAME_SPACE`
- `ALIYUN_REGISTRY_USER`
- `ALIYUN_REGISTRY_PASSWORD`
- `ALIYUN_REGISTRY`

## 4. 使用

部署完成后打开 Cloudflare Pages 域名：

1. 输入 `APP_PASSWORD`。
2. 编辑镜像列表。
3. 点击「保存并提交」。
4. 页面会提交 `images.txt`，GitHub Action 会自动转存镜像。

也可以点击「运行 Action」手动触发 workflow。

## 本地预览

```bash
npm install
npm run dev
```

本地运行时可以创建 `.dev.vars`：

```ini
APP_PASSWORD=change-this-password
GITHUB_TOKEN=github_pat_xxx
GITHUB_OWNER=Smithereensun
GITHUB_REPO=docker_image_pusher
GITHUB_BRANCH=main
```
