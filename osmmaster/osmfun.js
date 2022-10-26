
const fs = require('fs');
const Path = require("path");
const sqlite3 = require('sqlite3');
const memdbfilepath = './asset1/member.db'
const memdb =  new sqlite3.Database(memdbfilepath);
const osmpostindexpath = './asset1/osmpostindex.db'
const pindexdb =  new sqlite3.Database(osmpostindexpath);
const osmapp = require('./userlogin');
var staticlimit = osmapp.staticlimit ; // 3 // this is fixed chunk size; 
//console.log("stlmt", staticlimit); 
// this will add and subtract as user scroll up or down; and load post in chunck size
// had have to calculate as per scroll movement, and flush after page reload 
var varlimit= osmapp.varlimit ;
//console.log("varlmt", varlimit);
var trendlib = 'trendlib';
var imgvalidator = {'img' : "", 'imgbool' : false, 'username':'', 'flag':'1'};
var imgtransitdir = "imgtransitdir"

var replydefdata = {"rcount":0, "lcount":0, "dcount":0,
                0:{"created":"", "img":"", "username":"","firstname":"", "text":"","path":"",
                "lcount":0,"dcount":0,"like":"","dislike":"","vid":"","vote":"",
                "ld":{"lcount":0, "dcount":0,"username":{},"firstname":""},
                "reply":{},},}

function fillreplydefdata(idx, img, vid, vote, username, firstname, text, setpath){
    var strdate = getDateFormat();
    
    var newreplydata = {"created":strdate,"img":img, "username":username, 
     "firstname":firstname,"replypath":setpath,"path":setpath,"lcount":0,"dcount":0,"like":"","dislike":"", 
      "vid":vid,"vote":vote, "ld":{"lcount":0, "dcount":0,"username":{},"firstname":""},"reply":{}}
    
    
    return newreplydata
}

function fillreplyMainTextdefdata(username, firstname, text){
    var strdate = getDateFormat();
    return {"created":strdate, "img":"", "text":text,"username":username,
        "firstname":firstname,"vid":"", "vote":"", "like":"", "dislike":"","path":"",
           'ld':{"lcount":0, "dcount":0,"username":{},}, 
            "reply":replydefdata };
    }

function getPageInfo(name, firstname, title, info, alert, log, userdir){
    var strdate = getDateFormat();
    var userinfo = "";
    
    var userdp = Path.join(userdir, imgtransitdir, name+'.jpg')
    var notefilepath = Path.join(userdir, "ldr", "notification.json")
    try{
        var notecount = JSON.parse(fs.readFileSync(notefilepath, "utf8")).count.toString();
        
    } catch(err){
        var notecount = "";
    }
    
    var defdata = {"created":strdate, "img":"", "text":"Well-Come To OSM","username":"",
         "vid":"", "vote":"", "like":"", "dislike":"","path":null,
           'ld':{"lcount":0, "dcount":0,"username":{},}, 
            "reply":replydefdata };

    var pageinfo = {'title':title, 'user':name, 'username':name, 'firstname':firstname, 
    'info':info, 'alert':alert,'userdp':userdp, 'notecount':notecount,
    'osm':{'usave':'','load':'','adduser':false,'alert':'','log':log,'defdata':defdata,
    'jmaindir':'osmlib', 'jfilename':'2022.json', 'username':'','userdata':name,},
        'word' : '', 'tf' : 'Meaning', 'meaning' : '', 'field' : false}
    return  pageinfo ;        
}

function getDateFormat(){
    var dtt = new Date();
    var myyy = (dtt.getFullYear()).toString()
    var mymm = (dtt.getMonth()+1).toString();
    var mydd = (dtt.getDate()).toString();
    var myhh = dtt.getHours().toString();
    var mymi = dtt.getMinutes().toString();
    var myse = dtt.getSeconds().toString();

    if (mydd < 10){mydd = '0' + mydd};
    if (mymm < 10){mymm = '0' + mymm};
    if (mymi < 10){mymi = '0' + mymi};
    if (myse < 10){myse = '0' + myse};
    if (myhh < 10){myhh = '0' + myhh};
    dtstr = [mydd,mymm,myyy].join('/');
    tmstr = [myhh,mymi,myse].join(':');
    return [dtstr,tmstr].join('-');  
  }

