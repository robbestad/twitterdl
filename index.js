const Downloader = require("./build/index.js").default
console.log(Downloader)

//downloader.download('1563964779974246400', 'download');
let downloader = new Downloader(true);

(async()=>{
let filename = await downloader.download('1563964779974246400', '/home/svena/develop/wallets/twtivid/download/');
	console.log(filename)
})()
