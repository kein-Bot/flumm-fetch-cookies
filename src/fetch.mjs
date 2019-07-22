import http from "http";
import https from "https";
import url from "url";
import querystring from "querystring";

const readdata = (res, mode, data = "") => new Promise((resolve, reject) => res
  .setEncoding("utf8")
  .on("data", chunk => data += chunk)
  .on("end", () => {
    switch(mode) {
      case "text":   resolve(data); break;
      case "json":   try { resolve(JSON.parse(data)); } catch(err) { reject(data); } break;
      case "buffer": resolve(new Buffer.from(data)); break;
      default:       reject("lol no D:"); break;
    }
  }));

export default (a, options = {}, link = url.parse(a), body = "") => new Promise((resolve, reject) => {
  options = {...{ hostname: link.hostname, path: link.path, method: "GET" }, ...options};
  if(options.method === "POST") {
    body = querystring.stringify(options.body);
    delete options.body;
    options.headers = {...options.headers, ...{
      "Content-Type":   "application/x-www-form-urlencoded",
      "Content-Length": Buffer.byteLength(body)
    }};
  }
  (link.protocol === "https:"?https:http).request(options, res => resolve({
    body:    res,
    headers: res.headers,
    text:    () => readdata(res, "text"),
    json:    () => readdata(res, "json"),
    buffer:  () => readdata(res, "buffer")
  })).on("error", err => reject(err)).end(body);
});
