import 'dotenv/config';
import cron from 'node-cron';
import { Client, GatewayIntentBits } from 'discord.js';
import bodyParser from 'body-parser';
import express from 'express';
import {
  InteractionType,
  InteractionResponseType,
  InteractionResponseFlags,
  MessageComponentTypes,
  ButtonStyleTypes,
} from 'discord-interactions';
import { VerifyDiscordRequest, getRandomEmoji, DiscordRequest } from './utils.js';
import { paymentAddress, paymentBalance, paymentEndDate, paymentSei, paymentSeigma } from './controllers/paymentCtrl.js';
import { whitelistAdd, whitelistReset, whitelistRemove, whitelistShow } from './controllers/whitelistCtrl.js';
import { initDB } from './utils/initializeDB.js';
import { User } from './models/userModel.js'; 
import { deleteIP } from './utils/ufw.js';

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.DirectMessages],
});

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);

  // Schedule a task to run every day at 10:00 AM
  cron.schedule('21 18 * * *', async () => {
    const today = new Date();
    const deadlineThreshold = new Date(today);
    deadlineThreshold.setDate(today.getDate() + 5);
    const usersToNotify = await User.find({
      "payment.endDate": {
        $gte: today,
        $lt: deadlineThreshold
      }
    });
    usersToNotify.forEach(async (user) => {
      try {
        const userDiscord = await client.users.fetch(user.id);
        console.log(userDiscord);
        await userDiscord.send(`Your usage deadline is ${user.payment.endDate}.`);
      } catch (error) {
        console.error(`Failed to send DM to user ${user.discordId}: ${error}`);
      }
    });
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const blacklist = await User.find({
      "payment.endDate": {
        $gt: yesterday,
        $lte: today
      }
    });
    blacklist.forEach(async (user) => {
      try{
        user.ip_address.forEach(element => {
          if(element)
            deleteIP(element)
        });
      }
      catch(error){
        console.error(`Failed to delete IP of ${user.id}: ${error}`);
      }
    })
  }, {
    scheduled: true,
    timezone: process.env.TIMEZONE // Replace with your timezone
  });
});

client.login(process.env.DISCORD_TOKEN);

// Create an express app
const app = express();
// Get port, or default to 2024
const PORT = process.env.PORT || 2024;
// Parse request body and verifies incoming requests using discord-interactions package
app.use(express.json({ verify: VerifyDiscordRequest(process.env.PUBLIC_KEY) }));

/**
 * Interactions endpoint URL where Discord will send HTTP requests
 */
app.post('/interactions', async function (req, res) {
  // Interaction type and data
  const { type, id, data, member, token } = req.body; 
  /**
   * Handle verification requests
   */
  if (type === InteractionType.PING) {
    return res.send({ type: InteractionResponseType.PONG });
  }

  /**
   * Handle slash command requests
   * See https://discord.com/developers/docs/interactions/application-commands#slash-commands
   */
  if (type === InteractionType.APPLICATION_COMMAND) {
    const { name } = data;
    // "test" command
    if (name === 'test') {
      // Send a message into the channel where command was triggered from
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          // Fetches a random emoji to send from a helper function
          content: 'hello world ' + getRandomEmoji(),
        },
      });
    }
    console.log(process.env.NFTROLEID)
    console.log(member.roles.includes(process.env.NFTROLEID));
    if( member.roles.includes(process.env.NFTROLEID) == false ){
        return res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
                content: `Pre: You have no access permission for this command.`,
            },
        })
    }
    if (name === 'whitelist') {
      const { name, options } = data.options[0];
      switch (name) {
        case 'add':
          await whitelistAdd({options, member}, res)
          break;
        case 'remove':
          await whitelistRemove({options, member}, res)
          break;
        case 'reset':
          await whitelistReset({options, member}, res)
          break;
        case 'show':
          await whitelistShow({options, member}, res)
          break;
        default:

          break;
      }
    }
    if(name === 'payment'){
      const {name, options} = data.options[0];
      switch (name) {
        case 'balance':
          await paymentBalance({options, member, token}, res);
          break;
        case 'address':
          await paymentAddress({options, member}, res);
          break;
        case 'enddate':
          await paymentEndDate({options, member}, res);
          break;
        case 'paysei':
          await paymentSei({options, member, token}, res);
          break;
        case 'payseigma':
          await paymentSeigma({options, member, token}, res);
          break;
        default:
          break;
      }
    }
  }
});

// mongodb connection
initDB();

app.listen(PORT, () => {
  console.log('Listening on port', PORT);
});
