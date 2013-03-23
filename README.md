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

## Task file
A task file must export a function that is called getTasks. getTasks returns one task, that calls other tasks via 
callbacks when it is finished. A task must have a run method. This will be called by ci.js. 
This is an example task file:

```JavaScript

var child_process = require("child_process");
var fs = require("fs");

exports.getTasks = function(){
  return new checkoutTask();
}

function checkoutTask(){
    this.run = function(){    
        console.log("checkout");
        
        var workingDirectory = '/home/foo/tmp';

        var self = this;
            
        child_process.exec('git clone <your project>', 
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
        });
    }
}
```