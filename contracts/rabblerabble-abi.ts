export const rabbleRabbleAbi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_multisig",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "_fee",
        type: "uint256"
      },
      {
        internalType: "address",
        name: "_vrfCoordinatorV2",
        type: "address"
      },
      {
        internalType: "bytes32",
        name: "_keyHash",
        type: "bytes32"
      },
      {
        internalType: "uint64",
        name: "subscriptionId",
        type: "uint64"
      },
      {
        internalType: "uint32",
        name: "_callbackGasLimit",
        type: "uint32"
      }
    ],
    stateMutability: "nonpayable",
    type: "constructor"
  },
  {
    inputs: [],
    name: "AlreadyInRaffle",
    type: "error"
  },
  {
    inputs: [],
    name: "NotEnoughFunds",
    type: "error"
  },
  {
    inputs: [],
    name: "NotOwnerOf",
    type: "error"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "have",
        type: "address"
      },
      {
        internalType: "address",
        name: "want",
        type: "address"
      }
    ],
    name: "OnlyCoordinatorCanFulfill",
    type: "error"
  },
  {
    inputs: [],
    name: "RaffleFull",
    type: "error"
  },
  {
    inputs: [],
    name: "RaffleNotActive",
    type: "error"
  },
  {
    inputs: [],
    name: "RequestNotFound",
    type: "error"
  },
  {
    inputs: [],
    name: "UnableToJoin",
    type: "error"
  },
  {
    inputs: [],
    name: "UnableToRefund",
    type: "error"
  },
  {
    "anonymous": false,
    inputs: [
      {
        "indexed": true,
        internalType: "address",
        name: "previousOwner",
        type: "address"
      },
      {
        "indexed": true,
        internalType: "address",
        name: "newOwner",
        type: "address"
      }
    ],
    name: "OwnershipTransferred",
    type: "event"
  },
  {
    "anonymous": false,
    inputs: [
      {
        "indexed": true,
        internalType: "uint256",
        name: "raffleId",
        type: "uint256"
      },
      {
        "indexed": true,
        internalType: "bytes32",
        name: "requestId",
        type: "bytes32"
      }
    ],
    name: "RaffleRequest",
    type: "event"
  },
  {
    "anonymous": false,
    inputs: [
      {
        "indexed": true,
        internalType: "uint256",
        name: "raffleId",
        type: "uint256"
      },
      {
        "indexed": true,
        internalType: "uint256",
        name: "requestId",
        type: "uint256"
      },
      {
        "indexed": false,
        internalType: "address",
        name: "winner",
        type: "address"
      }
    ],
    name: "RaffleResult",
    type: "event"
  },
  {
    "anonymous": false,
    inputs: [
      {
        "indexed": true,
        internalType: "uint256",
        name: "requestId",
        type: "uint256"
      },
      {
        "indexed": true,
        internalType: "uint256",
        name: "randomWords",
        type: "uint256"
      }
    ],
    name: "RequestFulfilled",
    type: "event"
  },
  {
    inputs: [],
    name: "addressZero",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "callbackGasLimit",
    outputs: [
      {
        internalType: "uint32",
        name: "",
        type: "uint32"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "collectFee",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "collectableFees",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "contract IERC721",
        name: "collection",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "numberOfParticipants",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256"
      },
      {
        internalType: "address[]",
        name: "whitelist",
        type: "address[]"
      },
      {
        internalType: "uint256",
        name: "timeLimit",
        type: "uint256"
      }
    ],
    name: "createPrivateRaffle",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "contract IERC721",
        name: "collection",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "numberOfParticipants",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "timeLimit",
        type: "uint256"
      }
    ],
    name: "createPublicRaffle",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [],
    name: "fee",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "raffleId",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256"
      }
    ],
    name: "joinRaffle",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [],
    name: "keyHash",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "linkAddress",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "multisig",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "numWords",
    outputs: [
      {
        internalType: "uint32",
        name: "",
        type: "uint32"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "raffleCounter",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      },
      {
        internalType: "address",
        name: "",
        type: "address"
      }
    ],
    name: "raffleIdToWhitelisted",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    name: "raffles",
    outputs: [
      {
        internalType: "bool",
        name: "isPublic",
        type: "bool"
      },
      {
        internalType: "contract IERC721",
        name: "collection",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "timeLimit",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "numberOfParticipants",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "fees",
        type: "uint256"
      },
      {
        internalType: "address",
        name: "winner",
        type: "address"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "requestId",
        type: "uint256"
      },
      {
        internalType: "uint256[]",
        name: "randomWords",
        type: "uint256[]"
      }
    ],
    name: "rawFulfillRandomWords",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "requestConfirmations",
    outputs: [
      {
        internalType: "uint16",
        name: "",
        type: "uint16"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    name: "requests",
    outputs: [
      {
        internalType: "uint256",
        name: "raffleId",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "randomWord",
        type: "uint256"
      },
      {
        internalType: "bool",
        name: "fulfilled",
        type: "bool"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "subscriptionId",
    outputs: [
      {
        internalType: "uint64",
        name: "",
        type: "uint64"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address"
      }
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "vrfWrapperAddress",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address"
      }
    ],
    stateMutability: "view",
    type: "function"
  }
]