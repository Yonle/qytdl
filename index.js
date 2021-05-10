const express = require("express");
const RateLimit = require("express-rate-limit");
const app = express();

const ratelimit = RateLimit({
  windowMs: 3 * 60 * 60 * 1000, // Ratelimit 3 hou
  max: 30, // Maximum request per 10 Minute
  message: "Too many request from this request. Please try again later."
});

// Prepare Ratelumit for Download endpoint
app.set("trust proxy", 1);
app.use("/*.*", ratelimit);

// Automatic update ytdl-core every hour.
setInterval(() => {
  require("child_process").exec("npm i ytdl-core@latest", () => {
    delete require.cache[require.resolve("ytdl-core")];
  });
}, 3600000);

// Route for Download endpoint
app.get("/*.*", async function(req, response) {
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
app.get("/", (req, res) => {
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

// Listen....
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("QYTDL is now on port", listener.address().port);
});
