import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
import { GoogleGenerativeAI } from '@google/generative-ai'

(async function(){
  try{
    const key = process.env.GOOGLE_AI_API_KEY
    if(!key) throw new Error('GOOGLE_AI_API_KEY not set')
    const client = new GoogleGenerativeAI(key)
    console.log('client keys:', Object.keys(client))
    console.log('client prototype keys:', Object.getOwnPropertyNames(Object.getPrototypeOf(client)))
    console.dir(client, { depth: 2 })
  }catch(e){
    console.error('inspect error:', e)
    process.exit(1)
  }
})()
