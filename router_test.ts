import { test, assertEquals, assertNotEquals } from "./dev_deps.ts";
import { countParams, Node, NodeType } from "./router.ts";

interface TestRequest {
  path: string;
  isMatch: boolean;
  route: string;
  params: Array<{ key: string; value: string }>;
}

interface TestRoute {
  path: string;
  conflict: boolean;
}

function getErr(func: () => void): Error | null {
  try {
    func();
  } catch (e) {
    return e;
  }
  return null;
}

function checkPriorities(n: Node) {
  let prio = 0;
  for (const c of n.children) {
    prio += checkPriorities(c);
  }

  if (n.handle) {
    ++prio;
  }

  assertEquals(n.priority, prio);

  return prio;
}

function checkMaxParams(n: Node) {
  let maxParams = 0;
  for (const c of n.children) {
    const params = checkMaxParams(c);
    if (params > maxParams) {
      maxParams = params;
    }
  }
  if (n.nType > NodeType.Root && !n.wildChild) {
    ++maxParams;
  }

  assertEquals(n.maxParams, maxParams);

  return maxParams;
}

function checkRequests(n: Node, requests: TestRequest[]) {
  for (const r of requests) {
    const [h, ps] = n.getValue(r.path);
    if (h == null) {
      assertEquals(r.isMatch, false);
    } else {
      assertEquals(r.isMatch, true);
      assertEquals(h(), r.route);
    }
    assertEquals(ps, r.params);
  }
}

function checkRoutes(routes: TestRoute[]) {
  const n = new Node();
  for (const r of routes) {
    const err = getErr(() => n.addRoute(r.path, null));
    if (err) {
      assertEquals(r.conflict, true);
    } else {
      assertEquals(r.conflict, false);
    }
  }
}

test(function CountParams() {
  assertEquals(countParams("/path/:param1/static/*catch-all"), 2);
  assertEquals(countParams("/:param".repeat(256)), 255);
});

test(function AddAndFind() {
  const n = new Node();
  const routes = [
    "/hi",
    "/contact",
    "/co",
    "/c",
    "/a",
    "/ab",
    "/doc/",
    "/doc/go_faq.html",
    "/doc/go1.html",
    "/α",
    "/β"
  ];
  for (const r of routes) {
    n.addRoute(r, () => r);
  }
  checkRequests(n, [
    { path: "/a", isMatch: true, route: "/a", params: undefined },
    { path: "/", isMatch: false, route: "", params: undefined },
    { path: "/hi", isMatch: true, route: "/hi", params: undefined },
    { path: "/contact", isMatch: true, route: "/contact", params: undefined },
    { path: "/co", isMatch: true, route: "/co", params: undefined },
    { path: "/con", isMatch: false, route: "", params: undefined }, // key mismatch
    { path: "/cona", isMatch: false, route: "", params: undefined }, // key mismatch
    { path: "/no", isMatch: false, route: "", params: undefined }, // no matching child
    { path: "/ab", isMatch: true, route: "/ab", params: undefined },
    { path: "/α", isMatch: true, route: "/α", params: undefined },
    { path: "/β", isMatch: true, route: "/β", params: undefined }
  ]);
  checkPriorities(n);
  checkMaxParams(n);
});

