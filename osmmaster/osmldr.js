
var fs = require('fs');
var formidable = require('formidable');
const Path = require("path");
const osmapp = require('./userlogin');
const osmfun = require('./osmfun');
//const sessions = require('express-session');

const app = osmapp.app ;

var imgdir = 'imgtransitdir'; // user image upload dirname


app.post('/osmexpand', function(req, res) {
    
    var mainuser      = req.session.username ;
    var mainfirstname = req.session.firstname ;
    var getbody = req.body
    //var [mainuser, mainfirstname] = getbody.mainuser.split('-') ;
    var ppath = getbody.ppath;

    osmfun.imgvalidator['img'] = ''; // clearing previous image upload data 
    osmfun.imgvalidator['imgbool'] = false; // clearing previous image upload data 
    osmfun.imgvalidator['flag'] = '1'; // clearing previous image upload data 

    if (!mainuser){
        // when user name not available in session try to get from imgvalidator
        // this method could be dangerous, double check during any flaws 
        res.redirect('/osmlogin');
        return true;
      }

    var imgdir = req.session.datadir.imgdir;
    var userdp = req.session.datadir.userdp;
    var dtype = req.session.device.type ;

    var [uidx, jfilename, dirobj, uidxlib, userdir, filepath] = osmfun.getJfilePath(mainuser);
    
    try {
        var userdisplaydata = JSON.parse(getbody.postdata);
        }
    catch(err){
        // problem raised from osmmain.ejs about JSON DATA -->> JSON.parse
        // that is why this alternate method is used 
        var userdisplaydata = JSON.parse(fs.readFileSync(ppath, "utf8")); 
        
    } 
    var username = userdisplaydata.username
    var firstname = userdisplaydata.firstname
    var search_result = '@'+mainuser+' ['+mainfirstname+'] DART TO : @'+username+' ['+firstname+']';
    
    var [uidx, jfilename, udlib, uidxlib, userdir, filepath] = osmfun.getJfilePath(mainuser);
    var pageinfo = osmfun.getPageInfo(mainuser, mainfirstname, 'Expand', search_result, '', false, userdir); 
    var replydt = {}
    for (let [key, value] of Object.entries(userdisplaydata['reply'])){
        if(isNaN(parseInt(value))){ 
            // removing Empty or Empty WhiteSpace
            if(value.path.replace(/\s/g, '')){
              var rdt = JSON.parse(fs.readFileSync(value.path, "utf8"));  
              // exchanging temporarylily file based to replied user name
              rdt['username']  = value['username'] ;
              rdt['firstname'] = value['firstname'] ;
              rdt['img'] = value['img'] ;
              //console.log(value)
              replydt[key]=rdt
          }
        }
        
    }
    
    // delete temporarylily file based reply key value pair (which contains text path only)
    delete userdisplaydata['reply'] ;
    // update userdisplaydata; so that, userdisplaydata is ready to display reply data
    userdisplaydata['reply']=replydt;

    if (dtype=='desktop'){
        res.render('mysm/osmexpand', {"spinfo":pageinfo, "pg":userdisplaydata, "textdt":userdisplaydata, "imgdir":imgdir,
        "userdp":userdp, "username": mainuser, "firstname":mainfirstname, "search_result":search_result});
      }// for desktop}
    else{
        res.render('mob/osmexpand', {"spinfo":pageinfo, "pg":userdisplaydata, "textdt":userdisplaydata, "imgdir":imgdir,
        "userdp":userdp, "username": mainuser, "firstname":mainfirstname, "search_result":search_result});
     }// for other than desktop} mobile or smartphones ...

    // res.render('mysm/osmexpand', {"spinfo":pageinfo, "textdt":userdisplaydata, "userdp":userdp,
    //         "imgdir":imgdir, "username": mainuser, "firstname":mainfirstname, "search_result":search_result});
    });


