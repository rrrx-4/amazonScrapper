import { NextResponse } from "next/server";
import Product from "../../../lib/models/product.model";
import { connectToDB } from "../../../lib/mongoose";
import { generateEmailBody, sendEmail } from "../../../lib/nodemailer";
import { scrapeAmazonProduct } from "../../../lib/scraper";
import { getAveragePrice, getEmailNotifType, getHighestPrice, getLowestPrice } from "../../../lib/utils";

export async function GET(){

    try {
        
        connectToDB()

        const products = await Product.find({});

        if(!products) throw new Error("No products found")

        // 1 Scrape Latest product details & update DB 

        const updatedProducts = await Promise.all(
            products.map(async (currentProduct) => {

                const scrapedProduct = await scrapeAmazonProduct(currentProduct.url)

                if(!scrapedProduct) throw new Error("No product found")

                 const updatedPricedHistory: any = [
                ...currentProduct.priceHistory,
                {price: scrapedProduct.currentPrice}
            ]

         const   product = {
                ...scrapedProduct, 
                priceHistory: updatedPricedHistory,
                lowestPrice: getLowestPrice(updatedPricedHistory),
                highestPrice: getHighestPrice(updatedPricedHistory),
                averagePrice: getAveragePrice(updatedPricedHistory)
            }

            const updatedProduct = await Product.findOneAndUpdate({url: scrapedProduct.url}, product)


            // 2. Check each product's status & send mail accordingly

            const emailNotifType = getEmailNotifType (scrapedProduct, currentProduct)

            if(emailNotifType && updatedProduct.users.length > 0){
                 const productInfo = {
                    title: updatedProduct.title,
                    url: updatedProduct.url,
                 }

                 const emailContent =  await generateEmailBody(productInfo, emailNotifType)

                 const userEmails = updatedProduct.users.map((user : any)=>user.email)

                 await sendEmail(emailContent, userEmails)
            }

            return updatedProduct

            })
        )

        return NextResponse.json({
            message: 'OK', data: updatedProducts
        })


    } catch (error) {

        throw new Error(`Error in GET: ${error}`)
        
    }

}