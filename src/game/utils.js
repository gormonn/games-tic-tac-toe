export const battleFieldRaw = (size) =>
  new Array(size).fill(new Array(size).fill(0));

export const iSymbols = ((i) => {
  return [...Array(26)].map((_) => (++i).toString(36), (i = 9)).join``;
})(0);

export const nameSeparator = ":";
export const nameStringify = (iHor, iVert) =>
  `${iHor}${nameSeparator}${iSymbols[iVert]}`;

export const nameParse = (name) => {
  const [x, yStr] = name.split(nameSeparator);
  const y = iSymbols.indexOf(yStr);
  return [Number(x), Number(y)];
};

export const winSchemasRaw = (size) => {
  const allCells = new Set();
  const winSchemas = new Set();
  const lineDiag2 = [];
  for (let x = 0; x < size; x++) {
    const lineVert = [];
    const lineHori = [];
    const lineDiag1 = [];

    // lineDiag2.push(`${x}${nameSeparator}${iSymbols[x]}`);
    lineDiag2.push(nameStringify(x, x));
    for (let y = 0; y < size; y++) {
      // lineVert.push(`${x}${nameSeparator}${iSymbols[y]}`);
      // lineHori.push(`${y}${nameSeparator}${iSymbols[x]}`);
      // lineDiag1.push(`${y}${nameSeparator}${iSymbols[size - 1 - y]}`);
      // allCells.add(`${x}${nameSeparator}${iSymbols[y]}`);
      lineVert.push(nameStringify(x, y));
      lineHori.push(nameStringify(y, x));
      lineDiag1.push(nameStringify(y, size - 1 - y));
      allCells.add(nameStringify(x, y));
    }
    winSchemas.add(lineVert.join("."));
    winSchemas.add(lineHori.join("."));
    winSchemas.add(lineDiag1.join("."));
  }

  winSchemas.add(lineDiag2.join("."));

  return [createWinCounter([...winSchemas]), [...allCells]];

  function createWinCounter(arr) {
    const obj = {};
    arr.forEach((key) => {
      obj[key] = 0;
    });
    return obj;
  }
};
