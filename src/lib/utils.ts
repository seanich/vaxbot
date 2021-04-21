export function padLeft(str: string, width: number) {
  const len = Math.max(width - str.length, 0);
  let ret = "";
  for (let i = 0; i < len; ++i) {
    ret += " ​";
  }
  return ret + str;
}
