// Everything site-specific lives here. The build reads nothing else.
export default {
  url: "https://creationix.com",
  title: "Creationix Creations",
  description: "Stories of a techie living the good country life.",
  lang: "en",
  author: { name: "Tim Caswell", url: "https://creationix.com/about/" },
  image: "/cover.jpg", // default social preview image

  nav: [
    ["Posts", "/"],
    ["About", "/about/"],
    ["GitHub", "https://github.com/creationix"],
    ["Feed", "/feed.xml"],
  ],

  // Atom feed output paths. /rss/ is kept so 2016-era subscribers keep working.
  feeds: ["/feed.xml", "/rss/index.html"],

  // Old URLs that should keep working. Emitted as tiny meta-refresh pages.
  redirects: {
    "/author/tim/": "/about/",
    "/subscribe/": "/feed.xml",
    "/solar-powered-workstation/amp/": "/solar-powered-workstation/",
    "/moving-from-the-city-to-the-country/amp/": "/moving-from-the-city-to-the-country/",
  },
};
