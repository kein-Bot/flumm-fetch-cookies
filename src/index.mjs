import _fetch from "flumm-fetch";
import CookieJar from "./cookie-jar.mjs";
import Cookie from "./cookie.mjs";
import {CookieParseError} from "./errors.mjs";

const redirectStatus = new Set([301, 302, 303, 307, 308]);

const cookieJar = new CookieJar();

export default async function fetch(url, options) {
    let cookies = "";
    [...cookieJar.cookiesValidForRequest(url)].forEach(
        c => (cookies += c.serialize() + "; ")
    );

    if (cookies) {
        if (!options) options = {};
        if (!options.headers) options.headers = {};
        options.headers.cookie = cookies.slice(0, -2);
    }

    const wantFollow =
        !options || !options.redirect || options.redirect === "follow";
    if (wantFollow) {
        if (!options) options = {};
        options.redirect = "manual";
    }

    const result = await _fetch(url, options);

    cookies = result.headers["set-cookie"] || [];
    cookies.forEach(c => cookieJar.addCookie(c, url));

    // delete expired cookies after each request
    cookieJar.deleteExpired(false);

    if (wantFollow && redirectStatus.has(result.status)) {
        const location = result.headers.get("Location");
        options.redirect = "follow";
        return fetch(location, options);
    }

    return result;
}

export {cookieJar, CookieJar, Cookie, CookieParseError};
