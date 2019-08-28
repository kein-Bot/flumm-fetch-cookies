import Cookie from "./cookie.mjs";
import url from "url";

export default class CookieJar {
    constructor() {
        this.cookies = new Map();
    }
    addCookie(c, fromURL) {
        if(typeof c === "string") {
            try {
                c = new Cookie(c, fromURL);
            }
            catch(error) {
                if(error.name === "CookieParseError") {
                    console.warn("Ignored cookie: " + c);
                    console.warn("Reason: " + error.message);
                    return false;
                }
                else
                    throw error;
            }
        }
        else if(!(c instanceof Cookie))
            throw new TypeError("First parameter is neither a string nor a cookie!");
        if(!this.cookies.get(c.domain))
            this.cookies.set(c.domain, new Map());
        this.cookies.get(c.domain).set(c.name, c);
        return true;
    }
    domains() {
        return this.cookies.keys();
    }
    *cookiesDomain(domain) {
        for(const cookie of (this.cookies.get(domain) || []).values())
            yield cookie;
    }
    *cookiesValid(withSession) {
        for(const cookie of this.cookiesAll())
            if(!cookie.hasExpired(!withSession))
                yield cookie;
    }
    *cookiesAll() {
        for(const domain of this.domains())
            yield* this.cookiesDomain(domain);
    }
    *cookiesValidForRequest(requestURL) {
        const namesYielded = [],
              domains = url
                .parse(requestURL)
                .hostname
                .split(".")
                .map((_, i, a) => a.slice(i).join("."))
                .slice(0, -1);
        for(const domain of domains) {
            for(const cookie of this.cookiesDomain(domain)) {
                if(cookie.isValidForRequest(requestURL)
                && namesYielded.every(name => name !== cookie.name)) {
                    namesYielded.push(cookie.name);
                    yield cookie;
                }
            }
        }
    }
    deleteExpired(sessionEnded) {
        const validCookies = [...this.cookiesValid(!sessionEnded)];
        this.cookies = new Map();
        validCookies.forEach(c => this.addCookie(c));
    }
};
