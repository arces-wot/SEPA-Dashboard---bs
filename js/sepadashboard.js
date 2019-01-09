var openSubscriptions = {};
var myJson = null;
var tabIndex = 0;
var headers = {};

function getTimestamp() {
	date = new Date();
	return date.toLocaleDateString() + " " + date.toLocaleTimeString();
};

function deleteNamespace(ns) {
	document.getElementById(ns).remove();
};

function addNamespace() {
	// get the prefix
	pr = document.getElementById("prefixField").value;

	// get the namespace
	ns = document.getElementById("namespaceField").value;

	// if an old element with the same prefix exists,
	// then remove it
	el = document.getElementById(pr);
	if ((el !== undefined) && (el !== null)) {
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
	newCell.innerHTML = "<button action='button' class='btn btn-primary btn-sm' onclick='javascript:deleteNamespace("
			+ '"'
			+ pr
			+ '"'
			+ ");'><small><span class='glyphicon glyphicon-trash' aria-hidden='true''><i class='fas fa-trash-alt'></i>&nbsp;</span>Delete</small></button>";
};

function getNamespaces() {
	// initialize the results
	ns = "";

	// get namespace table
	table = document.getElementById("namespacesTable");
	for (var i = 1; i < table.rows.length; i++) {
		ns += "PREFIX " + table.rows[i].cells[0].innerHTML + ": <"
				+ table.rows[i].cells[1].innerHTML + "> ";
	}
	;

	// return
	return ns;

};

function loadJsap() {
	// check if file reader is supported
	if (!window.FileReader) {
		console.log("[ERROR] FileReader API is not supported by your browser.");
		return false;
	}

	// load data
	var $i = $('#loadJsap');
	input = $i[0];
	if (input.files && input.files[0]) {
		file = input.files[0];

		// create a mew instance of the file reader
		fr = new FileReader();
		var text;
		fr.onload = function() {

			// read the content of the file
			var decodedData = fr.result;

			// parse the JSON file
			myJson = JSON.parse(decodedData);

			// get the namespaces table
			table = document.getElementById("namespacesTable");

			// retrieve namespaces
			for (ns in myJson["namespaces"]) {

				// if an old element with the same prefix exists,
				// then remove it
				el = document.getElementById(ns);
				if ((el !== undefined) && (el !== null)) {
					el.remove();
				}

				// add the new item
				newRow = table.insertRow(-1);
				newRow.id = ns;
				newRow.insertCell(0).innerHTML = ns;
				newRow.insertCell(1).innerHTML = myJson["namespaces"][ns];
				newRow.insertCell(2).innerHTML = "<button action='button' class='btn btn-primary btn-sm' onclick='javascript:deleteNamespace("
						+ '"'
						+ ns
						+ '"'
						+ ");'><small><i class='fas fa-trash-alt'></i>&nbsp;</span>Delete</small></button>";

			}

			// retrieve the URLs
			$("#host").val(myJson["host"]);
			
			$("#sparql11protocol").val(myJson["sparql11protocol"]["protocol"]);
			$("#sparql11port").val(myJson["sparql11protocol"]["port"]);	
			$("#updatePath").val(myJson["sparql11protocol"]["update"]["path"]);
			$("#queryPath").val(myJson["sparql11protocol"]["query"]["path"]);
			
			ws = myJson["sparql11seprotocol"]["protocol"];
			
			$("#sparql11seprotocol").val(ws);
			$("#sparql11seport").val(myJson["sparql11seprotocol"]["availableProtocols"][ws]["port"]);	
			$("#subscribePath").val(myJson["sparql11seprotocol"]["availableProtocols"][ws]["path"]);
			
			// load queries
			ul = document.getElementById("queryDropdown");
			for (q in myJson["queries"]) {
				li = document.createElement("li");
				li.setAttribute("id", q);
				li.innerHTML = q;
				li.setAttribute("onclick",
						"javascript:loadUQS(\"Q\", '" + q + "');");
				li.setAttribute("data-toggle", "modal");
				li.setAttribute("data-target", "#basicModal");
				li.classList.add("dropdown-item");
				li.classList.add("small");
				ul.appendChild(li);
			}
			;
			
			// load subscribes
			ul = document.getElementById("subscribeDropdown");
			for (q in myJson["queries"]) {
				li = document.createElement("li");
				li.setAttribute("id", q);
				li.innerHTML = q;
				li.setAttribute("onclick",
						"javascript:loadUQS(\"S\", '" + q + "');");
				li.setAttribute("data-toggle", "modal");
				li.setAttribute("data-target", "#basicModal");
				li.classList.add("dropdown-item");
				li.classList.add("small");
				ul.appendChild(li);
			}
			;

			// load updates
			ul = document.getElementById("updateDropdown");
			for (q in myJson["updates"]) {
				li = document.createElement("li");
				li.setAttribute("id", q);
				li.innerHTML = q;
				li.setAttribute("onclick", "javascript:loadUQS(\"U\", '"
						+ q + "');");
				li.setAttribute("data-toggle", "modal");
				li.setAttribute("data-target", "#basicModal");
				li.classList.add("dropdown-item");
				li.classList.add("small");
				ul.appendChild(li);
			}
			;

		};
		fr.readAsText(file);
	}
};

//****************************************************//
//** Validate a URI (includes delimiters in groups) **//
//****************************************************//
//- The different parts--along with their delimiters--are kept in their own
//groups and can be recombined as $1$6$2$3$4$5$7$8$9
//- groups are as follows:
//1,6 == scheme:// or scheme:
//2   == userinfo@
//3   == host
//4   == :port
//5,7 == path (5 if it has an authority, 7 if it doesn't)
//8   == ?query
//9   == #fragment

var regexUriDelim = /^(?:([a-z0-9+.-]+:\/\/)((?:(?:[a-z0-9-._~!$&'()*+,;=:]|%[0-9A-F]{2})*)@)?((?:[a-z0-9-._~!$&'()*+,;=]|%[0-9A-F]{2})*)(:(?:\d*))?(\/(?:[a-z0-9-._~!$&'()*+,;=:@\/]|%[0-9A-F]{2})*)?|([a-z0-9+.-]+:)(\/?(?:[a-z0-9-._~!$&'()*+,;=:@]|%[0-9A-F]{2})+(?:[a-z0-9-._~!$&'()*+,;=:@\/]|%[0-9A-F]{2})*)?)(\?(?:[a-z0-9-._~!$&'()*+,;=:\/?@]|%[0-9A-F]{2})*)?(#(?:[a-z0-9-._~!$&'()*+,;=:\/?@]|%[0-9A-F]{2})*)?$/i;

var numbersOrBoolean = ["xsd:integer", "xsd:decimal", "xsd:double", "xsd:boolean", "http://www.w3.org/2001/XMLSchema#integer", "http://www.w3.org/2001/XMLSchema#decimal", "http://www.w3.org/2001/XMLSchema#double", "http://www.w3.org/2001/XMLSchema#boolean"];	

function formatValue(value,datatype) {
	if(datatype === "uri") {
		try {
			decodeURI(value);
		} catch(e) { // catches a malformed URI
			console.error(e);
			return null;
		}
		
		scheme = value.replace(regexUriDelim,"$1");
		if (scheme != "") value = "<" +value + ">";
		return value;
	} else if (datatype === "literal") {
		value = "'"+value+"'";
		return value;
	}
	
	if (numbersOrBoolean.includes(value)) return value;
	
	scheme = datatype.replace(regexUriDelim,"$1");
	if (scheme != "") datatype = "<" +datatype + ">";
	value = "'" + value + "'^^" + datatype;
	return value;
}

function replaceBindings(u,sparql) {
	if (u == "U") {
		text = document.getElementById("updateTextInput").value;
		fb = "#updateForcedBindings";
	} else if (u == "Q") {
		text = document.getElementById("queryTextInput").value;
		fb = "#queryForcedBindings";
	}
	else {
		text = document.getElementById("subscribeTextInput").value;
		fb = "#subscribeForcedBindings";
	}

	$(fb).each(function() {
		$(this).find(':input').each(function() {
			binding = $(this).attr("id");
			value = formatValue($(this).val(),$(this).attr("type"));
			sparql = sparql.replace("?"+binding,value)
		}); 
	});
	
	return sparql;
}

function loadForcedBindings(u, id) {
	if (u == "U") {
		key = "updates";
		forcedBindings = document.getElementById("updateForcedBindings");
		$("#updateForcedBindings").empty();
	} else if (u == "Q"){
		key = "queries";
		forcedBindings = document.getElementById("queryForcedBindings");
		$("#queryForcedBindings").empty();
	}
	else {
		key = "queries";
		forcedBindings = document.getElementById("subscribeForcedBindings");
		$("#subscribeForcedBindings").empty();
	}

	if ("forcedBindings" in myJson[key][id]) {
		console.log(Object.keys(myJson[key][id]["forcedBindings"]).length);
		if (Object.keys(myJson[key][id]["forcedBindings"]).length > 0) {
			/*
			 * <div class="form-group"> <label class="col-form-label-sm"><b>Forced
			 * bindings</b></label> </div>
			 */
			label = document.createElement("label");
			label.setAttribute("class", "col-form-label-sm");
			label.innerHTML = "<b>Forced bindings</b>";

			forcedBindings.appendChild(label);

			for (fb in myJson[key][id]["forcedBindings"]) {

				/*
				 * <div class="input-group mb-3"> 
				 * 	<div class="input-group-prepend"><span class="input-group-text">variable</span></div>
				 * 	<input type="text" class="form-control" aria-label="Specify the binding value" id="variable name">
				 *  <div class="input-group-append"> <span class="input-group-text">URI/literal</span></div>
				 * </div>
				 */

				span = document.createElement("span");
				span.setAttribute("class", "input-group-text");
				span.innerHTML = fb;

				div = document.createElement("div");
				div.setAttribute("class", "input-group mb-3");
				div.appendChild(span);
				
				if (myJson[key][id]["forcedBindings"][fb]["datatype"] != null)
					type = myJson[key][id]["forcedBindings"][fb]["datatype"];
				else
					type = myJson[key][id]["forcedBindings"][fb]["type"];
				
				input = document.createElement("input");
				input.type = "text";
				input.setAttribute("class", "form-control");
				input.setAttribute("aria-label", "Specify the binding value");
				input.setAttribute("id", fb);
				input.setAttribute("type", type);
				
				div.appendChild(input);

				span2 = document.createElement("span");
				span2.setAttribute("class", "input-group-text");
				span2.innerHTML = type;

				div2 = document.createElement("div");
				div2.setAttribute("class", "input-group-append");
				div2.appendChild(span2);

				div.appendChild(div2);

				forcedBindings.appendChild(div);
			}
		}
	}
}

function loadUQS(usq, uqname) {
	// check the value of u
	// u === "U" -> update
	// u === "Q" -> query
	// u === "S" -> subscribe
	
	if (usq == "U") {
		document.getElementById("updateTextInput").value = myJson["updates"][uqname]["sparql"];
		document.getElementById("updateLabel").innerHTML = "<b>" + uqname
				+ "</b>";
	} else if (usq == "Q") {
		document.getElementById("queryTextInput").value = myJson["queries"][uqname]["sparql"];
		document.getElementById("queryLabel").innerHTML = "<b>" + uqname
				+ "</b>";
	}
	else {
		document.getElementById("subscribeTextInput").value = myJson["queries"][uqname]["sparql"];
		document.getElementById("subscribeLabel").innerHTML = "<b>" + uqname
				+ "</b>";
		document.getElementById("subscriptionAlias").value = uqname;
	}

	loadForcedBindings(usq, uqname);
}

function query() {
	// read the query
	queryText = document.getElementById("queryTextInput").value;
	queryText = replaceBindings("Q",queryText);

	const sepa = Sepajs.client;
	
	config = {"host" : $("#host").val() , "sparql11protocol": {"port" : $("#sparql11port").val() , "path" : $("#queryPath").val()}};
	
	start = Date.now(); 
	sepa.query(getNamespaces() + queryText,config).then((data)=>{
		stop = Date.now();
		
		$("#queryResultLabel").html("["+getTimestamp()+ "] "+ data["results"]["bindings"].length +" results in "+(stop-start)+ " ms")
		
		$("#queryTable thead tr").empty();
		$("#queryTable tbody").empty();
		
		for (name of data["head"]["vars"]) {
			$("#queryTable thead tr").append("<th scope=\"col\">"+name+"</th>");
		}
	
		
		for (binding in data["results"]["bindings"]) {
			$("#queryTable tbody").append("<tr></tr>");
			tr = $("#queryTable tbody tr:last");
			
			for (name of data["head"]["vars"]) {
				value = null;
				type = "literal";
				if (data["results"]["bindings"][binding][name] != null) {
					type = data["results"]["bindings"][binding][name]["type"];
					value = data["results"]["bindings"][binding][name]["value"];
				}
				
				if (value === null) {
					tr.append("<td class=\"table-danger\"></td>");
				}
				else {
					if (type === "literal" || type === "typed-literal") {
						if (type === "typed-literal") value = value + "^^" + data["results"]["bindings"][binding][name]["datatype"];
						tr.append("<td class=\"table-primary\">"+value+"</td>");
					}
					else tr.append("<td class=\"table-success\">"+value+"</td>");
				}
				
			}
		}
	 }).catch((err)=>{
		 stop = Date.now();
		 $("#queryResultLabel").html("["+getTimestamp()+ "] "+err+" *** Query FAILED in "+(stop-start)+ " ms ***");
	 });
}

function clearQueryResults(){
	$("#queryTable thead tr").empty();
	$("#queryTable tbody").empty();
}

function update() {
	// read the update
	updateText = document.getElementById("updateTextInput").value;
	updateText = replaceBindings("U",updateText);

	config = {"host" : $("#host").val() , "sparql11protocol": {"port" : $("#sparql11port").val() , "path" : $("#updatePath").val()}};
	
	const sepa = Sepajs.client;
	start = Date.now();
	sepa.update(getNamespaces() + updateText,config).then((data)=>{ 
		stop = Date.now();
		$("#updateResultLabel").html("["+getTimestamp()+ "] Update done in "+(stop-start)+ " ms")
	}).catch((err)=>{
		 stop = Date.now();
		 $("#updateResultLabel").html("["+getTimestamp()+ "] "+err+" *** Update FAILED in "+(stop-start)+ " ms ***")
	 });
};

function subscribe() {
	// read the query
	subscribeText = document.getElementById("subscribeTextInput").value
	subscribeText = getNamespaces() + replaceBindings("U",subscribeText);

	/* TODO: use JS SEPA API
	ws = $("#sparql11seprotocol").val();
	config = {"host" : $("#host").val() , "sparql11seprotocol": {ws : {"port" : $("#sparql11seport").val() , "path" : $("#subscribePath").val()}}};
	
	const sepa = Sepajs.client;
	sepa.subscribe(getNamespaces() + subscribeText,{
	    next(data) {console.log("Data received: " + data)},
	    error(err) { console.log("Received an error: " + err) },
	    complete() { console.log("Server closed connection ") },
	  },
	  config)
	}
	*/

	if ($("#sparql11seport").val() === "") port = "";
	else port = ":" + $("#sparql11seport").val();
	
	subscribeURI = $("#sparql11seprotocol").val() + "://" + $("#host").val() + port + $("#subscribePath").val();
	
	// open a websocket
	var ws = new WebSocket(subscribeURI);

	var spuid = null;
	
	ws.onerror = function() {
		console.log("ERROR");
		
		$("#subscribeInfoLabel").html("["+getTimestamp()+ "] *** Subscribe FAILED @ "+subscribeURI+" ***");
		
	};

	ws.onopen = function() {
		// generate an alias
		alias = document.getElementById("subscriptionAlias").value;

		// send subscription
		ws.send(JSON.stringify({
			"subscribe" : {
				"sparql" : subscribeText,
				"alias" : alias
			}
		}));
	};

	// handler for received messages
	ws.onmessage = function(event) {

		// parse the message
		msg = JSON.parse(event.data);

		if (msg["notification"] !== undefined) {
			// get the subscription id
			spuid = msg["notification"]["spuid"];
			alias = msg["notification"]["alias"];
			
			if (alias === "") {
				alias = spuid;
			}
			
			// FIRST NOTIFICATION
			if (msg["notification"]["sequence"] == 0) {
				
				$("#subscribeInfoLabel").html("["+getTimestamp()+ "] New subscription "+spuid);
				$("#notificationsInfoLabel").html("["+getTimestamp()+ "] New subscription "+spuid);
				
				tabIndex = tabIndex + 1;
				openSubscriptions[spuid] = {"ws": ws, "tab": tabIndex};
				
				// Create TAB entry
				$("#pills-tab-subscriptions").append(
						"<li class=\"nav-item\">" +
						"	<a class=\"nav-link\" " +
						"id=\"pills-"+tabIndex+"-tab\" " +
						"data-toggle=\"pill\" " +
						"href=\"#pills-"+tabIndex+"\" " +
						"role=\"tab\" " +
						"aria-controls=\"pills-"+tabIndex+"\" " +
						"aria-selected=\"false\">"+alias+"</a></li>");
				
				// Create TAB content				
				$("#pills-tabContent-subscriptions").append(
						"<div class=\"tab-pane mt-3 fade\" " +
						"id=\"pills-" + tabIndex+"\" " +
						"role=\"tabpanel\" " +
						"aria-labelledby=\"pills-" + tabIndex+"-tab\">" +
							"<button action='button' class='btn btn-outline-danger btn-sm mb-3 float-right' " +
							"onclick='javascript:unsubscribe(\""+spuid+"\")'>"+
							"<small><i class='fas fa-trash-alt'></i>&nbspUnsubscribe</small>" +
							"</button>" +
							"<div class=\"table-responsive\">"+
							"<div class=\"table-wrapper\">"+
								"<table class=\"table table-bordered table-hover table-sm\" " +
								"id=\"table-" + tabIndex+"\"></table>" +
							"</div>" +
							"</div>" +
						"</div>");
				
				// SHOW tab
				$('#pills-'+tabIndex+"-tab").tab('show');
			}
			
			$("#notificationsInfoLabel").html("["+getTimestamp()+ "] Last notification: "+spuid +" ("+msg["notification"]["sequence"]+")");
			
			// TABLE HEADER
			for (v in msg["notification"]["removedResults"]["head"]["vars"]) {
				name = msg["notification"]["removedResults"]["head"]["vars"][v];
				
				if (headers[spuid] == null) {	
					// NEW HEADER
					headers[spuid] = [];
					headers[spuid].push(name);
					
					$("#activeSubscriptions #table-"+openSubscriptions[spuid].tab).append("<thead class=\"thead-light\"><tr><th scope=\"col\">"+"#"+"</th></tr></thead>");
					$("#activeSubscriptions #table-"+openSubscriptions[spuid].tab+" thead tr").append("<th scope=\"col\">"+name+"</th>");
					
					// NEW BODY
					$("#activeSubscriptions #table-"+openSubscriptions[spuid].tab).append("<tbody id=\"tbody-"+openSubscriptions[spuid].tab+"\"></tbody>");
				}
				else if (!headers[spuid].includes(name)) {
					// NEW VARIABLE
					headers[spuid].push(name);
					$("#activeSubscriptions #table-"+openSubscriptions[spuid].tab+" thead tr").append("<th scope=\"col\">"+name+"</th");
				}
			}
			
			for (v in msg["notification"]["addedResults"]["head"]["vars"]) {
				name = msg["notification"]["addedResults"]["head"]["vars"][v];
				
				if (headers[spuid] == null) {	
					// NEW HEADER
					headers[spuid] = [];
					headers[spuid].push(name);
					
					$("#activeSubscriptions #table-"+openSubscriptions[spuid].tab).append("<thead><tr><th scope=\"col\">"+"#"+"</th></tr></thead>");
					$("#activeSubscriptions #table-"+openSubscriptions[spuid].tab+" thead tr").append("<th scope=\"col\">"+name+"</th>");
					
					// NEW BODY
					$("#activeSubscriptions #table-"+openSubscriptions[spuid].tab).append("<tbody id=\"tbody-"+openSubscriptions[spuid].tab+"\"></tbody>");
				}
				else if (!headers[spuid].includes(name)) {
					// NEW VARIABLE
					headers[spuid].push(name);
					$("#activeSubscriptions #table-"+openSubscriptions[spuid].tab+" thead tr").append("<th scope=\"col\">"+name+"</th");
				}
			}
			
						
			/*
			 * <tbody> <tr class="table-danger"> <th scope="row">1</th> <td>Mark</td>
			 * <td>Otto</td> <td>@mdo</td> </tr> <tr class="table-success">
			 * <th scope="row">3</th> <td>Larry</td> <td>the Bird</td>
			 * <td>@twitter</td> </tr> </tbody>
			 */
			
			// iterate over the REMOVED bindings to fill the table
			for (index in msg["notification"]["removedResults"]["results"]["bindings"]) {
				bindings = msg["notification"]["removedResults"]["results"]["bindings"][index];
				
				$("#activeSubscriptions #tbody-"+openSubscriptions[spuid].tab).prepend("<tr class=\"table-danger\"></tr>");
				
				tr = $("#activeSubscriptions #tbody-"+openSubscriptions[spuid].tab+" tr:first");
				tr.append("<td>"+msg["notification"]["sequence"]+"</td>");
				
				for(name of headers[spuid]) {
					if (bindings[name] != null) value = bindings[name]["value"];
					else value = "";
					
					tr.append("<td>"+value+"</td>");
				}
			}
			
			// iterate over the ADDED bindings to fill the table
			for (index in msg["notification"]["addedResults"]["results"]["bindings"]) {
				bindings = msg["notification"]["addedResults"]["results"]["bindings"][index];
				
				$("#activeSubscriptions #tbody-"+openSubscriptions[spuid].tab).prepend("<tr class=\"table-success\"></tr>");
				
				tr = $("#activeSubscriptions #tbody-"+openSubscriptions[spuid].tab+" tr:first");
				tr.append("<td>"+msg["notification"]["sequence"]+"</td>");
				
				for(name of headers[spuid]) {
					if (bindings[name] != null) value = bindings[name]["value"];
					else value = "";
					
					tr.append("<td>"+value+"</td>");
				}
			}				
		} 
		else if (msg["unsubscribed"] !== undefined) {
			// CLOSE the tab
			spuid = msg["unsubscribed"]["spuid"];
			tab = openSubscriptions[spuid].tab;
			delete openSubscriptions[spuid];
			
			closeSpuidTab(tab);
			
			$("#subscribeInfoLabel").html("["+getTimestamp()+ "] Unsubscribed "+spuid);
		} 
		else {
			console.log(msg);
			
			$("#subscribeInfoLabel").html("["+getTimestamp()+ "] Subscribe FAILED @ "+msg);
		}
	};

	// handler for the ws closing
	ws.onclose = function(event) {
		if (spuid !== null) {
			tab = openSubscriptions[spuid].tab;
			delete openSubscriptions[spuid];
			
			closeSpuidTab(tab);
			
			$("#subscribeInfoLabel").html("["+getTimestamp()+ "] Subscription closed "+spuid);
		}
	};

}

function closeSpuidTab(tab) {
	$("#pills-tab-subscriptions #pills-"+tab+"-tab").remove();
	$("#pills-tabContent-subscriptions #pills-"+tab).remove();
	
	$("#pills-tab-subscriptions .nav-link:last").tab('show');	
}

function unsubscribe(spuid) {
	openSubscriptions[spuid].ws.send(JSON.stringify({
		"unsubscribe" : {
			"spuid" : spuid
		}
	}));
}