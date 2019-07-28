export function reduceKeys(keys: Array<string>, formatter: (key: string) => any) {
  return keys.reduce((accumulate, key) => (
    accumulate[key] = formatter(key), accumulate
  ), {} as { [key: string]: any });
}
