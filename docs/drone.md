---
title: drone CI
description: 使用docker + drone + github 构建CI/CD流程
header: git 使用手册
date: 2025-01-14
---

# docker + drone + github web 自动部署到阿里云ECS服务器

## 1. 在阿里云上安装docker
[参考官方文档](https://help.aliyun.com/zh/ecs/use-cases/install-and-use-docker)  

1. 更新您的包管理工具。
```shell
 sudo dnf -y update
```

2. 添加阿里云源到您的实例中，这个源包含Docker软件包，方便您使用命令来安装和更新Docker。
```shell
sudo dnf config-manager --add-repo=https://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo
```

3.安装Alibaba Cloud Linux3专用的dnf源兼容插件。
```shell
sudo dnf -y install dnf-plugin-releasever-adapter --repo alinux3-plus
```

4. 安装Docker社区版本，容器运行时containerd.io，以及Docker构建和Compose插件。
```shell
sudo dnf -y install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

5.启动Docker并设置Docker守护进程在系统启动时自动启动，这样可以确保每次系统启动时，Docker服务也会自动启动。
```shell
sudo systemctl start docker
sudo systemctl enable docker
```

6. 通过查看Docker版本命令，验证Docker是否安装成功。
```shell
sudo docker -v
```

```shell
 sudo dnf -y update
2. sudo dnf config-manager --add-repo=https://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo
3. sudo dnf -y install dnf-plugin-releasever-adapter --repo alinux3-plus
4. sudo dnf -y install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
5. sudo systemctl start docker
sudo systemctl enable docker

sudo docker -v

```

## 2. 在阿里云上安装docker-compose(可选)
```shell
# 下载安装包
sudo curl -L "https://github.com/docker/compose/releases/download/1.25.4/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
# 设置权限
sudo chmod +x /usr/local/bin/docker-compose
# 添加软连接
sudo ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose
# 查看安装信息
docker-compose --version
# 卸载数据
sudo rm /usr/local/bin/docker-compose
```

## 3. 安装drone
[官方文档](https://docs.drone.io/server/provider/github/) 照着这个一步一步往下走就行

1. [github中创建一个新的OAuth App](https://github.com/settings/applications/new), 创建后会得到一个client_id和client_secret
2. 再创建一个共享的secret, 用于加密drone的配置文件
```shell
openssl rand -hex 16
bea26a2221fd8090ea38720fc445eca6
```
3. 用docker拉取drone，如果使用docker-compose的方式创建，可直接跳到第7步
```shell
docker pull drone/drone:2
```
4. 启动drone server

--env=USER_CREATE=username:fireJera,admin:true 这个是创建一个管理员用户，用户名为需要和github的用户名保持一致，
之所以需要这一条流水线运行时出现一个错误，但是忘记了什么错，需要将github的仓库设为trusted，如果没有设置这个是看不到trusted的选项的
```shell
docker run \
  --volume=/var/lib/drone:/data \
  --env=DRONE_GITHUB_CLIENT_ID=CLIENT_ID \
  --env=DRONE_GITHUB_CLIENT_SECRET=CLIENT_SECRET \
  --env=DRONE_RPC_SECRET=bea26a2221fd8090ea38720fc445eca6 \
  --env=DRONE_SERVER_HOST=ci.xshiliu.com \
  --env=DRONE_SERVER_PROTO=https \
  --env=DRONE_USER_CREATE=username:fireJera,admin:true \
  --publish=80:80 \
  --publish=443:443 \
  --restart=always \
  --detach=true \
  --name=drone \
  drone/drone:latest
```

5. [启动drone runner](https://docs.drone.io/runner/docker/installation/linux/)
```shell
docker run --detach \
  --volume=/var/run/docker.sock:/var/run/docker.sock \
  --env=DRONE_RPC_PROTO=http \
  --env=DRONE_RPC_HOST=ci.xshiliu.com \
  --env=DRONE_RPC_SECRET=bea26a2221fd8090ea38720fc445eca6 \
  --env=DRONE_RUNNER_CAPACITY=2 \
  --env=DRONE_RUNNER_NAME=my-first-runner \
  --publish=3000:3000 \
  --restart=always \
  --name=runner \
  drone/drone-runner-docker:1
```

6. 验证是否安装成功
```shell
docker logs runner

INFO[0000] starting the server
INFO[0000] successfully pinged the remote server 
```

## 使用docker-compose方式安装drone和nginx
7. 创建.env文件

将下面内容复制到.env文件中，其中
```shell
DRONE_SERVER_HOST=ci.xshiliu.com
DRONE_GITHUB_CLIENT_ID=CLIENT_ID
DRONE_GITHUB_CLIENT_SECRET=CLIENT_SECRET
DRONE_SERVER_PROTO=http
DRONE_RPC_SECRET=bea26a2221fd8090ea38720fc445eca6
DRONE_USER_CREATE=username:fireJera,admin:true
```

8. 在.env同一目录下创建nginx.conf 文件

将下面内容复制到nginx.conf文件中, 部分内容需要替换
```nginx
user root;
worker_processes auto;


events {
    worker_connections 1024;
}

http {
  include             mime.types; #之前这里忘了配置，导致请求只能返回html还是txt来着，无法加载js文件，网页无法访问
  default_type        application/octet-stream;

  sendfile            on;
    
  keepalive_timeout   65;
  server {
    listen 80;
    server_name ci.xshiliu.com;

    location / {
      proxy_pass http://drone-server:80;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;
    }
  }

  server {
    listen 443 ssl;
    server_name 替换为你的CI域名;
    ssl_certificate 替换为你的CI域名的pem证书路径;
    ssl_certificate_key 替换为你的CI域名的key证书路径;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'TLS_AES_128_GCM_SHA256:TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384';

    location / {
      proxy_pass http://drone-server:80;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;
    }
  } 

  server {
    listen 80;
    server_name 替换为你的网页域名;

    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
    }

    location ~ /.well-known {
        allow all;
    }
  }

  server {
    listen 443 ssl;
    server_name替换为你的网页域名;
    ssl_certificate 替换为你的网页域名pem证书路径;
    ssl_certificate_key 替换为你的网页域名key证书路径;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'TLS_AES_128_GCM_SHA256:TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384';

    location / {
      root /usr/share/nginx/html; #这里的路径和下面docker-compose.yml中的路径要一致
      try_files $uri $uri/ /index.html;
    }
  }
}
```

9. 在.env同一目录下创建docker-compose.yml 文件

将下面内容复制到docker-compose.yml文件中
```shell
version: '3.8'
services:
  drone-server:
    image: drone/drone:latest
    ports:
      - "8080:80"
    volumes:
      - /var/lib/drone:/data
    environment:
      - DRONE_GITHUB_CLIENT_ID=${DRONE_GITHUB_CLIENT_ID}
      - DRONE_GITHUB_CLIENT_SECRET=${DRONE_GITHUB_CLIENT_SECRET}
      - DRONE_RPC_SECRET=${DRONE_RPC_SECRET}
      - DRONE_SERVER_HOST=${DRONE_SERVER_HOST}
      - DRONE_SERVER_PROTO=${DRONE_SERVER_PROTO}
      - DRONE_USER_CREATE=${DRONE_USER_CREATE}
      - DRONE_RUNNER_CAPACITY=2
    restart: always
    container_name: drone

  drone-runner:
    image: drone/drone-runner-docker:latest
    ports:
      - "3000:3000"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    environment:
      - DRONE_RPC_PROTO=${DRONE_SERVER_PROTO}
      - DRONE_RPC_HOST=${DRONE_SERVER_HOST}:80
      - DRONE_RPC_SECRET=${DRONE_RPC_SECRET}
      - DRONE_RUNNER_CAPACITY=2
      - DRONE_RUNNER_NAME=my-runner
    restart: always
    container_name: runner

  nginx:
    image: nginx:latest
    container_name: nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - /home/web/dist:/usr/share/nginx/html
      - /home/ssl:/home/ssl
    depends_on:
      - drone-server
