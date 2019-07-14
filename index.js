//IMPORT LIBRARY
const express = require('express');
const server = express();
const hbs = require('hbs');
var mysql = require('mysql');
const bodyParser = require('body-parser');
const path = require('path');
const axios = require('axios');

//DB CONNECTION
var con = mysql.createConnection({
    host: "127.0.0.1",
    user: "root",
    password: "",
    database: "webapi"
});

//DECLARATION
var displayData;
var countryData = [];

//SETTINGS - FROM PAUL
server.use(express.static(__dirname + '/public'));
server.use(bodyParser.urlencoded({extended: true}));
server.set('view engine', 'hbs');
hbs.registerPartials(__dirname + '/views/template');
hbs.registerPartials(__dirname + '/views');

//DEFAULT INDEX PAGE
server.get('/', (req, res) => {
    res.render('index.hbs');
});

//Records page (History)
server.get('/records', (req, res) => {
    displayData = [];
    con.query("SELECT * FROM countries", function (err, result, fields) {
        if (err) throw err;
        for(var pos = 0; pos < result.length; pos++){
            const name = result[pos].name;
            const capital = result[pos].capital;
            const region = result[pos].region;
            const population = result[pos].population;
            const currencies = result[pos].currencies;

            displayData.push({'name': name, 'capital': capital, 'region': region, 'population': population, 'currencies': currencies});
        }
        setTimeout(function(){
            // insertDB(dataArray);
            res.render('records.hbs');
        }, 200)
    });
})

//Helper for display info - Block Helper
hbs.registerHelper('list', (items, options) => {
    items = displayData;
    var out ="";

    const length = items.length;

    for(var i=0; i<length; i++){
        out = out + options.fn(items[i]);
    }

    return out;
});

//SEARCH FUNCTION
server.post('/search', (req, res) => {
    //HERE
    var s_name = req.body.query;
    countryData = [];
    displayData = [];
    const querystr1 = `https://restcountries-v1.p.rapidapi.com/name/${s_name}`;
    axios.get(querystr1, {headers: {"X-RapidAPI-Host": "restcountries-v1.p.rapidapi.com", "X-RapidAPI-Key":  "9fe03f2c21mshe5105b887cd6222p10c072jsn890002e795a7"}}).then((response) => {
        for(var pos = 0; pos < response.data.length; pos++){
            const name = response.data[pos].name;
            const capital = response.data[pos].capital;
            const region = response.data[pos].region;
            const population = response.data[pos].population;
            const currencies = response.data[pos].currencies[0];

            //HERE
            countryData.push([name, capital, region, population, currencies]);
            displayData.push({'name': name, 'capital': capital, 'region': region, 'population': population, 'currencies': currencies});
        }
        //HERE
        setTimeout(function(){
            addToDB(countryData);
            res.render('search.hbs');
        }, 200)
    })
});

server.listen(5000, () => {
    console.log('hello');
});

function addToDB(dbData){
    var sql = `INSERT INTO countries (name, capital, region, population, currencies) VALUES ?`;
    con.query(sql, [dbData],function (err, result) {
        if (err) throw err;
        console.log("Multiple record inserted");
    });
}

server.post('/del', (req, res) => {
    var sql = `DELETE FROM countries`;
    con.query(sql,function (err, result) {
        if (err) throw err;
        console.log('Data has been cleared');
        res.render('index.hbs');
    });
});