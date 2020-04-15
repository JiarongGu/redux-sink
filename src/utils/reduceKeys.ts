export function reduceKeys(keys: Array<string>, formatter: (key: string, index: number) => any) {
  return keys.reduce((accumulate, key, index) => (
    accumulate[key] = formatter(key, index), accumulate
  ), {} as { [key: string]: any });
}