module.exports = (req, res, io) => {
  const options = req.options;
  if(typeof options.username !== "string") { res.sendStatus(400); return; }
  if(typeof options.id !== "string") { res.sendStatus(400); return; }
  io.to(`player-${options.username}`).emit("play", {
    plot: req.plot,
        id: `${req.plot.identifier}-${options.id}`,
        time: options.time,
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