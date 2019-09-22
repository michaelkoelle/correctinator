import { remote } from 'electron';
import fs from 'fs'

export function openDirectory() {
  const paths = remote.dialog.showOpenDialog(remote.getCurrentWindow(),{
    properties: ['openDirectory']
  });

  if(!paths || paths.length !== 1){
    return undefined;
  }

  console.log(`Open directory: ${paths[0]}`);
  return paths[0];
}

export function getAllFilesInDirectory (dir, files_ = []){
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const name = `${dir}/${file}`;
    if (fs.statSync(name).isDirectory() && !name.includes('MACOSX')){
      getAllFilesInDirectory(name, files_);
    } else if(!fs.statSync(name).isDirectory()){
      files_.push(name);
    }
  });
  return files_;
}
