module.exports = (req, res, io) => {
  const options = req.options;
  if(typeof options.username !== "string") { res.sendStatus(400); return; }
  if(typeof options.id !== "string" && typeof options.track !== "string") { res.sendStatus(400); return; }
  io.to(`player-${options.username}`).emit("stop", {
    plot: req.plot,
        id: options.id ? `${req.plot.identifier}-${options.id}` : undefined,
        track: options.track ? `${req.plot.identifier}-${options.track}` : undefined
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