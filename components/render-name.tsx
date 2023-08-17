import { truncateAddress, avvyAddress } from "../utils/hooks";
import { useEffect, useState } from "react";

export default function RenderName({ address, isWinner, classData }: any) {
    const [display, setDisplay] = useState(null) as any;
    const [isAvvy, setIsAvvy] = useState(false);

    useEffect(() => {
        if (address) {
            setDisplay(truncateAddress(address));
            try {
                avvyAddress(address, setIsAvvy).then((res: any) => {
                    if (res) {
                        setDisplay(res);
                        setIsAvvy(true);
                    }
                });
            } catch (e) {
                console.log(e);
            }
        }
    }, [address, isAvvy]);
    return (
        <div className={classData}>
            {display}
        </div>
    );
} 