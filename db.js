const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'kuzetopup',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    timezone: '+07:00'
});

pool.getConnection()
    .then(conn => {
        console.log('✅ MySQL terhubung!');
        conn.release();
    })
    .catch(err => {
        console.error('❌ MySQL gagal terhubung:', err.message);
        process.exit(1);
    });

module.exports = pool;
