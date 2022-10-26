
var fs = require('fs');
var formidable = require('formidable');
const Path = require("path");

const osmapp = require('./userlogin');
const osmfun = require('./osmfun');

const memdbfilepath = './asset1/member.db'
const sqlite3 = require('sqlite3');
const memdb =  new sqlite3.Database(memdbfilepath);
const osmpostindexpath = './asset1/osmpostindex.db'
const pindexdb =  new sqlite3.Database(osmpostindexpath);

const app = osmapp.app ;
var imgdir = 'imgtransitdir'; // user image upload dirname

app.post('/osmpostopen', function(req, res){
  var username = req.session.userid //req.body.user;
  var firstname = req.session.firstname;
  
  osmfun.imgvalidator['img'] = ''; // clearing previous image upload data 
  osmfun.imgvalidator['imgbool'] = false; // clearing previous image upload data 
  osmfun.imgvalidator['flag'] = '1'; // clearing previous image upload data 
  //console.log(req.session)

  if (!username){
    // force assignment when session not available 
    // when user name not available redirect to Login Page
    res.redirect('/osmlogin');
    return true;
   }
  var imgdir = req.session.datadir.imgdir;
  var userdp = req.session.datadir.userdp;
  var dtype = req.session.device.type ;

  var [uidx, jfilename, udlib, uidxlib, userdir, filepath] = osmfun.getJfilePath(username);
  var pageinfo = osmfun.getPageInfo(username, firstname, 'Osm-Dart', '', '', false, userdir); 
  pageinfo['title']='OSM-DART'
  var displaydata = [];
  
  if (dtype=='desktop'){
        res.render('mysm/osmdart', {"spinfo":pageinfo, "pg":displaydata, "imgdir":imgdir,
        "userdp":userdp, "username": username, "firstname":firstname, "search_result":username+' Send Your DART'});
      }// for desktop}
  else{
    res.render('mob/osmdart', {"spinfo":pageinfo, "pg":displaydata, "imgdir":imgdir,
    "userdp":userdp, "username": username, "firstname":firstname, "search_result":username+' Send Your DART'});
     }// for other than desktop} mobile or smartphones ...

  //res.render('mysm/osmdart', {"spinfo": pageinfo, "pg":displaydata, "username": username, 
  //  "imgdir":userdp, "imgdir":userdp, "firstname":firstname, "search_result":username+' Send Your DART'});
});

app.post('/imguplod', (req, res) => {
  
  var username = req.session.userid;
  if (!username){
    // when user name not available in session try to get from imgvalidator
    // this method could be dangerous, double check during any flaws 
    username = osmfun.imgvalidator['username']; // <<< dangerous 
    res.redirect('/osmlogin');
    return true;
  }
 
  var [uidx, jfilename, udlib, uidxlib, userdir, filepath] = osmfun.getJfilePath(username);
  //var imgtransit = Path.join(userdir,"imgtransitdir");
  //if (!fs.existsSync(imgtransit)){fs.mkdirSync(imgtransit);} 

  var imgname = username + "_"+ osmfun.getDateNumeric() +".jpg";
  var maximagesize = 10000000;
  
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
    var firstname = req.session.firstname;

    var varlimit = 0 
    var staticlimit = 3

    
    if (!username){
        // // force assignment for session ids
        // username = req.body.username ; //Object.entries(req.body)[0][0] ;
        // firstname = req.body.firstname ;
        // req.session.userid = username;
        // req.session.username = username;
        // req.session.firstname = firstname;
        
        // when user name not available in session try to get from imgvalidator
        // this method could be dangerous, double check during any flaws 
        res.redirect('/osmlogin');
        return true;
        }
    //console.log('username',username)
      
    if (text.trim()===""){
        res.send('<html><head>Oh... No... !! CANNOT POST EMPTY FIELD </head><body><h1>'+ 
            ' <a href="/osm-home" class="myanchor2" >Click Me To GO BACK</a> </h1></body></html>');
        return;
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
               var pageinfo = osmfun.getPageInfo(username, firstname, 'OSM-TL', 'Your New Post !', '', false, userdir); 
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
                      ///*** res.redirect is IMPORTANT here, this will STOP Duplicate Posting after Page Reload ***//
                      ///*** res.render is will post Duplicate Posting on page reload,  ***//
                      //res.redirect('osmtl/?username=' + username)
                      res.redirect('osmtl/')
                      //res.render('mysm/osmmain', {"spinfo":pageinfo, "pg":displaydata, 
                      //  "imgdir":imgdir, "username": username, "search_result":""});
                      
                      return true;
                      }
                  }
                ndata['text']=text;
                ndata['username']=username;     
                ndata['path']=filepath;

                displaydata.push(ndata)
                
                osmfun.osmWriteFile(ndata, username, firstname, text, filepath, osmfun.imgvalidator['img'], flag=osmfun.imgvalidator['flag']);
                // sometime userid or username lost after user post; imgvalidator['username'] takeing as backup
                // there must be better method to keep alive username till user not logout
                osmfun.imgvalidator['username']=username; // <<<< keep username active inside imgvalidator
                osmfun.imgvalidator['img']='';
                osmfun.imgvalidator['imgbool']=false;
                var trendlist = osmfun.checkTrendFeed(text, filepath);
                pageinfo['title']='OSM-Feeds'
                ///*** res.redirect is IMPORTANT here, this will STOP Duplicate Posting after Page Reload ***//
                ///*** res.render is will post Duplicate Posting on page reload,  ***//
                //res.redirect('osmtl/?username=' + username)
                res.redirect('osmtl/')
                //res.render('mysm/osmmain', {"spinfo":pageinfo, "pg":displaydata, 
                      //  "imgdir":imgdir, "username": username, "search_result":""});
           //  });
            
          },varlimit, staticlimit)
    
});


module.exports.app = app