function getDateNumeric(){
    var dtt = new Date();
    var myyy = (dtt.getYear()-100).toString()
    var mymm = (dtt.getMonth()+1).toString();
    var mydd = (dtt.getDate()).toString();
    var myhh = dtt.getHours().toString();
    var mymi = dtt.getMinutes().toString();
    var myse = dtt.getSeconds().toString();

    if (mydd < 10){mydd = '0' + mydd};
    if (mymm < 10){mymm = '0' + mymm};
    if (mymi < 10){mymi = '0' + mymi};
    if (myse < 10){myse = '0' + myse};
    if (myhh < 10){myhh = '0' + myhh};
    return [myyy,mymm,mydd,myhh,mymi,myse].join('');  
  }

function getJfilePath(name){
    var udlib = 'osmlib';
    var uidx = name.slice(0, 1); 
    var jfilename = getDateNumeric()+'.json';

    //var udlib = Path.join(' ..', jmaindir);
    //var udlib = jmaindir // relative path adjacent to running server directory
    //var udlib = Path.join('.', jmaindir); // relative path '.' adjacent to running server directory
    
    //var udlib = Path.join(__dirname, jmaindir); //__dirname + '//'+ jmaindir; // all user data will store inside this directory
    
    var uidxlib = Path.join(udlib, uidx); //udlib+ '//'+uidx;        // user first name index directory; sorting by user name index
    var userdir = Path.join(udlib, uidx, name); //udlib+ '//'+uidx+'//'+name; // username directory; all data for same user store inside this dir  
    var userimgdir = Path.join(userdir, imgtransitdir);
    var ldrdir = Path.join(userdir, 'ldr');
    var ldridxpath = Path.join(userdir, 'ldr', 'ldr_index.json');
    var ldrnotepath = Path.join(userdir, 'ldr', 'notification.json');
    var aboutpath = Path.join(userdir, 'ldr', 'about.json');
    var ldrimgdir = Path.join(userdir, 'ldr', imgtransitdir);
    var userdp = Path.join(userdir, imgtransitdir, name+".jpg");
    var trendlib = "trendlib" ;

    var dirobj = {"userimgdir":userimgdir, "ldrdir":ldrdir, "udlib":udlib, "imgtransitdir_name":imgtransitdir,
                  "ldridxpath":ldridxpath, "ldrnotepath":ldrnotepath,"aboutpath":aboutpath,
                  "ldrimgdir":ldrimgdir, "userdp":userdp, "trendlib":trendlib}
                  
    var filepath = Path.join(udlib, uidx, name, jfilename); //udlib+'//'+uidx+'//'+name+'//'+jfilename;
    
    return [uidx, jfilename, dirobj, uidxlib, userdir, filepath];
}

function readAlljson(name){
    var userdisplaydata = [];
    var filepath = [];
    pindexdb.serialize(function() {
        var qry = 'SELECT postid, postpath, flag FROM osmpostindex WHERE username = "'+name+'" ORDER BY postid DESC LIMIT '+osmapp.varlimit+' ,'+osmapp.staticlimit+'';  

        //var userdisplaydata = [];
        //var filepath = [];
        pindexdb.all(qry, function(err, row) {
            if(err != null){console.log(err);}
            if(row){
                for (let i in row){
                   // console.log("------------into loop------------", row);
                    var postpath = row[i].postpath ;
                    userdisplaydata.push(JSON.parse(fs.readFileSync(postpath, "utf8"))); 
                    filepath.push(postpath);
                  //  console.log(userdisplaydata, "-------------- into loop od usrddt ------------")
                 }
               }
            });
           
       // return [userdisplaydata, filepath] ;
    });
    return [userdisplaydata, filepath];
}

function to_Delete_Old_readAlljson(name){
    var [uidx, jfilename, udlib, uidxlib, userdir, filepath] = getJfilePath(name);
    // /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////console.log(udlib, uidxlib , userdir);
    var userdisplaydata = [];
    var firstname = 'from deleted function'; 
    // Related to readJsonFromDir() READ BEFORE MAKING ANY CHANGE
    fs.readdirSync(userdir).forEach(file => {
      var updtpath = Path.join(userdir, file);
      if (file.endsWith('.json')){
        var updtpath = Path.join(userdir, file);
        var rawdata = fs.readFileSync(updtpath, "utf8");
        var xdata = JSON.parse(rawdata);
        //                                        console.log("this is xdata", xdata.text);
        userdisplaydata.push(xdata);
      }
      /*  
      var updtpath = Path.join(userdir, file);
      var rawdata = fs.readFileSync(updtpath, "utf8");

      xdata = JSON.parse(rawdata);
     //                                        console.log("this is xdata", xdata.text);
      userdisplaydata.push(xdata);
      */
    });    
    if (userdisplaydata.length===0){
        var pageinfo = getPageInfo(name, firstname, 'MyOSM', 'Well-Come '+name, '', true, userdir); 
        var defdata = pageinfo['osm']['defdata'];
        defdata["username"]=name;
        userdisplaydata.push(defdata);
        };
    
    //pageinfo['osm']['userdata']=userdisplaydata; 
    return [userdisplaydata, filepath] ;
    }

    
