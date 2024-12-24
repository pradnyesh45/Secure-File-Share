import React, { useState } from "react";
import {
  SearchIcon,
  AdjustmentsHorizontalIcon,
} from "@heroicons/react/24/outline";
import { Popover } from "@headlessui/react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const FileSearch = ({ onSearch }) => {
  const [searchText, setSearchText] = useState("");
  const [fileTypes, setFileTypes] = useState([]);
  const [dateRange, setDateRange] = useState("");
  const [customDateRange, setCustomDateRange] = useState({
    startDate: null,
    endDate: null,
  });
  const [sizeRange, setSizeRange] = useState("");
  const [sortBy, setSortBy] = useState("-uploaded_at");

  const handleSearch = () => {
    const params = new URLSearchParams();

    if (searchText) params.append("search", searchText);
    fileTypes.forEach((type) => params.append("type", type));
    if (dateRange) params.append("date_range", dateRange);
    if (dateRange === "custom") {
      if (customDateRange.startDate) {
        params.append("start_date", customDateRange.startDate.toISOString());
      }
      if (customDateRange.endDate) {
        params.append("end_date", customDateRange.endDate.toISOString());
      }
    }
    if (sizeRange) params.append("size", sizeRange);
    params.append("sort", sortBy);

    onSearch(params);
  };

  const handleTypeToggle = (type) => {
    setFileTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  return (
    <div className="mb-6 space-y-4">
      <div className="flex space-x-4">
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search files..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            />
            <SearchIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
          </div>
        </div>

        <Popover className="relative">
          <Popover.Button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <AdjustmentsHorizontalIcon className="h-5 w-5 mr-2" />
            Filters
          </Popover.Button>

          <Popover.Panel className="absolute right-0 z-10 mt-2 w-96 bg-white rounded-lg shadow-lg p-4">
            <div className="space-y-4">
              {/* File Types */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  File Type
                </label>
                <div className="space-x-2">
                  {["document", "image", "video", "audio"].map((type) => (
                    <button
                      key={type}
                      onClick={() => handleTypeToggle(type)}
                      className={`px-3 py-1 rounded-full text-sm ${
                        fileTypes.includes(type)
                          ? "bg-indigo-100 text-indigo-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date Range
                </label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="w-full rounded-lg border-gray-300"
                >
                  <option value="">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">Last 7 Days</option>
                  <option value="month">Last 30 Days</option>
                  <option value="custom">Custom Range</option>
                </select>

                {dateRange === "custom" && (
                  <div className="mt-2 flex space-x-2">
                    <DatePicker
                      selected={customDateRange.startDate}
                      onChange={(date) =>
                        setCustomDateRange((prev) => ({
                          ...prev,
                          startDate: date,
                        }))
                      }
                      placeholderText="Start Date"
                      className="w-full rounded-lg border-gray-300"
                    />
                    <DatePicker
                      selected={customDateRange.endDate}
                      onChange={(date) =>
                        setCustomDateRange((prev) => ({
                          ...prev,
                          endDate: date,
                        }))
                      }
                      placeholderText="End Date"
                      className="w-full rounded-lg border-gray-300"
                    />
                  </div>
                )}
              </div>

              {/* File Size */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  File Size
                </label>
                <select
                  value={sizeRange}
                  onChange={(e) => setSizeRange(e.target.value)}
                  className="w-full rounded-lg border-gray-300"
                >
                  <option value="">Any Size</option>
                  <option value="small">Small (&lt; 1MB)</option>
                  <option value="medium">Medium (1MB - 10MB)</option>
                  <option value="large">Large (&gt; 10MB)</option>
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full rounded-lg border-gray-300"
                >
                  <option value="-uploaded_at">Newest First</option>
                  <option value="uploaded_at">Oldest First</option>
                  <option value="name">Name (A-Z)</option>
                  <option value="-name">Name (Z-A)</option>
                  <option value="size">Size (Smallest)</option>
                  <option value="-size">Size (Largest)</option>
                </select>
              </div>

              <button
                onClick={() => {
                  handleSearch();
                  document.body.click(); // Close popover
                }}
                className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700"
              >
                Apply Filters
              </button>
            </div>
          </Popover.Panel>
        </Popover>
      </div>
    </div>
  );
};

export default FileSearch;
