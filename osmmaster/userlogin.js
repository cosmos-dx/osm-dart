
const express = require('express');
const cookieParser = require("cookie-parser");
const sessions = require('express-session');
const DeviceDetector = require('device-detector-js');
var async = require('async');
const deviceDetector = new DeviceDetector();

var fs = require('fs');
const Path = require("path");
var ejs = require('ejs');
var http = require('http');
const sqlite3 = require('sqlite3');
const memdbfilepath = './asset1/member.db'
//const memdb =  new sqlite3.Database(memdbfilepath);
const osmfun = require('./osmfun')

const app = express();

//app.use(express.json());
//app.use(express.urlencoded({ extended: true }));

const oneDay = 1000 * 60 * 60 * 24;

var sess = {
  secret: 'keyboard cat',
  cookie: {maxAge: oneDay, "username":"Hello-World"},
  saveUninitialized:false,
  resave: true,
  proxy : false,
  rolling:true
}

app.set('trust proxy', 1) // trust first proxy
sess.cookie.secure = 'auto';

//app.use(sessions(sess))

// cookie parser middleware
//app.use(cookieParser());
app.set('view engine', 'ejs');
//app.use(express.json());
//app.use(express.urlencoded({ extended: true }));

function use_parallel(middlewares) {
  return function (req, res, next) {
    async.each(middlewares, function (mw, cb) {
      mw(req, res, cb);
    }, next);
  };
}


app.use(use_parallel([
  sessions(sess),
  express.json(),
  express.urlencoded({ extended: true }),
  cookieParser(),
  // express.static(__dirname),
  // express.static(Path.join(__dirname, 'osmmaster')),
  // express.static(Path.join(__dirname, 'public'))
]));

var imgdir = 'imgtransitdir' 
var staticlimit = 5 // this is fixed chunk size;  
// this will add and subtract as user scroll up or down; and load post in chunck size
// had have to calculate as per scroll movement, and flush after page reload 
var varlimit=0 ; 






app.get('/',(req,res) => { 
   var info = ''; 
   if(req.session.userid){
        //res.send("Welcome User <a href=\'/logout'>click to logout</a>");
        var pageinfo = osmfun.getPageInfo('-', '', 'Login', info, '', false, '//');
        pageinfo['title']='OSM-Login'
        res.render('mysm/login',{root:__dirname, spinfo:pageinfo})
        
    }
    else{
        var pageinfo = osmfun.getPageInfo('-', '', 'Login', info, '', false, '//');
        //res.sendFile('vws/mysm/login',{root:__dirname})
        pageinfo['title']='OSM-Login'
        res.render('mysm/login',{root:__dirname, spinfo:pageinfo})
        //res.sendFile('views/mysm/login.ejs',{root:__dirname})
     }
});

app.get('/osmlogin', function(req, res) {
  //response.sendFile(path.join(__dirname + '/login.html'));
  var username = req.session.userid;
  var firstname = req.session.firstname;
  var info = '';
  if (!username){username = ''}
  else{info = username+'-LogOut Successfully !'}
  var pageinfo = osmfun.getPageInfo(username, firstname, 'Login', info, '', false, '//'); 
  
  req.session.destroy();
  pageinfo['title']='OSM-Login'
  res.render('mysm/login' , {root:__dirname, spinfo: pageinfo});
  //res.redirect('/');
  
});

app.post('/osmwellcome',(req,res,next) => {
    const device = deviceDetector.parse(req.headers['user-agent']);
    
    varlimit = 0 ; // reset to Zero from start

    var username = req.body.username.toLowerCase().trim();
    var password = req.body.password;
    var firstname = '';
    var qry = 'SELECT username, name, lastname, phone FROM member WHERE '+
      ' username = "'+username+'" AND password = "'+password+'" ';
    var qry2 = 'SELECT postid, postpath, flag FROM osmpostindex WHERE username = "'+username+'" '+
      'ORDER BY postid DESC LIMIT '+varlimit+', '+staticlimit+' '; 
    var userdisplaydata = [];
    var filepath = [];
    var userdp = ""
    getpindexdb_data(userdisplaydata, filepath, qry2, function(data){
      userdisplaydata = data[0];  // guranteed for accurate data from callback only
      filepath = data[1]  ;       // guranteed for accurate data from callback only
      let memdb =  new sqlite3.Database(memdbfilepath);

      memdb.get(qry, function (error, row){
        if (row){
            firstname = row.name ;
            username = row.username
            var [uidx, jfilename, dirobj, uidxlib, userdir, filepath] = osmfun.getJfilePath(username);
            var userdp = Path.join(userdir, imgdir, username+'.jpg') // assigning to session for further uses
            req.session.userdp = userdp
            req.session.userid=req.body.username;
            req.session.firstname= firstname;
            req.session.datadir = {"uidx":uidx, "jfilename":jfilename, "dirobj":dirobj,
                    "uidxlib":uidxlib, "userdir":userdir, "filepath":filepath,
                    "imgdir":imgdir,"ldr":"ldr","userdp":userdp}

            //req.session.device = device ; // full device info will store in session device.client & device.os 
            req.session.device = device.device 
            
            var dtype = device.device.type ;
            
            sess = req.session ;
            sess.username = username
            sess.firstname = firstname

            req.session.cookie['username']=username
            req.session.cookie['firstname']=firstname
            //req.session.save();

            var pageinfo = osmfun.getPageInfo(username, firstname, 'MyOSM', 'Well-Come @'+username+' ['+firstname+']', '', true, userdir); 
            //var [userdisplaydata, filepath] = osmfun.readAlljson(username, varlimit, staticlimit);    
            // sendtrendhashtag();
            pageinfo['title']='OSM-Profile'
            if (dtype=='desktop'){
                res.render('mysm/osmmain', {"spinfo":pageinfo, "pg":userdisplaydata, "imgdir":imgdir,
                "userdp":userdp, "username": username, "firstname":firstname, "search_result":""});
            }// for desktop}
            else{
                res.render('mob/osmmain', {"spinfo":pageinfo, "pg":userdisplaydata, "imgdir":imgdir,
                "userdp":userdp, "username": username, "firstname":firstname, "search_result":""});
            }// for other than desktop} mobile or smartphones ...
            
           
        }
        else{
            var pageinfo = osmfun.getPageInfo('', '', 'Login', '', 'Sorry !! Wrong ID - Password !', false, '//'); 
            pageinfo['title']='OSM-Login'
            res.render('mysm/login' , {"root":__dirname, "spinfo": pageinfo});
            //res.send('Invalid username or password');
        }
    } );
      memdb.close();
  });
})


module.exports.app = app
module.exports.imgdir = imgdir
module.exports.staticlimit = staticlimit
module.exports.varlimit = varlimit
module.exports.memdbfilepath = memdbfilepath;

//module.exports.sessions = sessions