app.post('/userreplyimguplod/:username/:firstname/:filepath', function(req, res){

    var username = req.params.username;
    var firstname = req.params.firstname;
    var mainuser = req.session.userid;
    var mainfirstname = req.session.firstname;
    var imggiven = false;
    var wrongimg = false; 
    var maximagesize = 100000;

    if (!mainuser){
        // when user name not available in session try to get from imgvalidator
        // this method could be dangerous, double check during any flaws 
        res.redirect('/osmlogin');
        return true;
      }
    var [uidx, jfilename, udlib, uidxlib, userdir, filepath] = osmfun.getJfilePath(mainuser);
    var ldrjpath = Path.join(userdir, 'ldr', 'ldr_index.json');
    
    var fdata = JSON.parse(fs.readFileSync(ldrjpath, "utf8"));
    fdata.imgcount += 1;
    var imgid = fdata.imgcount.toString() ;
    
    var replyjfilepath = req.params.filepath.split('.json')[0]
    
    // >>> imgid is number which is incrementing by one 
    // >>> followed by '__' double underscore identifier for split
    // >>> after main json file path extension replaced by .jpg
    // >>> replyjfilepath <<< BECAUSE image does not alone belongs to any relative identity >>>
    var imgname = imgid+'__'+replyjfilepath+".jpg";
    // >>> the FIRST part >>> imgid would be usefull while reading files one by one 'chuncksize'
    // >>> before reading files we have to find that if file startswith 0, or 1 or 2 ...
    // >>> if file found via startswith we will add another chunk size and find file by starswith


    var imgpath = Path.join(userdir, 'ldr', osmfun.imgtransitdir, imgname);
    fdata['filename']=imgpath
    // reading 'ldr_index.json' data (so that we can set next sequence of file name, img and text
    // and send image upload path + image file name to main userPOST method; where it will make empty )
    fs.writeFileSync(ldrjpath, JSON.stringify(fdata), 'utf8');
    
    var imgtransit = Path.join(userdir, 'ldr', osmfun.imgtransitdir);
    let form = new formidable.IncomingForm();
    form.uploadDir = imgtransit;
    
    form.parse(req, (err, fields, files) => {
        if (imggiven){
            var xoldfilepath = files.iupload.filepath ;
            var xnewfilepath = Path.join(imgtransit, imgname);
            
            fs.rename(xoldfilepath, xnewfilepath, function (err) {
                if (err) {console.log('errr ### >> ', err)};
              });
        }
       res.status(204).send();
    })

    form.on('fileBegin', (name, file) => {
        var imgtype = file.mimetype ;
        if (file.originalFilename){
            imggiven = true;
        }
        else{res.status(204).send();   return ;}

        if (imgtype.startsWith('image')){
          wrongimg = false;
          console.log('file yes', imgtype);
         }
        else{
            wrongimg = true;
            
            var fpath = file.filepath;
            
            fs.unlinkSync(fpath);
        
            console.log('Wrong File Type ####>>>> ', imgtype)
        
       }
    })
    
})

