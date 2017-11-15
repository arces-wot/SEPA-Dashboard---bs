var openSubscriptions = {};
var notifCols = [];
var myJson = null;

function getTimestamp(){
    date = new Date();
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();    
};

function deleteNamespace(ns){

    // debug print
    console.log("[DEBUG] invoked deleteNamespace function");

    // delete the namespace
    var rowIndex = document.getElementById(ns).remove();

    // add message to the footer
    document.getElementById("nsPanelFooter").innerHTML = "[" + getTimestamp() + "] prefix " + ns + " deleted";
   
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
    newCell.innerHTML = "<button action='button' class='btn btn-primary btn-sm' onclick='javascript:deleteNamespace(" + '"' + pr + '"' + ");'><span class='glyphicon glyphicon-trash' aria-hidden='true''>&nbsp;</span>Delete</button>";

    // add message to the footer
    document.getElementById("nsPanelFooter").innerHTML = "[" + getTimestamp() + "] new prefix " + pr + " defined";
    
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
		console.log(ns);
		newRow = table.insertRow(-1);
		newRow.id = ns;
		newRow.insertCell(0).innerHTML = ns;
		newRow.insertCell(1).innerHTML = myJson["namespaces"][ns];
		newRow.insertCell(2).innerHTML = "<button action='button' class='btn btn-primary btn-sm' onclick='javascript:deleteNamespace(" + '"' + ns + '"' + ");'><span class='glyphicon glyphicon-trash' aria-hidden='true''>&nbsp;</span>Delete</button>";

	    }

	    // retrieve the URLs
	    uURI = "http://" + myJson["parameters"]["host"] + ":" + myJson["parameters"]["ports"]["http"] + myJson["parameters"]["paths"]["update"];
	    document.getElementById("updateUriInput").value = uURI;    
	    qURI = "http://" + myJson["parameters"]["host"] + ":" + myJson["parameters"]["ports"]["http"] + myJson["parameters"]["paths"]["query"];
	    document.getElementById("queryUriInput").value = qURI;    
	    sURI = "ws://" + myJson["parameters"]["host"] + ":" + myJson["parameters"]["ports"]["ws"] + myJson["parameters"]["paths"]["subscribe"];
	    document.getElementById("subscribeUriInput").value = sURI;    
	    
		// load queries
		ul = document.getElementById("queryDropdown");
		for (q in myJson["queries"]){
			li = document.createElement("li");			
			li.setAttribute("id", q);
			li.innerHTML = q;
			li.setAttribute("onclick", "javascript:loadUpdateQuery(false, '" + q + "');");
			li.setAttribute("data-toggle", "modal");
			li.setAttribute("data-target", "#basicModal");	
			ul.appendChild(li);
		};
	    
	        // load updates
		ul = document.getElementById("updateDropdown");
		for (q in myJson["updates"]){
			li = document.createElement("li");			
			li.setAttribute("id", q);
			li.innerHTML = q;
			li.setAttribute("onclick", "javascript:loadUpdateQuery(true, '" + q + "');");		
			li.setAttribute("data-toggle", "modal");
			li.setAttribute("data-target", "#basicModal");			
			ul.appendChild(li);
		};
		
	};
	fr.readAsText(file);	
    }

    // put message in the footer
    document.getElementById("jsapPanelFooter").innerHTML = "[" + getTimestamp() + "] JSAP file loaded";
    
};

