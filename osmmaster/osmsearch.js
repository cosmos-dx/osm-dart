
const fs = require('fs');
const osmapp = require('./userlogin')
const osmfun = require('./osmfun')
const app = osmapp.app ;
const sqlite3 = require('sqlite3');
const { parseArgs } = require('util');
var staticlimit = parseInt(osmapp.staticlimit); 
//console.log("this is osmsearch",staticlimit); // 3 // this is fixed chunk size;  
// this will add and subtract as user scroll up or down; and load post in chunck size
// had have to calculate as per scroll movement, and flush after page reload 
var varlimit=parseInt(osmapp.varlimit) ;//

app.get('/osmnotifications', function(req, res, next) {
  var username = req.session.username;
  var firstname = req.session.firstname;
  var info = '@'+username+'-Notifications';
  
  if (!username){
    
      // username = req.query.username;
      // firstname = req.query.firstname;
      // req.session.userid = username;
      // req.session.username = username;
      // req.session.firstname = firstname;
      info = '@'+username+'-Notifications';
      // when user name not available in session try to get from imgvalidator
      // this method could be dangerous, double check during any flaws 
      res.redirect('/osmlogin');
      return true;
      }

  
  var [uidx, jfilename, dirobj, uidxlib, userdir, filepath] = osmfun.getJfilePath(username);
  var pageinfo = osmfun.getPageInfo(username, firstname, 'OSMNotifications', info, '', false, userdir);
  var notificationpath = dirobj.ldrnotepath 
  var notificationdata = osmfun.checkNotifications(username, username, firstname, firstname, "", notificationpath)
  var xtextdt = notificationdata["users"];
  var notedata = {}
  for (let [key, value] of Object.entries(notificationdata["users"])){
    if (value.path){
      notedata[key]=value;
      var dt = JSON.parse(fs.readFileSync(value.path, "utf8"));  
      notedata[key]['text']=dt['text']
      notedata[key]['data']=dt
      //console.log('xxxxxx ==> ', dt)
     }
    }
   
   var imgdir = req.session.datadir.imgdir;
   var userdp = req.session.datadir.userdp;
   var dtype = req.session.device.type ;

   if (dtype=='desktop'){
        res.render('mysm/osmnotifications', {"spinfo":pageinfo, "pg":notedata, "textdt":notedata, "imgdir":imgdir,
        "userdp":userdp, "username": username, "firstname":firstname, "search_result":"Search What is Happening !"});
      }// for desktop}
    else{
        res.render('mob/osmnotifications', {"spinfo":pageinfo, "pg":notedata, "textdt":notedata, "imgdir":imgdir,
        "userdp":userdp, "username": username, "firstname":firstname, "search_result":"Search What is Happening !"});
     }// for other than desktop} mobile or smartphones ...

   // res.render('mysm/osmnotifications' , {root:__dirname, "spinfo": pageinfo, "textdt":notedata, "userdp":userdp,
   //           "imgdir":imgdir, "username": username, "firstname":firstname, "search_result":"Search What is Happening !"});  

})

// app.post('/osmnotifications', function(req, res, next) {
//   var username = req.session.userid;
//   var firstname = req.session.firstname;
//   var info = '@'+username+'-Notifications';
//   if (!username){
//         // when user name not available in session try to get from imgvalidator
//         // this method could be dangerous, double check during any flaws 
//         res.redirect('/osmlogin');
//         return true;
//       }
//   var [uidx, jfilename, udlib, uidxlib, userdir, filepath] = osmfun.getJfilePath(username);
//   var pageinfo = osmfun.getPageInfo(username, firstname, 'OSMNotifications', info, '', false, userdir); 
 
//   res.render('mysm/osmnotifications' , {root:__dirname, "spinfo": pageinfo, "textdt":[], 
//             "imgdir":"", "username": username, "firstname":firstname, "search_result":"Search What is Happening !"});  

// })

