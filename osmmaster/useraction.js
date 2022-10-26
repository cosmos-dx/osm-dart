
var fs = require('fs');
var formidable = require('formidable');
const Path = require("path");
const osmapp = require('./userlogin');
const osmfun = require('./osmfun');
const memdbfilepath = './asset1/member.db'
const sqlite3 = require('sqlite3');
//const memdb =  new sqlite3.Database(memdbfilepath);
const osmpostindexpath = './asset1/osmpostindex.db'
const pindexdb =  new sqlite3.Database(osmpostindexpath);

const app = osmapp.app ;

var imgdir = osmapp.imgdir ; //'imgtransitdir'; // user image upload dirname
var staticlimit = osmapp.staticlimit ; // 3 // this is fixed chunk size;  
// this will add and subtract as user scroll up or down; and load post in chunck size
// had have to calculate as per scroll movement, and flush after page reload 
var varlimit=osmapp.varlimit ;// 


getpindexdb_data = async function(userdisplaydata, filepath, qry, callback){
  var pindexdb = new sqlite3.Database(osmpostindexpath); // Taking New every time connection
  pindexdb.serialize(function() {
    pindexdb.each(qry , function(err, row) {
      if(err != null){console.log(err);}
      if (row){
        for (let i in row){var postpath = row.postpath ;}
         
       try{
        userdisplaydata.push(JSON.parse(fs.readFileSync(postpath, "utf8"))); 
        filepath.push(postpath);
         }
      catch(err){}

       }
    }, 
    ///*** =function callback(for accessing return value) inside this function scope = ***///
      function(){ // calling function when all rows have been pulled
        pindexdb.close(); //closing connection
        callback([userdisplaydata, filepath]); 
      }
    ///*** =function callback(for accessing return value) inside this function scope = ***///
    );
  });
}

// app.post('/osmwellcome',(req,res) => {
//     varlimit = 0 ; // reset to Zero from start
//     var username = req.body.username;
//     var password = req.body.password;
//     var firstname = '';
//     var qry = 'SELECT username, name, lastname, phone FROM member WHERE '+
//       ' username = "'+username+'" AND password = "'+password+'" ';
//     var qry2 = 'SELECT postid, postpath, flag FROM osmpostindex WHERE username = "'+username+'" '+
//       'ORDER BY postid DESC LIMIT '+varlimit+', '+staticlimit+' '; 
//     var userdisplaydata = [];
//     var filepath = [];
//     var userdp = ""
//     getpindexdb_data(userdisplaydata, filepath, qry2, function(data){
//       userdisplaydata = data[0];  // guranteed for accurate data from callback only
//       filepath = data[1]  ;       // guranteed for accurate data from callback only
//       let memdb =  new sqlite3.Database(memdbfilepath);

//       memdb.get(qry, function (error, row){
//         if (row){
//             firstname = row.name ;
//             username = row.username
//             var [uidx, jfilename, udlib, uidxlib, userdir, filepath] = osmfun.getJfilePath(username);
//             var userdp = Path.join(userdir, imgdir, username+'.jpg') // assigning to session for further uses
//             req.session.userdp = userdp
//             req.session.userid=req.body.username;
//             req.session.firstname= firstname;
            
//             req.session.cookie['username']=username
//             req.session.cookie['firstname']=firstname
//             req.session.save();
//             var pageinfo = osmfun.getPageInfo(username, firstname, 'MyOSM', 'Well-Come @'+username+' ['+firstname+']', '', true, userdir); 
//             //var [userdisplaydata, filepath] = osmfun.readAlljson(username, varlimit, staticlimit);    
//             // sendtrendhashtag();
//             pageinfo['title']='OSM-Profile'
            
