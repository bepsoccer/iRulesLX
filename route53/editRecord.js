var AWS = require('aws-sdk');

// AWS Config
AWS.config.update({accessKeyId: "<your access key>", secretAccessKey: "<your secret>", region: "us-west-2"});

// get the Route53 library
var route53 = new AWS.Route53();

var DNSName = "aws.f5kc.com.";
var params = {
  DNSName: DNSName
};
var action = "UPSERT";
var name = "new.aws.f5kc.com";
var TTL = 1200;
var ip = "123.123.123.230";

route53.listHostedZonesByName(params, function(err,data) {
	if (err) {
	    console.log(err, err.stack);
	    //response.reply(err);
	}
	else if (data.HostedZones[0].Name !== params.DNSName) {
		console.log(params.DNSName + " is not a zone defined in Route53");
		//response.reply(params.DNSName + " is not a zone defined in Route53");
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
			if (err) {
				console.log(err, err.stack);
				//response.reply(err);
			}
			else if (data.ChangeInfo.Status === "PENDING") {
				console.log("Record is being updated");
				//response.reply("Record is being updated");
			}
		    else {
		    	console.log(data);
		    	//response.reply(data);
		    }
		});
	}
});