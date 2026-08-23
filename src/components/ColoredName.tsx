import React from 'react';

interface ColoredNameProps {
  name: string;
  nameColor?: string;
  letterColors?: Record<number, string>;
  className?: string;
  fallbackColorClass?: string;
}

export default function ColoredName({
  name,
  nameColor,
  letterColors,
  className = '',
  fallbackColorClass = ''
}: ColoredNameProps) {
  if (!name) return null;

  const hasLetterColors = letterColors && Object.keys(letterColors).length > 0;

  if (!hasLetterColors) {
    return (
      <span
        style={nameColor ? { color: nameColor } : undefined}
        className={`${className} ${!nameColor ? fallbackColorClass : ''} whitespace-pre-line`}
      >
        {name}
      </span>
    );
  }

  let charIndex = 0;
  const lines = name.split('\n');

  return (
    <span className={`${className} whitespace-pre-line`}>
      {lines.map((line, lineIdx) => {
        const lineChars = line.split('');
        const lineStartIndex = charIndex;
        charIndex += line.length + 1; // account for newline character

        return (
          <React.Fragment key={lineIdx}>
            {lineChars.map((char, charOffset) => {
              const globalIndex = lineStartIndex + charOffset;
              const customColor = letterColors[globalIndex] || nameColor;

              return (
                <span
                  key={charOffset}
                  style={customColor ? { color: customColor } : undefined}
                >
                  {char}
                </span>
              );
            })}
            {lineIdx < lines.length - 1 && <br />}
          </React.Fragment>
        );
      })}
    </span>
  );
}
