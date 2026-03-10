const sdk = require('node-appwrite');
// Tell dotenv to look one folder up at the root .env
require('dotenv').config({ path: '../.env' });

const client = new sdk.Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY); 