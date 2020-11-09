import { Client } from "./deps.ts";

const DB = await new Client().connect({
  hostname: "127.0.0.1",
  username: "root",
  password: "",
});
const dbname = "ultra_cat_app";

await DB.execute(`CREATE DATABASE IF NOT EXISTS ${dbname}`);
await DB.execute(`USE ${dbname}`);

await DB.execute(`
CREATE TABLE IF NOT EXISTS users (
  id int(11) NOT NULL AUTO_INCREMENT,
  username varchar(20) NOT NULL UNIQUE,
  password varchar(32) NOT NULL,
  created_at timestamp not null default current_timestamp,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
`);

await DB.execute(`
CREATE TABLE IF NOT EXISTS cats (
  id int(11) NOT NULL AUTO_INCREMENT,
  name varchar(20) NOT NULL,
  age int NOT NULL,
  created_at timestamp not null default current_timestamp,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
`);

export default DB;
