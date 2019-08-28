import fetch from "./fetch.mjs";
import CookieJar from "./cookie-jar.mjs";
import Cookie from "./cookie.mjs";

const cookieJar = new CookieJar();

export default async function cookieFetch(url, options) {
    let cookies = "";
    [...cookieJar.cookiesValidForRequest(url)]
        .filter((v, i, a) => a.slice(0, i).every(c => c.name !== v.name)) // filter cookies with duplicate names
        .forEach(c => cookies += c.serialize() + "; ");

    if(cookies) {
        if(!options)
            options = {};
        if(!options.headers)
            options.headers = {};
        options.headers.cookie = cookies.slice(0, -2);
    }

    const result = await fetch(url, options);

    cookies = result.headers["set-cookie"] || [];
    cookies.forEach(c => cookieJar.addCookie(c, url));

    // delete expired cookies after each request
    cookieJar.deleteExpired(false);

    return result;
}

export {cookieJar, CookieJar, Cookie};
