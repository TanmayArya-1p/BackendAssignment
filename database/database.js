import mysql from "mysql2";

const conn = mysql
  .createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    database: "mvc",
    password: process.env.MYSQL_PASSWORD,
    port: process.env.MYSQL_PORT,
  })
  .promise();

let result = await conn.query("SELECT * FROM users;");
console.log(result[0]);

conn.destroy();
// TODO: MAKE A DOCKERCOMPOSE WITH MYSQL AS OTHER SERVICE
