import mysql from "mysql2";

const conn = mysql
  .createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    database: "mvc",
    password: process.env.MYSQL_PASSWORD,
    port: process.env.MYSQL_PORT,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    idleTimeout: 31536000000
  })
  .promise();

export default conn;
