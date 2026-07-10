import { useState } from "react";

const SearchComponent = ({
  data,
  searchFields,
  renderResults,
  placeholder = "Search...",
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredData = data.filter((item) => {
    return searchFields.some((field) => {
      const fieldValue = item[field]?.toString().toLowerCase() || "";
      return fieldValue.includes(searchTerm.toLowerCase());
    });
  });

  return (
    <div className="w-full">
      <div className="mb-4">
        <input
          type="text"
          placeholder={placeholder}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {renderResults(filteredData)}
    </div>
  );
};

export default SearchComponent;
