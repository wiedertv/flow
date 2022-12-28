
export const setupAccount = `
import NFTStorefrontV2 from 0xdf202fd6391aaf5d

transaction {
    prepare(acct: AuthAccount) {
 
         // If the account doesn't already have a Storefront
         if acct.borrow<&NFTStorefrontV2.Storefront>(from: NFTStorefrontV2.StorefrontStoragePath) == nil {
 
             // Create a new empty Storefront
             let storefront <- NFTStorefrontV2.createStorefront()
             
             // save it to the account
             acct.save(<-storefront, to: NFTStorefrontV2.StorefrontStoragePath)
 
             // create a public capability for the Storefront
             acct.link<&NFTStorefrontV2.Storefront{NFTStorefrontV2.StorefrontPublic}>(NFTStorefrontV2.StorefrontPublicPath, target: NFTStorefrontV2.StorefrontStoragePath)
         }
     }
     execute {
       log("A user stored a SaleCollection inside their account")
     }
 }
`