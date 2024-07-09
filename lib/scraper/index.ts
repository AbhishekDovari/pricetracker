import axios from 'axios';
import * as cheerio from 'cheerio';

import { rejects } from "assert";
import { extractCurrency, extractDescription, extractPrice } from '../utils';

export async function scrapedAmazonProduct(url: string){
    if(!url) return;

    // curl --proxy brd.superproxy.io:22225 --proxy-user brd-customer-hl_bb01910c-zone-web_unlocker1:q6vvqgqc5540 -k "http://geo.brdtest.com/mygeo.json"

    //BrightData proxy configuration
    const username = String(process.env.BRIGHT_DATA_USERNAME);
    const password = String(process.env.BRIGHT_DATA_PASSWORD);
    const port = 22225;
    const session_id = (Math.random() * 1000000) | 0;
    const options = {
        auth: { 
            username: `${username}-session-${session_id}`, 
            password,
        },
        host: 'brd.superproxy.io',
        port,
        rejectsUnauthorized: false,
    }
     try {
        const response = await axios.get(url, options);
        
        const $ = cheerio.load(response.data);

        const title = $('#productTitle').text().trim();
        const currentPrice =  extractPrice(
          $('.priceToPay span.a-price-whole'),
          $('.a.size.base.a.color.price'),
          $('.a-button-selected .a-color-base'),
        //   $('.a-price.a-text-price') 
        );
        // console.log(response.data);

        const originalPrice = extractPrice(
            $('#priceblock_ourprice'), 
            $('.a-price.a-text-price span.a-offscreen'),
            $('#listPrice'),
            $('#priceblock_dealprice'),
            $('.a-size-base.a-color-base')
        );

        const outOfStock = $('#availability span').text().trim().toLowerCase().includes('currently unavailable');

        const images = 
        $('#imgBlkFront').attr('data-old-hires') ||
        $('#imgTagWrapperId img').attr('data-a-dynamic-image') ||
        $('#landingImage').attr('data-a-dynamic-image') ||
        '{}';

        const imageUrls = Object.keys(JSON.parse(images));

        const currency = extractCurrency($('.a-price-symbol'));
        const discountRate = $('.savingsPercentage').text().trim().replace(/[-%]/g, '');
        const description = extractDescription($);

        // console.log({title, currentPrice, originalPrice, outOfStock, imageUrls, currency, discountRate});
        const averagePrice = (Number(currentPrice) + Number(originalPrice)) / 2;

        const data = {
            url,
            currency: currency || 'Rupee',
            image : imageUrls[0],
            title,
            currentPrice : Number(currentPrice) || Number(originalPrice),
            originalPrice : Number(originalPrice) || Number(currentPrice),
            priceHistory :[],
            discountRate : Number(discountRate),
            category : '',
            isOutOfStock: outOfStock,
            reviewsCount : 100,
            stars : 4,
            description,
            lowestPrice : Number(currentPrice),
            highestPrice : Number(originalPrice),
            averagePrice,
        }

        // console.log(data);
        return data; 
     } catch (error: any) {
        throw new Error(`Failed to scrape product data: ${error.message}`);
     }
}