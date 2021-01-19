import { v5 as uuidv5 } from 'uuid';

function v5(name: string, namespace: string = uuidv5.URL): string {
  const replacePattern = /[/| |_|\\]/g;
  const temp = name.trim().replace(replacePattern, '-').toLowerCase();
  return uuidv5(temp, namespace);
}

export default { v5 };
