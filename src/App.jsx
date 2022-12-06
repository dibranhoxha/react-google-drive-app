import { useState } from "react";
import reactLogo from "./assets/react.svg";
import "./App.css";
import SelectSource from "./components/SelectSource";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="App">
      <SelectSource />
    </div>
  );
}

export default App;
