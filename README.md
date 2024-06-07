# Discord Bot

[Discord bot](https://github.com/hiroyukikumazawa/seigmaai-discordbot-backend).

## Project structure
Below is a basic overview of the project structure:

```
├── examples    
│   ├── app.js  
│   ├── button.js
│   ├── command.js
│   ├── modal.js
│   ├── selectMenu.js
├── utils    ->  utility app functions
│   ├── initializeDB.js -> database connection
│   ├── makeWallet.js -> wallet auto generation
│   ├── ufw.js -> allowIP and deleteIP for firewall
├── .env.sample -> sample .env file
├── app.js      -> main entrypoint for app
├── commands.js -> slash command payloads + helpers
├── package.json
├── README.md
└── .gitignore 
└── utils.js -> utility general functions
```

## Running app locally

Before you start, you'll need to install [NodeJS](https://nodejs.org/en/download/) and [create a Discord app](https://discord.com/developers/applications) with the proper permissions:
- `applications.commands`
- `bot` (with Send Messages enabled)


Configuring the app is covered in detail in the [getting started guide](https://discord.com/developers/docs/getting-started).

### Setup project

First clone the project:
```
git clone https://github.com/hiroyukikumazawa/seigmaai-discordbot-backend
```

Then navigate to its directory and install dependencies:
```
cd seigmaai-discordbot-backend
npm install
```
### Get app credentials

Fetch the credentials from your app's settings and add them to a `.env` file (see `.env.sample` for an example). You'll need your app ID (`APP_ID`), bot token (`DISCORD_TOKEN`), and public key (`PUBLIC_KEY`).

Fetching credentials is covered in detail in the [getting started guide](https://discord.com/developers/docs/getting-started).

> 🔑 Environment variables can be added to the `.env` file in Glitch or when developing locally, and in the Secrets tab in Replit (the lock icon on the left).

### Install slash commands

The commands for the example app are set up in `commands.js`. All of the commands in the `ALL_COMMANDS` array at the bottom of `commands.js` will be installed when you run the `register` command configured in `package.json`:

```
npm run register
```

### Run the app

After your credentials are added, go ahead and run the app:

```
npm run dev
```

> ⚙️ A package [like `nodemon`](https://github.com/remy/nodemon), which watches for local changes and restarts your app, may be helpful while locally developing.

If you aren't following the [getting started guide](https://discord.com/developers/docs/getting-started), you can move the contents of `examples/app.js` (the finished `app.js` file) to the top-level `app.js`.

### Set up interactivity

The project needs a public endpoint where Discord can send requests. To develop and test locally, you can use something like [`ngrok`](https://ngrok.com/) to tunnel HTTP traffic.

Install ngrok if you haven't already, then start listening on port `2024`:

```
ngrok http 2024
```

You should see your connection open:

```
Tunnel Status                 online
Version                       2.0/2.0
Web Interface                 http://127.0.0.1:4040
Forwarding                    http://1234-someurl.ngrok.io -> localhost:2024
Forwarding                    https://1234-someurl.ngrok.io -> localhost:2024

Connections                  ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

Copy the forwarding address that starts with `https`, in this case `https://1234-someurl.ngrok.io`, then go to your [app's settings](https://discord.com/developers/applications).

On the **General Information** tab, there will be an **Interactions Endpoint URL**. Paste your ngrok address there, and append `/interactions` to it (`https://1234-someurl.ngrok.io/interactions` in the example).

Click **Save Changes**, and your app should be ready to run 🚀


## About .env file

### APP_ID=1209805546262364210 
    this is from your discord bot app.
### DISCORD_TOKEN=
    this is from your discord bot app.
### PUBLIC_KEY=97f51a7c4507a7d6ba854ff6de737d5ce85a3aa47584e2089b529fef07e4b106
    this is from your discord bot app.
### DATABASE_URI=mongodb://localhost:27017/discordbot
    this is your mongodb server uri. so you need to install mongodb.
### NFTROLEID=1209311731843727452
    this is from your discord server. you can get role id from 'server settings/Roles' of your discord server.
### # RPCURL=https://sei-rpc.polkachu.com/
    this is mainnet url of SEI network. if you are trying to use this bot in mainnet, you should remove comment of this line and add comment in front of next line.
### RPCURL=https://rpc.atlantic-2.seinetwork.io/
    this is testnet url of SEI network. so you can test with this url. 
### SEIGMATOKENDENOM=sei1krmg8v3y8lv4z3cd8g3yzy4nexn5jcx07swdqrru4l07upg3q6hsp8rxee
    this is your SEIGMA token denom. 
### SEIGMADECIMAL=6
    this is your SEIGMA token decimal. but i set this with 6, it's just only for test.
### SEIAMOUNTTOSEND=2000000
    this is the SEI amount user have to pay to use your server. maybe this is 50000000, but i set this with 2000000. it's just only for test.
### SEIGMAAMOUNTTOSEND=1800000
    this is the SEIGMA amount user have to pay to use your server. maybe this is 45000000, but i set this with 1800000. it's just only for test.
### COLLECTIONWALLET=sei1mg4c5rlyjhw7vcc2dfnuamhm6s4wpvd2x5tjw0
    this is the wallet address where all payments will be stored.
### TIMEZONE=JST
    this is your timezone. this is a factor that affects the subscription function, so it must be selected accurately.
### PORT=2024
    this is your server api port.