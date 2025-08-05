import React, { useState, useRef, useEffect } from "react";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import "./MultiDropdown.scss";

export interface DropdownOption {
  id: string;
  label: string;
  emoji?: string;
}

export interface MultiDropdownProps {
  options: DropdownOption[];
  selectedOptions: DropdownOption[];
  onSelectionChange: (selectedOptions: DropdownOption[]) => void;
  onOptionsChange?: (options: DropdownOption[]) => void;
  onDeleteOption?: (optionId: string) => void;
  placeholder?: string;
  allowAddNew?: boolean;
  allowDelete?: boolean;
  className?: string;
}

const MultiDropdown: React.FC<MultiDropdownProps> = ({
  options,
  selectedOptions,
  onSelectionChange,
  onOptionsChange,
  onDeleteOption,
  placeholder = "Select options...",
  allowAddNew = true,
  allowDelete = true,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [availableOptions, setAvailableOptions] =
    useState<DropdownOption[]>(options);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [editingEmojiId, setEditingEmojiId] = useState<string | null>(null);
  const [newItemEmoji, setNewItemEmoji] = useState("✨");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setAvailableOptions(options);
  }, [options]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        showEmojiPicker &&
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(target)
      ) {
        setShowEmojiPicker(false);
        setEditingEmojiId(null);
        return;
      }

      if (
        isOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
      ) {
        setIsOpen(false);
        setInputValue("");
      }
    };

    if (isOpen || showEmojiPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, showEmojiPicker]);

  useEffect(() => {
    setAvailableOptions(options);
  }, [options]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (showEmojiPicker) {
          setShowEmojiPicker(false);
          setEditingEmojiId(null);
        } else if (isOpen) {
          setIsOpen(false);
          setInputValue("");
        }
      }
    };

    if (isOpen || showEmojiPicker) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, showEmojiPicker]);

  const handleToggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  };

  const handleOptionClick = (option: DropdownOption) => {
    const isSelected = selectedOptions.some(
      (selected) => selected.id === option.id
    );

    if (isSelected) {
      const newSelection = selectedOptions.filter(
        (selected) => selected.id !== option.id
      );
      onSelectionChange(newSelection);
    } else {
      const newSelection = [...selectedOptions, option];
      onSelectionChange(newSelection);
    }
  };

  const handleDeleteOption = (optionId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    const newAvailableOptions = availableOptions.filter(
      (option) => option.id !== optionId
    );
    setAvailableOptions(newAvailableOptions);

    const newSelectedOptions = selectedOptions.filter(
      (option) => option.id !== optionId
    );
    onSelectionChange(newSelectedOptions);

    if (onDeleteOption) {
      onDeleteOption(optionId);
    }
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    if (editingEmojiId) {
      const updatedOptions = availableOptions.map((option) =>
        option.id === editingEmojiId
          ? { ...option, emoji: emojiData.emoji }
          : option
      );
      setAvailableOptions(updatedOptions);

      const updatedSelectedOptions = selectedOptions.map((option) =>
        option.id === editingEmojiId
          ? { ...option, emoji: emojiData.emoji }
          : option
      );
      onSelectionChange(updatedSelectedOptions);

      setEditingEmojiId(null);
    } else {
      setNewItemEmoji(emojiData.emoji);
    }
    setShowEmojiPicker(false);
  };

  const handleEmojiButtonClick = (optionId?: string) => {
    if (optionId) {
      setEditingEmojiId(optionId);
    } else {
      setEditingEmojiId(null);
    }
    setShowEmojiPicker(!showEmojiPicker);
  };

  const suggestEmojiForText = (text: string): string => {
    const lowerText = text.toLowerCase();
    const emojiMap: { [key: string]: string } = {
      education: "🎓",
      book: "📖",
      learn: "🧠",
      science: "🧪",
      lab: "🥽",
      tech: "💻",
      art: "🎨",
      music: "🎵",
      tv: "📺",
      home: "🏠",
      car: "🚗",
      plane: "✈️",
      laugh: "😂",
      yes: "✅",
      no: "❌",
      good: "👍",
      bad: "👎",
      new: "✨",
      idea: "💡",
      question: "❓",
    };

    for (const [keyword, emoji] of Object.entries(emojiMap)) {
      if (lowerText.includes(keyword)) {
        return emoji;
      }
    }

    return "✨";
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim() && allowAddNew) {
      e.preventDefault();
      const existingOption = availableOptions.find(
        (option) =>
          option.label.toLowerCase() === inputValue.trim().toLowerCase()
      );

      if (!existingOption) {
        const newOption: DropdownOption = {
          id: `custom-${Date.now()}`,
          label: inputValue.trim(),
          emoji: newItemEmoji,
        };

        const newAvailableOptions = [newOption, ...availableOptions];
        setAvailableOptions(newAvailableOptions);

        if (onOptionsChange) {
          onOptionsChange(newAvailableOptions);
        }

        const newSelection = [...selectedOptions, newOption];
        onSelectionChange(newSelection);

        setNewItemEmoji("✨");
      } else if (
        !selectedOptions.some((selected) => selected.id === existingOption.id)
      ) {
        const newSelection = [...selectedOptions, existingOption];
        onSelectionChange(newSelection);
      }

      setInputValue("");
    }
  };

  const getDisplayText = () => {
    if (selectedOptions.length === 0) {
      return placeholder;
    }

    if (selectedOptions.length === 1) {
      return selectedOptions[0].label;
    }

    return `${selectedOptions.length} items selected`;
  };

  const filteredOptions = availableOptions.filter((option) =>
    option.label.toLowerCase().includes(inputValue.toLowerCase())
  );

  return (
    <div className={`multi-dropdown ${className}`} ref={dropdownRef}>
      <div
        className={`multi-dropdown__trigger ${
          isOpen ? "multi-dropdown__trigger--open" : ""
        }`}
        onClick={handleToggleDropdown}
      >
        <span className="multi-dropdown__display-text">{getDisplayText()}</span>
        <span
          className={`multi-dropdown__arrow ${
            isOpen ? "multi-dropdown__arrow--up" : ""
          }`}
        >
          ▼
        </span>
      </div>

      {isOpen && (
        <div className="multi-dropdown__content">
          {allowAddNew && (
            <div className="multi-dropdown__input-container">
              <button
                className="multi-dropdown__emoji-btn"
                onClick={() => handleEmojiButtonClick()}
                title="Select emoji for new item"
                type="button"
              >
                {newItemEmoji}
              </button>
              <input
                ref={inputRef}
                type="text"
                className="multi-dropdown__input"
                value={inputValue}
                onChange={(e) => {
                  const value = e.target.value;
                  setInputValue(value);
                  if (value.trim()) {
                    const suggestedEmoji = suggestEmojiForText(value);
                    setNewItemEmoji(suggestedEmoji);
                  }
                }}
                onKeyDown={handleInputKeyDown}
                placeholder="Type to add new item..."
              />
            </div>
          )}

          <div className="multi-dropdown__options">
            {filteredOptions.map((option) => {
              const isSelected = selectedOptions.some(
                (selected) => selected.id === option.id
              );

              return (
                <div
                  key={option.id}
                  className={`multi-dropdown__option ${
                    isSelected ? "multi-dropdown__option--selected" : ""
                  }`}
                  onClick={() => handleOptionClick(option)}
                >
                  <span className="multi-dropdown__option-text">
                    {option.label}{" "}
                    {option.emoji && (
                      <button
                        className="multi-dropdown__emoji multi-dropdown__emoji--clickable"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEmojiButtonClick(option.id);
                        }}
                        title="Click to change emoji"
                        type="button"
                      >
                        {option.emoji}
                      </button>
                    )}
                  </span>
                  <div className="multi-dropdown__option-actions">
                    {isSelected && (
                      <span className="multi-dropdown__checkmark">✓</span>
                    )}
                    {allowDelete && (
                      <button
                        className="multi-dropdown__delete-btn"
                        onClick={(e) => handleDeleteOption(option.id, e)}
                        title="Delete this option"
                        type="button"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {filteredOptions.length === 0 && inputValue && (
              <div className="multi-dropdown__no-options">
                {allowAddNew
                  ? `Press Enter to add "${inputValue}"`
                  : "No options found"}
              </div>
            )}
          </div>
        </div>
      )}

      {showEmojiPicker && (
        <div className="multi-dropdown__emoji-picker-overlay">
          <div ref={emojiPickerRef} className="multi-dropdown__emoji-picker">
            <EmojiPicker
              onEmojiClick={handleEmojiClick}
              width={300}
              height={400}
              searchDisabled={false}
              skinTonesDisabled={true}
              previewConfig={{
                showPreview: false,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiDropdown;
