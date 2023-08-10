import { Timestamp } from "firebase/firestore";
import { useEffect, useState } from "react";

export default function Countdown(props: { endTime: Timestamp, size: string }) {
  const [countdownTimeRemaining, setCountdownTimeRemaining] = useState({ hours: 0, minutes: 0, seconds: 0 });
  let countdownHours = countdownTimeRemaining.hours;
  let countdownMinutes = countdownTimeRemaining.minutes;
  let countdownSeconds = countdownTimeRemaining.seconds;

  interface CustomStyle extends React.CSSProperties {
    '--value'?: number | string;
  }

  const customHours: CustomStyle = { '--value': countdownHours };
  const customMinutes: CustomStyle = { '--value': countdownMinutes };
  const customSeconds: CustomStyle = { '--value': countdownSeconds };

  useEffect(() => {
    const expiration = props.endTime?.seconds;
    const now = Timestamp.now().seconds;
    const timeRemaining = expiration - now;
    const hours = Math.floor(timeRemaining / 3600);
    const minutes = Math.floor((timeRemaining % 3600) / 60);
    const seconds = Math.floor((timeRemaining % 3600) % 60);
    setCountdownTimeRemaining({ hours, minutes, seconds });

  }, [props.endTime]);

  useEffect(() => {
    const countdown = setInterval(() => {
      if (countdownSeconds > 0) {
        countdownSeconds--;
        document.getElementById('seconds')?.style.setProperty('--value', countdownSeconds.toString());
      } else {
        countdownSeconds = 59;
        if (countdownMinutes > 0) {
          countdownMinutes--;
          document.getElementById('minutes')?.style.setProperty('--value', countdownMinutes.toString());
        } else {
          countdownMinutes = 59;
          if (countdownHours > 0) {
            countdownHours--;
            document.getElementById('hours')?.style.setProperty('--value', countdownHours.toString());
          } else {
            countdownHours = 0;
            countdownMinutes = 0;
            countdownSeconds = 0;
          }
        }
      }
    }, 1000);

    return () => clearInterval(countdown);
  }, [countdownTimeRemaining]);

  return (
    <>
      {props.size === 'large' &&
        <div className="flex justify-between items-center mb-4">
          <div className='grid grid-flow-col gap-5 text-center auto-cols-max'>
            <div className='flex flex-col'>
              <span className='countdown font-mono text-4xl'>
                <span id="hours" style={customHours}></span>
              </span>
              hours
            </div>
            <div className='flex flex-col'>
              <span className='countdown font-mono text-4xl'>
                <span id="minutes" style={customMinutes}></span>
              </span>
              min
            </div>
            <div className='flex flex-col'>
              <span className='countdown font-mono text-4xl'>
                <span id="seconds" style={customSeconds}></span>
              </span>
              sec
            </div>
          </div>
        </div>
      }
      {props.size === 'medium' &&
        <span className="countdown font-mono text-xl">
          <span id="hours" style={customHours}></span>h
          <span id="minutes" style={customMinutes}></span>m
          <span id="seconds" style={customSeconds}></span>s
        </span>
      }
      {props.size === 'small' &&
        <span className="countdown">
          <span style={customHours}></span> h
          <span style={customMinutes}></span> m
          {/* <span style={customSeconds}></span>s */}
        </span>
      }
    </>
  )
}

