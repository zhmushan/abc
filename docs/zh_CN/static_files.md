## 静态资源

`abc.static()` 注册一个带路径前缀的新路由, 以便从提供的根目录提供静态文件. 例如, 对 `/static/js/main.js` 的请求将获取并提供 `assets/js/main.js` 文件.

```ts
abc().static("/static", "assets");
```

`abc.file()` 注册一个带路径的新路由来提供静态文件.

```ts
abc().file("/", "public/index.html");
```
