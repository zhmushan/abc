import { runTests } from "https://deno.land/std/testing/mod.ts";
import "./abc_test.ts";
import "./router_test.ts";
import "./context_test.ts";
import "./binder_test.ts";
import "./parser_test.ts";

runTests();
