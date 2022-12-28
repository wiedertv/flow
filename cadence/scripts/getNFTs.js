export const getNFTsScript = `

import NonFungibleToken from 0x631e88ae7f1d7c20
import ExampleNFT from 0xdf202fd6391aaf5d

///
pub fun main(address: Address, collectionPublicPath: PublicPath): [UInt64] {
    let account = getAccount(address)

    let collectionRef = account
        .getCapability(collectionPublicPath)
        .borrow<&{NonFungibleToken.CollectionPublic}>()
        ?? panic("Could not borrow capability from public collection at specified path")

    return collectionRef.getIDs()
}
`