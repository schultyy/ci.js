var http = require("http");
var url = require("url");
var fs = require("fs");
var path = require("path");

var options = fs.readFileSync("options.json");

options = JSON.parse(options);

var buildResultsFolder = options.buildResultsFolder;

function logger(){
    
    this.messages = [];

    this.error = function(name, msg){
        //console.log("[ERROR][" + name + "] / " + msg);
        this.messages.push({
            name : name,
            type : 'error',
            message : msg,
            date : new Date()
        });
    };
    this.info = function(name, msg){
        //console.log("[INFO][" + name + "] / " + msg);
        this.messages.push({
            name : name,
            type : 'info',
            message : msg,
            date : new Date()
        });
    };
    this.clear = function(){
        this.messages = [];
    };
}

function getExtension(filename) {
    var ext = path.extname(filename||'').split('.');
    return ext[ext.length - 1];
}

function getBuildReports(callback){
    fs.readdir(buildResultsFolder, function(err, files){
        files.sort().reverse();
        if(files.length > 10){
            files = files.slice(0, 10);
        }
        callback(files.map(function(item){ return item.replace(".json",""); }));
    });
}

function getBuildReport(reportId, callback){
    var fullPath = path.join(buildResultsFolder, reportId + ".json");
    fs.readFile(fullPath, function(err, data){
        if(err) throw err;
        callback(data);
    });
}

var contentTypeMapping = new Array();
contentTypeMapping["js"] = 'text/javascript';
contentTypeMapping["html"] = 'text/html';
contentTypeMapping["css"] = 'text/css';

console.log("starting up...");

if(process.argv.length < 3){
    console.log("Dude, you need to provide a tasks file. Quit");
    
    process.exit(1);
}

var taskFile = process.argv[2];

console.log("Reading " + taskFile);

taskFile = require("./" + taskFile.replace(".js", ""));

var log = new logger();

var taskTree = taskFile.getTasks({
    logger : log,
    finished : function(buildResult){
                
                if(!buildResult){
                    buildResult = "success";
                }
                
                var filename = new Date().getTime();
                var absoluteFilename = path.join(buildResultsFolder, filename + ".json");
                fs.writeFile(absoluteFilename, JSON.stringify({
                    status : buildResult,
                    messages : log.messages
                }, null, 4), function(){ 
                    taskIsRunning = false; 
                });
                console.log("finished build");
            }
});

var taskIsRunning = false;

console.log("Starting http server on 127.0.0.1:8080");

http.createServer(function(req, res){    

    var urlParts = url.parse(req.url);

    var urlPath = urlParts.pathname;
    
    console.log("Handling request " + urlPath);
    
    if(urlPath == "/favicon.ico"){
        return;
    }
    
    switch(urlPath){
        case "/":
            urlPath = "index.html";
            break;
        case "/projectInfo":
            res.writeHead(200, {'Content-Type' : 'application/json'});
            console.log("requested project name " + taskTree.name);		
            res.write(JSON.stringify({ 
                projectName : taskTree.name,
                projectPath : taskTree.projectPath,
            }));
            res.end();
            return;	
        case "/lastBuilds":        
            getBuildReports(function(results){
                res.writeHead(200, {'Content-Type' : 'application/json'});
                res.write(JSON.stringify(results));
                res.end();
            });
            return;
        case "/buildReport":
            getBuildReport(urlParts.query.replace("id=",""), function(results){
                res.writeHead(200, {'Content-Type' : 'application/json'});
                res.write(results);
                res.end();
            });
            return;
    }
    
    var ext = getExtension(urlPath);
    
    var filePath = "";
    
    if(urlPath.indexOf("bootstrap") !== -1 ||
                        ext == "js" ||
                        ext == "css"){
        filePath = "www" + urlPath;
    }
    else{
        filePath = "www/" + ext + "/" + urlPath;
    }
    
    fs.readFile(filePath, function(err, data){
        if(err)throw err;
        
        if(contentTypeMapping.hasOwnProperty(ext)){
            var contentType = contentTypeMapping[ext];
            
            res.writeHead(200, {'Content-Type' : contentType});
            res.write(data);
            res.end();
        }
        else{
            res.writeHead(404, {'Content-Type' : 'text/plain'});
            res.write("Not found - " + ext);
            res.end();
        }        
    });
}).listen(8080, '127.0.0.1');


setInterval(function(){
    
    if(taskIsRunning){
        return;
    }
    taskIsRunning = true;

    log.clear();
    
    console.log("Running tasks");
    log.name = taskTree.name;
    taskTree.tasks.run();    

}, 1 * 60 * 1000);
