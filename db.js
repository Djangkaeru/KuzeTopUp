const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',         // ganti kalau kamu punya password MySQL
    database: 'kuzetopup',
    waitForConnections: true,
    connectionLimit: 10,
    timezone: '+07:00'
});

// Test koneksi saat server start
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
