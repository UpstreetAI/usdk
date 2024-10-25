import * as React from 'react';
import { MentionsInput, Mention } from 'react-mentions';
import './custom-mention-input.css';

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
      className="mentions-input bg-transparent text-sm leading-5 min-h-[60px] border-none outline-none"
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