//            res.render('mysm/osmmain', {"spinfo":pageinfo, "pg":userdisplaydata, 
//             "imgdir":imgdir, "username": username, "firstname":firstname, "search_result":""});
//         }
//         else{
//             var pageinfo = osmfun.getPageInfo('', '', 'Login', '', 'Sorry !! Wrong ID - Password !', false, '//'); 
//             pageinfo['title']='OSM-Login'
//             res.render('mysm/login' , {"root":__dirname, "spinfo": pageinfo});
//             //res.send('Invalid username or password');
//         }
//     });
//   });
// })

app.get('/mysmhome', function(req, res, next) {
    var pageinfo = osmfun.getPageInfo('', '', '', '', '', false, '//');
    res.render('mysm/login', {spinfo: pageinfo,});
});


app.get('/osmprofile',(req,res) => {
    varlimit = 0 ; // reset to Zero from start
    var username = req.session.userid ;
    var firstname = req.session.firstname ;
    
    var userdisplaydata = [];
    var filepath = [];
    
    if (!username){
        // when user name not available in session try to get from imgvalidator
        // this method could be dangerous, double check during any flaws 
        res.redirect('/osmlogin');
        return true;
      } 
    // if (!username){
    //     username = req.query.username;
    //     firstname = req.query.firstname;
    //     req.session.userid = username;
    //     req.session.username = username;
    //     req.session.firstname = firstname;
        
    // }
    
    var imgdir = req.session.datadir.imgdir;
    var userdp = req.session.datadir.userdp;
        
      var qry2 = 'SELECT postid, postpath, flag FROM osmpostindex WHERE username = "'+username+'" '+
          'ORDER BY postid DESC LIMIT '+varlimit+', '+staticlimit+' '; 
      getpindexdb_data(userdisplaydata, filepath, qry2, function(data){
        userdisplaydata = data[0];  // guranteed for accurate data from callback only
        filepath = data[1]  ; 
        var [uidx, jfilename, udlib, uidxlib, userdir, filepath] = osmfun.getJfilePath(username);
        var pageinfo = osmfun.getPageInfo(username, firstname, 'MyOSM', username+'-Profile', '', true, userdir); 
        //var [userdisplaydata, filepath] = osmfun.readAlljson(username, varlimit, staticlimit); 
        pageinfo['title']='OSM-Profile'

        var dtype = req.session.device.type ;
        if (dtype=='desktop'){
            res.render('mysm/osmmain', {"spinfo":pageinfo, "pg":userdisplaydata, "imgdir":imgdir,
            "userdp":userdp, "username": username, "firstname":firstname, "search_result":""});
            }// for desktop}
        else{
          res.render('mob/osmmain', {"spinfo":pageinfo, "pg":userdisplaydata, "imgdir":imgdir,
          "userdp":userdp, "username": username, "firstname":firstname, "search_result":""});
           }// for other than desktop} mobile or smartphones ...

        // res.render('mysm/osmmain', {"spinfo":pageinfo, "pg":userdisplaydata, "userdp":userdp,
        //     "imgdir":imgdir, "username": username, "firstname":firstname, "search_result":""});
        
      });
   
});

app.post('/osmtl',(req,res) => {
    
    var username = req.session.userid ;
    var firstname = req.session.firstname ;
    
    varlimit = 0 ; // reset to Zero from start
    if (!username){
        // when user name not available in session try to get from imgvalidator
        // this method could be dangerous, double check during any flaws 
        res.redirect('/osmlogin');
        return true;
      } 
    // if (!username){
       
    //     username = Object.entries(req.body)[0][0] ;
    //     req.session.userid = username;
    // }
    var imgdir = req.session.datadir.imgdir;
    var userdp = req.session.datadir.userdp;
    var dtype = req.session.device.type ;

    var [uidx, jfilename, udlib, uidxlib, userdir, filepath] = osmfun.getJfilePath(username);
    var pageinfo = osmfun.getPageInfo(username, firstname, 'OSMTL', username+'-TimeLine', '', true, userdir); 
    
    osmfun.load_By_DB_AllJson(function(userdisplaydata){
        pageinfo['title']='OSM-Feeds'
        
        if (dtype=='desktop'){
            res.render('mysm/osmmain', {"spinfo":pageinfo, "pg":userdisplaydata, "imgdir":imgdir,
            "userdp":userdp, "username": username, "firstname":firstname, "search_result":""});
            }// for desktop}
        else{
          res.render('mob/osmmain', {"spinfo":pageinfo, "pg":userdisplaydata, "imgdir":imgdir,
          "userdp":userdp, "username": username, "firstname":firstname, "search_result":""});
           }// for other than desktop} mobile or smartphones ...


        // res.render('mysm/osmmain', {"spinfo":pageinfo, "pg":userdisplaydata, "userdp":userdp,
        //     "imgdir":imgdir, "username": username, "firstname":firstname, "search_result":""});
        
    }, varlimit, staticlimit);
    
    });