function loadUpdateQuery(u, uqname){
	
	// check the value of u
	// u === true -> update
	// u === false -> query/sub
	
	if (u){		
		// get the update content from JSAP					
		document.getElementById("updateTextInput").value = myJson["updates"][uqname]["sparql"];						

		if ("forcedBindings" in myJson["updates"][uqname]){
			console.log(Object.keys(myJson["updates"][uqname]["forcedBindings"]).length);
			if (Object.keys(myJson["updates"][uqname]["forcedBindings"]).length > 0){
			
				// now put the forced bindings variables into the form
				form = document.getElementById("fbForm");			
			
				// remove old elements		
				form.innerHTML = "";
							
				// set the title of the form 
				document.getElementById("forcedBindingsHeader").innerHTML = "update:" + uqname;
			
				// prepare the content of the form
				for (fb in myJson["updates"][uqname]["forcedBindings"]){				
							
					// add a label				
					linput = document.createElement("label");
					linput.innerHTML = fb + " (" + myJson["updates"][uqname]["forcedBindings"][fb]["type"] + ")";
					form.appendChild(linput);
					
					// add the entry field			
					input = document.createElement("input");
					input.type = "text";
					input.setAttribute("id", fb);
					input.setAttribute("placeholder", "?" + fb);
					input.setAttribute("class", "form-control");
					form.appendChild(input);
					form.appendChild(document.createElement("br"));									
					
				};
			};
		};
		
	} else {
		
		// get the query content from JSAP	
		document.getElementById("queryTextInput").value = myJson["queries"][uqname]["sparql"];
		
		if ("forcedBindings" in myJson["queries"][uqname]){
			console.log(Object.keys(myJson["queries"][uqname]["forcedBindings"]).length);
			if (Object.keys(myJson["queries"][uqname]["forcedBindings"]).length > 0){
			
				// now put the forced bindings variables into the form
				form = document.getElementById("fbForm");			
			
				// remove old elements		
				form.innerHTML = "";
							
				// set the title of the form 
				document.getElementById("forcedBindingsHeader").innerHTML = "query:" + uqname;
			
				// prepare the content of the form
				for (fb in myJson["queries"][uqname]["forcedBindings"]){				
							
					// add a label				
					linput = document.createElement("label");
					linput.innerHTML = fb + " (" + myJson["queries"][uqname]["forcedBindings"][fb]["type"] + ")";
					form.appendChild(linput);
					
					// add the entry field			
					input = document.createElement("input");
					input.type = "text";
					input.setAttribute("id", fb);
					input.setAttribute("placeholder", "?" + fb);
					input.setAttribute("class", "form-control");
					form.appendChild(input);
					form.appendChild(document.createElement("br"));									
					
				};
			};
		};
		
	}
};

function clr(w){

    console.log("[DEBUG] invoked clr function");
    switch (w) {
    case "subTables":

	// clear the added table
	table = document.getElementById("addedTable");
	while(table.rows.length > 0) {
	    table.deleteRow(-1);
	};
	newRow = table.insertRow(-1);
	newRow.insertCell(0).outerHTML = "<th>Sub ID</th>"

	// clear the table
	table = document.getElementById("deletedTable");
	while(table.rows.length > 0) {
	    table.deleteRow(-1);
	};
	newRow = table.insertRow(-1);	
	newRow.insertCell(0).outerHTML = "<th>Sub ID</th>"

	// clear the list of variables
	notifCols = [];
	
	break;
	
    case "query":

	// clear the textarea
	console.log("[DEBUG] Clearing query textarea");	
	document.getElementById("queryTextInput").value = "";

	// clear the panel status
	console.log("[DEBUG] Resetting panel status");

	// clear the panel footer
	console.log("[DEBUG] Resetting panel footer");
	$("#queryPanelFooter").innerHTML = "";
	
	break;

    case "update":

	// clear the textarea
	console.log("[DEBUG] Clearing update textarea");	
	document.getElementById("updateTextInput").value = "";

	// clear the panel footer
	console.log("[DEBUG] Resetting panel footer");
	$("#updatePanelFooter").innerHTML = "";

	break;

    case "queryResults":

	// clear the table
	table = document.getElementById("queryTable");
	while(table.rows.length > 0) {
	    table.deleteRow(-1);
	};
	
	break;
	
	case "all":
	
	// clear all the fields
	document.getElementById("updateTextInput").value = "";
	document.getElementById("queryTextInput").value = "";
	document.getElementById("subscriptionAlias").value = "";
	document.getElementById("updateUriInput").value = "";
	document.getElementById("subscribeUriInput").value = "";
	document.getElementById("queryUriInput").value = "";
	clr("query");
	clr("subTables");
	clr("queryResults");

	break;
	
    };    
    
};