app.post('/userreplypost', function(req, res){
    var username = req.body.username;
    var firstname = req.body.firstname;
    var mainuser = req.body.mainuser;
    var mainfirstname = req.body.mainfirstname;
    var masterreplyfilepath = req.body.masterreplyfilepath;
    var replytext = req.body.replyupost;
    
    if (!mainuser){
        // when user name not available in session try to get from imgvalidator
        // this method could be dangerous, double check during any flaws 
        res.redirect('/osmlogin');
        return true;
      }
    
    // we have to update actual post json data path
    // and
    // create another reply json file with reply text in mainuser set default directory  
    // so, the actual reply or text will remain only at ONE place 
    var [uidx, jfilename, dirobj, uidxlib, userdir, filepath] = osmfun.getJfilePath(mainuser);
    
    var ldrjpath = Path.join(userdir, 'ldr', 'ldr_index.json');
    // reading 'ldr_index.json' data (so that we can write next sequence of file name, img and text)
    var fdata = JSON.parse(fs.readFileSync(ldrjpath, "utf8"));
    var imgpath = fdata.filename ;
    fdata.replycount += 1;
    var replyid = fdata.replycount.toString() ;

    // >>> imgid is number which is incrementing by one 
    // >>> followed by '__' double underscore identifier for split
    // >>> after main json file path extension replaced by .jpg
    var replyjsonfilename = replyid+'__'+jfilename;
    var replyjpath = Path.join(userdir, 'ldr', replyjsonfilename);
    var replymainjdata = osmfun.fillreplyMainTextdefdata(username, firstname, replytext)
    // >>> the FIRST part >>> imgid would be usefull while reading files one by one 'chuncksize'
    // >>> before reading files we have to find that if file startswith 0, or 1 or 2 ...
    // >>> if file found via startswith we will add another chunk size and find file by starswith
    replymainjdata['path']=replyjpath // update path here
    replymainjdata['masterfilepath']=masterreplyfilepath // Master file on which reply  
    replymainjdata['referencepath']="" // reply of reply ....
    
    var vidpath = ""
    var votepath = ""
    
    fdata['filename']="";
    
    // updating ldr 'ldr_index.json' 
    fs.writeFileSync(ldrjpath, JSON.stringify(fdata), 'utf8');
    // Creating New json file text data (user that reply on main post, at user own path)
    fs.writeFileSync(replyjpath, JSON.stringify(replymainjdata), 'utf8');

    var replyfilepathdata = JSON.parse(fs.readFileSync(masterreplyfilepath, "utf8"));
    var replycount = parseInt(replyfilepathdata['rcount'])+1 ;
    replyfilepathdata['rcount']=replycount ;
    // filling json data on pre-defined template; these template are unified (can made any changes at one place)
    var replydefdata = osmfun.fillreplydefdata(replycount, imgpath, vidpath, votepath, 
        mainuser, mainfirstname, replytext, replyjpath); 
    replyfilepathdata['reply'][replycount]=replydefdata
    // updating masterreplyfilepath i.e main post on which reply has been made
    fs.writeFileSync(masterreplyfilepath, JSON.stringify(replyfilepathdata), 'utf8');
    //console.log('replyfilepathdata >>> ',replyfilepathdata)

    // notification data have to set to user who is the main post holder 
    // NOT who is making reply // reply notification Entry
    var notificationdata = osmfun.checkNotifications(username, mainuser, mainfirstname, replyjpath, "entry", null)
    //res.redirect('osmtl/?username=' + mainuser)
    res.redirect('osmtl/')
})

app.post('/userlike/:id', function(req, res) {
    var filepath = req.body.filepath; 
    var username = req.session.userid;
    var flag = req.body.flag; 
    
    var fdata = JSON.parse(fs.readFileSync(filepath, "utf8"));
    var count = '0';
    var dcount = '0';
    
    fdata = ldCount(fdata, username, flag)
    count = fdata["ld"]["lcount"];
    dcount = fdata["ld"]["dcount"];
    
    fs.writeFile(filepath, JSON.stringify(fdata), function writeJSON(err) {
      if (err) return console.log(err);
      
     });
    
    ////fdata["ld"]["username"] = {'sunil':true,'xsunil':true,'ysunil':false,'zsunil':true, };
    var senddata = {count:count,dcount:dcount, lduser:fdata["ld"]["username"]};
    
    res.send(JSON.stringify(senddata));
        
    });

app.post('/likeby', function(req, res) {
    var filepath = req.body.filepath; 
    
    var flag = req.body.flag; 
    
    var fdata = JSON.parse(fs.readFileSync(filepath, "utf8"));
    var count = '0';
    var dcount = '0';
   
    count = fdata["ld"]["lcount"];
    dcount = fdata["ld"]["dcount"];

    ////fdata["ld"]["username"] = {'sunil':true,'xsunil':true,'ysunil':false,'zsunil':true, };
    var senddata = {count:count,dcount:dcount, lduser:fdata["ld"]["username"]};
    
    res.send(JSON.stringify(senddata));
        
    });