app.get('/osmtl',(req,res) => {
    
    var username = req.session.userid ;
    var firstname = req.session.firstname ;

    varlimit = 0 ; // reset to Zero from start
    
    if (!username){
        // when user name not available in session try to get from imgvalidator
        // this method could be dangerous, double check during any flaws 
        res.redirect('/osmlogin');
        return true;
      } 
        // username = req.query.username;
        // firstname = req.query.firstname;
        // req.session.userid = username;
        // req.session.username = username;
        // req.session.firstname = firstname;
    var imgdir = req.session.datadir.imgdir;
    var userdp = req.session.datadir.userdp;
    var dtype = req.session.device.type ;

    var [uidx, jfilename, udlib, uidxlib, userdir, filepath] = osmfun.getJfilePath(username);
    var pageinfo = osmfun.getPageInfo(username, firstname, 'OSMTL', username+'-TimeLine', '', true, userdir); 
    
    osmfun.load_By_DB_AllJson(function(userdisplaydata){
      
      pageinfo['title']='OSM-Feeds'

      if (dtype=='desktop'){
            res.render('mysm/osmmain', {"spinfo":pageinfo, "pg":userdisplaydata, "imgdir":imgdir,
            "userdp":userdp, "username": username, "firstname":firstname, "search_result":""});
          }// for desktop}
      else{
        res.render('mob/osmmain', {"spinfo":pageinfo, "pg":userdisplaydata, "imgdir":imgdir,
        "userdp":userdp, "username": username, "firstname":firstname, "search_result":""});
         }// for other than desktop} mobile or smartphones ...
           
      // res.render('mysm/osmmain', {"spinfo":pageinfo, "pg":userdisplaydata, "userdp":userdp,
      //       "imgdir":imgdir, "username": username, "firstname":firstname, "search_result":""});
      
    },  varlimit, staticlimit);
    
    });

// osmmain.ejs via ajax
app.get('/chunkreloadDOWN',(req,res) => {

    var direction = req.query.direction ;
    var username = req.query.username ;
    var firstname = req.query.firstname ;
    var title  = req.query.title.split('-')[1] ;
    varlimit += staticlimit;
    
    if (title){
      if (title.toLowerCase()=='profile'){
          var qry2 = 'SELECT postid, postpath, flag FROM osmpostindex WHERE username = "'+username+'" '+
            'ORDER BY postid DESC LIMIT '+varlimit+', '+staticlimit+' '; 

          var userdisplaydata = [];
          var filepath = [];
          getpindexdb_data(userdisplaydata, filepath, qry2, function(data){
            userdisplaydata = data[0];  // guranteed for accurate data from callback only
            filepath = data[1]  ;

            var result = {"data":userdisplaydata, "status":200,};
            res.json({"success" : result, "status" : 200});
            //res.render('mysm/osmmain', {spinfo: pageinfo, pg:userdisplaydata, username: username, search_result:""});
          });
        }

      if (title.toLowerCase()=='feeds'){
          // Load userdisplaydata in chunks size varlimit increment by staticlimit
          osmfun.load_By_DB_AllJson(function(userdisplaydata){
              var result = {"data":userdisplaydata, "status":200,};
              res.json({"success" : result, "status" : 200});

          },  varlimit, staticlimit);
        }
    }
    
    else{
      // when no title found (may be due to any error or tempering)
      // only load once means ===>> userdisplaydata would not be more than staticlimit; only at once;
      osmfun.load_By_DB_AllJson(function(userdisplaydata){
        var result = {"data":userdisplaydata, "status":200,};
        res.json({success : result, status : 200});

      },  varlimit, staticlimit);
    }
    
});

