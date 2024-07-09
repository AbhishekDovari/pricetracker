"use server"
import { revalidatePath } from "next/cache";
import { connect } from "http2";
import { scrapedAmazonProduct } from "../scraper";
import { connectToDB } from "../scraper/mongoose";
import Product from "../models/product.model";
import { getAveragePrice, getHighestPrice, getLowestPrice } from "../utils";
import { User } from "@/types";
import { generateEmailContent, sendEmail } from "../nodemailer";

export async function scrapeAndStoreProductData(url: string) {
    if(!url) return;

    try {
        connectToDB();

        const scrapedProduct = await scrapedAmazonProduct(url);

        let product = scrapedProduct;

        const existingProduct = await Product.findOne({ url: scrapedProduct?.url });


        if(existingProduct) {
            const updatedPriceHistory: any = [
                ...existingProduct.priceHistory,
                { price: scrapedProduct?.currentPrice }
            ]
            
            product={
                ...scrapedProduct,
                priceHistory: updatedPriceHistory,
                lowestPrice: getLowestPrice(updatedPriceHistory),
                highestPrice: getHighestPrice(updatedPriceHistory),
                averagePrice: getAveragePrice(updatedPriceHistory),
                // discountRate: calculateDiscountRate(scrapedProduct.originalPrice, scrapedProduct.currentPrice),
            }
        }
        const newProduct = await Product.findOneAndUpdate(
            { url: scrapedProduct?.url },
            product,
            {upsert: true, new: true }
        );

        revalidatePath(`/products/$(newProduct._id)`);
        

    } catch (error :any) {
        throw new Error(`Failed to scrape product data: ${error.message}`);
        
    }
}

export async function getProductById(id: string) {
    
    try {
        connectToDB();
        const product = await Product.findOne({ _id: id });

        if(!product) {
            // throw new Error('Product not found');
            return null;
        }
        return product;

    } catch (error :any) {
        // throw new Error(`Failed to get product by id: ${error.message}`);
        console.log(error);
    }



}

export async function getAllProducts() {
    try {
        connectToDB();
        const products = await Product.find();
        return products;
    } catch (error) {
        console.log(error);
    }
}

export async function getSimilarProducts(productId : string) {
    try {
        connectToDB();
        const currentPruduct = await Product.findOne({ productId });
        if(!productId) return null;
        const similarProducts = await Product.find({
            id: { $ne: productId },
        }).limit(4);
        return similarProducts;
    } catch (error) {
        console.log(error);
    }
}

export async function addUserEmailToProduct(productId: string, email: string) {
    try {
        const product = await Product.findById(productId);
        if(!product) return;
        
        const userExists = product.users.some((user: User) => user.email === email);
        if(!userExists) {
            product.users.push({ email: email });
            await product.save();

            const emailContent = await generateEmailContent(product, "WELCOME");
            await sendEmail(emailContent, [email]);
        }

    }
    catch (error) {
        console.log(error);
    }
}