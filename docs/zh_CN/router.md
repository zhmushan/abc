## Router

路由基于 [radix tree](https://en.wikipedia.org/wiki/Radix_tree), 使路由查找非常快.

## 路径参数

```
Pattern: /user/:name

/user/my              match
/user/you             match
/user/my/profile      no match
/user/                no match
```

**注意**: 你不能同时为同一请求方法注册模式 `/user/new` 和 `/user/:name`. 不同请求方法的路由是彼此独立的.

## 捕获所有参数

```
Pattern: /src/*filepath

/src/                   match
/src/somefile           match
/src/subdir/somefile    match
```
