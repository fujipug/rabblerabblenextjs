import { truncateAddress, fetchNames } from "../utils/hooks";
import { useEffect, useState } from "react";

export default function RenderName({ address, isWinner, classData }: any) {
  const [display, setDisplay] = useState(null) as any;
  const [isAvvy, setIsAvvy] = useState(false);

  useEffect(() => {
    if (address) {
      setDisplay(truncateAddress(address));
      fetchNames(address, isAvvy).then((names: any) => {
        if (names[1]) {
          setDisplay(names[1]);
          setIsAvvy(true);
        } else {
          setDisplay(names[0]);
          setIsAvvy(true);
        }
      });
    }
  }, [address, isAvvy]);
  return (
    <div className={classData}>
      {display}
    </div>
  );
} 