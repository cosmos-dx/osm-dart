
var fs = require('fs');
var formidable = require('formidable');
const Path = require("path");
const sqlite3 = require('sqlite3');
const memdbfilepath = './asset1/member.db'
const memdb =  new sqlite3.Database(memdbfilepath);
const osmapp = require('./userlogin')
const osmfun = require('./osmfun')

const app = osmapp.app ;


app.get('/useraccount/:searchusername', function(req, res, next) {
	var username = req.session.username;
	var firstname = req.session.firstname;
	var searchusername = req.params.searchusername ;
	var searchfirstname = req.query.fname ;
	
	var mainusername = username ;
	var mainfirstname = firstname ;
	var accountpath = "useraccount" ;
	
	osmfun.imgvalidator['img'] = "";
	osmfun.imgvalidator['imgbool'] = false;
	if (username){	   
	    var [uidx, jfilename, dirobj, uidxlib, userdir, filepath] = osmfun.getJfilePath(username);
	    var pageinfo = osmfun.getPageInfo(username, firstname, '', '', '', false, userdir);
	    pageinfo['osm']['usave']='';
	    //pageinfo['user']=username;
	    pageinfo['title']='OSM-Account';
	    var dtype = req.session.device.type ;

	    var imgname = mainusername +".jpg";
		var imgtransit = osmfun.imgtransit_Dir(userdir, imgname);
		var userimgpath = Path.join(imgtransit, imgname);
	    //req.session['userdir'] = userdir;
	    //req.session['filepath'] = filepath;
	    pageinfo['searchusername']=username ;
	    pageinfo['searchfirstname']=firstname ;
	    pageinfo['osm']['defdata']['username']=mainusername ;
	    pageinfo['osm']['defdata']['path']=filepath ;
	    pageinfo['osm']['defdata']['userdir']=userdir ;
	    pageinfo['dirobj']= dirobj ;
	    
		if (searchusername===username){
			mainusername = username ;
			mainfirstname = firstname ;
			accountpath = "useraccount" ;
		}
		else{
			mainusername = searchusername ;
			mainfirstname = searchfirstname ;
			accountpath = "useraccountsearch" ;
			var [m_uidx, m_jfilename, m_dirobj, m_uidxlib, m_userdir, m_filepath] = osmfun.getJfilePath(mainusername);
			var imgname = mainusername +".jpg";
			var imgtransit = osmfun.imgtransit_Dir(m_userdir, imgname);
			var userimgpath = Path.join(imgtransit, imgname);
			pageinfo['searchusername']=mainusername ;
	    	pageinfo['searchfirstname']=searchfirstname ;

			pageinfo['dirobj']['aboutpath']=m_dirobj.aboutpath // modifying aboutpath
			
		}
		
	    
	    
	    pageinfo['aboutdata']= JSON.parse(fs.readFileSync(dirobj.aboutpath, "utf8" )) ;
	    
	    pageinfo['userdir']=userdir.replace(/\\/g,'//') ;
	    pageinfo['filepath']=filepath.replace(/\\/g,'//') ; 
	    pageinfo['userimgpath']=userimgpath.replace(/\\/g,'//') ; 
	    
	    if (dtype=='desktop'){
	    	res.render('mysm/'+accountpath, {spinfo: pageinfo, username:username, firstname:firstname}); 
			}
		else{
			res.render('mob/'+accountpath, {spinfo: pageinfo, username:username, firstname:firstname});
		    }
	}
	else{
		var pageinfo = osmfun.getPageInfo(username, firstname, 'Login', '', '', false, "//"); 
		pageinfo['title']='OSM-Login';
  		req.session.destroy();
  		res.redirect('/');
  		//res.render('mysm/login' , {root:__dirname, spinfo: pageinfo});
	}
});



