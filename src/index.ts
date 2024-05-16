import axios from "axios";
import { load } from "cheerio";
import urlParser from "urlparser";
import express from "express"
import cors from 'cors'

type movie = {
  title: string;
  release_date: string;
};

type tv = {
  name : string
}


const make_title: (titleid: number, type: string) => Promise<string> = async (
  titleid: number,
  type : string
) => {
  if (type == "movie") {
    const response : movie= (await axios.get(`https://api.themoviedb.org/3/movie/${titleid}?api_key=e8f6efe815b9e7eb81c43cfb9c10984a`)).data
    
    return `${response.title} (${response.release_date.split("-")[0]})`;
  } else {
    const losttv : tv = (await axios.get(`https://api.themoviedb.org/3/tv/${titleid}?api_key=e8f6efe815b9e7eb81c43cfb9c10984a`)).data;

    return losttv.name;
  }
};

const searchfind: (madetitle: string, type: string) => Promise<string> = async (
  madetitle: string,
  type: string
) => {
  const parseurl: string = (
    await axios.get(
      `https://tugaflix.best/${
        type == "movie" ? "filmes" : "series"
      }/?s=${madetitle}`,
      {
        headers: { "Accept-Encoding": "identity" },
      }
    )
  ).data;

  const parseurl$ = load(parseurl);

  const posterLinks = parseurl$("div.poster").find("a");

  var linkscrape;

  posterLinks.each((index, element) => {
    if (posterLinks.attr("title") == madetitle) {
      linkscrape = posterLinks.attr("href");
    }
  });

  if (linkscrape) {
    return linkscrape;
  } else {
    return "";
  }
};

const playerlost: (
  titleid: number,
  type: string,
  s: number,
  e: number
) => Promise<string[] | null> = async (
  titleid: number,
  type: string,
  s: number,
  e: number
) => {
  const madetitle: string = await make_title(titleid, type);

  const linkscrape = await searchfind(madetitle, type);
 
  if (linkscrape !== "") {
    const sea = s < 10 ? `0${s}` : s.toString();
    const eps = e < 10 ? `0${e}` : e.toString();
    const response = await fetch(linkscrape, {
      method: "POST", // *GET, POST, PUT, DELETE, etc.
      mode: "no-cors", // no-cors, *cors, same-origin
      // *default, no-cache, reload, force-cache, only-if-cached
      // include, *same-origin, omit
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      // manual, *follow, error
      // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
      body:
        type == "movie"
          ? new URLSearchParams({ play: "" })
          : new URLSearchParams({ [`S${sea}E${eps}`]: "" }), // body data type must match "Content-Type" header
    });

    const uu = await response.text();

    const url_parse$ = load(uu);

    if (type == "movie") {
      const findsource = url_parse$("div.play").find("a");

      var source_embeds: string[] = [];

      findsource.each((indx, source) => {
        const embedurl = url_parse$(source).attr("href");
        source_embeds.push(
          embedurl?.startsWith("https:") ? embedurl : `https:${embedurl}`
        );
      });
      return source_embeds;
    } else {
      return [`https:${url_parse$("iframe").attr("src")}`];
    }
  } else {
    return [];
  }
};

// const id: string = await playerlost();

// // Loop through each anchor and get its title

const streamtape = async (id:string | null | undefined)=>{
  if (id) {
    const data: string = (
      await axios.get(`https://streamta.pe/v/${id}`, {
        headers: {
          "Accept-Encoding": "identity",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        },
      })
    ).data;
  
    const match = data.match(/robotlink'\).innerHTML = (.*)'/);
    const [fh, sh] = match?.[1]?.split("+ ('") ?? [];
    const url = `https:${fh?.replace(/'/g, "").trim()}${sh?.substring(3).trim()}`;
    return url || null
  }
}



const foundfind = (srcs:string[] | null) => {
  if (srcs) {
    for (var i = 0; i < srcs.length; i++) {
      const parseOurl = urlParser.parse(srcs[i]);
      if (
        (parseOurl.host.hostname == "www.tugaflix.org" ||
          parseOurl.host.hostname == "tugaflix.org") &&
        (parseOurl.path.base == "player/streamtape.php" ||
          parseOurl.path.base == "player/tape.php")
      ) {
        return parseOurl.query.parts[0].split("=")[1];
      }
    }
  } else {
    return null;
  }
};

// const id: string | null | undefined = foundfind(await playerlost(106379, "tv", 1, 1));

const app = express()

app
.use(cors())
.get('/tv/:tmdb/:season/:episode',async (req,res)=>{
  res.send(await streamtape(foundfind(await playerlost(parseInt(req.params.tmdb), "tv", parseInt(req.params.season) ,  parseInt(req.params.episode)))))
})
.get('/movie/:tmdb',async (req,res)=>{
  res.send(await streamtape(foundfind(await playerlost(parseInt(req.params.tmdb), "movie", 1 ,  1))))
})
.listen(process.env.PORT || 7000)

// const main_ = async ()=>{
// const dit1 = await streamtape(foundfind(await playerlost(278, "movie", 1, 1)))

// console.log(await dit1)
// }

// const logout =async ()=>{
//    main_()
// }

// logout()

// console.log(await streamtape(foundfind(await playerlost(106379, "tv", 1, 1))))