```
这一步可能因为国内镜像的问题导致拉取镜像失败，需要配置国内镜像，可以参考[这里](https://gist.github.com/y0ngb1n/7e8f16af3242c7815e7ca2f0833d3ea6)
网上找的很多镜像其实已经失效，使用前需要ping一下，看看是否能ping通
```shell
cd /etc/docker
vim daemon.json
```

然后将下面的镜像地址复制到daemon.json文件中
```json
{
  "registry-mirrors": ["https://dockerpull.org", "https://pee6w651.mirror.aliyuncs.com", "https://vp63iuub.mirror.aliyuncs.com"]
}
```

10. 启动docker-compose
```shell
docker-compose up -d
```

## 在项目中配置drone流水线
11. 在项目中配置drone

根目录下创建.drone.yml文件，内容如下
```yaml
kind: pipeline
type: docker
name: build-and-deploy

clone:
  depth: 1

steps:
  - name: build
    image: node:22-alpine
    pull: if-no-exits
    enviroment:
      GIT_TAG: ${DRONE_TAG:latest}
      MODE: release
    volumes:
      - name: dist-volume
        path: /dist
    commands:
      - chmod +x build.sh
      - ./build.sh

volumes:
  - name: dist-volume
    host:
      path: /home/web/dist # 主机上的路径，将映射到容器中的路径

