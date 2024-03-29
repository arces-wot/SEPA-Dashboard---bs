var openSubscriptions = new Map();
var myJson = {
	namespaces : {}
};
var tabIndex = 0;
var headers = {};
let ids = 0;
let subEditor;
let queryEditor;
let updateEditor;

let emptyMarker = {
	clear : () => {},
}

function onInit() {
	loadEditors()

	let type = getQueryVariable("mode");
	switch (type) {
		case "local":
			$("#host").val("localhost");
			break;
		case "playground":
			$("#configPanel").hide()
			break;
		default:
			break;
	}
	
	defaultNamespaces();
	
}

function loadEditors() {
	YASQE.defaults.persistent = null
	subEditor = YASQE.fromTextArea(document.getElementById('subscribeTextInput'))
	queryEditor = YASQE.fromTextArea(document.getElementById('queryTextInput'))
	updateEditor = YASQE.fromTextArea(document.getElementById('updateTextInput'))

	subEditor.prefixMarker = emptyMarker
	queryEditor.prefixMarker = emptyMarker
	updateEditor.prefixMarker = emptyMarker
		
	$('#pills-subscribe-tab').on('shown.bs.tab', function handler (e) {
		unFixGlobalNamespaces(subEditor)
		subEditor.refresh()
		YASQE.doAutoFormat(subEditor)
		fixGlobalNamespaces(subEditor)
	})
	
	$('#pills-query-tab').on('shown.bs.tab', function handler (e) {
		
		queryEditor.refresh()
		unFixGlobalNamespaces(queryEditor)
		YASQE.doAutoFormat(queryEditor)
		fixGlobalNamespaces(queryEditor)
	})
	
	$('#pills-update-tab').on('shown.bs.tab', function handler (e) {
		unFixGlobalNamespaces(updateEditor)
		updateEditor.refresh()
		YASQE.doAutoFormat(updateEditor)
		fixGlobalNamespaces(updateEditor)
	})

	subEditor.setValue(subEditor.getTextArea().value)
	queryEditor.setValue(queryEditor.getTextArea().value)
	updateEditor.setValue(updateEditor.getTextArea().value)
	
}

function getTimestamp() {
	date = new Date();
	return date.toLocaleDateString() + " " + date.toLocaleTimeString();
};

function deleteNamespace(pr,ns) {
	document.getElementById(pr).remove();
	delete myJson.namespaces[pr]
	let pref = {}
	pref[pr] = ns

	try {subEditor.removePrefixes(pref)} catch (e) {console.log(e)}
	try {updateEditor.removePrefixes(pref)} catch (e) {console.log(e)}
	try {queryEditor.removePrefixes(pref)} catch (e) {console.log(e)}

};
function addNamespaceToAll(pr,ns) {
	let pref = {}
	pref[pr] = ns

	subEditor.addPrefixes(pref)
	updateEditor.addPrefixes(pref)
	queryEditor.addPrefixes(pref)

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
		+ '","' + ns + '"'
		+ ");'><small><span class='glyphicon glyphicon-trash' aria-hidden='true''><i class='fas fa-trash-alt'></i>&nbsp;</span>Delete</small></button>";
}

function addNamespace() {
	// get the prefix
	pr = document.getElementById("prefixField").value;

	// get the namespace
	ns = document.getElementById("namespaceField").value;
	myJson.namespaces[pr] = ns
	addNamespaceToAll(pr,ns)
};

function defaultNamespaces(){
	addNamespaceToAll("xsd","http://www.w3.org/2001/XMLSchema#");
	addNamespaceToAll("rdf","http://www.w3.org/1999/02/22-rdf-syntax-ns#");
	addNamespaceToAll("rdfs","http://www.w3.org/2000/01/rdf-schema#");
	addNamespaceToAll("time","http://www.w3.org/2006/time#");
	addNamespaceToAll("owl","http://www.w3.org/2002/07/owl#");
}

