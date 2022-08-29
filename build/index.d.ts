/// <reference types="node" />
import { EventEmitter } from 'events';
export default class Downloader extends EventEmitter {
    private debugFlag;
    constructor(debugFlag?: boolean);
    private getBearerToken;
    private getPlayUrl;
    private downLoadFile;
    private downLoadM3U8;
    private getGuestToken;
    download(twitterId: string, path: string): Promise<string>;
    downloadPublic(twitterId: string, url: string, path: string): Promise<string>;
    downloadPublicToGif(twitterId: string, url: string, path: string): Promise<string>;
}