app.post('/accountimgupload', function(req, res, next) {
	var username = req.session.userid;
	var firstname = req.session.firstname;
	var userdir = req.session.datadir.userdir;
	if (username){
			var imgname = username +".jpg";
			var imgtransit = osmfun.imgtransit_Dir(userdir, imgname);
			var dtype = req.session.device.type ;
			//if (username){
			//	osmfun.createEmptyUserImg(imgname, imgtransit);
			//}
		     
			
		  	var maximagesize = 10000000;
			let form = new formidable.IncomingForm();
		    form.uploadDir = imgtransit;
		  
		  	var wrongimg = false; 
		  
		  form.parse(req, (err, fields, files) => {
		   
		    if (wrongimg){

		        res.send('<html><head>Wrong Image Type </head><body><h1>Wrong Image Type, Valid [Post .jpeg, .jpg, .png, .gif] </h1>'+
		        '<form action="/accountimgupload" enctype="multipart/form-data" method="POST">'+
		        '<input type="image" src="./public/assets/img/errorimg.gif" alt="Submit"> '+
		        '<br><br></form></body></html>');
		        return;

		     
		        }
		    if ('accountimg' in files){
		        var imgsize = files.accountimg.size;
		        if (imgsize > maximagesize){
		            var delfilepath = files.accountimg.filepath;
		            fs.unlinkSync(delfilepath);
		            osmfun.imgvalidator['img'] = '';
		            osmfun.imgvalidator['imgbool'] = false;
		            res.send('<html><head>Big Image Size</head><body><h1>Big Image Size, Post Small Size Image </h1>'+
		            '<form action="/accountimgupload" enctype="multipart/form-data" method="POST">'+
		            '<input type="image" src="./public/assets/img/errorimg.gif" alt="Submit"> '+
		            '<br><br></form></body></html>');
		            return;
		            
		        }
		        else{
		            var xoldfilepath = files.accountimg.filepath ;
		            var xnewfilepath = Path.join(imgtransit, imgname);
		            
		            fs.rename(xoldfilepath, xnewfilepath, function (err) {
		                if (err) {console.log('errr ### >> ', err)};
		                
		              });
		            osmfun.imgvalidator['img'] = xnewfilepath;
		            osmfun.imgvalidator['imgbool'] = true;
		      }
		    }
		    //res.write('File uploaded and moved!');
		    var pageinfo = osmfun.getPageInfo(username, firstname, '', '', '', false, "//");
		    pageinfo['osm']['usave']='';
			//pageinfo['user']=username;
			pageinfo['title']='OSM-Account';
		    var [uidx, jfilename, dirobj, uidxlib, userdir, filepath] = osmfun.getJfilePath(username);
			var userimgpath = Path.join(imgtransit, imgname);
		    req.session['userdir'] = userdir;
		    req.session['filepath'] = filepath;
		    pageinfo['osm']['defdata']['username']=username ;
		    pageinfo['osm']['defdata']['path']=filepath ;
		    pageinfo['osm']['defdata']['userdir']=userdir ;
		    pageinfo['dirobj']=dirobj ;
		    pageinfo['aboutdata']= JSON.parse(fs.readFileSync(dirobj.aboutpath, "utf8" )) ;
		    pageinfo['userdir']=userdir.replace(/\\/g,'//') ;
		    pageinfo['filepath']=filepath.replace(/\\/g,'//') ; 
		    pageinfo['userimgpath']=userimgpath.replace(/\\/g,'//') ; 

		    if (dtype=='desktop'){
		    	res.render('mysm/useraccount', {spinfo: pageinfo, username:username, firstname:firstname});
				}
			else{
				res.render('mob/useraccount', {spinfo: pageinfo, username:username, firstname:firstname});
			    }

		    //res.render('mysm/useraccount', {spinfo: pageinfo, username:username, firstname:firstname});
		    //res.status(204).send();
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
		        wrongimg = true;
		        
		        var fpath = file.filepath;
		        
		        fs.unlinkSync(fpath);
		    
		        console.log('Wrong File Type in Account Image upload ####>>>> ', imgtype)
		        
		    }
		   
		  });
  }
  else{
  		var pageinfo = osmfun.getPageInfo(username, firstname, 'Login', '', '', false, "//"); 
		pageinfo['title']='OSM-Login';
  		req.session.destroy();
  		res.render('mysm/login' , {root:__dirname, spinfo: pageinfo});
  }
	
	
});

