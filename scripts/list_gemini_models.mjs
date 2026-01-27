import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
import { GoogleGenerativeAI } from '@google/generative-ai'

async function main(){
  try{
    const key = process.env.GOOGLE_AI_API_KEY
    if(!key) throw new Error('GOOGLE_AI_API_KEY not set in .env.local')
    const client = new GoogleGenerativeAI(key)
    const models = await client.listModels()
    console.log(JSON.stringify(models, null, 2))
  }catch(err){
    console.error('Error listing models:', err)
    process.exit(1)
  }
}

main()
