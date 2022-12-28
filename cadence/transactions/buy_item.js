export const BuyItemFromMarketPlace = `

import FlowToken from 0x7e60df042a9c0868
import FungibleToken from 0x9a0766d93b6608b7
import NonFungibleToken from 0x631e88ae7f1d7c20
import ExampleNFT from 0xdf202fd6391aaf5d
import NFTStorefrontV2 from 0xdf202fd6391aaf5d

transaction(listingResourceID: UInt64, storefrontAddress: Address, commissionRecipient: Address?) {
    let pvault: @FungibleToken.Vault
    let ExampleNFTCollection: &ExampleNFT.Collection{NonFungibleToken.Receiver}
    let market: &NFTStorefrontV2.Storefront{NFTStorefrontV2.StorefrontPublic}
    let listing: &NFTStorefrontV2.Listing{NFTStorefrontV2.ListingPublic}
    var CRC: Capability<&{FungibleToken.Receiver}>?

    prepare(acct: AuthAccount) {
        self.CRC = nil
        self.market = getAccount(storefrontAddress)
            .getCapability<&NFTStorefrontV2.Storefront{NFTStorefrontV2.StorefrontPublic}>(
                NFTStorefrontV2.StorefrontPublicPath
            )
            .borrow()
            ?? panic("Could not borrow Storefront from provided address")

        self.listing = self.market.borrowListing(listingResourceID: listingResourceID)
                    ?? panic("No Offer with that ID in Storefront")
        let price = self.listing.getDetails().salePrice

        let mainFlowVault = acct.borrow<&FlowToken.Vault>(from: /storage/flowTokenVault)
            ?? panic("Cannot borrow FlowToken vault from acct storage")
        self.pvault <- mainFlowVault.withdraw(amount: price)

        self.ExampleNFTCollection = acct.borrow<&ExampleNFT.Collection{NonFungibleToken.Receiver}>(
            from: ExampleNFT.CollectionStoragePath
        ) ?? panic("Cannot borrow NFT collection receiver from account")

        let commissionAmount = self.listing.getDetails().commissionAmount

        if commissionRecipient != nil && commissionAmount != 0.0 {
            let _commissionRecipientCap = getAccount(commissionRecipient!).getCapability<&{FungibleToken.Receiver}>(/public/flowTokenReceiver)
            assert(_commissionRecipientCap.check(), message: "Commission Recipient doesn't have flowtoken receiving capability")
            self.CRC = _commissionRecipientCap
        } else if commissionAmount == 0.0 {
            self.CRC = nil
        } else {
            panic("Commission recipient can not be empty when commission amount is non zero")
        }
    }

    execute {
        let item <- self.listing.purchase(
            payment: <-self.pvault,
            commissionRecipient: self.CRC
        )
        self.ExampleNFTCollection.deposit(token: <-item)
        log("bought nft")
    }
}
`