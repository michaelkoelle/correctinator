import { remote } from 'electron';
import fs from 'fs'
import path from 'path'

import {store} from '../index';
import { addSubmision, setLastOpen, setSubmissions } from '../actions/actionCreators';
import {parse} from './UniworxParser';
import { normalize, schema } from 'normalizr';
import {correction} from '../model/model';

const ratingFilePattern = new RegExp('bewertung_([0-9]+)\\.txt', 'g');

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

export function openSubmissions(){
  const dirPath = openDirectory();

  if(dirPath){
    store.dispatch(setLastOpen(dirPath));

    const ratingFiles = getAllFilesInDirectory(dirPath).filter(file => file.match(ratingFilePattern)).map(file => path.normalize(file));

    const submissions = [];

    ratingFiles.forEach(ratingFile => {
      const directory = path.normalize(path.dirname(ratingFile));
      const files = getAllFilesInDirectory(directory).filter(file => !file.match(ratingFilePattern)).map(file => path.normalize(file));
      const properties = parse(fs.readFileSync(ratingFile, 'utf8'));

      submissions.push(Object.assign({},
        properties,
        {
          directory,
          ratingFile,
          files,
          fileCount: files.length
        }
      ));

      console.log(properties);

      console.log(normalize(properties, correction));

      debugger;
    });

    if(submissions.length > 0){
      store.dispatch(setSubmissions(submissions));
    }

  }

}
