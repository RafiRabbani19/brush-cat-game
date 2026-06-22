import mysql from "mysql2/promise";

async function main() {
  const host = process.env.DB_HOST || "localhost";
  const user = process.env.DB_USER || "root";
  const password = process.env.DB_PASSWORD || "";
  const database = process.env.DB_NAME || "project";
  const port = parseInt(process.env.DB_PORT || "3306");

  console.log(`Connecting to database ${database} at ${host}:${port}...`);
  
  const connection = await mysql.createConnection({
    host,
    user,
    password,
    database,
    port,
  });
  
  console.log("⚠️ Disabling foreign key checks...");
  await connection.query("SET FOREIGN_KEY_CHECKS = 0;");
  
  console.log("🧹 Dropping tables (users, sessions, scores, todos)...");
  await connection.query("DROP TABLE IF EXISTS sessions;");
  await connection.query("DROP TABLE IF EXISTS scores;");
  await connection.query("DROP TABLE IF EXISTS users;");
  await connection.query("DROP TABLE IF EXISTS todos;");
  
  console.log("🔒 Re-enabling foreign key checks...");
  await connection.query("SET FOREIGN_KEY_CHECKS = 1;");
  
  console.log("✅ Database reset complete!");
  await connection.end();
}

main().catch((err) => {
  console.error("❌ Failed to reset database:", err);
  process.exit(1);
});
