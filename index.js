const core = require("@actions/core");
var request = require("request");
const propertiesReader = require('properties-reader');

const config_path = core.getInput('config_file') || './secret-server.properties';
var properties = propertiesReader(config_path);

var accessTokenUrl = properties.get('secret.server.accessTokenUrl');
var rootApiUrl = properties.get('secret.server.rootApiUrl');
var grantType = properties.get('secret.server.grantType');
var username = core.getInput('username') || properties.get('secret.server.username') || '';
var password = core.getInput('password') || properties.get('secret.server.password') || '';
var secretId = core.getInput('secret_id') || properties.get('secret.server.secretId');

// Fetch Token 
var options = { method: 'POST',
  url: accessTokenUrl,
  headers: 
   { 'content-type': 'application/x-www-form-urlencoded' },
  form: 
   { 'username': username,
     'password': password,
     'grant_type': grantType } 
};

request(options, function (error, response, body) {
  if (error) {
    core.setFailed('Secret Authentication Failed');
    throw new Error(error);
  };
  const tokenResponse =  JSON.parse(body);
  var authOptions = { method: 'GET',
  url: rootApiUrl+"/"+secretId,
  headers: 
   { 'Authorization': 'Bearer '+tokenResponse['access_token'] }
   };
   request(authOptions, function (error, response, body) {
    if (error) throw new Error(error);
    var secretDetails = JSON.parse(body);
    for(var i in secretDetails['items']){
        core.setOutput(''+secretDetails['items'][i]['slug'],secretDetails['items'][i]['itemValue']);
    }
   });
});


