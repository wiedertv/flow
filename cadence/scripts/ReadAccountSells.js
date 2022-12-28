export const readAccountSells = `

import NFTStorefrontV2 from 0xdf202fd6391aaf5d

// This script returns an array of all the nft uuids for sale through a Storefront
pub fun main(account: Address): [UInt64] {
    let storefrontRef = getAccount(account)
        .getCapability<&NFTStorefrontV2.Storefront{NFTStorefrontV2.StorefrontPublic}>(
            NFTStorefrontV2.StorefrontPublicPath
        )
        .borrow()
        ?? panic("Could not borrow public storefront from address")
    
    return storefrontRef.getListingIDs()
}
`;