function query(){
    
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
	data: getNamespaces() + queryText,	
	error: function(event){
	    console.log("[DEBUG] Connection failed!");
	    document.getElementById("queryPanelFooter").innerHTML = "[" + getTimestamp() + "] Query request failed";
	    return false;
	},
	success: function(data){
	    document.getElementById("queryPanelFooter").innerHTML = "[" + getTimestamp() + "] Query request successful";

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
		for (el in data["results"]["bindings"][line]){
		    newCell = newRow.insertCell(-1).innerHTML = data["results"]["bindings"][line][el]["value"];
		}
	    };	    
	}
    });
   
};

function update(){
    
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
	data: getNamespaces() + updateText,	
	error: function(event){
	    console.log("[DEBUG] Connection failed!");
	    document.getElementById("updatePanelFooter").innerHTML = "[" + getTimestamp() + "] Update request failed";
	    return false;
	},
	success: function(data){
	    document.getElementById("updatePanelFooter").innerHTML = "[" + getTimestamp() + "] Update request successful";
	}
    });
   
};

function subscribe(){
    
    // debug print
    console.log("[DEBUG] subscribe function invoked");
    
    // read the URI
    subscribeURI = document.getElementById("subscribeUriInput").value;    

    // read the query
    subscribeText = getNamespaces() + document.getElementById("queryTextInput").value;

    // open a websocket
    var ws = new WebSocket(subscribeURI);
    ws.onopen = function(){

	// generate an alias
	alias = document.getElementById("subscriptionAlias").value;
	    
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
	    newRow.insertCell(2).innerHTML = "<button action='button' class='btn btn-primary btn-sm' onclick='javascript:unsubscribe(" + '"' + subid + '"' + ");'><span class='glyphicon glyphicon-trash' aria-hidden='true'>&nbsp;</span>Unsubscribe</button>";

	    // store the socket
	    openSubscriptions[subid] = ws;

	    // put a message in the footer
	    document.getElementById("submanPanelFooter").innerHTML = "[" + getTimestamp() + "] subscription " + subal + " confirmed";
	    document.getElementById("queryPanelFooter").innerHTML = "[" + getTimestamp() + "] subscription " + subal + " confirmed";

	    // get the table for added and removed results
	    at = document.getElementById("addedTable");
	    dt = document.getElementById("deletedTable");
	    console.log(msg);
	    
	    // iterate over the variables and add them
	    // to the array if not present
	    for (v in msg["firstResults"]["head"]["vars"]){
		if (!(notifCols.includes(msg["firstResults"]["head"]["vars"][v]))){
		    
		    // add the column to the list
		    notifCols.push(msg["firstResults"]["head"]["vars"][v]);

		    // add the column to the added and removed tables
		    at.rows[0].insertCell(-1).outerHTML = "<th>?" + msg["firstResults"]["head"]["vars"][v] + "</th>";
		    dt.rows[0].insertCell(-1).outerHTML = "<th>?" + msg["firstResults"]["head"]["vars"][v] + "</th>";
		}
	    }

	    // iterate over the ADDED bindings to fill the table
	    for (r in msg["firstResults"]["results"]["bindings"]){

		// create a new row with the right number of fields	
		newRow = at.insertRow(-1);
		for (var nf=0; nf <= notifCols.length; nf++){
		    newRow.insertCell(-1);
		}

		// put the Sub ID into the first column
		newRow.cells[0].innerHTML = msg["subscribed"];
		
		// iterate over the fields
		for (f in msg["firstResults"]["results"]["bindings"][r]){

		    // get the index of the column
		    console.log(f);
		    iv = notifCols.indexOf(f);
		    newRow.cells[iv + 1].innerHTML = msg["firstResults"]["results"]["bindings"][r][f]["value"];
		}
		
	    }
	    
	    
	} else if ("results" in msg)  {

	    // get the table for added and removed results
	    at = document.getElementById("addedTable");
	    dt = document.getElementById("deletedTable");
	    
	    // iterate over the variables and add them
	    // to the array if not present
	    for (v in msg["results"]["head"]["vars"]){
		if (!(notifCols.includes(msg["results"]["head"]["vars"][v]))){
		    
		    // add the column to the list
		    notifCols.push(msg["results"]["head"]["vars"][v]);

		    // add the column to the added and removed tables
		    at.rows[0].insertCell(-1).outerHTML = "<th>?" + msg["results"]["head"]["vars"][v] + "</th>";
		    dt.rows[0].insertCell(-1).outerHTML = "<th>?" + msg["results"]["head"]["vars"][v] + "</th>";
		}
	    }

	    // iterate over the ADDED bindings to fill the table
	    for (r in msg["results"]["addedresults"]["bindings"]){

		// create a new row with the right number of fields	
		newRow = at.insertRow(-1);
		for (var nf=0; nf <= notifCols.length; nf++){
		    newRow.insertCell(-1);
		}

		// put the Sub ID into the first column
		newRow.cells[0].innerHTML = msg["spuid"];
		
		// iterate over the fields
		for (f in msg["results"]["addedresults"]["bindings"][r]){

		    // get the index of the column
		    console.log(f);
		    iv = notifCols.indexOf(f);
		    newRow.cells[iv + 1].innerHTML = msg["results"]["addedresults"]["bindings"][r][f]["value"];
		}
		
	    }

	    // iterate over the DELETED bindings to fill the table
	    for (r in msg["results"]["removedresults"]["bindings"]){

		// create a new row with the right number of fields	
		newRow = dt.insertRow(-1);
		for (var nf=0; nf <= notifCols.length; nf++){
		    newRow.insertCell(-1);
		}
		// put the Sub ID into the first column
		newRow.cells[0].innerHTML = msg["spuid"];
		
		// iterate over the fields
		for (f in msg["results"]["removedresults"]["bindings"][r]){

		    // get the index of the column
		    iv = notifCols.indexOf(f);
		    newRow.cells(iv + 1).innerHTML = msg["results"]["removedresults"]["bindings"][r][f]["value"];
		}		
	    }
	    
	} else {
	    console.log(msg);
	}

    };   
    
    // handler for the ws closing
    ws.onclose = function(event){

	// debug print
	console.log("[DEBUG] Subscription " + subid + " closed.");

	// put a message in the footer
	document.getElementById("queryPanelFooter").innerHTML = "[" + getTimestamp() + "] subscription " + subid + " closed";
	document.getElementById("submanPanelFooter").innerHTML = "[" + getTimestamp() + "] subscription " + subid + " closed";

	// delete the subscription from the local array
	delete openSubscriptions[subid];

	// TODO - delete the subscription from the list
	var rowIndex = document.getElementById(subid).remove();	
    };

}