when:
  ref:
    - refs/tags/*release

trigger:
  event:
    - tag
```

12. 在项目中创建build.sh文件

复制下面内容到build.sh文件中
```shell
# /bin/sh
# 配置文件
echo "VITE_APP_VERSION=${GIT_TAG}" > .env
# Build
npm config set registry https://registry.npmmirror.com
npm ci
# npm install --omit=optional
npm run build

if [ $? -eq 0 ]; then
  echo "Build Success!"
else 
  echo "Build failed!"
  exit 1
fi

mkdir -p /dist
cp -r /drone/src/dist/* /dist

```

13. 初始化项目

下面这些依赖复制到package.json中，因为服务器是Linux环境和，而本地开发环境一般是Mac或windows环境，所以需要在package.json中添加这些依赖，否则在流水线中会报错
```json
  "optionalDependencies": {
    "@lmdb/lmdb-linux-x64": "^3.0.13",
    "@lmdb/lmdb-win32-x64": "^3.0.13",
    "@rollup/rollup-android-arm-eabi": "4.22.4",
    "@rollup/rollup-android-arm64": "4.22.4",
    "@rollup/rollup-darwin-arm64": "4.22.4",
    "@rollup/rollup-darwin-x64": "4.22.4",
    "@rollup/rollup-linux-arm-gnueabihf": "4.22.4",
    "@rollup/rollup-linux-arm-musleabihf": "4.22.4",
    "@rollup/rollup-linux-arm64-gnu": "4.22.4",
    "@rollup/rollup-linux-arm64-musl": "4.22.4",
    "@rollup/rollup-linux-powerpc64le-gnu": "4.22.4",
    "@rollup/rollup-linux-riscv64-gnu": "4.22.4",
    "@rollup/rollup-linux-s390x-gnu": "4.22.4",
    "@rollup/rollup-linux-x64-gnu": "4.22.4",
    "@rollup/rollup-linux-x64-musl": "4.22.4",
    "@rollup/rollup-win32-arm64-msvc": "4.22.4",
    "@rollup/rollup-win32-ia32-msvc": "4.22.4",
    "@rollup/rollup-win32-x64-msvc": "4.22.4",
    "fsevents": "~2.3.2"
  }
```
本地npm 安装依赖，也需要使用如下命令，否则在流水线回根据package-lock.json安装依赖，不同环境也会报错
```shell
npm install --omit=optional
```

安装完成后可以打tag提交到github，然后在drone中查看流水线是否成功

接下来要做的是自动更新ssl证书，手动更新证书太麻烦了，可以使用acme.sh来自动更新证书