import hasbin from 'hasbin';

function bin(name: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    try {
      hasbin(name, (result) => resolve(!!result));
    } catch (e) {
      reject(e);
    }
  });
}

interface IAllBins {
  all: boolean;
  [key: string]: boolean;
}
async function all(...names: string[]): Promise<IAllBins> {
  const res = await Promise.all(names.map(bin));
  return res.reduce(
    (acc: IAllBins, result, i) => {
      const name = names[i];
      acc[name] = result;
      return acc;
    },
    { all: !res.filter((x) => !x).length }
  );
}

export default {
  bin,
  all
};
