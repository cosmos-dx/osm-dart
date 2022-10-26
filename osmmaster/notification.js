var fs = require('fs');
var formidable = require('formidable');
const Path = require("path");
const osmapp = require('./userlogin');
const osmfun = require('./osmfun');
//const sessions = require('express-session');

const app = osmapp.app ;

app.post('/opennote', function(req, res) {
	var mainuser      = req.session.username ;
    var mainfirstname = req.session.firstname ;
    
	if (!mainuser){
        // when user name not available in session try to get from imgvalidator
        // this method could be dangerous, double check during any flaws 
        res.redirect('/osmlogin');
        return true;
      }

    var imgdir = req.session.datadir.imgdir ;  
    var userdp = req.session.datadir.userdp;
    var userdir = req.session.datadir.userdir ;  
    var dtype = req.session.device.type ;

    var getdata = JSON.parse(req.body.notedata) ;
    var username = getdata.username ;
    var firstname = getdata.firstname ;
    var getpath = getdata.path ;
    var search_result = '@'+mainuser+' ['+mainfirstname+'] DART TO : @'+username+' ['+firstname+']';
    var pageinfo = osmfun.getPageInfo(mainuser, mainfirstname, 'Expand', search_result, '', false, userdir);
    var masterfilepath = getdata.data.masterfilepath
    var userdisplaydata = JSON.parse(fs.readFileSync(masterfilepath, "utf8")); 
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
        }// for other than desktop} mobile or smartphones ...
    else{
        res.render('mob/osmexpand', {"spinfo":pageinfo, "pg":userdisplaydata, "textdt":userdisplaydata, "imgdir":imgdir,
        "userdp":userdp, "username": mainuser, "firstname":mainfirstname, "search_result":search_result});
         }// for other than desktop} mobile or smartphones ...

    // res.render('mysm/osmexpand', {"spinfo":pageinfo, "pg":userdisplaydata, "textdt":userdisplaydata, "userdp":userdp,
    //         "imgdir":imgdir, "username": mainuser, "firstname":mainfirstname, "search_result":search_result});
	

	//res.status(204).send();
	//var imgdir = 'imgtransitdir';
	
	//res.render('mysm/osmexpand', {"spinfo":pageinfo, "textdt":userdisplaydata, 
    //        "imgdir":imgdir, "username": mainuser, "firstname":mainfirstname, "search_result":search_result});

})