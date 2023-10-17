const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const dotenv = require("dotenv")
const path = require('path')


dotenv.config()
const PORT = process.env.PORT || 3001;
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({ apiKey: process.env.OPEN_AI_KEY});
const openai = new OpenAIApi(configuration);

app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'audio')));

const AWS = require("aws-sdk");
AWS.config.loadFromPath("AWS_Credentials.json");

app.post('/api/TTS', async (req, res) => {

    const completion = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: req.body.text,
        max_tokens: 100,
        temperature: 0.5
    })
    // console.log(completion)

    let num = (Math.random() * 100000000).toFixed(0);

    const awsPolly = new AWS.Polly({ region: "us-east-1" })
    const params = {
        OutputFormat: "mp3",
        Text: completion.data.choices[0].text,
        VoiceId: "Matthew"
    }

    awsPolly.synthesizeSpeech(params, (err, data) => {
        if (err) {
            console.error(err);
            return;
        }

        //create file path and file name
        //the audio is storde in public folder of frontend
        //then the fileName is sent to the frontend
        //in the frontend, once the file is stored in there, when mySource changes, it'll play the audio
        let fileName = num + ".mp3";
        let filePath = path.join(__dirname, 'audio', fileName);
        
        if (num) {
            fs.writeFileSync(filePath, data.AudioStream, (err) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ error: "Failed to write audio file" });
                }
            });
            res.status(200).json(num);
        }
    })
})

app.listen(PORT, () => { 
    console.log(`Listening at ${PORT}`); 
});