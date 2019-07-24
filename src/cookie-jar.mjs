import Cookie from "./cookie";

export default class CookieJar {
    constructor() {
        this.cookies = new Map();
    }
    addCookie(c, fromURL) {
        if(typeof c === "string")
            c = new Cookie(c, fromURL);
        this.cookies.set(c.name, c);
    }
    forEach(callback) {
        this.cookies.forEach(callback);
    }
};
