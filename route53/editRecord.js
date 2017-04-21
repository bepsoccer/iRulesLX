var AWS = require('aws-sdk');

// AWS Config
AWS.config.update({accessKeyId: "<your access key>", secretAccessKey: "<your secret>", region: "us-west-2"});

// get the Route53 library
var route53 = new AWS.Route53();
//function to grab the hostedZoneId
function editZone(params, action, name,  TTL, ip, callback) {
	route53.listHostedZonesByName(params, function(err,data) {
		if (err) console.log(err, err.stack);
		if(!err) {
			var zoneId = data.HostedZones[0].Id;
			return callback(zoneId);
		}
	});
}
//function to edit the A record
function editRecord(action, name,  TTL, ip, zoneId, callback) {
	var params = {
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

	route53.changeResourceRecordSets(params, function(err,data) {
		callback(err,data);
	});

}

var DNSName = "aws.f5kc.com.";
var params = {
  DNSName: DNSName
};
var action = "UPSERT";
var name = "new.aws.f5kc.com";
var TTL = 1200;
var ip = "123.123.123.230";

editZone(params, action, name,  TTL, ip, function(zoneId) {
	//console.log(zoneId);
	editRecord(action, name, TTL, ip, zoneId, function(err,data) {
		console.log(err,data);
	});
});