function fixGlobalNamespaces(editor) {
	let startPrefixes = { line: 0, ch: 0 }
	let endPrefixes = { line: Object.keys(myJson.namespaces).length, ch: 0 }
	let marker = editor.markText(startPrefixes, endPrefixes, { readOnly: true, className: "non-editable" })
	editor.prefixMarker = marker
}
function unFixGlobalNamespaces(editor) {
	editor.prefixMarker.clear()
}

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
			for (pr in myJson["namespaces"]) {
				addNamespaceToAll(pr,myJson.namespaces[pr])
			}

			fixGlobalNamespaces(queryEditor)
			fixGlobalNamespaces(updateEditor)
			fixGlobalNamespaces(subEditor)


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

function getForcedBindings(u) {
	let fb = ""
	switch (u) {
		case "U":
			fb = "#updateForcedBindings";
			break;
		case "Q":
			fb = "#queryForcedBindings";
			break;
		case "S":
			fb = "#subscribeForcedBindings";
			break;
		default:
			throw "Cannot find forced binding type"
	}

	let result = {}
	$(fb).each(function () {
		$(this).find(':input').each(function () {
			let binding = $(this).attr("id");
			result[binding] = {
				type: $(this).attr("type"),
				value: $(this).val()
			}
		});
	});

	return result;
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
		let tempNS = updateEditor.getPrefixesFromQuery()
		updateEditor.setValue(myJson["updates"][uqname]["sparql"])
		updateEditor.addPrefixes(tempNS)
		unFixGlobalNamespaces(updateEditor)
		YASQE.doAutoFormat(updateEditor)
		fixGlobalNamespaces(updateEditor)
		document.getElementById("updateLabel").innerHTML = "<b>" + uqname
				+ "</b>";
	} else if (usq == "Q") {
		document.getElementById("queryTextInput").value = myJson["queries"][uqname]["sparql"];
		let tempNS = queryEditor.getPrefixesFromQuery()
		queryEditor.setValue(myJson["queries"][uqname]["sparql"])
		queryEditor.addPrefixes(tempNS)
		unFixGlobalNamespaces(queryEditor)
		YASQE.doAutoFormat(queryEditor)
		fixGlobalNamespaces(queryEditor)
		document.getElementById("queryLabel").innerHTML = "<b>" + uqname
				+ "</b>";
	}
	else {
		document.getElementById("subscribeTextInput").value = myJson["queries"][uqname]["sparql"];
		let tempNS = subEditor.getPrefixesFromQuery()
		subEditor.setValue(myJson["queries"][uqname]["sparql"])
		subEditor.addPrefixes(tempNS)
		unFixGlobalNamespaces(subEditor)
		YASQE.doAutoFormat(subEditor)
		fixGlobalNamespaces(subEditor)
		document.getElementById("subscribeLabel").innerHTML = "<b>" + uqname
				+ "</b>";
		document.getElementById("subscriptionAlias").value = uqname;
	}

	loadForcedBindings(usq, uqname);
}

