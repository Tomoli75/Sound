const axios = require("axios");

module.exports = async (req, res) => {
    const result = await axios.post("https://api.15.ai/app/getAudioFile5", {"text":req.params.text,"character":"GLaDOS","emotion":"Contextual"});
    res.redirect("https://cdn.15.ai/audio/"+result.data.wavNames[0]);
}