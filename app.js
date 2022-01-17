const bodyParser = require('body-parser');
const express = require('express');
const mysql = require('mysql');
const json2csvParser = require("json2csv").Parser;
const fs = require("fs");
const app = express()
const port = 3000;

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/assets"));

const connection = require('./db/connection.js');

//This variable will be used as our backend cache, since db is small all data is stored
//Potential future feature is implmenting pagination
//and limit size of cache to current page's items as db size increases for performance
let data;

//Landing page, loading/Reading in table data
app.get("/", (req, res) => {	
	const query = "select * from inventory;";
	connection.query(query, function(err, results){
		if(err) throw new Error("issue with retriving data from DB");
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
	}else if(req.body.sendProdData != undefined){  //We are editing a product's entry
		//handling edge case where user empties quantity field in front end and clicks save
		if(req.body.quantity === ""){
			res.redirect("/");
			return;
		}
		updatedProduct = {
			product_name: req.body.productName,
			quantity: parseInt(req.body.quantity)
		};
		originalProduct = {
			id : parseInt(req.body.id)
		};
		connection.query("update inventory set ? where ?", [updatedProduct, originalProduct], function(err, results){
			if(err) throw new Error("issue with update");
			res.redirect("/");
		});
	}
	else{
		//otherwise we are deleting the product
		product = data[parseInt(req.body.delete)]
		connection.query("delete from inventory where id = ?", product.id, function(err, result){
			if(err) throw new Error("issue with deleting");
			res.redirect("/")
		});
	}
})

//For if the user clicks on the hyperlink to insert a product
app.get("/insert", (req, res) =>{
        res.render("insertProduct");
})


// Creating/Inserting a new product via post request (clicking save button) from insert page
app.post("/insert", (req, res) => {
	//edge case where user empties quantity field and attempts to save, redirects to page
	if(req.body.quantity === ""){
		res.redirect("/insert")
		return;
	}
	//Both productName and quantity have default values set via ejs and validity checking is handled in frontend before POST request is allowed through
        const product = [req.body.productName, parseInt(req.body.quantity)]
        connection.query("insert into inventory (product_name, quantity) values(?, ?)", product, function(err, result){
                if(err) throw new Error("issue with adding new product to inventory");
                res.redirect("/");
        });
})

/** 
 * Writing to csv file function, using json2csv module's parser and fs
 * Most current state of db is reflected in file
 * Assumption is made that request will only come from the landingPage (since that is where we included the button to make the request)
 * Thus we do not need to make another query to DB as we cached data
 * Deals with edge case where the db is empty and creates empty file
 **/

app.get("/downloadCSV", (req, res) => { 
	if(data.length == 0){
		fs.writeFile("mySqlData.csv", "", function(err, results){
			if(err) throw new Error("Issue creating csv file");
		 	res.download(`${__dirname}/mySqlData.csv`);
		})
		return;
	};
	const parser = new json2csvParser({header : true});
	const csv = parser.parse(data);
	fs.writeFile("mySqlData.csv", csv, function(err, result){
		if(err) throw new Error("Issue writing csv file");
		res.download(`${__dirname}/mySqlData.csv`);
	});
}) 



app.listen(port, () => {console.log("connection successful")})