function testreadJsonFromDir (folder, dicobj, xfiles) {
    //const map1 = mew Map();

    fs.readdirSync(folder).forEach(file => {
        // Related to readAllJson() READ BEFORE MAKING ANY CHANGE 
        const setjasonfilepath = Path.join(folder, file);
        if (file.endsWith('.json')){
            console.log(setjasonfilepath)
            //xfiles.push(JSON.parse(fs.readFileSync(orderedfiles[item], "utf8")));
            //dicobj[file]=setjasonfilepath;
            return dicobj //xfiles.push(dicobj);
        }
        });
    };

    var load_By_DB_AllJson = function(callback, varlimit, staticlimit){
        //var xdb =  new sqlite3.Database(memdbfilepath);
        
        pindexdb.serialize(function() {
            var qry = 'SELECT postid, postpath, flag FROM osmpostindex ORDER BY postid DESC LIMIT '+varlimit+', '+staticlimit+' ';  
            
            var userkv = {};
            pindexdb.all(qry, function(err, row) {
                var datafiles = [];
                var dicobj = {};
                if(err != null){console.log(err);callback(err);}
                if(row){
                    for (let i in row) {
                        /*
                        var postpath = row[i].postpath
                        var pathsplit = postpath.split('\\');
                        var pathsplitlen = pathsplit.length-1
                        var jfilename = pathsplit.pop();
                        var userdir = postpath.split(jfilename)[0]
                        userdir = userdir.slice(0, userdir.length-1)
                        // username exists at second last position
                        var getusernameslicelen = pathsplit.length-2 
                        var name = pathsplit.slice(getusernameslicelen, pathsplitlen)[0]
                        */
                        datafiles.push(JSON.parse(fs.readFileSync(row[i].postpath, "utf8")));   
                    }
                 } 
                callback(datafiles);
            });
        });

        
        /*
        memdb.serialize(function() {
            // getting all username that exists
            var qry = 'SELECT username FROM member ';  
            memdb.all(qry, function(err, row) {
                if(err != null){
                    console.log(err);
                    callback(err);
                }
                var datafiles = [];
                var dicobj = {};
                var name = '';

            for (let i = 0; i < row.length; i++) {
                name = row[i].username

                var [uidx, jfilename, udlib, uidxlib, userdir, filepath] = getJfilePath(name);
                readJsonFromDir(userdir, dicobj, datafiles);
                } 
            var orderedfiles = getOrderedFiles(dicobj);

            for (var item in orderedfiles){
                datafiles.push(JSON.parse(fs.readFileSync(orderedfiles[item], "utf8")));
                }
            
            callback(datafiles);
            //xdb.close();

            });


        });
        */
    }

function getOrderedFiles(dicobj){
    var ordereddata = Object.keys(dicobj).sort().reduce(
          (obj, key) => { 
            obj[key] = dicobj[key]; 
            return obj;
          }, 
            {}
            );
      return ordereddata;
        }

function readJsonFromDir (folder, dicobj, xfiles) {
    //const map1 = mew Map();

    fs.readdirSync(folder).forEach(file => {
        // Related to readAllJson() READ BEFORE MAKING ANY CHANGE 
        const setjasonfilepath = Path.join(folder, file);
        if (file.endsWith('.json')){
            
            dicobj[file]=setjasonfilepath;
            return dicobj //xfiles.push(dicobj);
        }
        });
    };

function osmReadFileRG(name){
    var [uidx, jfilename, udlib, uidxlib, userdir, filepath] = getJfilePath(name);
    //var data = [{}];

    fs.readdir(userdir, (err, files) => {
          files.forEach(file => {
            var updtpath = userdir+'//'+file ;
            var rawdata = fs.readFileSync(updtpath, "utf8");
            var data = JSON.parse(rawdata);
            return data;
          });
        });
 }


