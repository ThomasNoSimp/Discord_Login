const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs').promises;

const app = express();
const port = 5000;

app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res) => {
    res.send('Welcome to the server!');
});

app.post('/saveFormData', async (req, res) => {
    const formData = req.body;

    try {
        // Read existing data from credentials.json or initialize an empty array
        let existingData = [];
        try {
            const data = await fs.readFile('credentials.json', 'utf8');
            existingData = JSON.parse(data);
        } catch (readError) {
            // Ignore read error if the file doesn't exist
            if (readError.code !== 'ENOENT') {
                console.error('Error reading credentials.json:', readError);
            }
        }

        // Append new form data to existing data
        existingData.push(formData);

        // Write updated data back to credentials.json
        await fs.writeFile('credentials.json', JSON.stringify(existingData, null, 2));
        console.log('Form data saved successfully:', formData);

        res.json({ success: true, message: 'Form data saved successfully.' });
    } catch (error) {
        console.error('Error saving form data:', error);
        res.status(500).json({ success: false, message: 'Error saving form data.' });
    }
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
