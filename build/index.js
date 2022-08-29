"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const fs_1 = __importDefault(require("fs"));
const events_1 = require("events");
const child_process_1 = require("child_process");
const videoApiURL = 'https://api.twitter.com/1.1/videos/tweet/config/', videoPlayerURL = 'https://twitter.com/i/videos/tweet/', guestTokenURL = "https://api.twitter.com/1.1/guest/activate.json";
class Downloader extends events_1.EventEmitter {
    constructor(debugFlag) {
        super();
        this.debugFlag = debugFlag || false;
    }
    async getBearerToken(twitter_id) {
        let playerResponse = await axios_1.default.get(`${videoPlayerURL}${twitter_id}`);
        let jsMatchRes = playerResponse.data.match(/src="(.*js)"/);
        if (jsMatchRes != null) {
            this.debugFlag && console.log(`jsUrl :${jsMatchRes[1]}`);
            let jsUrl = jsMatchRes[1], jsResponse = await axios_1.default.get(jsUrl), jsData = jsResponse.data, tokenMatchRes = jsData.match(/Bearer ([a-zA-Z0-9%-]+)/);
            if (tokenMatchRes != null) {
                this.debugFlag && console.log(`token: ${tokenMatchRes[1]}`);
                return tokenMatchRes[1];
            }
            else {
                this.debugFlag && console.error('can`t find token!');
            }
        }
        return null;
    }
    async getPlayUrl(twitter_id, token, guestToken) {
        let url = `${videoApiURL}${twitter_id}.json`, videoConfigResponse = await axios_1.default.get(url, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "x-guest-token": guestToken
            }
        }), videoConfig = videoConfigResponse.data;
        if (videoConfig && videoConfig.track) {
            this.debugFlag && console.log(`play url: ${videoConfig.track.playbackUrl}`);
            return videoConfig.track.playbackUrl;
        }
        return null;
    }
    async downLoadFile(url, path, guestToken) {
        let headers = guestToken ? {
            "x-guest-token": guestToken
        } : {};
        let response = await axios_1.default.get(url, {
            responseType: "stream",
            headers
        }), downloadStream = response.data;
        return new Promise((resolve, reject) => {
            let writeStream = fs_1.default.createWriteStream(path);
            downloadStream.pipe(writeStream);
            writeStream.on('finish', resolve);
        });
    }
    async downLoadM3U8(url, path, guestToken) {
        let tokenArgs = guestToken ? ` "x-guest-token: ${guestToken}"` : '';
        let command = `ffmpeg -i ${url} -headers${tokenArgs} -c copy ${path}`;
        return new Promise((resolve, reject) => {
            child_process_1.exec(command, (err, stdout, stderr) => {
                if (err) {
                    this.debugFlag && console.log(stdout);
                    this.debugFlag && console.error(stderr);
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        });
    }
    async getGuestToken(token) {
        let guestTokenResponse = await axios_1.default.post(guestTokenURL, '', {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        if (guestTokenResponse.data.guest_token) {
            return guestTokenResponse.data.guest_token;
        }
        return null;
    }
    async download(twitterId, path) {
        let token = await this.getBearerToken(twitterId);
        if (!token) {
            throw new Error('get Bearer Token Fail!');
        }
        let guestToken = await this.getGuestToken(token);
        if (!guestToken) {
            throw new Error('get Guest Token Fail!');
        }
        let url = await this.getPlayUrl(twitterId, token, guestToken);
        if (!url) {
            throw new Error('get video URL Fail!');
        }
        this.debugFlag && console.log('try to download...');
        if (url.indexOf(".mp4") != -1) {
            await this.downLoadFile(url, `${path}${twitterId}.mp4`, guestToken);
        }
        else if (url.indexOf(".m3u8") != -1) {
            await this.downLoadM3U8(url, `${path}${twitterId}.mp4`, guestToken);
        }
        return `${path}${twitterId}.mp4`;
    }
    async downloadPublic(twitterId, url, path) {
        this.debugFlag && console.log('try to download public...');
        if (url.indexOf(".mp4") != -1) {
            await this.downLoadFile(url, `${path}${twitterId}.mp4`);
        }
        else if (url.indexOf(".m3u8") != -1) {
            await this.downLoadM3U8(url, `${path}${twitterId}.mp4`);
        }
        return `${path}${twitterId}.mp4`;
    }
    async downloadPublicToGif(twitterId, url, path) {
        await this.downLoadM3U8(url, `${path}${twitterId}.gif`);
        return `${path}${twitterId}.gif`;
    }
}
exports.default = Downloader;
