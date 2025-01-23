---
title: docker 使用手册
description: 常用docker 命令，忘记用法时随手翻阅，适合新手
header: docker 使用手册
date: 2025-01-14
---

# docker 使用手册

## 1. docker images
查看docker镜像

```shell
    docker images
    docker rmi $(docker images -q)  // 删除所有镜像
    docker rmi 镜像ID  // 删除指定镜像
```

## 2. docker ps -a
查看docker容器

```shell
    docker ps -a
    docker ps -a -q  // 只显示容器ID
    docker stop $(docker ps -a -q)  // 停止所有容器
    docker rm $(docker ps -a -q)    // 删除所有容器 
    docker start $(docker ps -a -q)  // 启动所有容器
```

## 3. 进入docker容器
```shell
    docker exec -it 容器ID /bin/bash
    docker exec -it 容器ID /bin/sh
```

## 4. docker run
docker run 命令格式如下：

```shell
    docker run [OPTIONS] IMAGE [COMMAND] [ARG...]
    #-it 交互式操作
    docker run -it --name=容器名 镜像名 /bin/bash 
    docker run -d
```

## 4. docker pull
拉取镜像

```shell
    docker pull 镜像名
```

## 5. docker search
搜索镜像

```shell
    docker search 镜像名
```

6. docker-compose
docker-compose 是一个用来定义和运行多容器 Docker 应用程序的工具。通过 Compose，
您可以使用 YML 文件来配置应用程序需要的所有服务，然后使用一个命令就可以从 YML 文件配置中创建并启动所有服务。

```shell
    docker-compose up -d
    docker-compose down
```