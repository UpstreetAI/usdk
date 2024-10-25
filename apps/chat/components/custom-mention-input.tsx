import * as React from 'react';
import { MentionsInput, Mention } from 'react-mentions';

const mentionsInputStyle = {
  control: {
    backgroundColor: 'transparent',
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    minHeight: '60px',
    border: 'none',
    outline: 'none',
  },
  input: {
    margin: 0,
    padding: '1.3rem 1rem',
    overflow: 'auto',
    height: '100%',
    border: 'none',
    outline: 'none',
    '&:focus': {
      outline: 'none',
    },
  },
  highlighter: {
    padding: '1.3rem 1rem',
    boxSizing: 'border-box' as const,
    height: '100%',
    overflow: 'hidden',
  },
  suggestions: {
    list: {
      backgroundColor: 'white',
      border: '1px solid rgba(0,0,0,0.15)',
      fontSize: 14,
    },
    item: {
      padding: '5px 15px',
      borderBottom: '1px solid rgba(0,0,0,0.15)',
      '&focused': {
        backgroundColor: '#e0e4ef',
      },
    },
  },
};

const renderCustomSuggestion = (entry: any, search: string, highlightedDisplay: React.ReactNode, index: number, focused: boolean) => (
  <div
    className={`flex items-center p-2 cursor-pointer ${
      focused ? 'bg-blue-100' : 'bg-white'
    }`}
  >
    <img
      src={entry.spec.previewUrl}
      alt={entry.previewUrl}
      className="w-8 h-8 rounded-full mr-3"
    />
    <div className="flex flex-col">
      <span className="font-semibold">{highlightedDisplay}</span>
      {entry.spec.description && (
        <span className="text-xs text-gray-400">{entry.spec.description}</span>
      )}
    </div>
  </div>
);

interface CustomMentionsInputProps {
  value: string;
  onChange: (e: any) => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) => void;
  placeholder: string;
  disabled: boolean;
  inputRef: React.RefObject<HTMLTextAreaElement>;
  members: { id: string; display: string; spec: any }[];
}

const CustomMentionsInput: React.FC<CustomMentionsInputProps> = ({
  value,
  onChange,
  onKeyDown,
  placeholder,
  disabled,
  inputRef,
  members,
}) => {
  return (
    <MentionsInput
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      style={mentionsInputStyle}
      placeholder={placeholder}
      spellCheck={false}
      autoComplete="off"
      autoCorrect="off"
      disabled={disabled}
      inputRef={inputRef}
      forceSuggestionsAboveCursor={true}
      allowSuggestionsAboveCursor={true}
    >
      <Mention
        trigger="@"
        data={members}
        renderSuggestion={renderCustomSuggestion}
        style={{
          backgroundColor: '#e0e4ef',
          color: 'transparent',
        }}
        appendSpaceOnAdd={true}
        displayTransform={(id: any, display: any) => `@${display}`}
      />
    </MentionsInput>
  );
};

export default CustomMentionsInput;