app.post('/userreply', function(req, res) {
    var filepath = req.body.filepath; 
    var text = req.body.text; 
    if (text.trim()===""){
        res.send('<html> <head>Oh... No... !! CANNOT POST EMPTY FIELD </head><body><h1>'+ 
            ' <a href="/osm-home" class="myanchor2" >Click Me To GO BACK</a> </h1></body></html>');
        return;
    }
   
    var username = req.session.userid;
    var fdata = JSON.parse(fs.readFileSync(filepath, "utf8"));
    var count = fdata['reply']['rcount'] ;
    count ++ ;
    fdata['reply']['rcount'] = count ;
    fdata['reply'][count] = {} ;
    fdata['reply'][count]['username']=username ;
    var strdate = osmfun.getDateFormat();
    fdata['reply'][count]['created']=strdate ;
    fdata['reply'][count]['text']=text ;
    fdata['reply'][count]['path']=filepath ;
    fdata['reply'][count]['lcount']=0 ;
    fdata['reply'][count]['dcount']=0 ;

    var fwdata = osmfun.osmWriteFile_LDR(filepath, fdata);
    res.send(JSON.stringify(fdata['reply']));
    
    });

// app.post('/expandtext', function(req, res){
//     var filepath = req.body.filepath;
//     var username = req.session.userid;
//     var fdata = JSON.parse(fs.readFileSync(filepath, "utf8"));
//     res.send(JSON.stringify(fdata));

// });

app.post('/aplike', function(req, res){
    var filepath = req.body.filepath.trim(); 
    var idcount = req.body.idcount; 
    var flag = req.body.flag; 
    //var username = localStorage.getItem("userinfo");
    var username = req.session.userid;

    var fdata = JSON.parse(fs.readFileSync(filepath, "utf8"));
    
    if (flag.toLowerCase()==="like"){
        if (fdata['reply'][idcount]['lusername']){
            fdata['reply'][idcount]['lusername'].push(username);
        }
        else{
            fdata['reply'][idcount]['lusername'] = [username];
        }
        //fdata['reply'][idcount][username] = true;
        fdata['reply'][idcount]['lcount'] ++    
    }
    else{
        if (fdata['reply'][idcount]['dusername']){
            fdata['reply'][idcount]['dusername'].push(username);
        }
        else{
            fdata['reply'][idcount]['dusername'] = [username];
        }
        fdata['reply'][idcount]['dcount'] ++
    }
    var fwdata = osmfun.osmWriteFile_LDR(filepath, fdata);
    res.send(JSON.stringify(fwdata['reply'][idcount]));
    
});


function ldValidate(flag){
    var rflag = false;
    if (flag==='like'){rflag = true;}
    return rflag;
    }

function ldUserCount(jobj, iuser, flag){
    var rflag = ldValidate(flag);
    jobj["ld"]['username'][iuser]=rflag; // update first then count
    // update object by key[username]:value[rflag]
    var lcount = 0;
    var dcount = 0;
    // now read all like-dislike counts; because user update its entry
    for (var [k, v] of Object.entries(jobj["ld"]['username'])){
        if (v){lcount++; rflag = false }
        else{dcount++; rflag = true}
    }
    jobj["ld"]["lcount"]=lcount; // update like-counts now
    jobj["ld"]["dcount"]=dcount; // update dislike-counts now
    return jobj;
    }

function ldCount(jobj, iuser, flag){
    
    if (jobj["ld"]['username'][iuser]){
        ldUserCount(jobj, iuser, flag)
        
        }
    else if (jobj["ld"]['username'][iuser]===false){
        ldUserCount(jobj, iuser, flag)
        
    }
    else {
        var rflag = ldValidate(flag);
        // insert into object as key[username]:value[rflag]
        if (rflag){jobj["ld"]["lcount"]++ ;}
        else{jobj["ld"]["dcount"]++ ;}   
        
        jobj["ld"]["username"][iuser]=rflag;
        
        }
    return jobj;
    }


module.exports.ldValidate = ldValidate
module.exports.ldUserCount = ldUserCount
module.exports.ldCount = ldCount
module.exports.app = app