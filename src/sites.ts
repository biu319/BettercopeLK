import { load } from "cheerio";
import { request } from "undici";
import { SearchResult, SearchSource, Source } from "./types";

const searchWpSite = async (url: string, source: Source) => {
  const { body } = await request(url, {
    bodyTimeout: 30000,
    headersTimeout: 30000,
  });

  const resultsHtml = await body.text();
  const $ = load(resultsHtml);

  const searchResults: SearchResult[] = [];

  $(".item-list").each((_, element) => {
    const postBox = $(element).find(".post-box-title a");

    const title = $(postBox).text().trim();
    if (title === "Collection") return;

    const postUrl = $(postBox).attr("href");
    if (!postUrl) return;

    searchResults.push({ title, postUrl, source });
  });

  return searchResults;
};

const getSources = (keyword: string): SearchSource[] => {
  return [
    {
      url: `https://www.baiscopelk.com/?s=${encodeURIComponent(keyword)}`,
      name: "baiscopelk",
    },
    {
      url: `https://cineru.lk/?s=${encodeURIComponent(keyword)}`,
      name: "cineru",
    },
  ];
};

export const searchSites = async (keyword: string) => {
  let searchResults: SearchResult[] = [];
  const sources = getSources(keyword);

  for (const source of sources) {
    try {
      const results = await searchWpSite(source.url, source.name);
      searchResults = searchResults.concat(results);
    } catch (e) {
      console.error(e);
    }
  }

  return searchResults;
};
