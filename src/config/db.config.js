import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const MODE = process.env.NODE_ENV || 'development';

const { Pool } = pg;

// const db = new Pool({
//     host: process.env.DB_HOST,
//     port: process.env.DB_PORT,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_NAME,
// });

let db; 

if (MODE === 'production') {
  db = new Pool({
    connectionString: process.env.DATABASE_URL,
    // Safely use your declared MODE variable here
    ssl: { rejectUnauthorized: false } 
  });
} else {
  // Captures 'development', 'test', or empty fallbacks gracefully
  db = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5253', 10),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });
}

// export default pool;


// const db = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
// });

export default db;