function query() {
	// read the query
	let queryText = queryEditor.getValue()
	let bench = new Sepajs.bench()
	queryText = bench.sparql(queryText,getForcedBindings("Q"))

	const sepa = Sepajs.client;
	
	config = {host : $("#host").val() , sparql11protocol: { protocol : "http", port  : $("#sparql11port").val() , query : { "path" : $("#queryPath").val()}}};
	
	start = Date.now(); 
	sepa.query(queryText,config).then((data)=>{
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
	let updateText= updateEditor.getValue()
	let bench = new Sepajs.bench()
	updateText = bench.sparql(updateText, getForcedBindings("U"));

	config = {host : $("#host").val() , sparql11protocol : { protocol: "http","port" : $("#sparql11port").val() ,update :{ "path" : $("#updatePath").val()}}};
	
	const sepa = Sepajs.client;
	start = Date.now();
	sepa.update( updateText,config).then((data)=>{ 
		stop = Date.now();
		$("#updateResultLabel").html("["+getTimestamp()+ "] Update done in "+(stop-start)+ " ms")
	}).catch((err)=>{
		 stop = Date.now();
		 $("#updateResultLabel").html("["+getTimestamp()+ "] "+err+" *** Update FAILED in "+(stop-start)+ " ms ***")
	 });
};
function generateIdBySuggestion(suggestion) {
	if(!suggestion || openSubscriptions.get(suggestion)){
		return suggestion + ++ids
	}else{
		return suggestion
	}
}
function subscribe() {
	// read the query
	let subscribeText = subEditor.getValue();
	let bench = new Sepajs.bench()
	subscribeText = bench.sparql(subscribeText, getForcedBindings("S"))

	
	ws = $("#sparql11seprotocol").val();
	config = { host: $("#host").val(), sparql11seprotocol: { protocol: "ws", availableProtocols: {ws : {port : $("#sparql11seport").val() , path : $("#subscribePath").val()} } }};
	
	const sepa = Sepajs.client;
	let id = generateIdBySuggestion($('#subscriptionAlias').val())
	let subscription = sepa.subscribe(subscribeText, config, id)
	let tab = undefined
	subscription.on("subscribed",(data) => {
		// get the subscription id
		spuid = data.spuid
		let alias = data.alias

		$("#subscribeInfoLabel").html("[" + getTimestamp() + "] New subscription " + spuid);
		$("#notificationsInfoLabel").html("[" + getTimestamp() + "] New subscription " + spuid);

		tabIndex = tabIndex + 1;

		tab = tabIndex

		// Create TAB entry
		$("#pills-tab-subscriptions").append(
			"<li class=\"nav-item\">" +
			"	<a class=\"nav-link\" " +
			"id=\"pills-" + tabIndex + "-tab\" " +
			"data-toggle=\"pill\" " +
			"href=\"#pills-" + tabIndex + "\" " +
			"role=\"tab\" " +
			"aria-controls=\"pills-" + tabIndex + "\" " +
			"aria-selected=\"false\">" + alias + "</a></li>");

		// Create TAB content				
		$("#pills-tabContent-subscriptions").append(
			"<div class=\"tab-pane mt-3 fade\" " +
			"id=\"pills-" + tabIndex + "\" " +
			"role=\"tabpanel\" " +
			"aria-labelledby=\"pills-" + tabIndex + "-tab\">" +
			"<button action='button' class='btn btn-outline-danger btn-sm mb-3 float-right' " +
			"onclick='javascript:unsubscribe(\"" + alias + "\")'>" +
			"<small><i class='fas fa-trash-alt'></i>&nbspUnsubscribe</small>" +
			"</button>" +
			"<div class=\"table-responsive\">" +
			"<div class=\"table-wrapper\">" +
			"<table class=\"table table-bordered table-hover table-sm\" " +
			"id=\"table-" + tabIndex + "\"></table>" +
			"</div>" +
			"</div>" +
			"</div>");

		// SHOW tab
		$('#pills-' + tabIndex + "-tab").tab('show');
	})

	subscription.on("notification", (data) => {
		if (data) {
			// get the subscription id
			spuid = data.spuid

			$("#notificationsInfoLabel").html("[" + getTimestamp() + "] Last notification: " + spuid + " (" + data.sequence + ")");

			// TABLE HEADER
			for (v in data["removedResults"]["head"]["vars"]) {
				name = data["removedResults"]["head"]["vars"][v];

				if (headers[spuid] == null) {
					// NEW HEADER
					headers[spuid] = [];
					headers[spuid].push(name);

					$("#activeSubscriptions #table-" + tab).append("<thead class=\"thead-light\"><tr><th scope=\"col\">" + "#" + "</th></tr></thead>");
					$("#activeSubscriptions #table-" + tab + " thead tr").append("<th scope=\"col\">" + name + "</th>");

					// NEW BODY
					$("#activeSubscriptions #table-" + tab).append("<tbody id=\"tbody-" + tab + "\"></tbody>");
				}
				else if (!headers[spuid].includes(name)) {
					// NEW VARIABLE
					headers[spuid].push(name);
					$("#activeSubscriptions #table-" + tab + " thead tr").append("<th scope=\"col\">" + name + "</th");
				}
			}

			for (v in data["addedResults"]["head"]["vars"]) {
				name = data["addedResults"]["head"]["vars"][v];

				if (headers[spuid] == null) {
					// NEW HEADER
					headers[spuid] = [];
					headers[spuid].push(name);

					$("#activeSubscriptions #table-" + tab).append("<thead><tr><th scope=\"col\">" + "#" + "</th></tr></thead>");
					$("#activeSubscriptions #table-" + tab + " thead tr").append("<th scope=\"col\">" + name + "</th>");

					// NEW BODY
					$("#activeSubscriptions #table-" + tab).append("<tbody id=\"tbody-" + tab + "\"></tbody>");
				}
				else if (!headers[spuid].includes(name)) {
					// NEW VARIABLE
					headers[spuid].push(name);
					$("#activeSubscriptions #table-" + tab + " thead tr").append("<th scope=\"col\">" + name + "</th");
				}
			}


			/*
			 * <tbody> <tr class="table-danger"> <th scope="row">1</th> <td>Mark</td>
			 * <td>Otto</td> <td>@mdo</td> </tr> <tr class="table-success">
			 * <th scope="row">3</th> <td>Larry</td> <td>the Bird</td>
			 * <td>@twitter</td> </tr> </tbody>
			*/

			// iterate over the REMOVED bindings to fill the table
			for (index in data["removedResults"]["results"]["bindings"]) {
				bindings = data["removedResults"]["results"]["bindings"][index];

				$("#activeSubscriptions #tbody-" + tab).prepend("<tr class=\"table-danger\"></tr>");

				tr = $("#activeSubscriptions #tbody-" + tab + " tr:first");
				tr.append("<td>" + data["sequence"] + "</td>");

				for (name of headers[spuid]) {
					if (bindings[name] != null) value = bindings[name]["value"];
					else value = "";

					tr.append("<td>" + value + "</td>");
				}
			}

			// iterate over the ADDED bindings to fill the table
			for (index in data["addedResults"]["results"]["bindings"]) {
				bindings = data["addedResults"]["results"]["bindings"][index];

				$("#activeSubscriptions #tbody-" + tab).prepend("<tr class=\"table-success\"></tr>");

				tr = $("#activeSubscriptions #tbody-" + tab + " tr:first");
				tr.append("<td>" + data["sequence"] + "</td>");

				for (name of headers[spuid]) {
					if (bindings[name] != null) value = bindings[name]["value"];
					else value = "";

					tr.append("<td>" + value + "</td>");
				}
			}
		}
		else {
			console.log(msg);

			$("#subscribeInfoLabel").html("[" + getTimestamp() + "] Subscribe FAILED @ " + msg);
		}
	})
	subscription.on("error",(err) => {
		$("#subscribeInfoLabel").html("[" + getTimestamp() + "] *** Subscribe FAILED @ " + $("#host").val() + " ***")
	})
	subscription.on("connection-error",(err) => {
		$("#subscribeInfoLabel").html("[" + getTimestamp() + "] *** Subscribe FAILED @ " + $("#host").val() + " ***")
	})
	subscription.on("unsubscribed",(not) => {
		if (tab) closeSpuidTab(tab);

		$("#subscribeInfoLabel").html("[" + getTimestamp() + "] Unsubscribed ");
	})
	  
	openSubscriptions.set(id,subscription)
}


function closeSpuidTab(tab) {
	$("#pills-tab-subscriptions #pills-"+tab+"-tab").remove();
	$("#pills-tabContent-subscriptions #pills-"+tab).remove();
	
	$("#pills-tab-subscriptions .nav-link:last").tab('show');	
}

function unsubscribe(alias) {
	openSubscriptions.get(alias).unsubscribe()
}

function getQueryVariable(variable) {
	var query = window.location.search.substring(1);
	var vars = query.split('&');
	for (var i = 0; i < vars.length; i++) {
		var pair = vars[i].split('=');
		if (decodeURIComponent(pair[0]) == variable) {
			return decodeURIComponent(pair[1]);
		}
	}
	console.log('Query variable %s not found', variable);
}