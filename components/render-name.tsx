import { truncateAddress, avvyAddress } from "../utils/hooks";
import { useEffect, useState } from "react";
import {
  getNetwork,
} from "@wagmi/core";

export default function RenderName({ address, isWinner, classData }: any) {
  const [display, setDisplay] = useState(null) as any;
  const [isAvvy, setIsAvvy] = useState(false);
  const network = getNetwork();


  useEffect(() => {
    if (address) {
      setDisplay(truncateAddress(address));
      if (network.chain?.id === 43114) {
        try {
          avvyAddress(address, setIsAvvy).then((res: any) => {
            if (res) {
              console.log(res);
              setDisplay(res);
              setIsAvvy(true);
            }
          });
        } catch (e) {
          console.log(e);
        }
      }
    }
  }, [address, isAvvy]);
  return (
    <div className={classData}>
      {display}
    </div>
  );
} 