"use client"
import { scrapeAndStoreProduct } from "@/lib/actions";
import { FormEvent, useState } from "react"

const isValidAmazonProductLink = (link: string) => {
    try{
        const parsedUrl = new URL(link);
        const hostname = parsedUrl.hostname;

        if(
            hostname.includes('amazon.com')||
            hostname.includes('amazon.in') ||
            hostname.endsWith('amazon')){
            return true;
        }
    }
    catch(e){
        return false;
    }
}

const Searchbar = () => {
    const [searchpompt, setSearchpompt] = useState('')
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit =async(event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        // console.log(searchpompt)
        const isValidLink = isValidAmazonProductLink(searchpompt);
        // alert(isValidLink ? 'Valid Link' : 'Invalid Link')
        if(!isValidLink){
            return alert('Invalid Link, Please enter a valid Amazon product link')        
        }

        try {
            setIsLoading(true);
            

            const productData = await scrapeAndStoreProduct(searchpompt);
        } catch (error) {
            console.log(error);
        } finally{
            setIsLoading(false);
        }
    }

  return (
    <form
        className="flex flex-wrap gap-4 mt-12"
        onSubmit={handleSubmit}
    >
        <input type="text"
        value={searchpompt}
        onChange={(e) => setSearchpompt(e.target.value)}
        placeholder="Enter Product link"
        className="searchbar-input w-600" 
        />

        <button 
        type="submit" 
        className="searchbar-btn"
        disabled={searchpompt === '' || isLoading}
        >
            {isLoading ? 'Loading...' : 'Track Price'}
        </button>
    </form>
  )
}

export default Searchbar;
