import { JsonRpcProvider } from "@ethersproject/providers"
import { Wallet } from "@ethersproject/wallet"
import { Methods } from "@ew-did-registry/did"
import { DIDDocumentFull } from "@ew-did-registry/did-document"
import { abi1056, address1056, Operator } from "@ew-did-registry/did-ethr-resolver"
import { IResolverSettings, ProviderTypes } from "@ew-did-registry/did-resolver-interface"
import { Keys } from "@ew-did-registry/keys"
import { Signer } from "ethers"
import { config } from "../../../config/config"
import { ISignerProvider } from "../../signer-provider-interface/ISignerProvider"
import { getDIDFromAddress } from "../utils"

const resolverSettings: IResolverSettings = {
    provider: {
        uriOrInfo: config.prequalification.provider,
        type: ProviderTypes.HTTP
    },
    method: Methods.Erc1056,
    abi: abi1056,
    address: address1056
}

export class DID {

    constructor(private readonly signerProvider: ISignerProvider, private readonly operatorKeys: Keys) { }

    /**
     * Creates a DIDDocument
     */
    public async createDocument(address: string): Promise<void> {
        const did = getDIDFromAddress(address)
        const signer: Signer | undefined = await this.signerProvider.getSignerForDID(did)
        if (!signer) {
            throw Error("Unable to create DID Document as unable to retrieve signer")
        }
        const operator = new Operator(signer, resolverSettings)
        const document = new DIDDocumentFull(did, operator)
        console.log(`[${new Date()}]`, "[DID] minting tokens before did creation", did)
        // send tokens to address so they can create/update their document
        await this.mint(address)
        console.log(`[${new Date()}]`, "[DID] creating did document", did)
        await document.create()
        console.log(`[${new Date()}]`, `[DID] Created identity for ${did}`)
    }

    /**
     * Fund asset wallet with minimal EWT
     * @param assetAddress wallet address of asset
     */
    private async mint(assetAddress: string): Promise<void> {
        const provider = new JsonRpcProvider(resolverSettings.provider?.uriOrInfo)
        const wallet = new Wallet(this.operatorKeys.privateKey, provider)
        const valueInEther = 0.001
        console.log(`[${new Date()}]`, "creating tx, to:", assetAddress, "value:", valueInEther * 1e18, "gasPrice:", 1)
        const tx = await wallet.sendTransaction({
            to: assetAddress,
            value: valueInEther * 1e18, // convert to wei
        })
        console.log(`[${new Date()}]`, "sending mint tx", tx.hash)
        await tx.wait()
        console.log(`[${new Date()}]`, "tx confirmed", tx.hash)
        // log remaining balance
        const balance = await wallet.getBalance()
        // get approx. balance for log (ethers bignumber hates big numbers)
        const balanceInEther = (parseInt(balance.toString(), 10) / 1e18).toFixed(3)
        console.log(`[${new Date()}]`, `[DID] Minted ${valueInEther} for ${assetAddress}. Remaining balance: ${balanceInEther}`)
    }
}
