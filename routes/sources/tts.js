const axios = require("axios");

module.exports = async (req, res) => {
    const result = await axios.post("https://api.soundoftext.com/sounds", {"engine":"Google","data":{"text":req.params.text,"voice":req.params.voice||"en-US"}});
    res.redirect("https://storage.soundoftext.com/"+result.data.id+".mp3");
}