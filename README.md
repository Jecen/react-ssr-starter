# tpl-react 

## Introduction

* Based on [react-starter-kit](https://github.com/kriasoft/react-starter-kit)
* Add [antd](https://ant.design/index-cn)
* Add [happyPack](https://github.com/amireh/happypack)
* Del [graphql](https://graphql.org)
* Del fetch

## Structure

```
+-- build [项目配置文件]
|
+-- public [公有资源]
|
+-- dist [打包完成后文件夹]
|
+-- src [源代码]
|    |
|    +-- components [组件]
|    |
|    +-- routes [路由]
|    |
|    +-- client.js [客户端入口]
|    |
|    +-- server.js [服务端入口]
|    |
|    +-- history.js [客户端导航实例]
|    |
|    +-- router.js [系统路由实例]
|    |
|    +-- html-tool.js [针对html的操作方法]
|
+-- ... [项目相关配置]
```

## Script
### 依赖
```
yarn
```

### 本地开发模式
```
yarn dev
```
### 客户端打包
```
yarn build-client
```
### 服务端打包
```
yarn build-server
```