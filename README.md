
# Ad Hoc Email Server (AHEM)
[![Build Status](https://travis-ci.org/o4oren/Ad-Hoc-Email-Server.svg?branch=master)](https://travis-ci.org/o4oren/Ad-Hoc-Email-Server)

Ad Hoc Email Server is, well, an ad hoc mail server. 
AHEM server can be used for testing, were a large (or unknown) number of mailboxes is needed or to provide disposable emails for registering into services that might expose the email for spam;
This project will provide both RESTful api and web application for consuming the service.
A working example of AHEM is always available [here](http://www.ahem.email "AHEM - Ad Hoc Disposable Temporary Email addresss").


![Alt text](/client/assets/images/screenshot.png?raw=true "AHEM mail server")

## Getting Started
Ahem mail server will accept any email sent to it (on the domains specified in the configuration), and create an ad hoc mailbox as needed.
Then just browse to it's UI, enter the account name and you'll see the emails the account received.
That's it. No authentication. No account creation.

## Prerequisites
```
nodejs > v8.9 
angular cli installed globally (npm install -g @angular/cli)
mongodb
```

## Installation
```bash
# clone the repository
git clone https://github.com/o4oren/ahem-server.git
cd ahem-server
npm install
# builds the project.
# There are other, convenience options for build and run in development mode.
npm run build:ssr
# prod run - will run the backend which will also serve the front end form the `dist` folder.
npm run serve:ssr
```

### Configuration
A configuration file names properties.json is located in the root of the project.
Edit it to fit your use case.
Parameters:
* serverBaseUri - the base address for your api server
* mongoConnectUrl - the mongodb connect url in the form of "mongodb://localhost:27017/ahem"
* appListenPort - the port the node app will bind to.
* smtpPort - ahem... you know.
* emailDeleteInterval - The time in seconds between age checks for purging old files.
* emailDeleteAge - The age in seconds above which emails will be deleted
* allowedDomains - An array of allowed email domains. These domains will be allowed by the server as RCPT TO: entries. This also makes the server not act as an open relay. Format: ["my.domain.com", "my.second-domain.com"]
* customText - html string that will replace the default text in the landing page
* allowAutocomplete - if set to false, will prevent auto completing users in the ui

### Docker
* Build docker: docker build -t o4oren/ahem .
* Run docker: docker run --name ahem -it -p 3000:3000 -p 25:25 -d o4oren/ahem
* Sign into docker: docker exec -it ahem sh
* start docker stackand swarm: docker swarm init && docker stack deploy -c docker-compose.yml ahemswarmc
* stop docker stack: docker stack rm getstartedlab

* for debugging - run docker locally: docker run -d -p 27017:27017 -v ~/data:/data/db mongo

#### Build and run with mongodb
* docker-compose build
* docker-compose up

### API

The full api documentation is available [here](http://www.ahem.email/help/api "AHEM - API Help").

A brief list of RESTful resources:

HTTP Method | URI Path | Parameters | Descritpion
--- | --- | --- | ---
POST | /account/autocomplete | { "prefix":"value" } | Returns a partial list of accounts
GET | /api/properties | |returns the properties.json content
GET | /api/account/{account} | |returns a list of the email objects in the account
GET | /api/account/{account}/{emailId} | |Gets the contents of a specific email
PATCH | /api/account/{acount}/{emailId} | {"isRead" : true} |Updates the emailInfo object (representation of the email meta data in the user's account. Currently, only the isRead field is supported.
GET | /api/account/{account}/{emailId}/attachments/{filename} | |Downloads a specific attachment form an email
DELETE | /api/account/{account}/{emailId} | |Deletes a specific email
DELETE | /api/account/{account} | | Deletes a whole account

### Google Analytics

AHEM server is ready for google analytics. By default, when you set it up, it will not send information to GA though.
If you'd like to enable GA, add the snippet below in your /client/index.html file's head section, and rebuild the project.
Replace XX-XXXXXXXXX-X with your GA id.
```html
  <script>
    (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
        (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
      m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
    })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

    ga('create', 'XX-XXXXXXXXX-X', 'auto');
  </script>
```

### Todo for 1.0

- [x] Error page when user/email doesn't exist.
- [x] Empty mail page
- [x] Landing page
- [x] Errors on find user/email in api
- [x] Error on non existing user / message
- [x] routing for messages
- [x] read/unread icons
- [x] attachments
- [x] allow delete emails
- [x] migrate to mongodb
- [x] update missing emails page and loading circles
- []  sort out logging
- [] separate  account view from email view pages 
- [] separate  server and webapp properties 
- [] better home page
- [] Add apis to get account references from email, get account and email counts - both general and in account context


## Authors

* **Oren Geva**

See also the list of [contributors](https://github.com/o4oren/ahem-server/contributors) who participated in this project.

## License

This project is licensed under the GPLv3 License - see the [LICENSE.md](LICENSE.md) file for details



