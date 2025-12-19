import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env') , 
                quiet: true});

export function getenvVar(name:string){
    const variable = process.env[name]
    if(variable)
        {return process.env[name]}
    else{throw new Error(name+ '- variable does not exist in .env file')}
}