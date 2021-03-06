About Node Security

Node Security helps you keep your node applications secure. With Node Security you can:

    Make use of the CLI tool to help identify known vulnerabilities in your own projects.
    Get access to Node Security news and information from the ^lift team.

Installing the CLI (nsp)

    To install the Node Security command line tool: npm install -g nsp
    Then run nsp --help to find out more.

Output Format

You can adjust how the client outputs findings by specifying one of the following format options:

    default
    summary
    json
    codeclimate
    none

Example: nsp check --output summary

Additionally, you can use third-party formatters. The packages of custom formatters must adhere to the naming scheme nsp-formatter-<name> and can then be referenced by that name:

$ npm install -g nsp nsp-formatter-checkstyle
$ nsp check --output checkstyle

Please note that in case of naming conflicts built-in formatters (as listed above) take precedence. For instance, nsp-formatter-json would never be used since nsp ships with a json formatter.
Exceptions

The Node Security CLI supports adding exceptions. These are advisories that you have evaluated and personally deemed unimportant for your project.

In order to leverage this capability, create a .nsprc file in the root of your project with content like the following:

{
  "exceptions": ["https://nodesecurity.io/advisories/12"]
}

The URLs used in the array should match the advisory link that the CLI reports. With this in place, you will no longer receive warnings about any advisories in the exceptions array.

Be careful using this feature. If you add code later that is impacted by an excluded advisory, Node Security has no way of knowing. Keep a careful eye on your exceptions.

.nsprc is read using rc, so it supports comments using json-strip-comments.
Proxy Support

The Node Security CLI has proxy support by using proxy-agent.

The currently implemented protocol mappings are listed in the table below:
Protocol 	Example
http 	http://proxy-server-over-tcp.com:3128
https 	https://proxy-server-over-tls.com:3129
socks(v5) 	socks://username:password@some-socks-proxy.com:9050 (username & password are optional)
socks5 	socks5://username:password@some-socks-proxy.com:9050 (username & password are optional)
socks4 	socks4://some-socks-proxy.com:9050
pac 	pac+http://www.example.com/proxy.pac

To configure the proxy set the proxy key in your .nsprc file. This can be put in the root of your project or in your home directory.

{
    "proxy": "http://127.0.0.1:8080"
}

Offline Mode

nsp has an offline mode which was previously undocumented. We recommend not relying on offline support as it may become unsupported in the future as new features are added.

First you need to obtain the offline advisories database. Do this by running the npm run setup-offline script provided by nsp

Second you need to tell nsp where to find that file. You can do that 3 ways.

    Put it in the actual nsp module folder and no other configuration is required
    Specify it in the .nsprc configuration file advisoriesPath: "/path/to/advisories.json"
    Specify it from the command line when you call nsp nsp check --offline --advisoriesPath=/path/to/advisories.json

When you call nsp check you will want to use the --offline flag

A couple of notes

    Offline mode requires that your project include a npm-shrinkwrap.json file.
    Because of npm3 flattening reported paths may be incorrect.

Code Climate Node Security Engine

codeclimate-nodesecurity is a Code Climate engine that wraps the Node Security CLI. You can run it on your command line using the Code Climate CLI, or Code Climate's hosted analysis platform.

Note that this engine only works if your code has a npm-shrinkwrap.json file committed.
Testing

First, build this repo with docker

git clone git@github.com:nodesecurity/nsp
cd nsp
docker build -t codeclimate/codeclimate-nodesecurity .

Install the codeclimate CLI

brew tap codeclimate/formulae
brew install codeclimate

Go into your project's directory and enable codeclimate

codeclimate init

Then edit .codeclimate.yml to add the engine like so

---
engines:
  nodesecurity:
    enabled: true
exclude_paths: []

And finally run it

codeclimate analyze --dev

Suggesting Changes to Advisories

Should you come across data in an advisory that you feel is wrong or is a false positive please let us know at report@nodesecurity.io. We endeavor to make this process better in the future, however this is the best place to resolve these issues at the present.
Contact

Node Security (+) is brought to you by ^lift security.