import 'dotenv/config';
import { getRPSChoices } from './game.js';
import { capitalize, InstallGlobalCommands } from './utils.js';

// Get the game choices from game.js
function createCommandChoices() {
  const choices = getRPSChoices();
  const commandChoices = [];

  for (let choice of choices) {
    commandChoices.push({
      name: capitalize(choice),
      value: choice.toLowerCase(),
    });
  }

  return commandChoices;
}

// Simple test command
const TEST_COMMAND = {
  name: 'test',
  description: 'Basic command',
  type: 1,
};

// Command containing options
const CHALLENGE_COMMAND = {
  name: 'challenge',
  description: 'Challenge to a match of rock paper scissors',
  options: [
    {
      type: 3,
      name: 'object',
      description: 'Pick your object',
      required: true,
      choices: createCommandChoices(),
    },
  ],
  type: 1,
};

// Command associated with whitelist
const WHITELIST_COMMAND = {
  name: 'whitelist',
  description: 'Access to your whitelist',
  options: [
    {
      type: 1,
      name: 'add',
      description: 'Add your IP address to add to whitelist',
      options: [
        {
          type: 3,
          name: 'ipaddress',
          description: 'The IP address to whitelist',
          required: true
        }
      ]
    },
    {
      type: 1,
      name: 'remove',
      description: 'Remove your IP address from whitelist',
      options: [
        {
          type: 3,
          name: 'ipaddress',
          description: 'The IP address to remove from the whitelist',
          required: true,
        }
      ]
    },
    {
      type: 1,
      name: 'reset',
      description: 'Remove all your IP address from the whitelist',
    },
    {
      type: 1,
      name: 'show',
      description: 'Show all IP address from the whitelist'
    }
  ]
}

// Command containing options
const PAYMENT_COMMAND = {
  name: 'payment',
  description: 'Access your payment',
  options: [
    {
      name: 'address',
      description: 'Get your payment info',
      type: 1,
    },
    {
      name: 'balance',
      description: 'Get your payment address',
      type: 1,
    },
    {
      name: 'enddate',
      description: 'Get your payment address',
      type: 1,
    },
    {
      name: 'paysei',
      description: 'Pay with Sei',
      type: 1,
    },
    {
      name: 'payseigma',
      description: 'Pay with Seigma',
      type: 1,
    },
  ]
}

const ALL_COMMANDS = [TEST_COMMAND, WHITELIST_COMMAND, PAYMENT_COMMAND];

InstallGlobalCommands(process.env.APP_ID, ALL_COMMANDS);