
var fs = require('fs');
const Path = require("path");
const sqlite3 = require('sqlite3');
const memdbfilepath = './asset1/member.db'
const memdb =  new sqlite3.Database(memdbfilepath);
const osmpostindexpath = './asset1/osmpostindex.db'
const pindexdb =  new sqlite3.Database(osmpostindexpath);
const osmapp = require('./userlogin')
const osmfun = require('./osmfun')

const app = osmapp.app ;

//const app = express();

app.get('/mysmregister', function(req, res, next) {
	//console.log('====== mysmregister');
    var pageinfo = osmfun.getPageInfo('', '', '', '', '', false, '//');
    pageinfo['osm']['usave']='';
    res.render('mysm/register', {spinfo: pageinfo,});
});

app.get('/onuserValidation', function(req, res, next){
    var username = req.query.username
    //var qry = 'SELECT username FROM member WHERE username LIKE "'+username+'%" ';
    var qry = 'SELECT username FROM member WHERE username = "'+username+'" ';
    
    memdb.get(qry, function (error, row){
        
        if (row){
            var result = {'username':'Username Already in Use', 'status':200,};
            res.json({success : result, status : 200});
            //res.end(JSON.stringify(result));
            return true;
            }
        else{
            var result = {'username':null,  'status':200};
            res.json({success : result, status : 200});
            //res.end(JSON.stringify(result));
            return true;
            }
      })
    
});

app.get('/onphoneValidation', function(req, res, next){
    var phone = req.query.phone ;
    var qry = 'SELECT phone FROM member WHERE phone = "'+phone+'" ';
    
    memdb.get(qry, function (error, row){
        
        if (row){
            var result = {'phone':'Phone Already in Use', 'status':200,};
            res.json({success : result, status : 200});
            //res.end(JSON.stringify(result));
            return true;
            }
        else{
            var result = {'phone':null,  'status':200};
            res.json({success : result, status : 200});
            //res.end(JSON.stringify(result));
            return true;
            }
      })
    
});


app.post('/save_member', function(req, res) {
    var fvar = req.body;
    var fmval = fvar.phone;
    var info = '';
    var alrt = '';
    var jfilename = '2022.json';
    var pageinfo = osmfun.getPageInfo('', '', '', '', '', false, '//');
    
    if (fvar){
        if (fmval.length < 9)
        { 
         pageinfo['osm']['usave']='Phone Number is Wrong!';
         // $query = "SELECT username as username FROM member WHERE username = '".$username."' " ;
         // you can send html text seperatle from here; as per your requirments 
         //res.send("<html> <head>server Response</head><body><h1> This page was render direcly from the server <p>Hello there welcome to my website</p></h1></body></html>");
         res.render('mysm/register', {spinfo: pageinfo,});
         pageinfo['osm']['usave']='';
        }

        else {
           
            memdb.all('INSERT INTO member (name, lastname, username, phone, password) '+
            'VALUES ("'+fvar.firstname+'","'+fvar.lastname+'","'+fvar.username+'","'+fvar.phone+'","'+fvar.password[0]+'")', 
            function (error, rows){
                if (error){
                    info = 'Sorry Cannot Save !';
                    alrt = 'Database Error Found';
                    pageinfo['osm']['usave']=info;
                    // ** important** redirect is important otherwise REFRESH page will Re-Submit Query Again ***
                    res.redirect('/osmlogin');
                    //res.redirect('vws/mysm/login.html?'+info+'&'+alrt+'');
                }
                else{
                info = 'Add Successfully !';
                pageinfo['osm']['usave']=info;
                //console.log(fvar.username, fvar.firstname)
                //console.log(fvar);
                osmfun.osmfileCreate(fvar.username, fvar.firstname, flag='0');

                //res.render('mysm/login', {spinfo: pageinfo,});
                // ** important** redirect is important otherwise REFRESH page will Re-Submit Query Again ***
                res.redirect('/osmlogin');
                //res.redirect('vws/mysm/login.html?'+info+'&'+alrt+'');
                }
            });
        }
    }
    else{
        pageinfo['osm']['usave']='--';
        res.send("<html> <head>server Response</head><body><h1> This page was render direcly from the server <p>Hello there welcome to my website</p></h1></body></html>");
        //res.render('mysm/register', {spinfo: pageinfo,});
    }
    
});

module.exports.app = app
//module.exports = app;