// osmmain.ejs via ajax
app.get('/chunkreloadUP',(req,res) => {
    
        var direction = req.query.direction ;
        varlimit -= staticlimit;
        //console.log('varlimit === >>> ', varlimit, 'direction === >>> ', direction) 
    
        osmfun.load_By_DB_AllJson(function(userdisplaydata){
    
        var result = {"data":userdisplaydata, "status":200,};
        res.json({success : result, status : 200});

      },  varlimit, staticlimit);
    
  });

/*

app.post('/imguplod', (req, res) => {
  
  var username = req.session.userid;
  if (!username){
    // when user name not available in session try to get from imgvalidator
    // this method could be dangerous, double check during any flaws 
    username = osmfun.imgvalidator['username']; // <<< dangerous 
  }
 
  var [uidx, jfilename, udlib, uidxlib, userdir, filepath] = osmfun.getJfilePath(username);
  //var imgtransit = Path.join(userdir,"imgtransitdir");
  //if (!fs.existsSync(imgtransit)){fs.mkdirSync(imgtransit);} 

  var imgname = username + "_"+ osmfun.getDateNumeric() +".jpg";
  var maximagesize = 100000;
  
  // ## for default user profile image when imgtransit not exists ## 
  var imgtransit = osmfun.imgtransit_Dir(userdir, username+'.jpg'); 

  let form = new formidable.IncomingForm();
  form.uploadDir = imgtransit;
  
  var wrongimg = false; 
  
  form.parse(req, (err, fields, files) => {
   
    if (wrongimg){

        res.send('<html><head>Wrong Image Type </head><body><h1>Wrong Image Type, Valid [Post .jpeg, .jpg, .png, .gif] </h1>'+
        '<form action="/osmtl/?username=<%= spinfo.user %>" enctype="multipart/form-data" method="POST">'+
        '<input type="image" src="./public/assets/img/errorimg.gif" alt="Submit"> '+
        '<br><br></form></body></html>');
        return;

       
        }
    if ('iupload' in files){
        var imgsize = files.iupload.size;
        if (imgsize > maximagesize){
            var delfilepath = files.iupload.filepath;
            fs.unlinkSync(delfilepath);
            osmfun.imgvalidator['img'] = '';
            osmfun.imgvalidator['imgbool'] = false;
            osmfun.imgvalidator['flag'] = '1';
            res.send('<html><head>Big Image Size</head><body><h1>Big Image Size, Post Small Size Image </h1>'+
            '<form action="/osmtl/?username=<%= spinfo.user %>" enctype="multipart/form-data" method="POST">'+
            '<input type="image" src="./public/assets/img/errorimg.gif" alt="Submit"> '+
            '<br><br></form></body></html>');
            return;
            
        }
        else{
            var xoldfilepath = files.iupload.filepath ;
            var xnewfilepath = Path.join(imgtransit, imgname);
            
            fs.rename(xoldfilepath, xnewfilepath, function (err) {
                if (err) {console.log('errr ### >> ', err)};
                
              });
            osmfun.imgvalidator['img'] = xnewfilepath;
            osmfun.imgvalidator['imgbool'] = true;
            osmfun.imgvalidator['flag'] = '2';
      }
    }
    //res.write('File uploaded and moved!');
    res.status(204).send();
    //res.end();
    
  });
  form.on('fileBegin', (name, file) => {
    var imgtype = file.mimetype ;

    if (imgtype.startsWith('image')){
        wrongimg = false;
        console.log('file yes', imgtype);
    }
    else{
        osmfun.imgvalidator['img'] = '';
        osmfun.imgvalidator['imgbool'] = false;
        osmfun.imgvalidator['flag'] = '1';
        wrongimg = true;
        
        var fpath = file.filepath;
        
        fs.unlinkSync(fpath);
    
        console.log('Wrong File Type ####>>>> ', imgtype)
        
    }
    
  });
  
});

app.post('/userpost', function(req, res) 
{
    var fvar = req.body //req.query;
  
    var text = fvar.upost;
    var username = req.session.userid;
    varlimit = 0 // reset to Zero from start
    if (!username){
        username = req.body.username ; //Object.entries(req.body)[0][0] ;
        req.session.userid = username;
        
        }
    if (!username){
        var pageinfo = osmfun.getPageInfo('', 'Login', '', '', false); 
        
        res.render('mysm/login' , {root:__dirname, spinfo: pageinfo});
        //return true;
         
    }
    else{
      
        if (text.trim()===""){
            res.send('<html><head>Oh... No... !! CANNOT POST EMPTY FIELD </head><body><h1>'+ 
                ' <a href="/osm-home" class="myanchor2" >Click Me To GO BACK</a> </h1></body></html>');
            return;
            }
        }
        
        osmfun.load_By_DB_AllJson(function(displaydata)
        {
               
               // retimpth().then((val) => {
               // var imgpath = val;
               // console.log(imgpath);
               var thispost = text+username; 
               var getlastindex = displaydata.length-1;
               var getlastindexdata = displaydata[getlastindex];
               var [uidx, jfilename, udlib, uidxlib, userdir, filepath] = osmfun.getJfilePath(username);
               var pageinfo = osmfun.getPageInfo(username, 'OSM-TL', 'Your New Post !', '', false); 
               var ndata = pageinfo['osm']['defdata'];
               // var imgname = username + "_"+ getDateNumeric() +".jpg";
               // var newpath = Path.join('public', 'osmimage', imgname);
               if (getlastindexdata){
                   // this will validate for data user very first post gives undefined 
                   var checkpost = getlastindexdata.text+getlastindexdata.username ;
                   // this if condition comparing will imidiate adjusent last post or validate duplicate post 
                   // on page reload or duplicate post
                   if (thispost == checkpost){
                      console.log('-------- SAME POST ....', username);
                      pageinfo['title']='OSM-Feeds'
                      // res.redirect is IMPORTANT here, this will STOP Duplicate Posting after Page Reload
                      // res.render is will post Duplicate Posting on page reload, 
                      res.redirect('osmtl/?username=' + username)
                      //res.render('mysm/osmmain', {spinfo: pageinfo, pg:displaydata, username: username, search_result:''});
                      return true;
                      }
                  }
                ndata['text']=text;
                ndata['username']=username;     
                ndata['path']=filepath;

                displaydata.push(ndata)
                
                osmfun.osmWriteFile(ndata, username, text, filepath, osmfun.imgvalidator['img'], flag=osmfun.imgvalidator['flag']);
                // sometime userid or username lost after user post; imgvalidator['username'] takeing as backup
                // there must be better method to keep alive username till user not logout
                osmfun.imgvalidator['username']=username; // <<<< keep username active inside imgvalidator
                osmfun.imgvalidator['img']='';
                osmfun.imgvalidator['imgbool']=false;
                var trendlist = osmfun.checkTrendFeed(text, filepath);
                pageinfo['title']='OSM-Feeds'
                // res.redirect is IMPORTANT here, this will STOP Duplicate Posting after Page Reload 
                // res.render is will post Duplicate Posting on page reload,  
                res.redirect('osmtl/?username=' + username)
                //res.render('mysm/osmmain', {spinfo: pageinfo, pg:displaydata, username: username, search_result:''});
           //  });
            
          },varlimit, staticlimit)
    
});
*/

module.exports.varlimit = varlimit
module.exports.staticlimit = staticlimit
module.exports.app = app