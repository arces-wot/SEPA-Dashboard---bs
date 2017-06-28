function clr(w){

    console.log("[DEBUG] invoked clr function");
    switch (w) {
    case "query":

	// clear the textarea
	console.log("[DEBUG] Clearing query textarea");	
	document.getElementById("queryTextInput").value = "";

	// clear the panel status
	console.log("[DEBUG] Resetting panel status");
	$("#queryPanel").removeClass("panel-success");
	$("#queryPanel").removeClass("panel-danger");

	// clear the panel footer
	console.log("[DEBUG] Resetting panel footer");
	$("#queryPanelFooter").innerHTML = "";

	// clear the table
	table = document.getElementById("queryTable");
	while(table.rows.length > 0) {
	    table.deleteRow(-1);
	};
	
	break;
    };
    
};

function resetColours(){

    // clear the query panel
    $("#queryPanel").removeClass("panel-success");
    $("#queryPanel").removeClass("panel-danger");

    // clear the query panel
    $("#updatePanel").removeClass("panel-success");
    $("#updatePanel").removeClass("panel-danger");

    // clear the query panel
    $("#subscribePanel").removeClass("panel-success");
    $("#subscribePanel").removeClass("panel-danger");
  
};

function query(){

    // clear the previous success/error colours
    resetColours();
    
    // debug print
    console.log("[DEBUG] query function invoked");
    
    // read the URI
    queryURI = document.getElementById("queryUriInput").value;    

    // read the query
    queryText = document.getElementById("queryTextInput").value;    
    
    // send the query
    var req = $.ajax({
	url: queryURI,
	crossOrigin: true,
	method: 'POST',
	contentType: "application/sparql-query",
	data: queryText,	
	error: function(event){
	    console.log("[DEBUG] Connection failed!");
	    $("#queryPanel").addClass("panel-danger");
	    $("#queryPanelFooter").innerHTML = "Failure";
	    return false;
	},
	success: function(data){
	    $("#queryPanel").addClass("panel-success");
	    document.getElementById("queryPanelFooter").innerHTML = "Success";

	    // get the table to fill
	    table = document.getElementById("queryTable");

	    // remove all the lines
	    while(table.rows.length > 0) {
		table.deleteRow(-1);
	    }

	    // add heading
	    headingRow = table.insertRow(-1);
	    for (v in data["head"]["vars"]){
		newCell = headingRow.insertCell(-1).innerHTML = data["head"]["vars"][v];
		newCell.id = "variable_" + data["head"]["vars"][v];
	    };

	    // add results	    
	    for (line in data["results"]["bindings"]){
		newRow = table.insertRow(-1);
		console.log(data["results"]["bindings"][line]);
		for (el in data["results"]["bindings"][line]){
		    newCell = newRow.insertCell(-1).innerHTML = data["results"]["bindings"][line][el]["value"];
		}
	    };	    
	}
    });
   
};

	    