test(function Wildcard() {
  const n = new Node();
  const routes = [
    "/",
    "/cmd/:tool/:sub",
    "/cmd/:tool/",
    "/src/*filepath",
    "/search/",
    "/search/:query",
    "/user_:name",
    "/user_:name/about",
    "/files/:dir/*filepath",
    "/doc/",
    "/doc/go_faq.html",
    "/doc/go1.html",
    "/info/:user/public",
    "/info/:user/project/:project"
  ];

  for (const r of routes) {
    n.addRoute(r, () => r);
  }

  checkRequests(n, [
    { path: "/", isMatch: true, route: "/", params: undefined },
    {
      path: "/cmd/test/",
      isMatch: true,
      route: "/cmd/:tool/",
      params: [{ key: "tool", value: "test" }]
    },
    {
      path: "/cmd/test",
      isMatch: false,
      route: "",
      params: [{ key: "tool", value: "test" }]
    },
    {
      path: "/cmd/test/3",
      isMatch: true,
      route: "/cmd/:tool/:sub",
      params: [{ key: "tool", value: "test" }, { key: "sub", value: "3" }]
    },
    {
      path: "/src/",
      isMatch: true,
      route: "/src/*filepath",
      params: [{ key: "filepath", value: "/" }]
    },
    {
      path: "/src/some/file.png",
      isMatch: true,
      route: "/src/*filepath",
      params: [{ key: "filepath", value: "/some/file.png" }]
    },
    { path: "/search/", isMatch: true, route: "/search/", params: undefined },
    {
      path: "/search/someth!ng+in+ünìcodé",
      isMatch: true,
      route: "/search/:query",
      params: [{ key: "query", value: "someth!ng+in+ünìcodé" }]
    },
    {
      path: "/search/someth!ng+in+ünìcodé/",
      isMatch: false,
      route: "",
      params: [{ key: "query", value: "someth!ng+in+ünìcodé" }]
    },
    {
      path: "/user_gopher",
      isMatch: true,
      route: "/user_:name",
      params: [{ key: "name", value: "gopher" }]
    },
    {
      path: "/user_gopher/about",
      isMatch: true,
      route: "/user_:name/about",
      params: [{ key: "name", value: "gopher" }]
    },
    {
      path: "/files/js/inc/framework.js",
      isMatch: true,
      route: "/files/:dir/*filepath",
      params: [
        { key: "dir", value: "js" },
        { key: "filepath", value: "/inc/framework.js" }
      ]
    },
    {
      path: "/info/gordon/public",
      isMatch: true,
      route: "/info/:user/public",
      params: [{ key: "user", value: "gordon" }]
    },
    {
      path: "/info/gordon/project/go",
      isMatch: true,
      route: "/info/:user/project/:project",
      params: [
        { key: "user", value: "gordon" },
        { key: "project", value: "go" }
      ]
    }
  ]);

  checkPriorities(n);
  checkMaxParams(n);
});

test(function WildcardConflict() {
  checkRoutes([
    { path: "/cmd/:tool/:sub", conflict: false },
    { path: "/cmd/vet", conflict: true },
    { path: "/src/*filepath", conflict: false },
    { path: "/src/*filepathx", conflict: true },
    { path: "/src/", conflict: true },
    { path: "/src1/", conflict: false },
    { path: "/src1/*filepath", conflict: true },
    { path: "/src2*filepath", conflict: true },
    { path: "/search/:query", conflict: false },
    { path: "/search/invalid", conflict: true },
    { path: "/user_:name", conflict: false },
    { path: "/user_x", conflict: true },
    { path: "/user_:name", conflict: false },
    { path: "/id:id", conflict: false },
    { path: "/id/:id", conflict: true }
  ]);
});

test(function ChildConflict() {
  checkRoutes([
    { path: "/cmd/vet", conflict: false },
    { path: "/cmd/:tool/:sub", conflict: true },
    { path: "/src/AUTHORS", conflict: false },
    { path: "/src/*filepath", conflict: true },
    { path: "/user_x", conflict: false },
    { path: "/user_:name", conflict: true },
    { path: "/id/:id", conflict: false },
    { path: "/id:id", conflict: true },
    { path: "/:id", conflict: true },
    { path: "/*filepath", conflict: true }
  ]);
});

test(function DupliatePath() {
  const n = new Node();
  const routes = [
    "/",
    "/doc/",
    "/src/*filepath",
    "/search/:query",
    "/user_:name"
  ];
  for (const r of routes) {
    let err = getErr(() => n.addRoute(r, () => r));
    assertEquals(err, null);
    err = getErr(() => n.addRoute(r, () => r));
    assertNotEquals(err, null);
  }

  checkRequests(n, [
    { path: "/", isMatch: true, route: "/", params: undefined },
    { path: "/doc/", isMatch: true, route: "/doc/", params: undefined },
    {
      path: "/src/some/file.png",
      isMatch: true,
      route: "/src/*filepath",
      params: [{ key: "filepath", value: "/some/file.png" }]
    },
    {
      path: "/search/someth!ng+in+ünìcodé",
      isMatch: true,
      route: "/search/:query",
      params: [{ key: "query", value: "someth!ng+in+ünìcodé" }]
    },
    {
      path: "/user_gopher",
      isMatch: true,
      route: "/user_:name",
      params: [{ key: "name", value: "gopher" }]
    }
  ]);
});

