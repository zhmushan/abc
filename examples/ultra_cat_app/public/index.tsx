/// <reference lib="dom" />

import React from "react";
import * as ReactDOM from "react-dom";
import { BrowserRouter as Router } from "react-router-dom";
import App from "./App.tsx";

function Index() {
  return (
    <Router>
      <App />
    </Router>
  );
}

ReactDOM.render(<Index />, document.getElementById("root"));
