const mysql = require('mysql');

const connection = mysql.createConnection({
        host    : 'database-shopifychallenger.cfcyklgwnowg.us-east-1.rds.amazonaws.com',
        user    : 'temp',
        password: 'strong password',
        database: 'shopifyStore'
});

module.exports = connection;
