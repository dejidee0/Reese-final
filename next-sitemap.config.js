/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://www.reeseblank.com",
  generateRobotsTxt: true,
  generateIndexSitemap: true,
  changefreq: "weekly",
  priority: 0.8,
  sitemapSize: 7000,
  exclude: ["/admin", "/dashboard"],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/dashboard"],
      },
    ],
    additionalSitemaps: ["https://www.reeseblank.com/sitemap.xml"],
  },
};
