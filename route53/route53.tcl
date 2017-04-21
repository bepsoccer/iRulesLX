when CLIENT_ACCEPTED {
    ACCESS::restrict_irule_events disable
}
when HTTP_REQUEST {
    if { [ACCESS::policy result] eq "allow" && [HTTP::uri] starts_with "/myvpn?sess="} {
        after 5000 {
            set apmSessionId [ACCESS::session data get session.user.sessionid]
            set apmProfileName [ACCESS::session data get session.access.profile]
            set apmPart [ACCESS::session data get session.partition_id]
            set DNSName "<zone name with trailing dot>"
	        set action "UPSERT"
	        set name "[ACCESS::session data get session.logon.last.username].<hostname domain>"
	        if {not ($name ends_with ".[string trimright ${DNSName} {.}]")}{
	            log -noname local1.err "${apmProfileName}:${apmPart}:${apmSessionId}: proper hostname was not provided ($name): 01490000: A Record will not be updated for this session."
	            event disable all
	            return
	        }
	        set TTL 1200
	        set ip [ACCESS::session data get "session.assigned.clientip"]
	        if {[catch {IP::addr $ip mask 255.255.255.255}]}{
	            log -noname local1.err "${apmProfileName}:${apmPart}:${apmSessionId}: proper IP addressed was not assigned ($ip): 01490000: A Record will not be updated for this session."
	            event disable all
	            return
	        }
	        set RPC_HANDLE [ILX::init route53] 
	        if {[catch {set rpc_response [ILX::call $RPC_HANDLE route53_nodejs $DNSName $action $name $TTL $ip]}]}{
	            set rpc_response "Check LTM log for execution errors from sdmd.  A Record may not have been updated for this session."
	        }
	        log -noname local1. "${apmProfileName}:${apmPart}:${apmSessionId}: Client connected: 01490000: Params sent = $DNSName $action $name $TTL $ip\r\nRPC response = $rpc_response"
        }
    }
}
when ACCESS_SESSION_CLOSED {
    set apmSessionId [ACCESS::session data get session.user.sessionid]
    set apmProfileName [ACCESS::session data get session.access.profile]
    set apmPart [ACCESS::session data get session.partition_id]
    set DNSName "<zone name with trailing dot>"
    set action "DELETE"
    set name "[ACCESS::session data get session.logon.last.username].<hostname domain>"
    if {not ($name ends_with ".[string trimright ${DNSName} {.}]")}{
        log -noname local1.err "${apmProfileName}:${apmPart}:${apmSessionId}: proper hostname was not provided ($name): 01490000: A Record will not be removed for this session."
        event disable all
        return
    }
    set TTL 1200
    set ip [ACCESS::session data get "session.assigned.clientip"]
    if {[catch {IP::addr $ip mask 255.255.255.255}]}{
        log -noname local1.err "${apmProfileName}:${apmPart}:${apmSessionId}: proper IP addressed was not assigned ($ip): 01490000: A Record will not be removed for this session."
        event disable all
        return
    }
	set RPC_HANDLE [ILX::init route53] 
	if {[catch {set rpc_response [ILX::call $RPC_HANDLE route53_nodejs $DNSName $action $name $TTL $ip]}]}{
	    set rpc_response "Check LTM log for execution errors from sdmd.  A Record may not have been removed for this session."
	}
	log -noname local1. "${apmProfileName}:${apmPart}:${apmSessionId}: Client disconnected: 01490000: Params sent = $DNSName $action $name $TTL $ip\r\nRPC response = $rpc_response"
}
#when ACCESS_POLICY_COMPLETED {
#    set DNSName "<zone name with trailing dot>"
#	set action "UPSERT"
#	set name "[ACCESS::session data get session.logon.last.username].<hostname domain>"
#	set TTL 1200
#	set ip [ACCESS::session data get "session.assigned.clientip"]
#	set RPC_HANDLE [ILX::init route53] 
	#set rpc_response [ILX::call $RPC_HANDLE route53_nodejs $DNSName $action $name $TTL $ip]
	#log local0. "Params sent = $DNSName $action $name $TTL $ip\r\nRPC response = $rpc_response"
#	log local0. "Params sent = $DNSName $action $name $TTL $ip"
#}


#testing via http
when HTTP_REQUEST {
	set DNSName "<zone name with trailing dot>"
	set action "UPSERT"
	set name "<hostname>"
	set TTL 1200
	set ip [URI::query [HTTP::uri] ip]
	set RPC_HANDLE [ILX::init route53] 
	if {[catch {set rpc_response [ILX::call $RPC_HANDLE route53_nodejs $DNSName $action $name $TTL $ip]}]}{
	    set rpc_response "Check LTM log for execution errors from sdmd"
	}
	log local0. "response equals $rpc_response"
	set myContent "<html><head><title>Response</title></head><body>${rpc_response}</body></html>"
	HTTP::respond 200 content $myContent
}
