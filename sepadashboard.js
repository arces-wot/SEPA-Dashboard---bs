var openSubscriptions = {};
var notifCols = [];

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

    // if an old element with the same prefix exists,
    // then remove it
    el = document.getElementById(pr);
    if ((el !== undefined) && (el !== null)){
	el.remove();
    }
    
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
		
		// if an old element with the same prefix exists,
		// then remove it
		el = document.getElementById(ns);
		if ((el !== undefined) && (el !== null)){
		    el.remove();
		}
		
		// add the new item
		newRow = table.insertRow(-1);
		newRow.insertCell(0).innerHTML = ns;
		newRow.insertCell(1).innerHTML = myJson["namespaces"][ns];
		newRow.insertCell(2).innerHTML = "<button action='button' class='btn btn-link btn-sm'><span class='glyphicon glyphicon-trash' aria-hidden='true'>&nbsp;</span>Delete</button>";
	    }

	    // retrieve the URLs
	    uURI = "http://" + myJson["parameters"]["host"] + ":" + myJson["parameters"]["ports"]["http"] + "/" + myJson["parameters"]["paths"]["update"];
	    document.getElementById("updateUriInput").value = uURI;    
	    qURI = "http://" + myJson["parameters"]["host"] + ":" + myJson["parameters"]["ports"]["http"] + "/" + myJson["parameters"]["paths"]["query"];
	    document.getElementById("queryUriInput").value = qURI;    
	    sURI = "ws://" + myJson["parameters"]["host"] + ":" + myJson["parameters"]["ports"]["ws"] + "/" + myJson["parameters"]["paths"]["subscribe"];
	    document.getElementById("subscribeUriInput").value = sURI;    
	    
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
	    document.getElementById("queryPanelFooter").innerHTML = "[" + ts + "] Query request failed";
	    return false;
	},
	success: function(data){
	    d = new Date();
	    ts = d.toLocaleFormat("%y/%m/%d %H:%M:%S");
	    $("#queryPanel").addClass("panel-success");
	    document.getElementById("queryPanelFooter").innerHTML = "[" + ts + "] Query request successful";

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
	    document.getElementById("updatePanelFooter").innerHTML = "[" + ts + "] Update request failed";
	    return false;
	},
	success: function(data){
	    d = new Date();
	    ts = d.toLocaleFormat("%y/%m/%d %H:%M:%S");
	    $("#updatePanel").addClass("panel-success");
	    document.getElementById("updatePanelFooter").innerHTML = "[" + ts + "] Update request successful";
	}
    });
   
};

function subscribe(){

    // clear the previous success/error colours
    resetColours();
    
    // debug print
    console.log("[DEBUG] subscribe function invoked");
    
    // read the URI
    subscribeURI = document.getElementById("subscribeUriInput").value;    

    // read the query
    subscribeText = document.getElementById("queryTextInput").value;    

    // open a websocket
    var ws = new WebSocket(subscribeURI);
    ws.onopen = function(){

	// generate an alias
	alias = "foo";
	    
	// send subscription
	ws.send(JSON.stringify({"subscribe":subscribeText, "alias":alias}));
    };

    // handler for received messages
    ws.onmessage = function(event){

	// parse the message
	msg = JSON.parse(event.data);
	
	if (msg["subscribed"] !== undefined){
	    
	    // get the subscription id
	    subid = msg["subscribed"];
	    subal = msg["alias"];
	    
	    // store the subid
	    table = document.getElementById("subidTable");
	    newRow = table.insertRow(-1);
	    newRow.id = subid;
	    newRow.insertCell(0).innerHTML = subid;
	    newRow.insertCell(1).innerHTML = subal;
	    newRow.insertCell(2).innerHTML = "<button action='button' class='btn btn-link btn-sm' onclick='javascript:unsubscribe(" + '"' + subid + '"' + ");'><span class='glyphicon glyphicon-trash' aria-hidden='true'>&nbsp;</span>Unsubscribe</button>";

	    // store the socket
	    openSubscriptions[subid] = ws;
	    
	    
	} else if ("results" in msg)  {

	    // get the table for added and removed results
	    at = document.getElementById("addedTable");
	    dt = document.getElementById("deletedTable");
	    
	    // iterate over the variables and add them
	    // to the array if not present
	    console.log(msg);
	    for (v in msg["results"]["head"]["vars"]){
		console.log();
		if (!(msg["results"]["head"]["vars"][v] in notifCols)){

		    // add the column to the list
		    notifCols.push(msg["results"]["head"]["vars"][v]);
		    console.log(notifCols);

		    // todo - add a column to the table
		    at.rows[0].insertCell(-1).innerHTML = msg["results"]["head"]["vars"][v];
		}
	    }

	    // iterate over the ADDED bindings to fill the table
	    for (r in msg["results"]["addedresults"]["bindings"]){

		// create a new row
		newRow = at.insertRow(-1);
		
		// iterate over the fields
		for (f in msg["results"]["addedresults"]["bindings"][r]){

		    // get the index of the column
		    console.log(f);
		    iv = notifCols.indexOf(f);
		    newRow.insertCell(iv).innerHTML = msg["results"]["addedresults"]["bindings"][r][f]["value"];
		}
		
	    }

	    // iterate over the DELETED bindings to fill the table
	    for (r in msg["results"]["removedresults"]["bindings"]){

		// create a new row
		newRow = dt.insertRow(-1);
		
		// iterate over the fields
		for (f in msg["results"]["removedresults"]["bindings"][r]){

		    // get the index of the column
		    console.log(f);
		    iv = notifCols.indexOf(f);
		    newRow.insertCell(iv).innerHTML = msg["results"]["removedresults"]["bindings"][r][f]["value"];
		}
		
	    }
	    
	    // msg["results"]["bindings"]
	    
	} else {
	    console.log(msg);
	}

    };   
    
    // handler for the ws closing
    ws.onclose = function(event){
	console.log("[DEBUG] Subscription " + subid + " closed.");
    };

}

function unsubscribe(subid){

    // debug print
    console.log("[DEBUG] function unsubscribe invoked");

    // close the websocket
    openSubscriptions[subid].close();
    delete openSubscriptions[subid];

    // delete the row from table
    document.getElementById(subid).remove();

}

function getNamespaces(){

    // get namespace table
    table = document.getElementById("namespacesTable");
    for (var i=1; i<table.rows.length; i++) {
	console.log(table.rows[1]);
    };
       
}
