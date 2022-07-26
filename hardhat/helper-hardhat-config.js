const networkConfig = {
    default: {
        name: "hardhat",
        fee: "100000000000000000",
        keyHash: "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
        jobId: "29fa9aa13bf1468788b7cc4a500a45b8",
        fundAmount: "1000000000000000000",
        keepersUpdateInterval: "30",
    },
    31337: {
        name: "localhost",
        fee: "100000000000000000",
        keyHash: "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
        jobId: "29fa9aa13bf1468788b7cc4a500a45b8",
        fundAmount: "1000000000000000000",
        keepersUpdateInterval: "30",
        ethUsdPriceFeed: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
    },
    4: {
        name: "rinkeby",
        linkToken: "0x01be23585060835e02b77ef475b0cc51aa1e0709",
        ethUsdPriceFeed: "0x8A753747A1Fa494EC906cE90E9f37563A8AF630e",
        keyHash: "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
        vrfCoordinator: "0x6168499c0cFfCaCD319c818142124B7A15E857ab",
        oracle: "0xc57b33452b4f7bb189bb5afae9cc4aba1f7a4fd8",
        jobId: "6b88e0402e5d415eb946e528b8e0c7ba",
        fee: "100000000000000000",
        fundAmount: "100000000000000000", // 0.1
        keepersUpdateInterval: "30",
    },
    137: {
        name: "polygon",
        ethUsdPriceFeed: "0xF9680D99D6C9589e2a93a78A04A279e509205945",
        oracle: "0x0a31078cd57d23bf9e8e8f1ba78356ca2090569e",
        jobId: "12b86114fa9e46bab3ca436f88e1a912",
        fee: "100000000000000",
        fundAmount: "100000000000000",
        vrfCoordinator: '0xae975071be8f8ee67addbc1a82488f1c24858067',
        keyHash: '0x6e099d640cde6de9d40ac749b4b594126b0169747122711109c9985d47751f93',
        linkToken: "0xb0897686c545045afc77cf20ec7a532e3120e0f1",
    },
}

const developmentChains = ["hardhat", "localhost"]
const VERIFICATION_BLOCK_CONFIRMATIONS = 3

module.exports = {
    networkConfig,
    developmentChains,
    VERIFICATION_BLOCK_CONFIRMATIONS,
}