app.get('/osmtrendsearch', function(req, res, next) {
  //response.sendFile(path.join(__dirname + '/login.html'));
  var username = req.session.userid;
  var firstname = req.session.firstname;
  
  var info = '@'+username+'-Search';
  
  if (!username){
      // username = req.query.username;
      // firstname = req.query.firstname;
      // req.session.userid = username;
      // req.session.username = username;
      // req.session.firstname = firstname;
      info = '@'+username+'-Search';
      // when user name not available in session try to get from imgvalidator
      // this method could be dangerous, double check during any flaws 
      res.redirect('/osmlogin');
      return true;
      }
  
  var imgdir = req.session.datadir.imgdir;
  var userdp = req.session.datadir.userdp;
  var [uidx, jfilename, udlib, uidxlib, userdir, filepath] = osmfun.getJfilePath(username);
  var pageinfo = osmfun.getPageInfo(username, firstname, 'OSMTrends', info, '', false, userdir); 
  //////////////////////////////// there should be a code /////////////////////////////////////////////
  
  var dtype = req.session.device.type ;
   
  if (dtype=='desktop'){
     // res.render('mysm/osmtrendsearch', {"spinfo":pageinfo, "pg":[], "textdt":[], "imgdir":imgdir,
     // "userdp":userdp, "username": username, "firstname":firstname, "search_result":"Search What is Happening !"});

      res.render('mysm/osmtrendsearch', {"spinfo":pageinfo, "pg":[], "textdt":[], "imgdir":imgdir,
      "userdp":userdp, "username": username, "firstname":firstname, "search_result":"Search What is Happening !"});
    }// for desktop}
  else{
      res.render('mob/osmtrendsearch', {"spinfo":pageinfo, "pg":[], "textdt":[], "imgdir":imgdir,
      "userdp":userdp, "username": username, "firstname":firstname, "search_result":"Search What is Happening !"});
   }// for other than desktop} mobile or smartphones ...

  // res.render('mysm/osmtrendsearch' , {root:__dirname, "spinfo": pageinfo, "textdt":[], "userdp":userdp,
  //           "imgdir":imgdir, "username": username, "firstname":firstname, "search_result":" !"});  
});

app.post('/osmtrendsearch',(req,res) => {
    var username = req.session.userid ;
    var firstname = req.session.firstname;
    var text = req.body.text;
    if (!username){
        //username = req.body.username;
        // when user name not available in session try to get from imgvalidator
        // this method could be dangerous, double check during any flaws 
        res.redirect('/osmlogin');
        return true;
    }
    if (text){
        var senddata = [];
        var searchtxt = text.slice(1);
        var uidx = searchtxt.slice(0, 1); 
        var trendlib = 'trendlib' ;
        var lendir = searchtxt.length.toString() ;  
        var getpath = Path.join(trendlib, uidx, uidx+lendir);
        
        try{
            fs.readdirSync(getpath).forEach(file => {
                var trendname = file.split('.json')[0];
                senddata.push(trendname);
                });
            }
        catch{
            senddata = [];
            
        }
        
        res.send(JSON.stringify(senddata));
    }
  
  var imgdir = req.session.datadir.imgdir;
  var userdp = req.session.datadir.userdp; 
  var [uidx, jfilename, udlib, uidxlib, userdir, filepath] = osmfun.getJfilePath(username);
  var pageinfo = osmfun.getPageInfo(username, firstname, 'OSMTrends', info, '', false, userdir); 
  //////////////////////////////// there should be a code /////////////////////////////////////////////
  
  var dtype = req.session.device.type ;
   
  if (dtype=='desktop'){
      res.render('mysm/osmtrendsearch', {"spinfo":pageinfo, "pg":[], "textdt":[], "imgdir":imgdir,
      "userdp":userdp, "username": username, "firstname":firstname, "search_result":"Search What is Happening !"});
    }// for desktop}
  else{
      res.render('mob/osmtrendsearch', {"spinfo":pageinfo, "pg":[], "textdt":[], "imgdir":imgdir,
      "userdp":userdp, "username": username, "firstname":firstname, "search_result":"Search What is Happening !"});
   }// for other than desktop} mobile or smartphones ...

  // res.render('mysm/osmtrendsearch' , {root:__dirname, "spinfo": pageinfo, "textdt":[], "userdp":userdp,
  //           "imgdir":imgdir, "username": username, "firstname":firstname, "search_result":" !"}); 
});

app.get('/osmprofilesearch', function(req, res) {
  //response.sendFile(path.join(__dirname + '/login.html'));
  var username = req.session.username;
  var firstname = req.session.firstname;
  if (!username){
        //username = req.query.username;
        //req.session.userid = username;
        // when user name not available in session try to get from imgvalidator
        // this method could be dangerous, double check during any flaws 
        res.redirect('/osmlogin');
        return true;
    }
  var imgdir = req.session.datadir.imgdir;
  var userdp = req.session.datadir.userdp; 
  var [uidx, jfilename, udlib, uidxlib, userdir, filepath] = osmfun.getJfilePath(username);
  var pageinfo = osmfun.getPageInfo(username, firstname, 'Login', info, '', false, userdir); 
  
  var dtype = req.session.device.type ;
   
  if (dtype=='desktop'){
      res.render('mysm/osmtrendsearch', {"spinfo":pageinfo, "pg":[], "textdt":[], "imgdir":imgdir,
      "userdp":userdp, "username": username, "firstname":firstname, "search_result":"Search What is Happening !"});
    }// for desktop}
  else{
      res.render('mob/osmtrendsearch', {"spinfo":pageinfo, "pg":[], "textdt":[], "imgdir":imgdir,
      "userdp":userdp, "username": username, "firstname":firstname, "search_result":"Search What is Happening !"});
   }// for other than desktop} mobile or smartphones ...

  // res.render('mysm/osmtrendsearch' , {root:__dirname, "spinfo": pageinfo, "textdt":[], "userdp":userdp,
  //           "imgdir":imgdir, "username": username, "firstname":firstname, "search_result":"Search What is Happening !"});  

  //res.redirect('/');
  
});

