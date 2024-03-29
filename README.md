# Uberspace webhook server
Trigger shell commands via HTTP requests. Not limited to use at uberspace.

## Setup

1. Install dependencies ``npm install``
2. Rename ``example-config.js`` to ``config.js``
3. Rename ``example-hooks.js`` to ``hooks.js``
4. Adapt config to your needs
5. Start server ``npm start``

### Create hooks
Create hooks by adding them to the ``hooks.js``

```javascript
'myhook': {
  script: './updateMyApp.sh'
}
```
The script is executed on ``POST /hook/myhook``


### Config - Options

|Property|Description|
| :------ | :--------- |
|port|Port the server should listen on e.g. 1337|
|secret|String that needs to be sent with each request as query-param|

### Trigger webhook
Assuming your webhook server runs on ``localhost:1337``

``POST http://localhost:1337/hook/myhook?secret=shhhhh``

### Responses

|Status|Description|Response|
| :------ | :--------- | :------ |
|200 OK|Shell command was executed sccessfully| ``{executed: true, stdout: <output_of_shell>, stderr: <err_output_of_shell>}``|
|404 NOT FOUND| Hook was not specified in hooks.js or secret was wrong|``{executed: false, error: 'Not found'}``|
|404 NOT FOUND| Request URL did not match any request handlers|``{executed: false, error: 'Not found'}``|
|500 INTERNAL SERVER ERROR| Script execution failed|``{executed: false, error: <err_from_child_process>, stdout: <output_of_shell>, stderr: <err_from_script>}``|

### Running on Uberspace
* See [Uberspace](https://uberspace.de) specific instructions on how to run this server as a service [here](https://manual.uberspace.de/daemons-supervisord/#create-a-service).
