# IT-Climb Test One
==============
This wiki uses the [Markdown](http://daringfireball.net/projects/markdown/) syntax.

#1) Get Started

## Technologies

* **[Node.js](https://nodejs.org/)** - is a JavaScript runtime built on Chrome's V8 JavaScript engine. Node.js uses an event-driven, non-blocking I/O model that makes it lightweight and efficient. Node.js' package ecosystem, npm, is the largest ecosystem of open source libraries in the world.
* **[Bluebird](https://github.com/petkaantonov/bluebird)** - is a fully featured promise library with focus on innovative features and performance.
* **[jQuery](https://jquery.com/)** - is a fast, small, and feature-rich JavaScript library. It makes things like HTML document traversal and manipulation, event handling, animation, and Ajax much simpler with an easy-to-use API that works across a multitude of browsers. With a combination of versatility and extensibility, jQuery has changed the way that millions of people write JavaScript.
* **[React](https://facebook.github.io/react/)** - a javascript library for building user interfaces.
* **[Bootstrap](http://getbootstrap.com/)** - is the most popular HTML, CSS, and JS framework for developing responsive, mobile first projects on the web.
* **[JSPM](http://jspm.io/)** - is a package manager for the SystemJS universal module loader, built on top of the dynamic ES6 module loader.
* **[pm2](https://github.com/Unitech/PM2)** - is a CLI tool for ensuring that a given script runs continuously, with simple monitoring integration.

## Before You Start - Remember

1. Document Your Code.
2. Identify Reusable Code and Isolate it.
3. Use a Standard/Best Practices for Node.js & React.


#2) Process for contributing (branching, committing, merging, etc)

See [Development Wiki](https://bitbucket.org/react-it-climb/react-app/wiki/Process) to get detailed description.

#3) Installation process

1. ```sudo npm install -g gulp jspm```
2. ```nvm use v7```
3. ```npm install```
4. ```jspm install```

#4) Run project / re-deploy project

1. ```gulp build:dev``` vs ```gulp build:prod```
2. ```npm install```
3. ```node index.js (with corresponding parameters)```

#5) Other details
...

##More information
You may find more information in [Development Wiki](https://bitbucket.org/react-it-climb/react-app/wiki).

## Environments variables

ENV var | Description | Required | Notes
------- | ----------- | -------- | --------
NODE_ENV |Identifier of server environment | + | has to be 'production' ONLY for PRODUCTION server
TEST_DB_HOST | IP of database | + | |
TEST_DB_USERNAME | Name of user who have granted access to database | + | | 
TEST_DB_NAME | Name of database | + | |  
TEST_DB_PASSWORD | Password for database user | + | |
TEST_DOMAIN_NAME | Domain name of website| + | |
TEST_PUBLIC_SERVER_NAME | Name of THX Public server (by default: 'www') | - | |
TEST_API_SERVER_NAME | Name of THX API server (by default: 'api') | - | |
AMAZON_S3_KEY_ID | Amazon S3 public key  | - | |
AMAZON_S3_KEY | Amazon S3 secret key | - | |
REDIS_HOST | Redis instance URL | + | |
REDIS_PORT | Redis instance port | + | |
REDIS_AUTH | Redis instance password | - | |
TEST_MAIL_USER | Mailing user email (e.g. 'test@gmail.com') | - | |
TEST_MAIL_PWD | Mailing user password | - | |
TEST_MAIL_SERVER | Mailing SMTP server (e.g. 'smtp.gmail.com') | - | |


Example: 
For website Public 'www.site.com' with Public pages 'www.site.com' and API 'api.site.com':
TEST_PUBLIC_HOST_URL: 'site.com'
TEST_PUBLIC_SERVER_NAME: 'www'
TEST_API_SERVER_NAME: 'api'
