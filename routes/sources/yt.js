const Downloader = require("./../../libs/downloader.js");
const fs = require("fs");

module.exports = (req, res) => {
    if (fs.existsSync("/home/container/cache/" + req.params.id + ".mp3")) {
        res.sendFile("/home/container/cache/" + req.params.id + ".mp3");
        return;
    }
    var dl = new Downloader();
    dl.getMP3({
        videoId: req.params.id,
        name: req.params.id + ".mp3"
    }, function(err, videoRes) {
        res.sendFile("/home/container/cache/" + req.params.id + ".mp3");
    });
}