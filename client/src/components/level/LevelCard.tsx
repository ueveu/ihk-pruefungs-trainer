// Assuming this is part of a larger React component
const LevelComponent = ({ levelNumber, previousLevelProgress }) => {
  const isLocked = previousLevelProgress?.completed !== true && levelNumber > 1;

  return (
    <div>
      {/* ... other level component JSX ... */}
      <button disabled={isLocked}>
        {isLocked ? "Locked" : "Start Level"}
      </button>
    </div>
  );
};

//Example usage within a larger component
const Levels = ({ levelsData, progress }) => {
  return(
    <div>
      {levelsData.map((level, index) => (
        <LevelComponent key={index} levelNumber={index + 1} previousLevelProgress={progress[index]} />
      ))}
    </div>
  )
}