async function osmWriteFile(data, username, firstname, text, filepath, imagefilepath, flag='1'){
    //fs.writeFile(filepath, JSON.stringify(data));
    data['path']=filepath;
    data['username']=username;
    data['firstname']=firstname;
    data['text']=text;
    data['img']= imagefilepath;
    
    data['rcount']='0';
    data['lcount']='0';
    data['dcount']='0';
    //if (!fs.existsSync(filepath)){
   //     console.log('create file...')
    //}
    await fs.promises.writeFile(filepath, JSON.stringify(data), {encoding:"utf8"}); // UTF-8 is default
    postIndexInsert(filepath, username, flag);
    
    }

function getTrendPath(trendname){
    var trendib = 'trendlib';
    var firstchar = trendname.slice(0, 1); 
    var firstleveldir = Path.join(trendib, firstchar);
    var trendlen = trendname.length ;
    var trendlenstr = trendlen.toString() ;
    var secondleveldir = Path.join(firstleveldir, firstchar+trendlenstr );
    var lastchar = trendname.slice(trendlen-1, trendlen);
    var thirdleveldir = Path.join(secondleveldir, firstchar+trendlenstr+lastchar );
    var trendfilepath = Path.join(thirdleveldir, trendname+'.json');
    
    return {"trendib":trendib, "firstchar":firstchar, "lastchar":lastchar, "trendlen":trendlenstr, 
            "firstleveldir":firstleveldir, "secondleveldir":secondleveldir, "thirdleveldir":thirdleveldir, 
            "trendfilepath":trendfilepath };
    }

function checkTrendFeed(gettext, usermainppath){
    //var mtext = gettext.replace(/(?:\\[rn]|[\r\n]+)+/g, "");
    var mtext = gettext.replace(/(?:\\[rn]|[\r\n]+)+/g, " ").trim();
    
    var textlist = Array.from(new Set(mtext.split(' '))); // unique word list
    
    var trendlist = [];
     
    for (let i = 0; i < textlist.length; i++) {
        if (textlist[i].startsWith('#')) {
            var trendname = textlist[i].replace("#", "") ; 
            //console.log('trendname',trendname) 
            osmTrendWriteFile(trendname, usermainppath);
          }
      }
  }

function osmTrendWriteFile(trendname, usermainppath){
    var tobj = getTrendPath(trendname) ;
    
    var trendib = tobj['trendlib'];
    var firstchar = tobj['firstchar'];
    var firstleveldir = tobj['firstleveldir'];
    var trendlen = tobj['trendlen'];
    var secondleveldir = tobj['secondleveldir'];
    var lastchar = tobj['lastchar'];
    var thirdleveldir = tobj['thirdleveldir'];
    var trendfilepath = tobj['trendfilepath'];
   
    if (!fs.existsSync(thirdleveldir)){
       // first check third level directory, if not than create... 
       if (!fs.existsSync(firstleveldir)){
        fs.mkdirSync(firstleveldir);
    }
       // user first name index directory; sorting by user name index
       if (!fs.existsSync(secondleveldir)){
        fs.mkdirSync(secondleveldir);
    }
       
       fs.mkdirSync(thirdleveldir);
       // default Empty file create initially;
       var tdata = {"count":0,"created":getDateFormat(), "path":[]}

       fs.writeFileSync(trendfilepath, JSON.stringify(tdata), 'utf8');
    }
    
    var tdata = JSON.parse(fs.readFileSync(trendfilepath, "utf8")); 
    tdata.count += 1 ;
    tdata.path.push(usermainppath);
    fs.writeFileSync(trendfilepath, JSON.stringify(tdata), 'utf8');

    // fs.writeFile(trendfilepath, JSON.stringify(tdata), {encoding:"utf8",flag:"w"},(err) => {
    //   if (err){
    //     text = err.toString()
    //     console.log("Error on osmTrendWriteFile writeFile >>> ", text) ;
    //   }
    // });
        
    return tobj;
}

