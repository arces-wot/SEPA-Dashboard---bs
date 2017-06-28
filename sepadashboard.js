function deleteNamespace(ns){

    // debug print
    console.log("[DEBUG] invoked deleteNamespace function");

    // delete the namespace
    var rowIndex = document.getElementById(ns).remove();
    
};

function addNamespace(){

    console.log("[DEBUG] invoked addNamespace function");
    
    // get the prefix
    pr = document.getElementById("prefixField").value;

    // get the namespace
    ns = document.getElementById("namespaceField").value;

    // get the table and add the namespace
    table = document.getElementById("namespacesTable");
    newRow = table.insertRow(-1);

    // prefix cell
    newCell = newRow.insertCell(0);
    newCell.innerHTML = pr;

    // namespace cell
    newCell = newRow.insertCell(1);
    newCell.innerHTML = ns;

    // bind the prefix to the row
    newRow.id = pr;

    // actions cell
    newCell = newRow.insertCell(2);
    newCell.innerHTML = "<button action='button' class='btn btn-link btn-sm' onclick='javascript:deleteNamespace(" + '"' + pr + '"' + ");'><span class='glyphicon glyphicon-trash' aria-hidden='true''>&nbsp;</span>Delete</button>";
};

function loadJsap(){

    // debug
    console.log("[DEBUG] invoked loadJsap function");
    
    //check if file reader is supported
    if ( ! window.FileReader ) {
	console.log("[ERROR] FileReader API is not supported by your browser.");
	return false;
    }

    // load data
    var $i = $('#loadJsap');		
    input = $i[0];
    if ( input.files && input.files[0] ) {	
	file = input.files[0];
	
	// create a mew instance of the file reader
	fr = new FileReader();		    
	var text;
	fr.onload = function () {
	    
	    // read the content of the file
	    var decodedData = fr.result;
	    
	    // parse the JSON file
	    myJson = JSON.parse(decodedData);
	      
	    // get the namespaces table
	    table = document.getElementById("namespacesTable");
	    
	    // retrieve namespaces
	    for (ns in myJson["namespaces"]){
		
		// add the new item
		newRow = table.insertRow(-1);
		newRow.insertCell(0).innerHTML = ns;
		newRow.insertCell(1).innerHTML = myJson["namespaces"][ns];
		newRow.insertCell(2).innerHTML = "<button action='button' class='btn btn-link btn-sm'><span class='glyphicon glyphicon-trash' aria-hidden='true'>&nbsp;</span>Delete</button>";
	    }
	};
	fr.readAsText(file);	
    }
};

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

    case "update":

	// clear the textarea
	console.log("[DEBUG] Clearing update textarea");	
	document.getElementById("updateTextInput").value = "";

	// clear the panel status
	console.log("[DEBUG] Resetting panel status");
	$("#updatePanel").removeClass("panel-success");
	$("#updatePanel").removeClass("panel-danger");

	// clear the panel footer
	console.log("[DEBUG] Resetting panel footer");
	$("#updatePanelFooter").innerHTML = "";

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
	    d = new Date();
	    ts = d.toLocaleFormat("%y/%m/%d %H:%M:%S");	    
	    console.log("[DEBUG] Connection failed!");
	    $("#queryPanel").addClass("panel-danger");
	    document.getElementById("queryPanelFooter").innerHTML = "[" + ts + "] Failure";
	    return false;
	},
	success: function(data){
	    d = new Date();
	    ts = d.toLocaleFormat("%y/%m/%d %H:%M:%S");
	    $("#queryPanel").addClass("panel-success");
	    document.getElementById("queryPanelFooter").innerHTML = "[" + ts + "] Success";

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

function update(){

    // clear the previous success/error colours
    resetColours();
    
    // debug print
    console.log("[DEBUG] update function invoked");
    
    // read the URI
    updateURI = document.getElementById("updateUriInput").value;    

    // read the query
    updateText = document.getElementById("updateTextInput").value;    
    
    // send the update
    var req = $.ajax({
	url: updateURI,
	crossOrigin: true,
	method: 'POST',
	contentType: "application/sparql-update",
	data: updateText,	
	error: function(event){
	    d = new Date();
	    ts = d.toLocaleFormat("%y/%m/%d %H:%M:%S");
	    console.log("[DEBUG] Connection failed!");
	    $("#updatePanel").addClass("panel-danger");
	    document.getElementById("updatePanelFooter").innerHTML = "[" + ts + "] Failure";
	    return false;
	},
	success: function(data){
	    d = new Date();
	    ts = d.toLocaleFormat("%y/%m/%d %H:%M:%S");
	    $("#updatePanel").addClass("panel-success");
	    document.getElementById("updatePanelFooter").innerHTML = "[" + ts + "] Success";
	}
    });
   
};
