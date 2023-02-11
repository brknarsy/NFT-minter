import { FC, MouseEventHandler, useCallback, useEffect, useState } from "react"
import {
    Button,
    Container,
    Heading,
    HStack,
    Text,
    VStack,
    Image,
    Alert,
} from "@chakra-ui/react"
import { ArrowForwardIcon } from "@chakra-ui/icons"
import { useRouter } from "next/router"
import { keypairIdentity, walletAdapterIdentity } from "@metaplex-foundation/js"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { Metaplex, CandyMachine} from "@metaplex-foundation/js"
import { useMemo } from "react"
import { PublicKey } from "@solana/web3.js"

const Connected: FC = () => {
    const {connection} = useConnection()
    const walletAdapter = useWallet()
    const [candyMachine, setCandyMachine] = useState<CandyMachine>()
    const [isMinting, setIsMinting] = useState(false)

    const metaplex = useMemo(() => {
        return Metaplex.make(connection).use(walletAdapterIdentity(walletAdapter))
    }, [walletAdapter, connection])

    useEffect(() => {
        if(!metaplex) return
        metaplex.candyMachines().findByAddress({ address: new PublicKey("DZKES8g5qPhSAme8noJQnWtNRtFAf3h3F5VeijMJFEu3") }).then((candyMachine) => {
            console.log(candyMachine)
            setCandyMachine(candyMachine)
        }).catch((error) => {
            alert(error)
        })
    }, [metaplex])

    const router = useRouter()

    const handleClick: MouseEventHandler<HTMLButtonElement> = useCallback(
        async (event) => {
            if (event.defaultPrevented) return;
            if (!walletAdapter.connected || !candyMachine) return;
            try{
                setIsMinting(true)
                const collectionUpdateAuthority = new PublicKey("73LWuRckyh35gEk8WVCbQJw7APPXMoG1cefS1A713oXp")
                const nft = await metaplex.candyMachines().mint({ candyMachine, collectionUpdateAuthority })
                console.log(nft)
                router.push(`/newMint?mint=${nft.nft.address.toBase58()}`)
            } catch (error) {
                
                console.error(error);
            } finally {
                setIsMinting(false)
            }
        }, [metaplex, walletAdapter, candyMachine]
    )
    return (
        <VStack spacing={20}>
            <Container>
                <VStack spacing={8}>
                    <Heading
                        color="white"
                        as="h1"
                        size="2xl"
                        noOfLines={1}
                        textAlign="center"
                    >
                        Welcome Buildoor.
                    </Heading>

                    <Text color="bodyText" fontSize="xl" textAlign="center">
                        Each brkn is randomly generated and can be staked to receive
                        <Text as="b"> $BLD</Text> Use your <Text as="b"> $BLD</Text> to
                        upgrade your brkn and receive perks within the community!
                    </Text>
                </VStack>
            </Container>

            <HStack spacing={10}>
                <Image src="avatar1.png" alt="" />
                <Image src="avatar2.png" alt="" />
                <Image src="avatar3.png" alt="" />
                <Image src="avatar4.png" alt="" />
                <Image src="avatar5.png" alt="" />
            </HStack>

            <Button bgColor="accent" color="white" maxW="380px" onClick={handleClick} isLoading={isMinting}>
                <HStack>
                    <Text>mint brkn</Text>
                    <ArrowForwardIcon />
                </HStack>
            </Button>
        </VStack>
    )
}

export default Connected