'use client'

import { FormEvent, useState} from 'react'
import { scrapeAndStoreProduct } from '../lib/actions'

const Searchbar = () => {


const isValidAmazonProductURL = (searchPrompt: string)=> {
  
  try {

    const paresdUrl = new URL(searchPrompt)
    const hostname = paresdUrl.hostname

    if(hostname.includes('amazon.com') || hostname.includes('amazon.') || hostname.endsWith('amazon') ){
      return true
    }

    
  } catch (error) {
    return false    
  }

  return false

}

  const [searchPrompt, setSearchPrompt] = useState('')

  const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async ( event:  FormEvent<HTMLFormElement>)=>{
        event.preventDefault()

        // console.log("ggg");
        
        
        const isValidLink = isValidAmazonProductURL(searchPrompt)

        if(!isValidLink) return alert('Please provide a valid Amazon link')


        try {
          setIsLoading(true)

          const product = await scrapeAndStoreProduct(searchPrompt)

        } catch (error) {
          
        } finally {
          setIsLoading(false)
        }



    }


  return (
    <form className='flex flex-wrap gap-4 mt-12' onSubmit={handleSubmit}>

        <input value={searchPrompt} onChange={(e)=>setSearchPrompt(e.target.value)} type="text" placeholder="Enter product link" className="searchbar-input" />

        <button type="submit" className="searchbar-btn" disabled={searchPrompt === ''} >
          {isLoading ? 'Searching...' :'Search'}
        </button>

     </form>
  )
}

export default Searchbar


