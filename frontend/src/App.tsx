import React from 'react';
import MidiAnalyzer from './components/MidiAnalyzer';

const App: React.FC = () => {
  return (
    <div className="App">
      <h1>SmartScore Analyzer</h1>
      <MidiAnalyzer />
    </div>
  );
};

export default App;