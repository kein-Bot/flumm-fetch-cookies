import _fetch from "flumm-fetch";
import CookieJar from "./cookie-jar.mjs";
import Cookie from "./cookie.mjs";

const cookieJar = new CookieJar();

export default async function fetch(url, options) {
    let cookies = "";
    [...cookieJar.cookiesValidForRequest(url)]
        .forEach(c => cookies += c.serialize() + "; ");

    if(cookies) {
        if(!options)
            options = {};
        if(!options.headers)
            options.headers = {};
        options.headers.cookie = cookies.slice(0, -2);
    }

    const result = await _fetch(url, options);

    cookies = result.headers["set-cookie"] || [];
    cookies.forEach(c => cookieJar.addCookie(c, url));

    // delete expired cookies after each request
    cookieJar.deleteExpired(false);

    return result;
}

export {cookieJar, CookieJar, Cookie};

