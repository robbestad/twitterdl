"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = __importDefault(require("./index"));
let targetId = '1207958103641034758';
//let targetId: string = '1207942429036298240';
let path = "/home/kaiser/website/";
async function main() {
    let downloader = new index_1.default(true);
    //await downloader.download(targetId, path);
    await downloader.download(targetId, path);
}
main();
