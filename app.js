const bodyParser = require('body-parser');
const express = require('express');
const mysql = require('mysql');
const app = express()
const port = 3000;

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/assets"));

const connection = require('./db/connection.js');


//Landing page, loading/Reading in table data
app.get("/", (req, res) => {	
	const query = "select * from inventory;";
	connection.query(query, function(err, results){
		if(err) throw err;
		res.render("landingPage", {data : results});
	});
})


//For if the user clicks on the hyperlink to insert a product
app.get("/insert", (req, res) =>{
	res.render("insertProduct");
})


// Creating/Inserting a new product
app.post("/insert", (req, res) => {
	const product ={
		product_name : req.body.productName,
		quantity : req.body.quantity
        };	
	connection.query("insert into inventory set ?", product, function(err, result){
                if(err) throw err;
                res.redirect("/");
        });
	
})


// Updating/editing a product
app.post("/", (req, res) =>{
	const product = {
		id : req.body.id,
		product_name : req.body.product_name,
		quantity : req.body.quantity,
	};
	const prodChosen = [product, product.id]
	connection.query("update inventory set ? where id = ?", prodChosen, function(err, result){
		if(err) throw err;
		res.redirect("/");
	})
})

//Deleting a product
app.delete('/', (req, res) =>{
	const product ={
		id : req.body.id
	};
	connection.query("delete from inventory where id = ?", prod, function(err, result){
		if(err) throw err;
		res.redirect("/");
	})
	//do nothing if user confirms that they do not want to delete
})

app.listen(port, () => {console.log("connection successful")});
