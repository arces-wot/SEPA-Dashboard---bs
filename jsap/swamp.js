jsap = {
	"host": "mml.arces.unibo.it",
	"oauth": {
		"enable": false,
		"register": "https://localhost:8443/oauth/register",
		"tokenRequest": "https://localhost:8443/oauth/token"
	},
	"sparql11protocol": {
		"protocol": "http",
		"port": 8666,
		"query": {
			"path": "/query",
			"method": "POST",
			"format": "JSON"
		},
		"update": {
			"path": "/update",
			"method": "POST",
			"format": "JSON"
		}
	},
	"sparql11seprotocol": {
		"protocol": "ws",
		"availableProtocols": {
			"ws": {
				"port": 9666,
				"path": "/subscribe"
			},
			"wss": {
				"port": 9443,
				"path": "/secure/subscribe"
			}
		}
	},
	"graphs": {	},
	"namespaces": {
		"schema": "http://schema.org/",
		"rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
		"rdfs": "http://www.w3.org/2000/01/rdf-schema#",
		"sosa": "http://www.w3.org/ns/sosa/",
		"qudt": "http://qudt.org/schema/qudt#",
		"unit": "http://qudt.org/vocab/unit#",
		"arces-monitor": "http://wot.arces.unibo.it/monitor#",
		"swamp": "http://swamp-project.org/ns#",
		"mqtt": "http://wot.arces.unibo.it/mqtt#",
		"time": "http://www.w3.org/2006/time#",
		"wgs84_pos": "http://www.w3.org/2003/01/geo/wgs84_pos#",
		"gn": "http://www.geonames.org/ontology#"
	},
	"queries" : {
		"PLACES": {
			"sparql": "SELECT * WHERE {GRAPH <http://wot.arces.unibo.it/context> {?place rdf:type schema:Place; schema:name ?name ;  schema:GeoCoordinates ?coordinate . ?coordinate schema:latitude ?lat ; schema:longitude ?long}}"
		},
		"OBSERVATIONS": {
			"sparql": "SELECT * WHERE {GRAPH <http://wot.arces.unibo.it/observation> {?observation rdf:type sosa:Observation ; rdfs:label ?label ; sosa:hasResult ?quantity ; sosa:hasFeatureOfInterest ?location . ?quantity rdf:type qudt:QuantityValue ; qudt:unit ?unit . OPTIONAL {?quantity qudt:numericValue ?value} . OPTIONAL {?observation sosa:resultTime ?timestamp}} . GRAPH <http://wot.arces.unibo.it/context> {?location schema:name ?name} . OPTIONAL{?unit qudt:symbol ?symbol} }"
		},
		"MQTT_BROKERS": {
			"sparql": "SELECT * WHERE { GRAPH <http://wot.arces.unibo.it/mqtt> {?broker mqtt:url ?url ; rdf:type mqtt:Broker ; mqtt:port ?port ; mqtt:sslProtocol ?sslProtocol ; mqtt:user ?user ; mqtt:password ?password ; mqtt:sslCA ?caFile ; mqtt:clientId ?clientId}}"
		},
		"MQTT_MAPPINGS": {
			"sparql": "SELECT * {GRAPH <http://wot.arces.unibo.it/mqtt> {?mapping rdf:type mqtt:Mapping ; mqtt:observation ?observation ; mqtt:topic ?topic}}"
		},
		"MQTT_MESSAGES": {
			"sparql": "SELECT * WHERE {GRAPH <http://wot.arces.unibo.it/mqtt/message> {?message rdf:type mqtt:Message ; mqtt:value ?value ; mqtt:topic ?topic ; mqtt:hasBroker ?broker;  time:inXSDDateTimeStamp ?timestamp}}"
		}
	}
};