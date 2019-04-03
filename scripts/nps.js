const ifelse = (x, a, b) => (x ? a || x : b || 'shx echo');
const series = (...x) => `(${x.map((y) => ifelse(y)).join(') && (')})`;

module.exports = function nps(obj) {
  function trunk(o) {
    if (typeof o !== 'object') return o || 'shx echo';
    if (Array.isArray(o)) {
      if (!o.length) return 'shx echo';
      return o.length === 1 ? o[0] : series(...o);
    }
    return Object.entries(o).reduce((acc, [key, value]) => {
      acc[key] = trunk(value);
      return acc;
    }, {});
  }
  return { scripts: trunk(obj) };
};
