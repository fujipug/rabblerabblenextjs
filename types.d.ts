import { Timestamp } from "firebase/firestore";

type Lobby = {
    id: string;
    collection: string;
    collectionAddress: string;
    confirmedPlayers: number;
    createdAt: Timestamp;
    endDate: Timestamp;
    evmChain: string;
    isPrivate: boolean;
    lobbyName: string;
    nfts: any[];
    raffleId: string;
    status: string;
    timeLimit: number;
    totalPlayers: number;
    winner?: string;
} & DocumentData;