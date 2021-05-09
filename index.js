const express = require("express");
const RateLimit = require("express-rate-limit");
const app = express();

const ratelimit = RateLimit({
  windowMs: 10 * 60 * 1000,
  max: 8,
  message: "Too many request from this request. Please try again later."
});

app.set("trust proxy", 1);
app.use("/*.*", ratelimit);
setInterval(() => {
  require("child_process").exec("npm i ytdl-core@latest", () => {
    delete require.cache[require.resolve("ytdl-core")];
  });
}, 3600000);

app.all("/*.*", async function(req, response) {
  if (
    !req.url
      .split("?")[0]
      .split(".")[0]
      .slice(1).length
  )
    return response.redirect("/");
  if (req.url.includes("favicon")) return response.end();
  let url = req.query["url"];
  let filter = req.query["filter"];
  let contenttype = req.query["contenttype"];

  try {
    if (contenttype) response.setHeader("content-type", contenttype);
    let stream = await require("ytdl-core")(
      req.url
        .split("?")[0]
        .split(".")[0]
        .slice(1),
      { quality: "highest", filter: filter || "audioandvideo" }
    ).on("error", error => {
      console.error(error);
      response.json({ url: url, error: error });
      return;
    }).on("info", info => {
      if (!contenttype)
        response.setHeader("content-type", info.formats[0].mimeType);
      stream.pipe(response);
    });
  } catch (error) {
    console.log(error);
    response.json({ url: url, error: "ytdl Error:" + error });
    return false;
  }
  return;
});
app.get("/discord", (req, res) => res.redirect("https://discord.gg/9S3ZCDR"));
app.all("/", (req, res) => {
  if (req.query && req.query.url) {
    try {
      require("ytdl-core").getVideoID(req.query.url);
    } catch (error) {
      return res.end(error.toString());
    }
    return res.redirect(
      `/${require("ytdl-core").getVideoID(
        req.query.url
      )}.${req.query.contenttype.split("/")[1] || "mp4"}?contenttype=${req.query
        .contenttype || ""}&filter=${req.query.filter || ""}`
    );
  } else {
    res.sendFile(__dirname + "/index.html");
  }
});
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("QYTDL is now on port", listener.address().port);
});
