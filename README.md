# IT-Climb cash-back project
==============
This wiki uses the [Markdown](http://daringfireball.net/projects/markdown/) syntax.

#1) Download cash-back project from dev branch

https://github.com/it-climb/cash-back/tree/dev

#2) Install nginx

1.	```sudo apt-get update```
2.	```sudo apt-get install nginx```
3.	```sudo service nginx start```

##2.1) Nginx settings

open project cash-back and run terminal in this folder

1. `pwd` 

console will retern fullpath to project like this: `/home/[ROOT NAME]/[PATH TO PROJECT]`

goto root/etc folder ~etc/ -> /nginx/sites-available

open default by:

`sudo gedit default`

and write down next and save changes in default file: 

`server { 
    listen 80;
    server_name www.reacttest.local.com;
    root /home/[ROOT NAME]/[PATH TO FILE]/dist/;
    location /api { 
        rewrite /api/(.*) /$1 break; 
        client_max_body_size 100M; 
        include proxy_params; 
        proxy_redirect off; 
        proxy_pass http://localhost:3000; 
    } 
    location /socket.io/ { 
        proxy_pass http://localhost:3000; 
        proxy_http_version 1.1; 
        proxy_set_header Upgrade $http_upgrade; 
        proxy_set_header Connection "upgrade"; 
        proxy_read_timeout 950s; 
    } 
    location / { 
        try_files $uri $uri/ /index.html; 
    }
} 
## REST API server 
server { 
    listen 80; 
    server_name www.reacttest.local.com; 
    root /home/[ROOT NAME]/[PATH TO FILE]/dist/; 
    location / { 
        client_max_body_size 100M; 
        include proxy_params; 
        proxy_pass http://localhost:3000; 
    } 
}
`
2. in etc/ folder find hosts file

open terminal in etc/ and enter 

`sudo gedit hosts`

add the string and save changes in hosts file:

`127.0.0.1	www.reacttest.local.com`

##2.2 Restart nginx

`sudo service nginx restart`

##2.3 check if nginx is idle

`sudo service nginx status`

#3) Install DataBases

https://www.digitalocean.com/community/tutorials/how-to-install-and-use-postgresql-on-ubuntu-16-04

	sudo apt-get update
	sudo apt-get install postgresql
	sudo apt-get install pgadmin3
	sudo -u postgres psql

type 1 `\password: 1`

##3.1 Create DB reactdb for project

Type next settins (see details in video)

`
name:     localhost
host:     localhost
username: postgres
password: 1
`

#4) Install Nodejs, nvm, npm.
 
 https://www.digitalocean.com/community/tutorials/how-to-install-node-js-on-ubuntu-16-04

 or
    
 https://losst.ru/ustanovka-node-js-ubuntu-16-04  
    
    
    	sudo apt-get update
    
    	sudo apt-get install build-essential libssl-dev
    
    	curl -sL https://raw.githubusercontent.com/creationix/nvm/v0.31.0/install.sh -o install_nvm.sh
    
    	bash install_nvm.sh
    
    	nvm ls-remote (choose any version > 7.1.0)
    
    	nvm install 7.5.0
    
    	sudo apt-get update
    
    	sudo apt-get install npm
    	
 Check current versions of Node and NPM
    
    	`node -v
    	npm -v`
    
 Check installed versions of Node 

    	`nvm ls`
    
 Choose the any version of Node > 7.1.0
    
        `nvm use default 7.5.0`
    
 Install express:
    
         `sudo npm install -g express`
    	
    	

#5) Installation process

1. ```sudo npm install -g gulp jspm```
2. ```npm install```
3. ```jspm install```

#4) Run project / re-deploy project

1. ```gulp build:dev```

#5) Run SQL scripts

Goto project cash-back/config folder and run `schema.sql` and `data.sql`

#6) Other details
...

##More information
You may find more information in [Development Wiki](https://bitbucket.org/react-it-climb/react-app/wiki).

## Environments variables

ENV var | Description | Required | Notes
------- | ----------- | -------- | --------
NODE_ENV |Identifier of server environment | + | has to be 'production' ONLY for PRODUCTION server
TEST_DB_HOST | IP of database | + | localhost |
TEST_DB_USERNAME | Name of user who have granted access to database | + | postgres | 
TEST_DB_NAME | Name of database | + | reactdb |  
TEST_DB_PASSWORD | Password for database user | + | 1 |
TEST_DOMAIN_NAME | Domain name of website| + | www.reacttest.local.com |
TEST_PUBLIC_SERVER_NAME | Name of Public server (by default: 'www') | - | www |
TEST_API_SERVER_NAME | Name of API server (by default: 'api') | - | api |
AMAZON_S3_KEY_ID | Amazon S3 public key  | - | - |
AMAZON_S3_KEY | Amazon S3 secret key | - | - |
REDIS_HOST | Redis instance URL | + | - |
REDIS_PORT | Redis instance port | + | - |
REDIS_AUTH | Redis instance password | - | - |
TEST_MAIL_USER | Mailing user email (e.g. 'test@gmail.com') | - | - |
TEST_MAIL_PWD | Mailing user password | - | - |
TEST_MAIL_SERVER | Mailing SMTP server (e.g. 'smtp.gmail.com') | - | - |