app.post('/osmprofilesearch',(req,res) => {
    
    var username = req.session.username ;
    var firstname = req.session.firstname;
    var text = req.body.text;
    if (!username){
        //username = req.body.username;
        // when user name not available in session try to get from imgvalidator
        // this method could be dangerous, double check during any flaws 
        res.redirect('/osmlogin');
        return true;
        }
    const memdbfilepath = osmapp.memdbfilepath;
    const memdb =  new sqlite3.Database(memdbfilepath);
    if (text.length>0){
        var searchtxt = text.slice(1);
        var qry = 'SELECT username FROM member WHERE username LIKE "'+searchtxt+'%" LIMIT 10 '; 
   
        memdb.all(qry, function (error, row){
        if (row){
            //var senddata = {'result':row}
            res.send(JSON.stringify(row));
        }
        else{
            res.send(JSON.stringify({'result':''}));
            }
        })
    }
      
});

app.get('/osmhastag_search',(req,res,next) => {
    
    var username = req.session.username ;
    var firstname = req.session.firstname;
    var trendlib = req.session.trendlib ;
    var text = req.query.text;
    if (!username){
        //username = req.body.username;
        // when user name not available in session try to get from imgvalidator
        // this method could be dangerous, double check during any flaws 
        res.redirect('/osmlogin');
        return true;
        }
    
    if (text.length>0){
        var getdata = osmfun.osmTrendReadFile(text, readdata=false);
        var tdata = getdata.data ;
        if (tdata.length>0){
          res.json({"success":tdata});
        }
        else{
          res.status(204).send();
        }
        
    }
    
});

app.post('/osmhastag_search',(req,res,next) => {
    var username = req.session.username ;
    var firstname = req.session.firstname;
    var tname = req.body.tname;
    
    if (!username){
        //username = req.body.username;
        // when user name not available in session try to get from imgvalidator
        // this method could be dangerous, double check during any flaws 
        res.redirect('/osmlogin');
        return true;
        }
    tname = tname.replace(".json", "") ;    
    var imgdir = req.session.datadir.imgdir;
    var userdp = req.session.datadir.userdp;
    var userdir = req.session.datadir.userdir;  
    
    //console.log(typeof varlimit, varlimit, typeof staticlimit, staticlimit)
    osmapp.varlimit = osmapp.staticlimit   ; // stating size ;

    var userdisplaydata = osmfun.osmTrendReadFile(tname, readdata=true, limitrange=[0, osmapp.staticlimit]);
    
    //var [uidx, jfilename, dirobj, uidxlib, userdir, filepath] = osmfun.getJfilePath(username);
    var pageinfo = osmfun.getPageInfo(username, firstname, 'OSM TRENDS', '#'+tname+' Search', '', true, userdir); 
    pageinfo['varlimit']=osmapp.varlimit;
    pageinfo['staticlimit']=osmapp.staticlimit;
    pageinfo['tname']=tname; 
    //var [userdisplaydata, filepath] = osmfun.readAlljson(search_text); 


    var dtype = req.session.device.type ;
    if (dtype=='desktop'){
        
       // res.render('mysm/osmtrendfeeds', {"spinfo":pageinfo, "pg":userdisplaydata,  "imgdir":imgdir,
        //"userdp":userdp, "username": username, "firstname":firstname, "search_result":""});

        res.render('mob/osmtrendfeeds', {"spinfo":pageinfo, "pg":userdisplaydata,  "imgdir":imgdir,
        "userdp":userdp, "username": username, "firstname":firstname, "search_result":""});
      }// for desktop}
    else{
        res.render('mob/osmtrendfeeds', {"spinfo":pageinfo, "pg":userdisplaydata,  "imgdir":imgdir,
        "userdp":userdp, "username": username, "firstname":firstname, "search_result":""});
     }// for other than desktop} mobile or smartphones ...

    // res.render('mysm/osmtrendfeeds', {"spinfo":pageinfo, "pg":userdisplaydata, "userdp":userdp,
    //       "imgdir":imgdir, "username": username, "firstname":firstname, "search_result":""});

});

