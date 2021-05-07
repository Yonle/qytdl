const express = require("express");
const app = express();
setInterval(() => {
	require("child_process").exec("npm i ytdl-core@latest", () => {
		delete require.cache[require.resolve("ytdl-core")];
	})
}, 3600000)

app.get("/bg", (req, res) => res.sendFile(__dirname + "/bg.jpg"))

app.all("/*.*", async function(req, response) {
		if (!req.url.split("?")[0].split(".")[0].slice(1).length) return response.redirect("/");
        var url = req.query["url"];
        var filter = req.query["filter"]
        var contenttype = req.query["contenttype"]


	 // url.includes("youtube.com")||url.includes("youtu.be")) {
               try {
               response.setHeader("content-type", "video/mp4");
          if (contenttype) response.setHeader("content-type", contenttype);
                        var stream = await require("ytdl-core")(req.url.split("?")[0].split(".")[0].slice(1), { quality: "highest", filter: filter||"audioandvideo" }).on("error", error =>{ console.error(error);
                        
        response.json({"url":url, "error":error})
                        
        
                      
                return;
            })
            stream.on('info', info => {
            	if (!contenttype) response.setHeader("content-type", info.formats[0].mimeType);
            	stream.pipe(response);
            });
            
               } catch (error) {
               	console.log(error);
               	response.json({"url":url, error:"ytdl Error:"+error})
               	return false;
               }
            
            return;
    //    } else response.json({"url":url, "error": "Invalid Youtube URL."})

	 

});
app.get("/discord", (req, res) => res.redirect("https://discord.gg/9S3ZCDR"))
app.all('/', (req, res) => {
	if (req.query && req.query.url) {
		try {
			require("ytdl-core").getVideoID(req.query.url);
		} catch (error) {
			return res.end(error.toString());
		}
		return res.redirect(`/${require("ytdl-core").getVideoID(req.query.url)}.${req.query.contenttype.split("/")[1] || "mp4"}?contenttype=${req.query.contenttype || ""}&filter=${req.query.filter || ""}`);
	} else {
res.sendFile(__dirname + "/index.html")
}
})
const listener = app.listen(process.env.PORT || 3000, () => {
//	console.clear()
 // console.log("Welcome back!");
});
