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
                
                $.get(url, function(data){
                    $("#shellOutput").empty();

                    var tabs = $("<ul>").addClass("nav nav-tabs");
                    
                    var tabContent = $("<div>").addClass("tab-content");
                    
                    for(var i = 0; i < data.messages.length; i++){
                        var currentElement = data.messages[i];
                        
                        var tab = $("<li>");
                        
                        if(i == 0){
                            tab = tab.addClass("active");
                        }
                        
                        if(data.status == "failed"){
                            tab = tab.addClass("buildFailed");
                        }
                        
                        var heading = $("<a>")
                                        .attr("data-toggle","tab")
                                        .attr("href", "#" + currentElement.name)
                                        .html(currentElement.name);
                        
                        tab.append(heading);
                        tabs.append(tab);
                        
                        var content = $("<div>").addClass("tab-pane");
                        
                        if(i == 0){
                            content = content.addClass("active");
                        }
                        
                        content = content.attr("id", currentElement.name)
                                            .html($("<code>")
                                            .addClass("shellContent")
                                            .html("<pre>" + currentElement.message + "</pre>"));
                        
                        tabContent.append(content);
                    }
                    $('a[data-toggle="tab"]').on('show', function (e) {
                        alert("buh");
                    });
                    $("#shellOutput").append(tabs);
                    $("#shellOutput").append(tabContent);
                });
            
                e.preventDefault();
            });
        }
    });
});