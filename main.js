var http = require("http");
var url = require("url");
var fs = require("fs");
var path = require("path");

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
}

function getExtension(filename) {
    var ext = path.extname(filename||'').split('.');
    return ext[ext.length - 1];
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

var taskIsRunning = false;

console.log("Starting http server on 127.0.0.1:8080");

http.createServer(function(req, res){    
var urlPath = url.parse(req.url).path;
    
    console.log("Handling request " + urlPath);
    
    if(urlPath == "/favicon.ico"){
        return;
    }
    
    if(urlPath == "/"){
        urlPath = "index.html";
    }
    else if(urlPath == "/startBuild"){
    
        builder.buildProject(options, function(log){
        
            var logFilename = path.join(options.LogDirectory, "licensemanagement_" + new Date().getTime() + ".json");
        
            fs.writeFile(logFilename, JSON.stringify(log.buffer, null, 4), function(err){
                if(err) 
                    console.log(err);
                        
                res.writeHead(200, {'Content-Type' : 'application/json'});
                res.write(JSON.stringify(log.buffer));
                res.end();
            });

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
    
    var file = fs.readFileSync(filePath);
    
    if(contentTypeMapping.hasOwnProperty(ext)){
        var contentType = contentTypeMapping[ext];
        
        res.writeHead(200, {'Content-Type' : contentType});
        res.write(file);
        res.end();
    }
    else{
        res.writeHead(404, {'Content-Type' : 'text/plain'});
        res.write("Not found - " + ext);
        res.end();
    }
}).listen(8080, '127.0.0.1');


setInterval(function(){
    
    if(taskIsRunning){
        return;
    }

    taskIsRunning = true;
    var log = new logger();
    var taskTree = taskFile.getTasks(log, function(){
        console.log("finished build");
                
        taskIsRunning = false;
    });
    console.log("Running tasks");
    taskTree.run();    

}, 1500);
