module.exports = (req, res, io) => {
  const options = req.options;
  if(!["music","sfx"].includes(options.track)) { res.sendStatus(400); return; }
  if(typeof options.username !== "string") { res.sendStatus(400); return; }
  if(typeof options.id !== "string") { res.sendStatus(400); return; }
  if(!validUrl(options.url)) { res.sendStatus(400); return; }
  io.to(`player-${options.username}`).emit("simpleplay", {
    plot: req.plot,
        id: `${req.plot.identifier}-${options.id}`,
        url: options.url,
        looping: options.looping === "true",
        track: options.track,
        time: options.time
    });
    res.sendStatus(200);
}

function validUrl(string) {
  let url;
  
  try {
    url = new URL(string);
  } catch (_) {
    return false;  
  }

  return url.protocol === "http:" || url.protocol === "https:";
}