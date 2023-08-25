import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import Countdown from './countdown'
import RenderName from './render-name'
import { Lobby } from '../types'
import { getLobbies, getLobbyCount, getMoreLobbies } from '../lib/lobbies'

export default function LobbiesTable() {
  const [lobbies, setLobbies] = useState([]) as Lobby[];
  const [lobbyCount, setLobbyCount] = useState(0);
  const [showMoreButton, setShowMoreButton] = useState(false);

  // Get Lobbies
  useEffect(() => {
    const unsubscribe = getLobbies(setLobbies);
    return () => {
      unsubscribe(); // Clean up the listener when the component unmounts
    };
  }, []);

  // Get Lobby Count
  useEffect(() => {
    async function fetchLobbyCount() {
      const count = await getLobbyCount();
      setLobbyCount(count);
    }

    fetchLobbyCount();
  }, []);

  // Show More Button
  useEffect(() => {
    (lobbies?.length) === lobbyCount ? setShowMoreButton(false) : setShowMoreButton(true);
  }, [lobbies?.length, lobbyCount]);

  const fetchMoreLobbies = async () => {
    const moreLobbies = await getMoreLobbies();
    const fetchedLobbies = setLobbies([...lobbies, ...moreLobbies]);
    (fetchedLobbies?.length) < lobbyCount ? setShowMoreButton(true) : setShowMoreButton(false);
  };

  return (
    <>
      {lobbies?.length > 0 &&
        <div>
          <table className="table bg-base-100">
            <thead>
              <tr>
                <th>Lobby</th>
                <th>Type</th>
                <th>Status</th>
                <th>Collection</th>
                <th>Time Remaining</th>
                <th>Players</th>
                <th>Winner</th>
              </tr>
            </thead>
            <tbody>
              {lobbies?.length > 0 && lobbies.map((lobby: Lobby, index: number) => (
                <tr key={index}>
                  <th className="cursor-pointer hover:underline">
                    <Link href={`/lobby-details/${lobby.id}`} className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                      {lobby.lobbyName ? lobby.lobbyName : lobby.id}
                    </Link>
                  </th>
                  {lobby.isPrivate ?
                    <td>Private</td>
                    :
                    <td>Public</td>
                  }
                  <td>
                    {lobby.status === 'Expired' &&
                      <span className="inline-flex items-center rounded-full bg-rose-50 px-2 py-1 text-xs font-medium text-rose-700 ring-1 ring-inset ring-rose-600/10">
                        {lobby.status}
                      </span>
                    }
                    {lobby.status === 'Active' &&
                      <span className="inline-flex items-center rounded-full bg-sky-50 px-2 py-1 text-xs font-medium text-sky-700 ring-1 ring-inset ring-sky-600/10">
                        {lobby.status}
                      </span>
                    }
                    {lobby.status === 'Completed' &&
                      <span className="inline-flex items-center rounded-full bg-lime-50 px-2 py-1 text-xs font-medium text-lime-700 ring-1 ring-inset ring-lime-600/10">
                        {lobby.status}
                      </span>
                    }
                  </td>
                  <td className="truncate">{lobby.collection}</td>
                  <td>
                    {(lobby.status === 'Expired' || lobby.status === 'Completed') ?
                      <span>-</span>
                      :
                      <Countdown endTime={lobby.endDate} size={'small'} />
                    }
                  </td>
                  <td>{lobby.confirmedPlayers} of {lobby.totalPlayers}</td>
                  {lobby.status === 'Expired' &&
                    <td>N/A</td>
                  }
                  {lobby.status === 'Active' &&
                    <td>TBA</td>
                  }
                  {lobby.status === 'Completed' && lobby.winner &&
                    <td><RenderName address={lobby.winner} isWinner={true} classData="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500" /></td>
                  }
                </tr>
              ))}
            </tbody>
          </table>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center pl-2" aria-hidden="true">
              <div className="w-full border-t" />
            </div>
            <div className="relative flex justify-end">
              <span className="bg-base-100 pl-2 text-sm">
                <span className="badge badge-outline mr-2">
                  {lobbies?.length}/{lobbyCount}
                </span></span>
            </div>
          </div>

          {showMoreButton &&
            <div className="flex justify-center my-2">
              <button onClick={() => fetchMoreLobbies()} className="btn btn-outline btn-primary">Load More</button>
            </div>
          }
        </div>
      }
    </>
  )
}
