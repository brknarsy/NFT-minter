import * as web3 from "@solana/web3.js";
import * as token from "@solana/spl-token";
import { initializeKeypair } from "./initializeKeypair";

import * as fs from "fs";
import {
  bundlrStorage,
  findMetadataPda,
  keypairIdentity,
  Metaplex,
  toMetaplexFile,
} from "@metaplex-foundation/js";

import {
  DataV2,
  createCreateMetadataAccountV2Instruction,
} from "@metaplex-foundation/mpl-token-metadata";

const TOKEN_NAME = "Kelchainer"
const TOKEN_SYMBOL = "KEL"
const TOKEN_DESCRIPTION = "A token for kelchainers"
const TOKEN_IMAGE_NAME = "kelchain.png"
const TOKEN_IMAGE_PATH = `tokens/bld/assets/${TOKEN_IMAGE_NAME}`

async function createBldToken(
  connection: web3.Connection,
  payer: web3.Keypair,
) {
  const tokenMint = await token.createMint(
    connection,
    payer,
    payer.publicKey,
    payer.publicKey,
    2
  )

  const metaplex = Metaplex.make(connection)
  .use(keypairIdentity(payer))
  .use(bundlrStorage({
    address: "https://devnet.bundlr.network",
    providerUrl: "https://api.devnet.solana.com",
    timeout: 60000,
  }));

  const imageBuffer = fs.readFileSync(TOKEN_IMAGE_PATH);
  const imageFile = toMetaplexFile(imageBuffer, TOKEN_IMAGE_NAME);
  const imageUri = await metaplex.storage().upload(imageFile);

  const { uri } = await metaplex.nfts().uploadMetadata({
    name: TOKEN_NAME,
    image: imageUri,
    description: TOKEN_DESCRIPTION,
  })
  
  const metadataPDA = metaplex.nfts().pdas().metadata({ mint: tokenMint});
  const tokenMetadata = {
    name: TOKEN_NAME,
    symbol: TOKEN_SYMBOL,
    uri: uri,
    sellerFeeBasisPoints: 0,
    creators: null,
    collection: null,
    uses: null
  } as DataV2

  const metadataInstruction = createCreateMetadataAccountV2Instruction(
    {
      metadata: metadataPDA,
      mint: tokenMint,
      payer: payer.publicKey,
      mintAuthority: payer.publicKey,
      updateAuthority: payer.publicKey,
    }, 
    {
      createMetadataAccountArgsV2: {
        data: tokenMetadata,
        isMutable: true
      }
    }
  )

  const transaction = new web3.Transaction().add(metadataInstruction);
  const signature = await web3.sendAndConfirmTransaction(connection, transaction, [payer]);

  fs.writeFileSync('/home/ixoth/Personal/Patika/nft-minter/tokens/bld/cache.json', JSON.stringify({
    mint: tokenMint.toBase58(),
    metadata: metadataPDA.toBase58(),
    metadataUri: uri,
    imageUri: imageUri,
    metadataTransaction: signature,
  }));
}

async function main() {
  const connection = new web3.Connection(web3.clusterApiUrl("devnet"));
  const payer = await initializeKeypair(connection);

  await createBldToken(connection, payer);
}

main()
  .then(() => {
    console.log("Finished successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });