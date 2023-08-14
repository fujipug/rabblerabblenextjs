export default function SoundBoard({ onValueChange }: any) {
  const soundHandler = (battleCry: any) => {
    const audio = battleCry;
    const audioElement = new Audio(battleCry);
    audioElement.play();
    onValueChange(audio); // Call the callback function with the new value
  };
  return (
    <div className="dropdown dropdown-top dropdown-end">
      <label tabIndex={0} className="btn btn-accent">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
        </svg>
        Add Battle Cry
      </label>
      <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
        <li><a onClick={() => soundHandler('/audio/fbi-open-the-door.mp3')}>FBI Open Up</a></li>
        <li><a onClick={() => soundHandler('/audio/original-sheesh.mp3')}>Sheesh</a></li>
        <li><a onClick={() => soundHandler('/audio/call-an-ambulance.mp3')}>Call An Ambulance</a></li>
        <li><a onClick={() => soundHandler('/audio/x-files-theme.mp3')}>X-files Theme</a></li>
        <li><a onClick={() => soundHandler('/audio/gta.mp3')}>GTA</a></li>
        <li><a onClick={() => soundHandler('/audio/onii-chan.mp3')}>Onni Chan</a></li>
        <li><a onClick={() => soundHandler('/audio/augh.mp3')}>Augh</a></li>
        <li><a onClick={() => soundHandler('/audio/amongus.mp3')}>Amongus Sus</a></li>
        <li><a onClick={() => soundHandler('/audio/bruh.mp3')}>Bruh</a></li>
        <li><a onClick={() => soundHandler('/audio/vine-boom.mp3')}>Vine Boom</a></li>
      </ul>
    </div>
  );
} 