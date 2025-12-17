import { WelcomeScreen } from "../chat/WelcomeScreen";

export default function WelcomeScreenExample() {
  return (
    <WelcomeScreen onJoin={(name) => console.log("Joining as:", name)} />
  );
}
