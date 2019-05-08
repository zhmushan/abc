## Router

The router based on [radix tree](https://en.wikipedia.org/wiki/Radix_tree), making route lookup really fast.

## Path Parameters

```
Pattern: /user/:name

/user/my              match
/user/you             match
/user/my/profile      no match
/user/                no match
```

**Note**: You can not register the patterns `/user/new` and `/user/:name` for the same request method at the same time. The routing of different request methods is independent from each other.

## Catch All Parameters

```
Pattern: /src/*filepath

/src/                   match
/src/somefile           match
/src/subdir/somefile    match
```
