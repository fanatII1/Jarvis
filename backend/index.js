const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const dotenv = require("dotenv")

dotenv.config()
const PORT = process.env.PORT || 3001;
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({ apiKey: process.env.OPEN_AI_KEY});
const openai = new OpenAIApi(configuration);

app.use(bodyParser.json());
app.use(cors());
app.use(express.static('public'));

const AWS = require("aws-sdk");
AWS.config.loadFromPath("AWS_Credentials.json");

app.post('/api/TTS', async (req, res) => {

    const completion = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: req.body.text,
        max_tokens: 100,
        temperature: 0.5
    })
    console.log(completion)

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

        let filePath = "../public/voice/";
        let fileName = num + ".mp3";

        if (num) fs.writeFileSync(filePath + fileName, data.AudioStream)
    })

    setTimeout(() => { res.status(200).json(num) }, 4500)
})


app.listen(PORT, () => { 
    console.log(`Listening at ${PORT}`); 
});