// pages/scm/PODetail.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Outlet, useNavigate, useLocation } from 'react-router-dom';

const PODetail = ({ poId, onCloseSelf, onSupportedViewTypesChange }) => {
  const [poData, setPoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate()
  useEffect(() => {
    onSupportedViewTypesChange([]);
  }, [onSupportedViewTypesChange])
  
  // Logic để fetch dữ liệu đơn hàng dựa trên poid
  const purchaseOrder = {
    id: poId,
    name: `PO-${poId}`,
    status: 'Confirmed',
    products: [
      { id: 32, name: 'Product A', qty: 10 },
      { id: 33, name: 'Product B', qty: 5 },
    ],
    // ...
  };

  const handleOpenProductDetail = (productId) => {
    // Điều hướng đến chi tiết sản phẩm, xếp chồng lên đơn hàng hiện tại
    // Giữ nguyên các path segments hiện có và thêm path mới
    navigate(`${location.pathname}/product.id/${productId}`);
  };

  // Logic để quay lại (đóng lớp hiện tại)
  const handleClose = () => {
    // Để đóng lớp hiện tại và quay lại lớp trước đó trong stack
    // Bạn cần parse URL và loại bỏ phân đoạn cuối cùng
    const segments = location.pathname.split('/').filter(Boolean);
    segments.pop(); // Loại bỏ phần ID của PO
    if (segments[segments.length - 1] && segments[segments.length - 1].startsWith('product.product')) {
      segments.pop(); // Loại bỏ cả 'product.product' nếu có
    }
    const previousPath = '/' + segments.join('/');
    navigate(previousPath || '/'); // Hoặc về trang chủ nếu không còn lớp nào
  };

  return (
    <div className='container'>
      <h2>Purchase Order Detail: {purchaseOrder.name}</h2>
      <p>ID: {purchaseOrder.id}</p>
      <p>Status: {purchaseOrder.status}</p>
      <h3>Products:</h3>
      <ul>
        {purchaseOrder.products.map(product => (
          <li key={product.id}>
            {product.name} (Qty: {product.qty})
            <button onClick={() => handleOpenProductDetail(product.id)} >
              View Product
            </button>
          </li>
        ))}
      </ul>
      <button onClick={() => navigate(-1)}>Go Back (React Router)</button> {/* Cách đơn giản hơn */}
      <button onClick={handleClose} >Close this PO (Custom Logic)</button>

      {/* Đây là nơi các route con sẽ được render (ví dụ: ProductDetail) */}
      <Outlet />
    </div>
  );
};

export default PODetail;