// osmtrendfeeds.ejs via ajax
app.get('/chunkreload_trend_DOWN',(req,res) => {

    var username = req.session.username ;
    var firstname = req.session.firstname;
     if (!username){
      // session OUT no result fetch
      res.status(204).send();
      return ;
     }

    var imgdir = req.session.datadir.imgdir;
    var userdp = req.session.datadir.userdp;
    var userdir = req.session.datadir.userdir;  
    var direction = req.query.direction ;
    var tname = req.query.tname ;
    var title  = req.query.title ;
   
    var startrange = varlimit ;
    osmapp.varlimit += osmapp.staticlimit
    
    if (title.toLowerCase()=='feeds'){
        var userdisplaydata = osmfun.osmTrendReadFile(tname, readdata=true, limitrange=[startrange, varlimit]);

        var pageinfo = osmfun.getPageInfo(username, firstname, 'OSM TRENDS', '#'+tname+' Search', '', true, userdir); 
        pageinfo['varlimit']=osmapp.varlimit;
        pageinfo['staticlimit']=osmapp.staticlimit;
        pageinfo['tname']=tname; 

        res.json({"success" : {"data":userdisplaydata}});
        //var [userdisplaydata, filepath] = osmfun.readAlljson(search_text); 
        //res.render('mysm/osmtrendfeeds', {"spinfo":pageinfo, "pg":userdisplaydata, "userdp":userdp,
        //      "imgdir":imgdir, "username": username, "firstname":firstname, "search_result":""});
        return ;
      }
    res.status(204).send();
});
// osmtrendfeeds.ejs via ajax

app.get('/osmprofiles_search',(req,res) => {
    var username = req.query.username;
    var firstname = req.query.firstname;
    var text = req.query.text;

    const memdbfilepath = osmapp.memdbfilepath;
    const memdb =  new sqlite3.Database(memdbfilepath);
    if (text.length>1){
        var searchtxt = text.slice(1);
        var qry = 'SELECT username, name as firstname FROM member WHERE username LIKE "'+searchtxt+'%" LIMIT 10 '; 
   
        memdb.all(qry, function (error, row){
        if (row){
            //var senddata = {'result':row}
            res.send(JSON.stringify(row));
        }
        else{
            res.send(JSON.stringify({'result':''}));
            }
        })
    }
    
});

app.post('/osmprofiles_search',(req,res, next) => {
   
    var main_username = req.session.username;
    var main_firstname = req.session.firstname;
    if(!main_username){
        res.redirect('/osmlogin');
    }

    var username = req.body.listusername;
    var firstname = req.body.listuser_firstname;
    var userdisplaydata=[];
    var filepath =[];
    var dtype = req.session.device.type;


    var qry2 = 'SELECT postid, postpath, flag FROM osmpostindex WHERE username = "'+username+'" '+
    'ORDER BY postid DESC LIMIT '+osmapp.varlimit+', '+osmapp.staticlimit+' '; 
    getpindexdb_data(userdisplaydata, filepath, qry2, function(data){
        userdisplaydata = data[0];  // guranteed for accurate data from callback only
        filepath = data[1]  ;       // guranteed for accurate data from callback only
        var [uidx, jfilename, dirobj, uidxlib, userdir, filepath] = osmfun.getJfilePath(username);
        var imgdir = dirobj.imgtransitdir_name;
        var userdp = dirobj.userdp;
        
        var pageinfo = osmfun.getPageInfo(username, firstname, 'MyOSM', '@'+username+' ['+firstname+']', '', true, userdir); 
             
        pageinfo['title']='OSM-Search-Profile'
        if (dtype=='desktop'){
            res.render('mysm/osmmain', {"spinfo":pageinfo, "pg":userdisplaydata, "imgdir":imgdir,
            "userdp":userdp, "username": username, "firstname":firstname, "search_result":""});
        }// for desktop}
        else{
            res.render('mob/osmmain', {"spinfo":pageinfo, "pg":userdisplaydata, "imgdir":imgdir,
            "userdp":userdp, "username": username, "firstname":firstname, "search_result":""});
        }// for other than desktop} mobile or smartphones ...
              
             
  
    });


                    // var [userdisplaydata, filepath] = osmfun.readAlljson(username); 
                    // console.log("userdisplay data 387 osmsearch",userdisplaydata);


                    // var dtype = req.session.device.type ;
                
                    // if (dtype=='desktop'){
                    //     res.render('mysm/osmtrendfeeds', {"spinfo":pageinfo, "pg":userdisplaydata,  "imgdir":imgdir,
                    //     "userdp":userdp, "username": username, "firstname":firstname, "search_result":""});
                    //   }// for desktop}
                    // else{
                    //     res.render('mob/osmtrendfeeds', {"spinfo":pageinfo, "pg":userdisplaydata,  "imgdir":imgdir,
                    //     "userdp":userdp, "username": username, "firstname":firstname, "search_result":""});
                    //  }// for other than desktop} mobile or smartphones ...

                    // // res.render('mysm/osmmain', {"spinfo": pageinfo, "pg":userdisplaydata, "username": username, "userdp":userdp,
                    // //       "imgdir":imgdir, "firstname":firstname, "search_result":''});
   
});

module.exports.app = app