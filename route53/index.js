var AWS = require('aws-sdk');
var f5 = require('f5-nodejs'); 
// AWS Config
AWS.config.update({accessKeyId: "<your access key>", secretAccessKey: "<your secret>", region: "us-west-2"});
// get the Route53 library
var route53 = new AWS.Route53(); 
// Create a new rpc server for listening to TCL iRule calls. 
var ilx = new f5.ILXServer();  
  
// Start listening for ILX::call and ILX::notify events.  
ilx.listen();  

// Add a method and expect DNSName, action, name, TTL, and ip parameters and reply with response  
ilx.addMethod('route53_nodejs', function(req, response) {
	var DNSName = req.params()[0];
	var params = {
	  DNSName: DNSName
	};
	var action = req.params()[1];
	var name = req.params()[2];
	var TTL = req.params()[3];
	var ip = req.params()[4];
	
	route53.listHostedZonesByName(params, function(err,data) {
		if (err) {
		    //console.log(err, err.stack);
		    response.reply(err.toString());
		}
		else if (data.HostedZones[0].Name !== params.DNSName) {
			response.reply(params.DNSName + " is not a zone defined in Route53");
		}
		else {
		    var zoneId = data.HostedZones[0].Id;
		    var recParams = {
				"HostedZoneId": zoneId,
				"ChangeBatch": {
					"Changes": [
						{
							"Action": action,
							"ResourceRecordSet": {
								"Name": name,
								"Type": "A",
								"TTL": TTL,
								"ResourceRecords": [
									{
										"Value": ip
									}
								]
							}
						}
					]
				}
			};
			//edit records using aws sdk
			route53.changeResourceRecordSets(recParams, function(err,data) {
				if (err) {response.reply(err.toString());}
				else if (data.ChangeInfo.Status === "PENDING") {response.reply("Record is being updated");}
			    else {response.reply(data);}
			});
		}
	});
});