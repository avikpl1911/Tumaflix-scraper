"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const cheerio_1 = require("cheerio");
const urlparser_1 = __importDefault(require("urlparser"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const make_title = (titleid, type) => __awaiter(void 0, void 0, void 0, function* () {
    if (type == "movie") {
        const response = (yield axios_1.default.get(`https://api.themoviedb.org/3/movie/${titleid}?api_key=e8f6efe815b9e7eb81c43cfb9c10984a`)).data;
        return `${response.title} (${response.release_date.split("-")[0]})`;
    }
    else {
        const losttv = (yield axios_1.default.get(`https://api.themoviedb.org/3/tv/${titleid}?api_key=e8f6efe815b9e7eb81c43cfb9c10984a`)).data;
        return losttv.name;
    }
});
const searchfind = (madetitle, type) => __awaiter(void 0, void 0, void 0, function* () {
    const parseurl = (yield axios_1.default.get(`https://tugaflix.best/${type == "movie" ? "filmes" : "series"}/?s=${madetitle}`, {
        headers: { "Accept-Encoding": "identity" },
    })).data;
    console.log("hello");
    const parseurl$ = (0, cheerio_1.load)(parseurl);
    const posterLinks = parseurl$("div.poster").find("a");
    var linkscrape;
    posterLinks.each((index, element) => {
        if (parseurl$(element).attr("title") == madetitle) {
            // console.log(parseurl$(element).attr("href"))
            linkscrape = parseurl$(element).attr("href");
        }
    });
    if (linkscrape) {
        return linkscrape;
    }
    else {
        return "";
    }
});
const playerlost = (titleid, type, s, e) => __awaiter(void 0, void 0, void 0, function* () {
    const madetitle = yield make_title(titleid, type);
    const linkscrape = yield searchfind(madetitle, type);
    if (linkscrape !== "") {
        const sea = s < 10 ? `0${s}` : s.toString();
        const eps = e < 10 ? `0${e}` : e.toString();
        const response = yield fetch(linkscrape, {
            method: "POST", // *GET, POST, PUT, DELETE, etc.
            mode: "no-cors", // no-cors, *cors, same-origin
            // *default, no-cache, reload, force-cache, only-if-cached
            // include, *same-origin, omit
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            // manual, *follow, error
            // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
            body: type == "movie"
                ? new URLSearchParams({ play: "" })
                : new URLSearchParams({ [`S${sea}E${eps}`]: "" }), // body data type must match "Content-Type" header
        });
        const uu = yield response.text();
        const url_parse$ = (0, cheerio_1.load)(uu);
        if (type == "movie") {
            const findsource = url_parse$("div.play").find("a");
            var source_embeds = [];
            findsource.each((indx, source) => {
                const embedurl = url_parse$(source).attr("href");
                source_embeds.push((embedurl === null || embedurl === void 0 ? void 0 : embedurl.startsWith("https:")) ? embedurl : `https:${embedurl}`);
            });
            return source_embeds;
        }
        else {
            return [`https:${url_parse$("iframe").attr("src")}`];
        }
    }
    else {
        return [];
    }
});
// const id: string = await playerlost();
// // Loop through each anchor and get its title
const streamtape = (id) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    if (id) {
        const data = (yield axios_1.default.get(`https://streamta.pe/v/${id}`, {
            headers: {
                "Accept-Encoding": "identity",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            },
        })).data;
        const match = data.match(/robotlink'\).innerHTML = (.*)'/);
        const [fh, sh] = (_b = (_a = match === null || match === void 0 ? void 0 : match[1]) === null || _a === void 0 ? void 0 : _a.split("+ ('")) !== null && _b !== void 0 ? _b : [];
        const url = `https:${fh === null || fh === void 0 ? void 0 : fh.replace(/'/g, "").trim()}${sh === null || sh === void 0 ? void 0 : sh.substring(3).trim()}`;
        return url || null;
    }
});
const foundfind = (srcs) => {
    if (srcs) {
        for (var i = 0; i < srcs.length; i++) {
            const parseOurl = urlparser_1.default.parse(srcs[i]);
            if ((parseOurl.host.hostname == "www.tugaflix.org" ||
                parseOurl.host.hostname == "tugaflix.org") &&
                (parseOurl.path.base == "player/streamtape.php" ||
                    parseOurl.path.base == "player/tape.php")) {
                return parseOurl.query.parts[0].split("=")[1];
            }
        }
    }
    else {
        return null;
    }
};
// const id: string | null | undefined = foundfind(await playerlost(106379, "tv", 1, 1));
const app = (0, express_1.default)();
app
    .use((0, cors_1.default)())
    .get("/", (req, res) => { res.send("formovie /movie/tmdb forshow /tv/tmdb/season/episode"); })
    .get('/tv/:tmdb/:season/:episode', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const logreq = yield streamtape(foundfind(yield playerlost(parseInt(req.params.tmdb), "tv", parseInt(req.params.season), parseInt(req.params.episode))));
    if (logreq) {
        if ((logreq === null || logreq === void 0 ? void 0 : logreq.length) > 0) {
            console.log("why");
            res.send(logreq);
        }
        else {
            res.status(404);
        }
    }
    else {
        res.status(404).send("not found");
    }
}))
    .get('/movie/:tmdb', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const logreq = yield streamtape(foundfind(yield playerlost(parseInt(req.params.tmdb), "movie", 1, 1)));
    if (logreq) {
        if ((logreq === null || logreq === void 0 ? void 0 : logreq.length) > 0) {
            console.log("why");
            res.send(logreq);
        }
        else {
            res.status(404);
        }
    }
    else {
        res.status(404).send("not found");
    }
}))
    .listen(process.env.PORT || 7000);
// const main_ = async ()=>{
// const dit1 = await streamtape(foundfind(await playerlost(278, "movie", 1, 1)))
// console.log(await dit1)
// }
// const logout =async ()=>{
//    main_()
// }
// logout()
// console.log(await streamtape(foundfind(await playerlost(106379, "tv", 1, 1))))
//# sourceMappingURL=index.js.map