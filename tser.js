const express = require('express');
const favicon = require('serve-favicon');
//const cookieParser = require("cookie-parser");
//const sessions = require('express-session');
//const sqlite3 = require('sqlite3');

// Each and Every modules which is part of OSM must import here  
const memdbfilepath = 'asset1/member.db'; 
const myapp = require('./osmmaster/userlogin')
const osmfun = require('./osmmaster/osmfun')
const osmldr = require('./osmmaster/osmldr')
const osmapp = require('./osmmaster/userregister')
const osmdart = require('./osmmaster/osmdart')
const useraction = require('./osmmaster/useraction')

const useraccount = require('./osmmaster/useraccount')
const osmsearch = require('./osmmaster/osmsearch')
const noftification = require('./osmmaster/notification')
//const mv = require('mv'); 
//var url = require('url');


const Path = require("path");
//var ejs = require('ejs');
//var http = require('http'); 
//var formidable = require('formidable');
//var fs = require('fs');

//const { setTimeout } = require('timers/promises');
//const memdb =  new sqlite3.Database(memdbfilepath);

//const app = express();

const app = myapp.app ;
app.use(favicon(__dirname + '/favicon.ico'));
//var session = app.session;

const port = process.env.PORT ||  4040;

//serving public file
app.set('views',__dirname + '/vws');
app.use(express.static(__dirname));
app.use(express.static(Path.join(__dirname, 'osmmaster')))
app.use(express.static(Path.join(__dirname, 'public'))) // configure express to use public folder
//app.use(express.static(__dirname, + '/public')); 


module.exports.app = app;


app.listen(port , () => console.log(`Script tser.js is Running at port ${port}`));

