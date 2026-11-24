const totals = (days) =>
  days.reduce(
    (sum, d) => ({
      views: sum.views + d.views,
      site: sum.site + d.site,
      calls: sum.calls + d.calls,
      routes: sum.routes + d.routes,
    }),
    { views: 0, site: 0, calls: 0, routes: 0 },
  );
const meanRating = (sum, count) => (count ? Math.round((10 * sum) / count) / 10 : null);
const difference = (current, previous) => current - previous;
export { totals, meanRating, difference };
