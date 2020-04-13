import { writeFile } from 'fs';
// Configure Angular `environment.ts` file path

const targetPath = './src/environments/environment.prod.ts';

// Dev target path.
// Uncomment next line and comment line 4 above. Change the targetPath in method writeFile(devtargetPath, envConfigFile, function (err) {})
// const devtargetPath = './src/environments/environment.ts';

// Load node modules
const colors = require('colors');
require('dotenv').load();
// `environment.ts` file structure
const envConfigFile = `export const environment = {
    hostIP: '${process.env.OPENSDS_S3_HOST}',
    hostPort: '${process.env.OPENSDS_S3_PORT}',
    production: '${process.env.PRODUCTION}'
};
`;
console.log(colors.magenta('The file `environment.ts` will be written with the following content: \n'));
console.log(colors.grey(envConfigFile));
writeFile(targetPath, envConfigFile, function (err) {
   if (err) {
       throw console.error(err);
   } else {
       console.log(colors.magenta(`Angular environment.ts file generated correctly at ${targetPath} \n`));
   }
});