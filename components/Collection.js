import React, { useEffect, useState } from 'react'
import { getNFTsScript } from '../cadence/scripts/getNFTs'
import { readAccountSells } from '../cadence/scripts/ReadAccountSells'
import { getDetails } from '../cadence/scripts/getDetails'
import Image from 'next/image'
import { sellItem } from "../cadence/transactions/sell_item";
import * as fcl from "@onflow/fcl"
import * as types from "@onflow/types"

export const Collection = ({ address }) => {
    const [collection, setCollection] = useState(null);
    const [nftOnSale, setNftOnSale] = useState([]);
    const [nftDetail, setNftDetail] = useState([]);
    const getNFTs = async () => {
        const result = await fcl.send([
            fcl.script(getNFTsScript),
            fcl.args([
                fcl.arg(address, types.Address),
                fcl.arg({
                    domain: "public",                // public | private | storage
                    identifier: "exampleNFTCollection"
                }, types.Path),
            ])
        ]).then(fcl.decode)
        setCollection(result);
        console.log(result);
    }

    const getNFTsonSale = async () => {
        const result = await fcl.send([
            fcl.script(readAccountSells),
            fcl.args([
                fcl.arg("0xdf202fd6391aaf5d", types.Address),
            ])
        ]).then(fcl.decode)
        setNftOnSale(result);
        console.log(result);
    }

    const getDetailsOfOneNFTOnSale = async (id) => {
        const result = await fcl.send([
            fcl.script(getDetails),
            fcl.args([
                fcl.arg("0xdf202fd6391aaf5d", types.Address),
                fcl.arg(id, types.UInt64),
            ])
        ]).then(fcl.decode)
        setNftDetail((prev) => ({
            ...prev, result
        }))
        console.log("detalle del nft en venta", result);
    }

    //saleItemID: UInt64, saleItemPrice: UFix64, customID: String?, commissionAmount: UFix64
    const SellNFT = async (id) => {
        const transactionId = await fcl.send([
            fcl.transaction(sellItem),
            fcl.args([
                fcl.arg(id, types.UInt64),
                fcl.arg("100.0", types.UFix64),
                fcl.arg("1", types.String),
                fcl.arg("10.0", types.UFix64),
            ]),
            fcl.payer(fcl.authz),
            fcl.authorizations([fcl.authz]),
            fcl.proposer(fcl.authz),
            fcl.limit(9999)
        ]).then(fcl.decode);

        console.log(transactionId);

        return fcl.tx(transactionId).onceSealed();
    }

    useEffect(() => {
        if (address) {
            getNFTs();
        }
    }, [address])

    useEffect(() => {
        if (nftOnSale.length)
            nftOnSale.forEach(nft => {
                getDetailsOfOneNFTOnSale(nft);
            })
    }, [nftOnSale]);

    return (
        <div>
            <h3>
                {address ? "My NFTS" : null}
            </h3>
            <div style={{
                "display": "flex",
                "gap": "20px",
                "margin-bottom": "20px",
            }}>
                {
                    collection && address && collection.length ? collection.map((nft) =>
                    (<>
                        <div style={{
                            "width": "250px",
                            "height": "250px",
                            "position": "relative",
                            "background": "#c3c3c3",
                            "borderRadius": "5px",
                        }}>
                            <Image src={"/placeholder.png"} fill alt='placeholder' />
                            <div style={{
                                "position": "absolute",
                                "width": "100%",
                                "bottom": "0",
                                "left": "0",
                            }}
                            >
                                <button
                                    onClick={() => SellNFT(nft)}
                                    style={{
                                        "width": "100%",
                                        "color": "white",
                                        "padding": "10px",
                                        "cursor": "pointer",
                                    }}> Sell NFT </button>
                            </div>
                        </div>

                    </>)
                    )
                        : null
                }
            </div>
            <button onClick={() => getNFTsonSale()}>
                get nft on sale
            </button>
            {/* <p> {nftOnSale.join(", ")} </p> */}

        </div>
    )
}
