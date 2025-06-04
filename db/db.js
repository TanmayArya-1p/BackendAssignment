import mysql from "mysql2";

// TODO: MAKE A DOCKERCOMPOSE WITH MYSQL AS OTHER SERVICE

const conn = mysql
  .createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    database: "mvc",
    password: process.env.MYSQL_PASSWORD,
    port: process.env.MYSQL_PORT,
  })
  .promise();

export default conn;
