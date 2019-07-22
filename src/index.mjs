import fetch from "./fetch";
import CookieJar from "./cookie-jar";
import Cookie from "./cookie";

async function cookieFetch(cookieJars, url, options) {
    let cookies = "";
    if(cookieJars) {
        if(Array.isArray(cookieJars) && cookieJars.every(c => c instanceof CookieJar)) {
            cookieJars.forEach(jar => {
                if(!jar.flags.includes("r"))
                    return;
                jar.forEach(c => {
                    if(c.isValidForRequest(url))
                        cookies += c.serialize() + "; ";
                });
            });
        }
        else if(cookieJars instanceof CookieJar && cookieJars.flags.includes("r")) {
            cookieJars.forEach(c => {
                if(c.isValidForRequest(url))
                    cookies += c.serialize() + "; ";
            });
        }
        else
            throw new TypeError("First paramter is neither a cookie jar nor an array of cookie jars!");
    }
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
    cookies = result.headers["set-cookie"]);
    if(cookies && cookieJars) {
        if(Array.isArray(cookieJars)) {
            cookieJars.forEach(jar => {
                if(!jar.flags.includes("w"))
                    return;
                cookies.forEach(c => jar.addCookie(c, url));
            });
        }
        else if(cookieJars.flags.includes("w")) {
            cookies.forEach(c => cookieJars.addCookie(c, url));
        }
    }
    return result;
}

export {cookieFetch as fetch, CookieJar, Cookie};
