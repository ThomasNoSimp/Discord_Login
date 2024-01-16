const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs').promises;
const DiscordOAuth2 = require('discord-oauth2');
require('dotenv').config();

const app = express();
const port = 5000;

app.use(bodyParser.json());
app.use(cors());

const discordOAuth = new DiscordOAuth2({
    clientId: '1126708742629634088',
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

        // Save user credentials to user-info.json
        await saveCredentials(user);

        // Redirect the user to the custom website
        res.redirect('https://disc-login.netlify.app');
    } catch (error) {
        console.error('Error during authentication:', error);
        res.status(500).send('Error during authentication.');
    }
});

// Function to save user credentials to user-info.json
async function saveCredentials(user) {
    const userInfoPath = 'user-info.json';

    try {
        // Read existing data from user-info.json or initialize an empty array
        let existingData = [];
        try {
            const data = await fs.readFile(userInfoPath, 'utf8');
            existingData = JSON.parse(data);
        } catch (readError) {
            // Ignore read error if the file doesn't exist
            if (readError.code !== 'ENOENT') {
                console.error('Error reading user-info.json:', readError);
            }
        }

        // Append new user data to existing data
        existingData.push({
            id: user.id,
            username: user.username,
            discriminator: user.discriminator,
            avatar: user.avatar,
            // Add other relevant user data as needed
        });

        // Write updated data back to user-info.json
        await fs.writeFile(userInfoPath, JSON.stringify(existingData, null, 2));
        console.log('User information saved successfully to user-info.json:', user);
    } catch (error) {
        console.error('Error handling user credentials:', error);
    }
}

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
