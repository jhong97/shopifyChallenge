const bodyParser = require('body-parser');
const express = require('express');
const mysql = require('mysql');
const app = express()

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));

const connection = mysql.createConnection({
	host	: 'database-shopifychallenger.cfcyklgwnowg.us-east-1.rds.amazonaws.com',
	user	: 'temp',
	password: 'strong password',
	database: 'shopifyStore'
});
