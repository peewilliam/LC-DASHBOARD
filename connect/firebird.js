const Firebird = require('node-firebird');
require('dotenv/config');

// Configurações do banco de dados
const options = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  lowercase_keys: false, // set to true to lowercase keys
  role: null,            // default
  pageSize: 4096,        // default when creating database
};

// Criando pool de conexões com o banco de dados
const pool = Firebird.pool(10, options);

const executeQuery = async (query) => {
  try {
    const results = await new Promise((resolve, reject) => {
      pool.get((err, db) => {
        if (err) {
          reject(err);
        }
        db.query(query, (err, result) => {
          if (err) {
            db.detach();
            reject(err);
          } else {
            db.detach();
            resolve(result);
          }
        });
        
      });
    });
    return results;
  } catch (error) {
    console.log(`Error connecting to database: ${error}.`);
    return error;
  }
};

module.exports = {
  executeQuery: executeQuery,
};
