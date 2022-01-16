const bodyParser = require('body-parser');
const express = require('express');
const mysql = require('mysql');
const app = express()
const port = 3000;

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/assets"));

const connection = require('./db/connection.js');

//we will use this variable as our backend cache
let data;

//Landing page, loading/Reading in table data
app.get("/", (req, res) => {	
	const query = "select * from inventory;";
	connection.query(query, function(err, results){
		if(err) throw err;
		//storing the first retrieved variables
		data = results;
		res.render("landingPage", {data});
	});
})

// Editing/Deleting a product, using POST request with row num to pass to backend to check cache
app.post("/", (req, res) =>{
	let product;
	//catching a post request from front end and rendering the edit product page
	if(req.body.editReq != undefined){
		product = data[parseInt(req.body.editReq)]
		res.render( "editProduct", {product});
	}else if(req.body.sendProdData != undefined){
		updatedProduct = {
			product_name: req.body.productName,
			quantity: parseInt(req.body.quantity)
		};
		originalProduct = {
			id : parseInt(req.body.id)
		};
		console.log(originalProduct);
		connection.query("update inventory set ? where ?", [updatedProduct, originalProduct], function(err, results){
			if(err) throw err;
			res.redirect("/");
		})
	}
	else{
		//otherwise we are deleting the product, only 2 possible ways to get a post request
		product = data[parseInt(req.body.delete)]
		connection.query("delete from inventory where id = ?", product.id, function(err, result){
			if(err) throw err;
			res.redirect("/")
		})
	}
})

//For if the user clicks on the hyperlink to insert a product
app.get("/insert", (req, res) =>{
        res.render("insertProduct");
})


// Creating/Inserting a new product
app.post("/insert", (req, res) => {
        const product = [req.body.productName, parseInt(req.body.quantity)]
        connection.query("insert into inventory (product_name, quantity) values(?, ?)", product, function(err, result){
                if(err) throw err;
                res.redirect("/");
        });
})



app.listen(port, () => {console.log("connection successful")});
