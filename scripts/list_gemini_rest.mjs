import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
import axios from 'axios'

async function tryEndpoint(ep){
  try{
    const key = process.env.GOOGLE_AI_API_KEY
    const url = `${ep}?key=${encodeURIComponent(key)}`
    const res = await axios.get(url, { timeout: 15000 })
    console.log(`Success for ${ep}:`)
    console.log(JSON.stringify(res.data, null, 2))
  }catch(err){
    console.error(`Error calling ${ep}:`, err?.response?.status, err?.response?.data || err.message)
  }
}

;(async ()=>{
  await tryEndpoint('https://generativelanguage.googleapis.com/v1/models')
  await tryEndpoint('https://generativelanguage.googleapis.com/v1beta/models')
})()