test(function EmptyWildcardName() {
  const n = new Node();
  const routes = ["/user:", "/user:/", "/cmd/:/", "/src/*"];
  for (const r of routes) {
    const err = getErr(() => n.addRoute(r, null));
    assertNotEquals(err, null);
  }
});

test(function CatchAllConflict() {
  checkRoutes([
    { path: "/src/*filepath/x", conflict: true },
    { path: "/src2/", conflict: false },
    { path: "/src2/*filepath/x", conflict: true }
  ]);
});

test(function CatchAllConflictRoot() {
  checkRoutes([
    { path: "/", conflict: false },
    { path: "/*filepath", conflict: true }
  ]);
});

test(function DoubleWildcard() {
  const errMsg = "only one wildcard per path segment is allowed";
  const routes = ["/:foo:bar", "/:foo:bar/", "/:foo*bar"];
  for (const r of routes) {
    const n = new Node();
    const err = getErr(() => n.addRoute(r, null));
    assertEquals(err.message.startsWith(errMsg), true);
  }
});

test(function TrailingSlashRedirect() {
  const n = new Node();
  const routes = [
    "/hi",
    "/b/",
    "/search/:query",
    "/cmd/:tool/",
    "/src/*filepath",
    "/x",
    "/x/y",
    "/y/",
    "/y/z",
    "/0/:id",
    "/0/:id/1",
    "/1/:id/",
    "/1/:id/2",
    "/aa",
    "/a/",
    "/admin",
    "/admin/:category",
    "/admin/:category/:page",
    "/doc",
    "/doc/go_faq.html",
    "/doc/go1.html",
    "/no/a",
    "/no/b",
    "/api/hello/:name"
  ];
  for (const r of routes) {
    const err = getErr(() => n.addRoute(r, () => r));
    assertEquals(err, null);
  }

  const tsrRoutes = [
    "/hi/",
    "/b",
    "/search/gopher/",
    "/cmd/vet",
    "/src",
    "/x/",
    "/y",
    "/0/go/",
    "/1/go",
    "/a",
    "/admin/",
    "/admin/config/",
    "/admin/config/permissions/",
    "/doc/"
  ];
  for (const r of tsrRoutes) {
    const [h] = n.getValue(r);
    assertEquals(h == null, true);
  }

  const noTsrRoutes = ["/", "/no", "/no/", "/_", "/_/", "/api/world/abc"];
  for (const r of noTsrRoutes) {
    const [h] = n.getValue(r);
    assertEquals(h == null, true);
  }
});

test(function RootTrailingSlashRedirect() {
  const n = new Node();
  const err = getErr(() => n.addRoute("/:test", () => "/:test"));
  assertEquals(err, null);

  const [h] = n.getValue("/");
  assertEquals(h == null, true);
});

test(function InvalidNodeType() {
  const errMsg = "invalid node type";
  const n = new Node();
  n.addRoute("/", () => "/");
  n.addRoute("/:page", () => "/:page");

  // set invalid node type
  n.children[0].nType = 42;
  const err = getErr(() => n.getValue("/test"));
  assertEquals(err.message, errMsg);
});

test(function WildcardConflictEx() {
  const conflicts = [
    {
      route: `/who/are/foo`,
      segPath: `/foo`,
      existPath: `/who/are/*you`,
      existSegPath: `/*you`
    },
    {
      route: `/who/are/foo/`,
      segPath: `/foo/`,
      existPath: `/who/are/\*you`,
      existSegPath: `/\*you`
    },
    {
      route: `/who/are/foo/bar`,
      segPath: `/foo/bar`,
      existPath: `/who/are/\*you`,
      existSegPath: `/\*you`
    },
    {
      route: `/conxxx`,
      segPath: `xxx`,
      existPath: `/con:tact`,
      existSegPath: `:tact`
    },
    {
      route: `/conooo/xxx`,
      segPath: `ooo`,
      existPath: `/con:tact`,
      existSegPath: `:tact`
    }
  ];
  for (const c of conflicts) {
    const n = new Node();
    const routes = ["/con:tact", "/who/are/*you", "/who/foo/hello"];
    for (const r of routes) {
      n.addRoute(r, () => r);
    }
    const err = getErr(() => n.addRoute(c.route, () => c.route));
    assertEquals(
      err.message,
      `'${c.segPath}' in new path '${
        c.route
      }' conflicts with existing wildcard '${
        c.existSegPath
      }' in existing prefix '${c.existPath}'`
    );
  }
});
