const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const DiscordOAuth2 = require('discord-oauth2');
require('dotenv').config();

const app = express();
const port = 5000;

app.use(bodyParser.json());
app.use(cors());

const discordOAuth = new DiscordOAuth2({
    clientId: 'YOUR_DISCORD_CLIENT_ID',
    clientSecret: process.env.DiscordClientSecret,
    redirectUri: 'https://disc-login.netlify.app',
});

app.get('/', (req, res) => {
    res.send('Welcome to the server!');
});

app.get('/auth', (req, res) => {
    const authorizationUrl = discordOAuth.generateAuthUrl({
        scope: ['identify'],
    });
    res.redirect(authorizationUrl);
});

app.get('/auth/success', async (req, res) => {
    const code = req.query.code;

    try {
        const tokenData = await discordOAuth.tokenRequest({
            code,
            scope: ['identify'],
        });

        // Retrieve user information using the access token
        const user = await discordOAuth.getUser(tokenData.access_token);

        // Save user credentials to credentials.json
        saveCredentials(user);

        // Redirect the user to the custom website
        res.redirect('https://disc-login.netlify.app');
    } catch (error) {
        console.error('OAuth error:', error);
        res.status(500).send('Error during authentication.');
    }
});

// Function to save user credentials to credentials.json
function saveCredentials(user) {
    const credentialsPath = 'credentials.json';

    // Read existing data from credentials.json
    let existingData = [];
    try {
        const data = fs.readFileSync(credentialsPath, 'utf8');
        existingData = JSON.parse(data);
    } catch (error) {
        console.error('Error reading existing data:', error);
    }

    // Append new user data to existing data
    existingData.push({
        username: user.username,
        discriminator: user.discriminator,
        // Add other relevant user data as needed
    });

    // Write updated data back to credentials.json
    try {
        fs.writeFileSync(credentialsPath, JSON.stringify(existingData, null, 2));
        console.log('Credentials saved successfully.');
    } catch (error) {
        console.error('Error writing data to credentials.json:', error);
    }
}

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
