import React, { useState, useEffect } from "react";

// Component to handle filter buttons
const FilterButtons = ({ filters, onFilterClick }) => {
  return (
    <div style={{ display: "flex" }}>
      {filters.map((filter) => (
        <li
          key={filter.filterName}
          style={{ marginLeft: "3px", listStyle: "none" }}
        >
          <button
            style={{
              background: filter.active ? "white" : "black",
              color: filter.active ? "black" : "white",
              padding: "5px",
            }}
            onClick={() => onFilterClick(filter.filterName)}
          >
            {filter.filterName.toUpperCase()}
          </button>
        </li>
      ))}
    </div>
  );
};

// Component for price filter inputs
const PriceFilter = ({
  minprice,
  maxprice,
  onMinPriceChange,
  onMaxPriceChange,
  onToggleFilter,
}) => {
  return (
    <div>
      <input
        value={minprice}
        onChange={(e) => onMinPriceChange(e.target.value)}
        placeholder="Min value"
      />
      <input
        value={maxprice}
        onChange={(e) => onMaxPriceChange(e.target.value)}
        placeholder="Max value"
      />
      <button onClick={onToggleFilter}>Filter price</button>
    </div>
  );
};

// Component to display active filters
const ActiveFilters = ({ activeFilters }) => {
  return (
    <div style={{ marginTop: "5px", display: "flex" }}>
      {activeFilters.map((filter) => (
        <div key={filter.filterName}>
          <button
            style={{
              background: "gray",
              color: "white",
              padding: "5px",
              marginLeft: "3px",
            }}
          >
            <span style={{ marginRight: "5px" }}>❌</span>
            {filter.filterName}
          </button>
        </div>
      ))}
    </div>
  );
};

// Component to display products
const ProductList = ({ products }) => {
  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        flexWrap: "wrap",
        justifyContent: "space-evenly",
      }}
    >
      {products.map((product) => (
        <div
          key={product.id}
          style={{ display: "flex", flexDirection: "column", width: "19%" }}
        >
          <img
            src={product.images[0]}
            alt="product"
            style={{ height: "300px" }}
          />
          <h3>Price: {product.price}</h3>
        </div>
      ))}
    </div>
  );
};

// Main App component
function App() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filters, setFilters] = useState([]);
  const [activeFilters, setActiveFilters] = useState([]);

  const [minprice, setMinPrice] = useState(0);
  const [maxprice, setMaxPrice] = useState(10000);
  const [filterEnable, setFilterEnable] = useState(false);

  useEffect(() => {
    let controller = new AbortController();
    const fetchFn = async () => {
      try {
        const response = await fetch(
          "https://api.escuelajs.co/api/v1/products",
          { signal: controller.signal }
        );
        const jsonRes = await response.json();
        if (!response.ok) throw new Error("Data fetching failed...");
       controller=null;
        setData(jsonRes);
        setFilteredData(jsonRes);
      } catch (err) {
        console.error(err);
      }
    };

    fetchFn();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const uniqueCategories = [
      ...new Set(data.map((item) => item.category.name)),
    ];
    setFilters(
      uniqueCategories.map((category) => ({
        filterName: category,
        active: false,
      }))
    );
  }, [data]);

  useEffect(() => {
    setActiveFilters(filters.filter((filter) => filter.active));
  }, [filters]);

  useEffect(() => {
    let updatedData = data;
    if (activeFilters.length > 0) {
      updatedData = data.filter((item) =>
        activeFilters.some((filter) => filter.filterName === item.category.name)
      );
    }

    if (filterEnable) {
      updatedData = updatedData.filter(
        (item) => item.price >= minprice && item.price <= maxprice
      );
    }

    setFilteredData(updatedData);
  }, [activeFilters, filterEnable, minprice, maxprice, data]);

  const handleFilterClick = (filterName) => {
    setFilters((prevFilters) =>
      prevFilters.map((filter) =>
        filter.filterName === filterName
          ? { ...filter, active: !filter.active }
          : filter
      )
    );
  };

  return (
    <div>
      <div style={{ margin: "20px 0px", marginLeft: "20px" }}>
        <FilterButtons filters={filters} onFilterClick={handleFilterClick} />
        <PriceFilter
          minprice={minprice}
          maxprice={maxprice}
          onMinPriceChange={setMinPrice}
          onMaxPriceChange={setMaxPrice}
          onToggleFilter={() => setFilterEnable((prev) => !prev)}
        />
        <ActiveFilters activeFilters={activeFilters} />
      </div>
      <ProductList products={filteredData} />
    </div>
  );
}

export default App;
