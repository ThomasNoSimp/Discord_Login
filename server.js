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
        // Request an access token using the obtained code
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
        console.error('Error during authentication:', error);
        res.status(500).send('Error during authentication.');
    }
});

// Function to save user credentials to credentials.json
function saveCredentials(user) {
    const credentialsPath = 'credentials.json';

    try {
        // Read existing data from credentials.json
        let existingData = [];
        if (fs.existsSync(credentialsPath)) {
            const data = fs.readFileSync(credentialsPath, 'utf8');
            existingData = JSON.parse(data);
        }

        // Append new user data to existing data
        existingData.push({
            id: user.id,
            username: user.username,
            discriminator: user.discriminator,
            avatar: user.avatar,
            // Add other relevant user data as needed
        });

        // Write updated data back to credentials.json
        fs.writeFileSync(credentialsPath, JSON.stringify(existingData, null, 2));
        console.log('User information saved successfully.');
    } catch (error) {
        console.error('Error handling user credentials:', error);
    }
}

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
