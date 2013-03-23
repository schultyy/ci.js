$(document).ready(function(){
    $.get("/projectInfo", function(data){
        $("#projectName").append("<small>" + data.projectName + "</small>");
        $("#localPath").append("<small>" + data.projectPath + "</small>");
    });
    $.get("/lastBuilds", function(resultSet){
        for(var i = 0; i < resultSet.length; i++){
        
            var currentElement = resultSet[i];
        
            var time = new Date(parseInt(currentElement));

            var formattedTime = time.getDay() + "." +
                                time.getMonth() + "." +
                                time.getFullYear() + " " +
                                time.getHours() + ':' + time.getMinutes() + ':' + time.getSeconds();

            $("#LatestBuilds").append("<a href='#' id='"+ currentElement +"'>" + formattedTime + "</a>");
            $("#LatestBuilds").append("<br />"); 
            
            $("#" + currentElement).click(function(e){
            
                var url = "/buildReport?id=" + currentElement;
                
                $.get(url, function(buildReport){
                    $("#shellOutput").empty();

                    if(buildReport.status == "failed"){
                    
                        $("#shellOutput").append($("<div>").append($("<p>").addClass("buildFailed")
                                                            .html("Build failed")));
                    }

                    var tabs = $("<ul>").addClass("nav nav-tabs");
                    
                    var tabContent = $("<div>").addClass("tab-content");
                    
                    var usedNames = {};
                    
                    for(var i = 0; i < buildReport.messages.length; i++){
                        var currentElement = buildReport.messages[i];
                        
                        var tab = $("<li>");
                        
                        if(i == 0){
                            tab = tab.addClass("active");
                        }
                        
                        var heading = $("<a>")
                                        .attr("data-toggle","tab")
                                        .attr("href", "#" + currentElement.name + i)
                                        .html(currentElement.name);
                        
                        tab.append(heading);
                        tabs.append(tab);
                        
                        var content = $("<div>").addClass("tab-pane");
                        
                        if(i == 0){
                            content = content.addClass("active");
                        }
                        
                        content = content.attr("id", currentElement.name + i)
                                            .html($("<code>")
                                            .addClass("shellContent")
                                            .html("<pre>" + currentElement.message + "</pre>"));
                        
                        tabContent.append(content);
                    }
                    $("#shellOutput").append(tabs);
                    $("#shellOutput").append(tabContent);
                });
            
                e.preventDefault();
            });
        }
    });
});