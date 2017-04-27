# Register APM SSL VPN client assigned IP to a route53 zone
If you don't want to hard code the AWS credentials in 
```
AWS.config.update({accessKeyId: "<your access key>", secretAccessKey: "<your secret>"});
```
then you will need to create a IAM role with a policy like the [policy](R53-DNS-registration-policy.json) included and attach it to your EC2 instance running APM and this iRule LX.

# Needed configuration
```
set DNSName "<your zone with trailing dot>"
```
and
```
set name "<your hostname>"
```
need to be set.  This is up to you how you want to set them.

```
set RPC_HANDLE [ILX::init <name of your extension>]
```
The name of your extension will need to match what's in the [editRecord.tcl](editRecord.tcl).  It's set to route53 in the current code.