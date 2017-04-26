# My iRulesLX repo
Just a repo to store iRules LX solutions for others to use

# How to use
add a new iRules LX workspace
![](images/newworkspace.png)

add an extension to the workspace
![](images/addextension.png)

edit the extension's index and package.json
![](images/editextension.png)

add an iRule to the workspace
![](images/addirule.png)

edit the iRule
![](images/editirule.png)

add a new iRules LX plugin
![](images/newplugin.png)

Add needed node modules via ssh, i.e.
```
config # cd /var/ilx/workspaces/Common/myNewWorkSpace/extensions/route53/
route53 # npm install validator --save
```