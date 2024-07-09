import Product from "@/lib/models/product.model";
import { generateEmailContent, sendEmail } from "@/lib/nodemailer";
import { scrapedAmazonProduct } from "@/lib/scraper";
import { connectToDB } from "@/lib/scraper/mongoose"
import { getAveragePrice, getEmailNotifType, getHighestPrice, getLowestPrice } from "@/lib/utils";
import { NextResponse } from "next/server";
import { title } from "process";

export const maxDuration =60;
export const dynamic = 'force-dynamic';
export const revalidate= 0;

export async function GET(){
    try {
        connectToDB();

        const products = await Product.find({});
        if(!products){
            throw new Error("No products found");
        }

        const updatedProducts = await Promise.all(
            products.map(async (currentProduct) => {
                const scrapedProduct = await scrapedAmazonProduct(currentProduct.url);

                if(!scrapedProduct){
                    throw new Error("Error scraping product");
                }

                const updatedPriceHistory = [
                    ...currentProduct.priceHistory,
                    { price: scrapedProduct.currentPrice }
                ]
                
                const product={
                    ...scrapedProduct,
                    priceHistory: updatedPriceHistory,
                    lowestPrice: getLowestPrice(updatedPriceHistory),
                    highestPrice: getHighestPrice(updatedPriceHistory),
                    averagePrice: getAveragePrice(updatedPriceHistory),
                    // discountRate: calculateDiscountRate(scrapedProduct.originalPrice, scrapedProduct.currentPrice),
                }

                const updatedProduct = await Product.findOneAndUpdate(
                    { url: product.url },
                    product,
                );
                
                const emailNotifactionType = getEmailNotifType(scrapedProduct , currentProduct )
                if(emailNotifactionType && updatedProduct.users.length>0){
                    const productInfo = {
                        title: updatedProduct.title,
                        url: updatedProduct.url,
                    }
                    const emailContent = await generateEmailContent(productInfo, emailNotifactionType);
                    const userEmails = updatedProduct.users.map((user : any) => user.email);
                    await sendEmail(emailContent,  userEmails );
                }
                return updatedProduct;
            })
        )

        return NextResponse.json({
            message:'Ok', data: updatedProducts
        })
    } catch (error) {
        throw new Error(`Error in GET: ${error}`)
        
    }
}