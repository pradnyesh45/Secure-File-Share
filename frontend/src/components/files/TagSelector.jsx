import { useState, useEffect } from "react";
import { fileApi } from "../../services/fileApi";
import PropTypes from "prop-types";

const TagSelector = ({ selectedTags, onChange }) => {
  const [tags, setTags] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      setIsLoading(true);
      const response = await fileApi.getTags();
      setTags(response.data);
    } catch (err) {
      console.error("Failed to load tags:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTagToggle = (tagId) => {
    const newSelection = selectedTags.includes(tagId)
      ? selectedTags.filter((id) => id !== tagId)
      : [...selectedTags, tagId];
    onChange(newSelection);
  };

  if (isLoading) {
    return <div>Loading tags...</div>;
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">Tags</label>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <button
            key={tag.id}
            onClick={() => handleTagToggle(tag.id)}
            className={`inline-flex items-center px-2 py-1 rounded-full text-sm ${
              selectedTags.includes(tag.id)
                ? "bg-indigo-100 text-indigo-700"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            <div
              className="w-2 h-2 rounded-full mr-1"
              style={{ backgroundColor: tag.color }}
            />
            {tag.name}
          </button>
        ))}
        {tags.length === 0 && (
          <div className="text-sm text-gray-500">No tags available</div>
        )}
      </div>
    </div>
  );
};

TagSelector.propTypes = {
  selectedTags: PropTypes.arrayOf(PropTypes.string).isRequired,
  onChange: PropTypes.func.isRequired,
};

export default TagSelector;
