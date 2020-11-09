import React from "react";
import { Link, Route, Switch } from "react-router-dom";
import HomePage from "./pages/Home.tsx";
import LoginPage from "./pages/Login.tsx";
import ListPage from "./pages/List.tsx";

export default () => (
  <>
    <Link to="/">Home</Link>
    <br />
    <Switch>
      <Route path="/list" component={ListPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/" component={HomePage} />
    </Switch>
  </>
);