function unsubscribe(subid){

    // debug print
    console.log("[DEBUG] function unsubscribe invoked");

    // close the websocket
    openSubscriptions[subid].close();

    // delete the row from table
    document.getElementById(subid).remove();

}

function getNamespaces(){

    // initialize the results
    ns = "";
    
    // get namespace table    
    table = document.getElementById("namespacesTable");
    for (var i=1; i<table.rows.length; i++) {
	ns += "PREFIX " + table.rows[i].cells[0].innerHTML + ": <" + table.rows[i].cells[1].innerHTML + "> ";
    };

    // return
    return ns;
       
};

function aboutUs(){
    alert("Developed by Fabio Viola (ARCES, University of Bologna). Licensed under GPLv3.");
}

function parseForcedBindings(){
	
	// debug print
	console.log("[DEBUG] function parseForcedBindings invoked");
	
	// find if it is a query or an update and its name
	u = document.getElementById("forcedBindingsHeader").innerHTML.split(":")[0];
	uqname = document.getElementById("forcedBindingsHeader").innerHTML.split(":")[1];	
	uqtext = null;
	if (u === "update"){
		uqtext = myJson["updates"][uqname]["sparql"];
	} else {
		uqtext = myJson["subscribes"][uqname]["sparql"];
	};
	
	// read values from form
	form = document.getElementById("fbForm");
	els = form.getElementsByTagName('input');			
	for (var c=0; c < els.length; c++){
		
		// build a regexp for the substitution
		varname = els[c].placeholder;
		varvalue = els[c].value;
		r = new RegExp('\\?' + varname.substring(1) + '\\s+', 'g');
		uqtext = uqtext.replace(r, varvalue + " ");				
	};	
	
	// fill the query/update textbox
	if (u === "update"){
		document.getElementById("updateTextInput").value = uqtext;					
	} else {
		document.getElementById("queryTextInput").value = uqtext;
	};
		
	// close the popup
	$("#basicModal").modal('hide');
	
};

