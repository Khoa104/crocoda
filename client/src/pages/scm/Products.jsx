//src/pages/scm/ProductsList.jsx

import React, { useEffect, useState } from "react";
import axios from "axios";

const Products = () => {

  const [products, setProducts] = useState([]);
  useEffect(() => {
    const fetchProducts = async () => {
      const response = await axios.get("http://localhost:3000/products", { withCredentials: true });
      setProducts(response.data);
    };
    fetchProducts();
  }, []);

  return (
    <div className="container">
      <h2>Products</h2>
      <ul>
        {products.map((product, index) => (
          <li key={index}>{product.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default Products;
