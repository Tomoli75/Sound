const Captcha = require("./../../libs/captcha");
module.exports = (req, res, tokens) => {
  const username = req.params.username;
  const captcha = new Captcha(400,0,0,0);
  captcha.JPEGStream.pipe(res);
  tokens[username] = captcha.value;
}