function osmTrendReadFile(trendname, readdata=false, limitrange=[0,0]){
    var tname = trendname.replace("#","")
    var tobj = getTrendPath(tname) ;
    var tfilepath = tobj.trendfilepath ;
    var result = {"data":[]};
    if (readdata){
        var gettdata = JSON.parse(fs.readFileSync(tfilepath, "utf8")); 
        var getfilelist = gettdata.path.reverse() ; // Last post appear first
        var userdisplaydata = [] ;
        result = {} ;
        //for (var i = 0; i < getfilelist.length; i++){
        for (var i = limitrange[0]; i < limitrange[1]; i++){
            var getfilepath = getfilelist[i] ;
            if (getfilepath){ 
                // if index of getfilelist array not exists it gives undefined, using if argument here
                userdisplaydata.push(JSON.parse(fs.readFileSync(getfilepath, "utf8"))); 
             }
            
            //console.log(rawdata)
        }
        
        return userdisplaydata;
        //var rawdata = JSON.parse(fs.readFileSync(getfilepath.path, "utf8")); 
        //console.log(rawdata)
        //return {"data":[rawdata]};
        }
    else{
        // try{
        // var flf = (fs.readdirSync(tobj['firstleveldir'], "utf8" ))
        //     //console.log(tobj['firstleveldir'], flf)
        //     var flistarray = [];
        //     for (var i = 0; i < flf.length; i++){
        //         //var fname = flf[i] ;
        //         var flvl = Path.join(tobj['firstleveldir'],  flf[i]) ;
        //         var fpath = fs.readdirSync(flvl, "utf8" )
        //         var slvl = fs.readdirSync(Path.join(flvl, fpath[0]), "utf8" ) 
        //         flistarray.push(slvl[0])
        //         //console.log(slvl, fpath)
        //        }
        //     }
            
        // catch(err){}
        // console.log(trendname.length, trendname)
        // return {"data":flistarray};

        if (!fs.existsSync(tobj['firstleveldir'])){return {"data":[]};}
        if (!fs.existsSync(tobj['secondleveldir'])){return {"data":[]};}
        if (!fs.existsSync(tobj['thirdleveldir'])){return {"data":[]};}
        return {"data":fs.readdirSync(tobj['thirdleveldir'], "utf8" )};
        // finally when all required directory exists, 
        // last check if trend name file exists or not
        // var lf = (fs.readdirSync(tobj['thirdleveldir'], "utf8" ))
        // var getfname = lf[0].replace(".json", "") 
        // var gettlist = []
        // if (trendname.length == getfname.length){
        //     for (var i = 0; i < lf.length; i++){
        //         getfname = lf[i].replace(".json", "") 
        //         if (getfname.toLowerCase() == trendname.toLowerCase()){
        //             gettlist.push(getfname) 
        //         } 
        //     }
        //     return {"data":gettlist};
        // }
        // else{return {"data":lf};}
        //return {"data":[JSON.parse(fs.readdirSync(tobj['thirdleveldir'], "utf8" ))]};
       

        // if (fs.existsSync(tfilepath)) {
        //     return {"data":[tname]};
        // }
    }
    
    return result;
    }


function osmWriteFile_LDR(filepath, fdata){
    fs.writeFile(filepath, JSON.stringify(fdata), function writeJSON(err) {
      if (err) return err;
      else return false;
     });
    return fdata
    }

function osmfileCreate(name, firstname, flag='1'){
    var [uidx, jfilename, dirobj, uidxlib, userdir, filepath] = getJfilePath(name);
    // default data 
    var udlib = dirobj.udlib ;
    
    let strdate = getDateFormat();
    var pageinfo = getPageInfo('', '', '', '', '', false, userdir); 
    var data = pageinfo['osm']['defdata'];
    var wellcomestr = name + " Well-Come to OSM !!"
    var imgname = name +".jpg";
    var ldrdir = Path.join(userdir, 'ldr') 
    var ldrdirimg = Path.join(userdir, 'ldr', imgtransitdir) 
    var ldrjpath = Path.join(userdir, 'ldr', 'ldr_index.json');
    var fdata = {"likecount":0,"replycount":0,"imgcount":0,"dislikecount":0,"vidcount":0,
          "votecount":0,"filename":""}
    

    var ldrnotepath = dirobj.ldrnotepath ;
    var notedata = {"shownotification":false,"count":0,"varcount":0, "users":{"0":{"path":"","username":"","firstname":"","type":""}}}

    var aboutpath = dirobj.aboutpath ;
    var aboutdata = {"about":"", "description":"", "key":"", "bannerimg":"//public//assets//img//banner.jpg"};

    if (!fs.existsSync(udlib)){fs.mkdirSync(udlib);} 

    if (!fs.existsSync(uidxlib)){
        fs.mkdirSync(uidxlib);
        fs.mkdirSync(userdir);
        var imgtransit = imgtransit_Dir(userdir, imgname);
        osmWriteFile(data, name, firstname, wellcomestr, filepath, "", flag=flag);
        } 
    else{
        if (!fs.existsSync(userdir)){
            fs.mkdirSync(userdir);
            var imgtransit = imgtransit_Dir(userdir, imgname);
            osmWriteFile(data, name, firstname, wellcomestr, filepath, "", flag=flag);
            } 
        else{
            var imgtransit = imgtransit_Dir(userdir, imgname);
            osmWriteFile(data, name, firstname, wellcomestr, filepath, "", flag=flag);
        }
        }
      fs.mkdirSync(ldrdir)
      fs.mkdirSync(ldrdirimg)
      fs.writeFileSync(ldrjpath, JSON.stringify(fdata), 'utf8');
      fs.writeFileSync(ldrnotepath, JSON.stringify(notedata), 'utf8');
      fs.writeFileSync(aboutpath, JSON.stringify(aboutdata), 'utf8');
     }


