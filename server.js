const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');

const app = express();
const port = 5000;

app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res) => {
    res.send('Welcome to the server!');
});

app.post('/saveFormData', (req, res) => {
    const formData = req.body;

    // Read existing data from credentials.json
    let existingData = [];
    try {
        const data = fs.readFileSync('credentials.json', 'utf8');
        existingData = JSON.parse(data);
    } catch (error) {
        console.error('Error reading existing data:', error);
    }

    // Append new form data to existing data
    existingData.push(formData);

    // Write updated data back to credentials.json
    try {
        fs.writeFileSync('credentials.json', JSON.stringify(existingData));
        res.json({ success: true, message: 'Data saved successfully.' });
    } catch (error) {
        console.error('Error writing data to credentials.json:', error);
        res.status(500).json({ success: false, message: 'Error saving data.' });
    }
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
