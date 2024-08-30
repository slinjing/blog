# Hexo 博客部署
Hexo是一个快速、简洁且高效的博客框架，它能够将Markdown文档渲染成HTML，这样就可以在很短的时间内创建出网站的静态内容。

官网：https://hexo.io

## 安装前提
安装Hexo非常简单，只需要先安装Node.js环境和Git环境，Node.js是一个能够在服务器端运行JavaScript代码的环境, Git是版本控制工具。

## 安装Node.js
Windows系统系统参考[Windows安装Node.js。](/docker/debug.md)

Linux系统系统参考[Linux安装Node.js。](/docker/debug.md)


## 安装Git
### Windows
前往[Git 官网](https://git-scm.com/)下载安装即可，安装完成后验证。
```shell
$ git --version
git version 2.40.0.windows.1
```
### Linux
Linux平台安装Git以下命令二选一：
```shell
$ sudo apt-get install git-core 
$ sudo yum install git-core 
```

## 安装Hexo
以上准备工作完成后，直接使用npm安装Hexo，我这里使用的环境是windows。
```shell
$ npm install -g hexo-cli
```
如果安装速度过慢，可以先将 npm 的下载源更换为国内的淘宝镜像，然后再进行安装。
```shell
$ npm config set registry https://registry.npm.taobao.org
```
验证，输入`hexo --version`返回如下内容则说明没问题。
```shell
$ hexo --version
hexo-cli: 4.3.2
os: win32 10.0.19045 undefined
node: 20.15.0
acorn: 8.11.3
ada: 2.7.8
ares: 1.28.1
base64: 0.5.2
brotli: 1.1.0
cjs_module_lexer: 1.2.2
cldr: 45.0
icu: 75.1
llhttp: 8.1.2
modules: 115
napi: 9
nghttp2: 1.61.0
nghttp3: 0.7.0
ngtcp2: 1.1.0
openssl: 3.0.13+quic
simdutf: 5.2.8
tz: 2024a
undici: 6.13.0
unicode: 15.1
uv: 1.46.0
uvwasi: 0.0.21
v8: 11.3.244.8-node.23
zlib: 1.3.0.1-motley-7d77fb7
```

## 搭建博客
安装Hexo完成后，先通过下面的命令来创建一个专门保存博客项目的文件夹，会在当前目录生成，如果不想把文件夹放到其他路径，先切换到指定路径再执行命令，该命令会从github上克隆博客项目和默认的主题。
```shell
$ hexo init hexo-blog
INFO  Cloning hexo-starter https://github.com/hexojs/hexo-starter.git
INFO  Install dependencies
INFO  Start blogging with Hexo!
```
此时Hexo就初始化成功了，切换到博客目录下，可以看到会生成一堆文件和目录，其中:
> _config.yml：是博客项目的配置文件,
package.json：是项目的依赖项文件,
scaffolds：保存了Markdown文件的模板，也就是向新添加的Markdown文件中默认填充的内容，
source：目录下有一个名为_post的目录，我们稍后可以将编写好的Markdown文件放到该目录，这样就可以利用Hexo将Markdown文件处理成博客的静态页面，生成的静态页面将置于public目录下；
themes文件夹保存了博客使用的主题。

然后通过下面的命令来安装`package.json`中指明的依赖
```shell
$ npm install
```
通过下面的命令来生成博客静态文件
```shell
$ hexo generate
```
接下来启动服务器。默认情况下，访问网址为：`http://localhost:4000/`
```shell
$ hexo server
```
![hexo博客](/hexo.png)
此时已经完成了博客框架框架的搭建，接下来更换一个适合自己的主题。

## 更换主题
首先在[主题页面](https://hexo.io/themes/)寻找适合自己的，主题一般都有自己的说明文档，这里以butterfly主题为例，也可直接前往[butterfly github地址](https://github.com/jerryc127/hexo-theme-butterfly)下载。下载后将主题放到博客项目的`themes`目录下，然后修改配置文件`_config.yml`文件如下：
```yaml
......
theme: butterfly # 这里填主题文件夹的名称
```
重启服务器后就可以看到效果了，但是此时页面也比较单调，想要更改一些功能和配置可以参考[文档。](https://butterfly.js.org/categories/Docs%E6%96%87%E6%AA%94/)

## GitHub Pages部署

当完成以上步骤后现在就可以开始部署博客了，这里选择使用GitHub Pages部署，主要优点是免费，当然也可以部署到自己的服务上。

第一步在GitHub上创建名为<你的GitHub用户名>.github.io的仓库，然后将Hexo项目中的文件push到仓库中。
```shell
$ git add .
$ git commit -m "update"
$ git remote add origin https://github.com/slinjing/slinjing.github.io.git
$ git branch -M main
$ git push -u origin main
```


push成功就可以在仓库中查看到刚刚推送的文件，接着开启GitHub Pages并修改部署文件，点击-->Settings-->Pages把Build and deployment下的Ddploy form a branch修改为GitHub Actions。最后创建`.github/workflows/pages.yml`文件，文件内容Hexo官方已经给出来了，如下：
```yaml
name: Pages

on:
  push:
    branches:
      - main # default branch

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          # If your repository depends on submodule, please see: https://github.com/actions/checkout
          submodules: recursive
      - name: Use Node.js 20
        uses: actions/setup-node@v4
        with:
          # Examples: 20, 18.19, >=16.20.2, lts/Iron, lts/Hydrogen, *, latest, current, node
          # Ref: https://github.com/actions/setup-node#supported-version-syntax
          node-version: "20"
      - name: Cache NPM dependencies
        uses: actions/cache@v4
        with:
          path: node_modules
          key: ${{ runner.OS }}-npm-cache
          restore-keys: |
            ${{ runner.OS }}-npm-cache
      - name: Install Dependencies
        run: npm install
      - name: Build
        run: npm run build
      - name: Upload Pages artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./public
  deploy:
    needs: build
    permissions:
      pages: write
      id-token: write
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```
需要将文件中的20修改为自己的Node.js版本，并且因为此时仓库中比本地多一个文件，下次先将push之前先pull一下，不然push会失败。那么完成到这个步骤就已经大公告成了，以后无论是修改了博客内容还是主题配置，push到GitHub后都会自动进行部署，可以在仓库中点击Actions查看部署进度，部署完成后在浏览器输入：https://<github用户名>.github.io/即可在公网访问。