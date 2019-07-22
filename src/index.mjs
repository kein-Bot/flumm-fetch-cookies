import fetch from "./fetch";
import CookieJar from "./cookie-jar";
import Cookie from "./cookie";

const cookieJar = new CookieJar("rw");

export default async function cookieFetch(url, options) {
    let cookies = "";
    cookieJar.forEach(c => {
        if(c.isValidForRequest(url))
            cookies += c.serialize() + "; ";
    });
    if(cookies.length !== 0) {
        if(!options) {
            options = {
                headers: {}
            };
        }
        else if(!options.headers)
            options.headers = {};
        options.headers.cookie = cookies.slice(0, -2);
    }
    const result = await fetch(url, options);
    cookies = result.headers["set-cookie"];
    if(cookies)
        cookies.forEach(c => cookieJar.addCookie(c, url));
    return result;
}
