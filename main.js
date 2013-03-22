var http = require("http");

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

function errorHandler(feed, log){

}

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
    // cache the xml
    var xml = feed.xml();

    res.writeHead(200, {'Content-Type' : 'application/xml'});
    res.write(xml);
    res.end();
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
