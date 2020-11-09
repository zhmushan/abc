import React, { useState } from "react";
import { useHistory } from "react-router-dom";

export default () => {
  const history = useHistory();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  function login() {
    fetch("/user/login", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    }).then((resp) => resp.json()).then((data) => {
      if (data.username === username) {
        history.push({ pathname: "/list", state: { username } });
      } else {
        throw new Error();
      }
    }).catch(() => {
      alert("failed");
    });
  }

  function signup() {
    fetch("/user/signup", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    }).then((resp) => resp.json()).then((data) => {
      if (data.username === username) {
        alert("success");
      } else {
        throw new Error();
      }
    }).catch(() => {
      alert("failed");
    });
  }

  return (
    <>
      <label htmlFor="username">Username:</label>
      <input
        id="username"
        type="text"
        onChange={(e) => setUsername(e.target.value)}
        autoComplete="off"
      />
      <br />
      <label htmlFor="password">Password:</label>
      <input
        id="password"
        type="password"
        onChange={(e) => setPassword(e.target.value)}
      />
      <br />
      <button onClick={login}>Login</button>
      <button onClick={signup}>Sign up</button>
    </>
  );
};