app.post('/bannerimgupload', function(req, res, next) {
	var username = req.session.userid;
	var firstname = req.session.firstname;
	

	if (username){
		    var userdir = req.session.datadir.userdir;
			var imgname = "img_banner_img.jpg" ;
			var imgtransit = osmfun.imgtransit_Dir(userdir, imgname);
			var dtype = req.session.device.type ;
			//if (username){
			//	osmfun.createEmptyUserImg(imgname, imgtransit);
			//}
		     
			
		  	var maximagesize = 10000000;
			let form = new formidable.IncomingForm();
		    form.uploadDir = imgtransit;
		  
		  	var wrongimg = false; 
		  
		  form.parse(req, (err, fields, files) => {
		   
		    if (wrongimg){

		        res.send('<html><head>Wrong Image Type </head><body><h1>Wrong Image Type, Valid [Post .jpeg, .jpg, .png, .gif] </h1>'+
		        '<form action="/bannerimgupload" enctype="multipart/form-data" method="POST">'+
		        '<input type="image" src="./public/assets/img/errorimg.gif" alt="Submit"> '+
		        '<br><br></form></body></html>');
		        return;

		        }
		    if ('bannerimg' in files){
		        var imgsize = files.bannerimg.size;
		        if (imgsize > maximagesize){
		            var delfilepath = files.bannerimg.filepath;
		            fs.unlinkSync(delfilepath);
		            osmfun.imgvalidator['img'] = '';
		            osmfun.imgvalidator['imgbool'] = false;
		            res.send('<html><head>Big Image Size</head><body><h1>Big Image Size, Post Small Size Image </h1>'+
		            '<form action="/bannerimgupload" enctype="multipart/form-data" method="POST">'+
		            '<input type="image" src="./public/assets/img/errorimg.gif" alt="Submit"> '+
		            '<br><br></form></body></html>');
		            return;
		            
		        }
		        else{
		            var xoldfilepath = files.bannerimg.filepath ;
		            var xnewfilepath = Path.join(imgtransit, imgname);
		            
		            fs.rename(xoldfilepath, xnewfilepath, function (err) {
		                if (err) {console.log('errr ### >> ', err)};
		                
		              });
		            osmfun.imgvalidator['img'] = xnewfilepath;
		            osmfun.imgvalidator['imgbool'] = true;
		      }
		    }
		    //res.write('File uploaded and moved!');
		    var pageinfo = osmfun.getPageInfo(username, firstname, '', '', '', false, "//");
		    pageinfo['osm']['usave']='';
			//pageinfo['user']=username;
			pageinfo['title']='OSM-Account';
		    var [uidx, jfilename, dirobj, uidxlib, userdir, filepath] = osmfun.getJfilePath(username);

			var userimgpath = req.session.datadir.userdp;
			
		    pageinfo['osm']['defdata']['username']=username
		    pageinfo['osm']['defdata']['path']=filepath
		    pageinfo['osm']['defdata']['userdir']=userdir
		    pageinfo['dirobj'] = dirobj ;
		    pageinfo['aboutdata']= JSON.parse(fs.readFileSync(dirobj.aboutpath, "utf8" )) ;

		    var banneimgpath = Path.join(imgtransit, imgname);
		    pageinfo['aboutdata']['bannerimg'] = banneimgpath.replace(/\\/g,'//') ;
		    fs.writeFileSync(dirobj.aboutpath, JSON.stringify(pageinfo['aboutdata']), 'utf8');

		    pageinfo['userdir']=userdir.replace(/\\/g,'//') ;
		    pageinfo['filepath']=filepath.replace(/\\/g,'//') ; 
		    pageinfo['userimgpath']=userimgpath.replace(/\\/g,'//') ; 

		    if (dtype=='desktop'){
		    	res.render('mysm/useraccount', {spinfo: pageinfo, username:username, firstname:firstname});
				}
			else{
				res.render('mob/useraccount', {spinfo: pageinfo, username:username, firstname:firstname});
			    }

		    //res.render('mysm/useraccount', {spinfo: pageinfo, username:username, firstname:firstname});
		    //res.status(204).send();
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
		        wrongimg = true;
		        
		        var fpath = file.filepath;
		        
		        fs.unlinkSync(fpath);
		    
		        console.log('Wrong File Type in Account Image upload ####>>>> ', imgtype)
		        
		    }
		   
		  });
  }
  else{
  		var pageinfo = osmfun.getPageInfo(username, firstname, 'Login', '', '', false, "//"); 
		pageinfo['title']='OSM-Login';
  		req.session.destroy();
  		res.render('mysm/login' , {root:__dirname, spinfo: pageinfo});
  }
	
	
});


app.post('/aboutfill', function(req, res, next) {
	var username = req.session.username;
	var firstname = req.session.firstname;
	let body = req.body;
	var sessdata = req.session;
	if (username){
		let dirobj = sessdata.datadir.dirobj ;
		let aboutpath = dirobj.aboutpath ;
		let readdata = JSON.parse(fs.readFileSync(aboutpath, "utf8" )) ;

		readdata["about"] = req.body.about ; 
		readdata["description"] = req.body.description ; 
	    readdata["key"] = req.body.key ; 
	    fs.writeFileSync(aboutpath, JSON.stringify(readdata), 'utf8');
	    
	    let userdir = sessdata.datadir.userdir ;
	    let filepath = sessdata.datadir.filepath ;
		
	    var pageinfo = osmfun.getPageInfo(username, firstname, '', '', '', false, userdir);
	    pageinfo['osm']['usave']='';
	    //pageinfo['user']=username;
	    pageinfo['title']='OSM-Account';
	    var dtype = req.session.device.type ;

	    var imgname = username +".jpg";
		var imgtransit = osmfun.imgtransit_Dir(userdir, imgname);
		var userimgpath = Path.join(imgtransit, imgname);
	    req.session['userdir'] = userdir;
	    req.session['filepath'] = filepath;
	    pageinfo['osm']['defdata']['username']=username ;
	    pageinfo['osm']['defdata']['path']=filepath ;
	    pageinfo['osm']['defdata']['userdir']=userdir ;
	    pageinfo['dirobj']= dirobj ;
	    pageinfo['aboutdata']= JSON.parse(fs.readFileSync(dirobj.aboutpath, "utf8" )) ;
	    
	    pageinfo['userdir']=userdir.replace(/\\/g,'//') ;
	    pageinfo['filepath']=filepath.replace(/\\/g,'//') ; 
	    pageinfo['userimgpath']=userimgpath.replace(/\\/g,'//') ; 
	    if (dtype=='desktop'){
	    	res.render('mysm/useraccount', {spinfo: pageinfo, username:username, firstname:firstname});
			}
		else{
			res.render('mob/useraccount', {spinfo: pageinfo, username:username, firstname:firstname});
		    }
	}

	else{
		res.redirect('/');
	}
});

