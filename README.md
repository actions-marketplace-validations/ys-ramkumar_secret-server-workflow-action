# Secret Server GitHub Action

This is a GitHub action to fetch information from Secret Server.

## Inputs

### `config_file`

**Required** The path to secret-server.properties file and by default it finds in root directory.

### `username`

**Required** Username used in authentication with Secret Server

### `password`

**Required** Password used in authentication with Secret Server

### `secret_id`

**Required** ID to be used to fetch secret details

## Outputs

Returns list of key & value configured in Secret Server for provided secret id

## Example usage for manual test

    - npm install
      node index.js
## Example usage in GitHub Workflow

    - name: Fetch Secrets
      id: fetch-keys
      uses: C52866/secret-server-workflow-action@v1
      with:
        username: <user name>
        password: <pwd>
        secret_id: <secret id>
        config_file: <secret-server.properties location>

    - Use secrets retrieved from - fetch-keys step
    - name: Print Keys
      run: echo ${{ steps.fetch-keys.outputs.secret-key }}

# License

The scripts and documentation in this project are released under the [MIT License](LICENSE.md)
