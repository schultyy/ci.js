# ci.js
This is a very very basic continuous integration server written in JavaScript. This runs on node.js.

## How does it work?
It comes up with a basic http server that provides a web page where you can see the 10 latest build results. 
In background, every n minutes a new build starts. After the build finished, a build result log file is written and 
can be viewed on the web page.
The build server gets its work via a task file, which is plain JavaScript.

## Configuration
You need to place a file called 'options.json' in the same directory where main.js exists. The options file must contain
the following parts:
```JavaScript
{
    "buildResultsFolder" : "/home/foo/bar/BuildResults",
    "port" : 8080,
    "host" : "127.0.0.1",
    "buildInterval" : 15
}
```

Note that buildInterval expresses the interval in minutes. The build results folder must exist, ci.js does not create it.
## Usage
```Bash
$ node main.js tasks.js
```

## Task file
A task file must export a function that is called getTasks. getTasks returns one task, that calls other tasks via 
callbacks when it is finished. A task must have a run method. This will be called by ci.js. 
(Disclaimer: I need this to build my .Net software. So the example below contains Windows paths and calls to MSBuild.)
This is an example task file:
```JavaScript

var child_process = require("child_process");
var fs = require("fs");

exports.getTasks = function(options){

    var finishedCallback = options.finished;

    var checkout = new checkoutTask();
    var buildTask = new buildTask();
    
    checkout.callback = buildTask;
    
    //Notify ci.js when build is finished
    buildTask.callback = {
        this.run = finishedCallback;
        this.callback = undefined;
    };
    return {
        name            : "Your project",
        projectPath     : "C:\\Temp\\",
        tasks           : checkout
    };
}

function checkoutTask(){
    this.callback = undefined;
    this.run = function(){    
        console.log("checkout");
        
        var workingDirectory = 'C:\\temp\\';

        var self = this;
            
        child_process.exec('"C:\\Program Files (x86)\\Git\\bin\\sh.exe" --login -i -c "git clone <your project>"', 
        {'cwd' : workingDirectory}, function(error, stdout, stderr){
            if(stdout){
                console.log("checkout", stdout);
            }
            if(stderr){
                console.log("checkout", stderr);
            }
            if(error){
                console.log("checkout", error.signal);
                console.log("checkout", error.code);
                return;
            }
            if(self.callback){
                self.callback.run();
            }
        });
    };
}

function buildTask(){
    this.callback = undefined;
    this.run = function(){
    
        console.log("build");
    
        var solutionFile = "C:\\temp\\<your project>\\<your solution>.sln";
        
        var self = this;
        
        child_process.exec('cmd.exe /s /c "C:\\Windows\\Microsoft.NET\\Framework64\\v4.0.30319\\MSBuild.exe /p:Configuration=Release ' + solutionFile + '"', 
            function(error, stdout, stderr){
                if(stdout){
                    console.log("build", stdout);
                }
                if(stderr){
                    console.log("build", stderr);
                }
                if(error){
                    console.log("build", "Signal: " + error.signal + " / Code: " + error.code);
                    return;
                }
                
                if(self.callback){
                    self.callback.run();
                }
        });
    };
}
```

# Dependencies
* bootstrap
* JQuery 1.9.1