function imgtransit_Dir(userdir, userimg, targetdir="imgtransitdir"){
    var imgtransit = Path.join(userdir, targetdir);
    if (!fs.existsSync(imgtransit)){
        fs.mkdirSync(imgtransit);
        var srcDir = 'public/assets/img/osmuser.jpg';
        var targetdirname = Path.join(imgtransit, userimg);
        try{
        fs.copyFileSync(srcDir, targetdirname, { overwrite: true|false })
        }
        catch{
            
        }
      } 
    return imgtransit
}

function postIndexInsert(postpath, username, flag='1'){
    var pindexdb = new sqlite3.Database(osmpostindexpath); // Taking New every time connection
    // flag is used as identifier example:
    // {0:'wellcome post', 1:'text without image', 2:'text with image', 3:'text with video', 4:'text with votes'} etc. ..
    var qry = 'INSERT INTO osmpostindex (postpath, username, flag) VALUES ("'+postpath+'","'+username+'","'+flag+'")' 
    pindexdb.all(qry, function (error, rows){
        // returning as array at zeroth index decleare success or abourt(true, false)
        if (error){
            console.log(' ======>>> Error while writing postIndexInsert function' ,error)
            return [false, error];
          } 
        else{return [true, 'Index Added Successfully']}
    });
    pindexdb.close(); //closing connection
  }

function checkNotifications(username, mainuser, mainfirstname, replyjpath, type, notificationpath){

    if (!notificationpath){
        var [uidx, jfilename, dirobj, uidxlib, userdir, filepath] = getJfilePath(username);
        notificationpath = dirobj.ldrnotepath
    }
    
    var njpath = notificationpath ; 
    if (type == 'entry'){
        var njdata = JSON.parse(fs.readFileSync(njpath, "utf8"));
        njdata.shownotification = true ;
        njdata.count += 1 ;
        njdata.varcount += 1; // varcound never reset to ZERO; always increment by one
        njdata.users[njdata.varcount.toString()]={"path":replyjpath,
                        "username":mainuser, "firstname":mainfirstname,"type":type}
        fs.writeFileSync(njpath, JSON.stringify(njdata), 'utf8');
        
      }
    else{
        var njdata = JSON.parse(fs.readFileSync(njpath, "utf8"));
        njdata.shownotification = false ;
        njdata.count = 0 ;
        fs.writeFileSync(njpath, JSON.stringify(njdata), 'utf8');
      }
      return njdata;
}


module.exports.getPageInfo = getPageInfo
module.exports.getDateFormat = getDateFormat
module.exports.getDateNumeric = getDateNumeric
module.exports.getJfilePath = getJfilePath
module.exports.readAlljson = readAlljson
module.exports.load_By_DB_AllJson = load_By_DB_AllJson 
module.exports.getOrderedFiles = getOrderedFiles
module.exports.readJsonFromDir = readJsonFromDir
//module.exports.osmReadFileRG = osmReadFileRG

module.exports.osmWriteFile = osmWriteFile
module.exports.osmTrendReadFile = osmTrendReadFile
module.exports.getTrendPath = getTrendPath
module.exports.osmTrendWriteFile = osmTrendWriteFile
module.exports.osmWriteFile_LDR = osmWriteFile_LDR
module.exports.osmfileCreate = osmfileCreate
module.exports.checkTrendFeed = checkTrendFeed
module.exports.imgtransit_Dir = imgtransit_Dir
module.exports.postIndexInsert = postIndexInsert
module.exports.imgtransitdir = imgtransitdir
module.exports.imgvalidator = imgvalidator
module.exports.fillreplydefdata = fillreplydefdata
module.exports.fillreplyMainTextdefdata = fillreplyMainTextdefdata
module.exports.checkNotifications = checkNotifications