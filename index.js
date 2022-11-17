const core = require("@actions/core");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const propertiesReader = require("properties-reader");

const config_path =
  core.getInput("config_file") || "./secret-server.properties";
var properties = propertiesReader(config_path);

var accessTokenUrl = properties.get("secret.server.accessTokenUrl");
var rootApiUrl = properties.get("secret.server.rootApiUrl");
var grantType = properties.get("secret.server.grant_type") || "password";
var username =
  core.getInput("username") || properties.get("secret.server.username") || "";
var password =
  core.getInput("password") || properties.get("secret.server.password") || "";
var secretId =
  core.getInput("secret_id") || properties.get("secret.server.secret_id");

async function fetchData(url = "", opts) {
  const response = await fetch(url, opts);
  if (!response.ok) {
    console.error(response);
    throw new Error("fetchData action failed for url - " + url);
  }
  let res = await response.json();
  return res;
}

// Fetch Token
const searchParams = new URLSearchParams();
searchParams.append("username", username);
searchParams.append("password", password);
searchParams.append("grant_type", grantType);

let options = {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: searchParams,
};

fetchData(accessTokenUrl, options)
  .then((data) => {
    let authOptions = {
      method: "GET",
      url: rootApiUrl + "/" + secretId,
      headers: { Authorization: "Bearer " + data["access_token"] },
    };

    // Fetch Secret Keys
    fetchData(rootApiUrl + "/" + secretId, authOptions)
      .then((secretDetails) => {
        for (var i in secretDetails["items"]) {
          core.setOutput(
            "" + secretDetails["items"][i]["slug"],
            secretDetails["items"][i]["itemValue"]
          );
          core.exportVariable(
            ("SS_" + secretDetails["items"][i]["slug"]).toUpperCase(),
            secretDetails["items"][i]["itemValue"]
          );
        }
      })
      .catch((error) => {
        core.setFailed("Reading Secrets from Auth Server failed");
        console.error("Error:", error);
      });
  })
  .catch((error) => {
    core.setFailed("Secret Authentication Failed");
    console.error("Error:", error);
  });
