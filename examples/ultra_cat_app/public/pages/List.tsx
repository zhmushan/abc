import type { Cat } from "../../cat/cat.ts";

import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

export default () => {
  const [cats, setCats] = useState<Cat[]>([]);
  const [id, setId] = useState(0);
  const [name, setName] = useState("");
  const [age, setAge] = useState(0);
  const [] = useState([]);
  const location = useLocation<{ username: string }>();
  const username = location.state.username;

  useEffect(() => {
    fetch("/cat").then((resp) => resp.json()).then((data) => {
      if (data.length > 0) {
        console.log(data);
        setCats(data);
      }
    });
  }, []);

  function add() {
    fetch("/cat", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ name, age }),
    }).then((resp) => resp.json()).then((data) => {
      if (data.id) {
        setCats([...cats, data]);
      } else {
        throw new Error();
      }
    }).catch(() => {
      alert("failed");
    });
  }

  function del(id: number) {
    fetch(`/cat/${id}`, {
      method: "DELETE",
    }).then((resp) => resp.json()).then((data) => {
      if (data.affectedRows === 1) {
        setCats(cats.filter((c) => c.id !== id));
      }
    });
  }

  function update(id: number) {
    const n = name;
    const a = age;
    fetch(`/cat/${id}`, {
      method: "PUT",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ name: n, age: a }),
    }).then((resp) => resp.json()).then((data) => {
      if (data.affectedRows === 1) {
        setCats(cats.map((c) => {
          if (c.id === id) {
            return { id: c.id, name: n, age: a };
          }
          return c;
        }));
      }
    });
  }

  return (
    <>
      Hello, {username}! <Link to="/login">Logout</Link>
      <br />

      <table border="1">
        <caption>Cats List</caption>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Age</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {cats.map((c) => (
            <tr>
              <td>{c.id}</td>
              <td>{c.name}</td>
              <td>{c.age}</td>
              <td><button onClick={() => del(c.id!)}>Delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>

      <label htmlFor="id">ID:</label>
      <input
        id="id"
        type="number"
        onChange={(e) => setId(Number(e.target.value))}
      />
      &nbsp;
      <label htmlFor="name">Name:</label>
      <input
        id="name"
        type="text"
        autoComplete="off"
        onChange={(e) => setName(e.target.value)}
      />
      &nbsp;
      <label htmlFor="age">Age:</label>
      <input
        id="age"
        type="number"
        onChange={(e) => setAge(Number(e.target.value))}
      />
      &nbsp;
      <button onClick={id ? () => update(id) : add}>Add/Update</button>
    </>
  );
};
