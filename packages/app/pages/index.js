import { useEffect, useState } from "react";
import Head from "next/head";
import {
  Box,
  Heading,
  Container,
  Text,
  Button,
  Stack,
  Input,
  Center,
  Flex,
  Avatar,
  Image,
} from "@chakra-ui/react";
import { ethers } from "ethers";
// import QRCode from "react-qr-code";
import { client, challenge, authenticate, getDefaultProfile } from "./api";
import {
  // createIdentity,
  // claimQrCode,
  createClaim,
  // generateQRCode,
} from "../lib/id";

export default function Home() {
  /* local state variables to hold user's address and access token */
  const [address, setAddress] = useState();
  const [token, setToken] = useState();
  const [issuerDID, setIssuerDID] = useState();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [lensName, setLensName] = useState();
  const [lensID, setLensID] = useState();
  const [lensStats, setLensStats] = useState();
  const [lensBio, setLensBio] = useState();
  const [lensPicture, setLensPicture] = useState();
  const [userDID, setUserDID] = useState();
  const [jsonLD, setJsonLD] = useState();
  const [qrURL, setQrURL] = useState();

  useEffect(() => {
    /* when the app loads, check to see if the user has already connected their wallet */
    checkConnection();
  }, []);
  async function checkConnection() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const accounts = await provider.listAccounts();
    if (accounts.length) {
      setAddress(accounts[0]);
    }
  }
  async function connect() {
    /* this allows the user to connect their wallet */
    const account = await window.ethereum.send("eth_requestAccounts");
    if (account.result.length) {
      setAddress(account.result[0]);
    }
  }
  async function login() {
    try {
      /* first request the challenge from the API server */
      const challengeInfo = await client.query({
        query: challenge,
        variables: { address },
      });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      /* ask the user to sign a message with the challenge info returned from the server */
      const signature = await signer.signMessage(
        challengeInfo.data.challenge.text
      );
      /* authenticate the user */
      const authData = await client.mutate({
        mutation: authenticate,
        variables: {
          address,
          signature,
        },
      });
      /* if user authentication is successful, you will receive an accessToken and refreshToken */
      const {
        data: {
          authenticate: { accessToken },
        },
      } = authData;
      console.log({ accessToken });
      window.localStorage.setItem("lens-auth-token", accessToken);
      setToken(accessToken);

      const profileQuery = await client.query({
        query: getDefaultProfile,
        variables: { address },
      });

      const {
        data: {
          defaultProfile: { picture, name, bio, stats, id },
        },
      } = profileQuery;

      setLensID(id);
      setLensName(name);
      setLensStats(stats);
      setLensBio(bio);
      setLensPicture(picture.original.url);
    } catch (err) {
      console.log("Error signing in: ", err);

      const dummy_id = '123';
      const dummy_name = 'lens-anonymous-user';
      const dummy_stats = {
        totalFollowing: 40,
      };
      const dummy_bio = 'cat person...';
      const dummy_picture = 'n/a'

      setLensID(dummy_id);
      setLensName(dummy_name);
      setLensStats(dummy_stats);
      setLensBio(dummy_bio);
      setLensPicture(dummy_picture);
    }
  }

  async function getissuerDID() {
    try {
      // const identityPayload = {
      //   didMetadata: {
      //     method: "polygonid",
      //     blockchain: "polygon",
      //     network: "mumbai",
      //   },
      // };

      // const identityRequest = await createIdentity(identityPayload);
      // const { identifier } = identityRequest.data;
      setIssuerDID("did:polygonid:polygon:mumbai:2qG79L99uDxgaWe9ySyudEAxkv8V1EoShcbvZk5deC"); //TODO(ky): hard-coded, to refactor.
    } catch (err) {
      console.log("Error fetching profile: ", err);
    }
  }

  async function generateClaim(_userDID) {
    //TODO update the function call.
    try {
      setLoading(true);
      setStatus("Creating the VC...");
      const claim = await createClaim(
        _userDID,
        lensID,
        lensStats.totalFollowing
      );
      const id = claim.data.id; 
      const qrUrl = claim.data.qrUrl;
      
      // setStatus("Requesting Claim JSON-LD...");
      // const claimQr = await claimQrCode(_issuerDID, id);
      // const claimJSONLD = claimQr.data;
      
      // setStatus("Creating QR Code...");
      // setJsonLD(claimJSONLD);
      showQRURL(qrUrl);
      console.log('qrURL = ' + qrURL);
      setStatus('');
    } catch (err) {
      console.log("Error Generating Claim: ", err);
      setLoading(false);

      const dummy_qrURL = 'https://dummy_qrURL';
      showQRURL(dummy_qrURL);
      setStatus("");
    }
  }

  async function showQRURL(qrUrl) {
    try {
      setLoading(true)
      setStatus('Generating QR URL...')

      // const qrResponse = await generateQRCode(body)
      console.log(qrUrl);
      // const { png } = qrResponse.data

      setQrURL(qrUrl);
      console.log('setQRURL: qrURL=' + qrURL);
      setLoading(false);
      setStatus('');
    } catch (e) {
      console.log('Error Generating URL: ', e)
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Lens ID PoC</title>
      </Head>

      <Container maxW={"3xl"}>
        <Stack
          as={Box}
          textAlign={"center"}
          spacing={{ base: 8, md: 14 }}
          py={{ base: 20, md: 36 }}
        >
          <Heading
            fontWeight={600}
            fontSize={{ base: "2xl", sm: "4xl", md: "6xl" }}
            lineHeight={"110%"}
          >
            Create self-sovereign identity with{" "}
            <Text as={"span"} color={"#804AE1"}>
              Polygon ID
            </Text>{" "}
            using {" "}
            <Text as={"span"} color={"#ABFF2C"}>
              Lens
            </Text>{" "}
            Profiles
          </Heading>
          <Text color={"gray.500"} fontSize="2xl">
            Get verified KYC credential to your own wallet. If you have a Lens profile,
            go ahead and click the button below.
          </Text>
          <Stack
            direction={"column"}
            spacing={3}
            align={"center"}
            alignSelf={"center"}
            position={"relative"}
          >
            {!address && (
              <Button
                colorScheme={"green"}
                bg={"blue.400"}
                rounded={"full"}
                px={6}
                onClick={connect}
              >
                Connect Wallet
              </Button>
            )}
            {address && !token && (
              <>
                <Button
                  colorScheme={"green"}
                  bg={"#ABFF2C"}
                  rounded={"full"}
                  px={6}
                  _hover={{
                    bg: "blue.500",
                  }}
                  onClick={login}
                >
                  Login to Lens
                </Button>
                <Text color={"gray.500"}>
                  Check your Wallet after clicking this button
                </Text>
              </>
            )}

            {address && token && !issuerDID && (
              <Button
                colorScheme={"green"}
                bg={"#804AE1"}
                rounded={"full"}
                px={6}
                _hover={{
                  bg: "purple.800",
                }}
                onClick={getissuerDID}
              >
                Verify using this Lens profile
              </Button>
            )}
            <Flex gap={20}>
              {address && lensStats && token && (
                <>
                  <Center py={6}>
                    <Box
                      maxW={"500px"}
                      w={"xl"}
                      bg={"white"}
                      boxShadow={"2xl"}
                      rounded={"md"}
                      overflow={"hidden"}
                    >
                      <Heading mt={4} color={"#804AE1"} fontSize={"3xl"}>
                        Lens Profile
                      </Heading>
                      <Flex justify={"center"} mt={2}>
                        <Avatar
                          size={"xl"}
                          src={lensPicture}
                          alt={lensName}
                          css={{
                            border: "2px solid white",
                          }}
                        />
                      </Flex>

                      <Box p={6}>
                        <Stack spacing={0} align={"center"} mb={5}>
                          <Heading
                            fontSize={"2xl"}
                            fontWeight={500}
                            fontFamily={"body"}
                          >
                            {lensName}
                          </Heading>
                          <Text color={"gray.500"}>{lensBio}</Text>
                        </Stack>

                        <Stack direction={"row"} justify={"center"} spacing={6}>
                          <Stack spacing={0} align={"center"}>
                            <Text fontWeight={600}>
                              {lensStats.totalFollowers}
                            </Text>
                            <Text fontSize={"sm"} color={"gray.500"}>
                              Followers
                            </Text>
                          </Stack>
                          <Stack spacing={0} align={"center"}>
                            <Text fontWeight={600}>
                              {lensStats.totalFollowing}
                            </Text>
                            {/* <Text fontSize={"sm"} color={"gray.500"}>
                              Following
                            </Text> */}
                          </Stack>
                        </Stack>
                      </Box>
                    </Box>
                  </Center>
                </>
              )}

              {address && issuerDID && token && (
                <>
                  <Center py={6}>
                    <Box
                      maxW={"500px"}
                      w={"xl"}
                      bg={"white"}
                      boxShadow={"2xl"}
                      rounded={"md"}
                      overflow={"hidden"}
                    >
                      <Box p={6}>
                        <Heading color={"#804AE1"} fontSize={"3xl"}>
                          Polygon ID Profile
                        </Heading>
                        <Stack spacing={0} align={"center"} mb={5}>
                          <Heading
                            fontSize={"2xl"}
                            fontWeight={500}
                            fontFamily={"body"}
                            pt={4}
                          >
                            Issuer Created
                          </Heading>
                          <Text
                            pt={4}
                            wordBreak={"break-word"}
                            color={"gray.500"}
                          >
                            Issuer DID: {issuerDID}
                          </Text>
                          <Text pt={8}>
                            Enter your DID from the Polygon Wallet to Create a
                            Verifiable Credential
                          </Text>
                          <Input
                            pt={4}
                            mb={32}
                            placeholder="Enter DID"
                            onChange={(e) => setUserDID(e.target.value)}
                          />
                          <Button
                            colorScheme={"green"}
                            bg={loading ? "gray" : "#804AE1"}
                            rounded={"full"}
                            _active={loading}
                            px={6}
                            _hover={{
                              bg: "purple.800",
                            }}
                            onClick={() => generateClaim(userDID)}
                          >
                            {loading ? status : "Create Proof of VC"}
                          </Button>
                          {/* <Text pt={8}>
                            Please scan the QRCode in {qrCode} to complete the claim using your Polygon ID APP.
                          </Text> */}
                        </Stack>
                      </Box>
                    </Box>
                  </Center>
                </>
              )}
              {address && token && issuerDID && qrURL && (
                <>
                <Center py={6}>
                  <Box
                    maxW={"500px"}
                    w={"xl"}
                    bg={"white"}
                    boxShadow={"2xl"}
                    rounded={"md"}
                    overflow={"hidden"}
                  >
                    <Box p={6}>
                      <Heading color={"#804AE1"} fontSize={"3xl"}>
                        Issue Credential
                      </Heading>
                      <Stack spacing={0} align={"center"} mb={5}>
                        <Heading
                          fontSize={"2xl"}
                          fontWeight={500}
                          fontFamily={"body"}
                          pt={4}
                        >
                          Claim QRCode
                        </Heading>
                        <Text
                          pt={4}
                          wordBreak={"break-word"}
                          color={"gray.500"}
                        >
                          { qrURL }
                        </Text>
                        <Text pt={8}>
                        Please visit the link and scan the QRCode to complete the claim using your Polygon ID APP:
                        </Text>
                      </Stack>
                    </Box>
                  </Box>
                </Center>
              </>
              )}
            </Flex>
          </Stack>
        </Stack>
      </Container>
    </>
  );
}
