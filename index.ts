import { keypairIdentity, Metaplex, sol, toDateTime } from "@metaplex-foundation/js";
import * as web3 from "@solana/web3.js";
import { initializeKeypair } from "./initializeKeypair";

async function main() {
    const connection = new web3.Connection("https://api.devnet.solana.com");
    const user = await initializeKeypair(connection);
    const metaplex = Metaplex.make(connection).use(keypairIdentity(user));
    const candyMachine = await metaplex.candyMachines().findByAddress({ address: new web3.PublicKey("DZKES8g5qPhSAme8noJQnWtNRtFAf3h3F5VeijMJFEu3")})
    await metaplex.candyMachines().update({
      candyMachine,
      guards: {
        botTax: { lamports: sol(0.01), lastInstruction: false },
        solPayment: { amount: sol(3), destination: user.publicKey },
        startDate: { date: toDateTime("2022-10-18T16:00:00Z") },
      },
    });
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