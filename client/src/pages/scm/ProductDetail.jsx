// src/pages/scm/ProductDetail.jsx
import React, {useEffect} from 'react';
import { useParams } from 'react-router-dom'; // Sử dụng nếu bạn dùng React Router

function ProductDetail ({ productId}) {
  console.log(productId);

  // Giả lập dữ liệu sản phẩm
  const product = {
    id: productId || 'prod001', // Dùng ID từ URL hoặc mặc định
    name: 'Laptop Gaming XYZ Pro',
    sku: 'LGXYZP001',
    description: 'Laptop gaming hiệu năng cao với CPU Intel Core i9, GPU RTX 4080, RAM 32GB, SSD 1TB NVMe.',
    price: 2500,
    stock: 12,
    minStock: 5,
    status: 'active',
    createdAt: '2023-01-15',
    lastUpdated: '2024-06-20',
    transactions: [
      { id: 1, type: 'Nhập kho', date: '2024-05-01', quantity: 20, reference: 'PO-2024-001' },
      { id: 2, type: 'Xuất kho', date: '2024-05-10', quantity: -5, reference: 'SO-2024-003' },
      { id: 3, type: 'Nhập kho', date: '2024-06-01', quantity: 3, reference: 'PO-2024-008' },
    ]
  };

  if (!product) {
    return <div className="product-detail__empty-state">Không tìm thấy sản phẩm.</div>;
  }

  return (
    <div className="container">
      <h2 className="product-detail__title">Chi tiết Sản phẩm: {product.name}</h2>

      <div className="product-detail__grid-layout">
        <div className="product-detail__section">
          <h3 className="product-detail__section-title">Thông tin chung</h3>
          <div className="product-detail__info-group">
            <p><span className="product-detail__label">ID:</span> {product.id}</p>
            <p><span className="product-detail__label">SKU:</span> {product.sku}</p>
            <p><span className="product-detail__label">Mô tả:</span> {product.description}</p>
            <p><span className="product-detail__label">Giá:</span> ${product.price}</p>
            <p>
              <span className="product-detail__label">Trạng thái:</span>
              <span className={`product-detail__status-badge ${product.status === 'active' ? 'product-detail__status-badge--active' : 'product-detail__status-badge--inactive'}`}>
                {product.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
              </span>
            </p>
            <p><span className="product-detail__label">Ngày tạo:</span> {product.createdAt}</p>
            <p><span className="product-detail__label">Cập nhật cuối:</span> {product.lastUpdated}</p>
          </div>
        </div>

        <div className="product-detail__section">
          <h3 className="product-detail__section-title">Thông tin tồn kho</h3>
          <div className="product-detail__info-group">
            <p><span className="product-detail__label">Tồn kho hiện tại:</span> <span className="product-detail__stock-current">{product.stock}</span> đơn vị</p>
            <p><span className="product-detail__label">Tồn kho tối thiểu:</span> {product.minStock} đơn vị</p>
            {product.stock <= product.minStock && (
              <p className="product-detail__low-stock-alert">
                <span className="product-detail__alert-indicator"></span>
                Cần bổ sung hàng!
              </p>
            )}
          </div>

          <h3 className="product-detail__section-title product-detail__section-title--mt">Lịch sử giao dịch kho</h3>
          <div className="product-detail__table-wrapper">
            <table className="product-detail__table">
              <thead className="product-detail__table-header">
                <tr>
                  <th className="product-detail__table-th">Loại</th>
                  <th className="product-detail__table-th">Ngày</th>
                  <th className="product-detail__table-th">Số lượng</th>
                  <th className="product-detail__table-th">Tham chiếu</th>
                </tr>
              </thead>
              <tbody>
                {product.transactions.map(tx => (
                  <tr key={tx.id} className="product-detail__table-row">
                    <td className="product-detail__table-td">{tx.type}</td>
                    <td className="product-detail__table-td">{tx.date}</td>
                    <td className={`product-detail__table-td ${tx.quantity > 0 ? 'product-detail__quantity--in' : 'product-detail__quantity--out'}`}>
                      {tx.quantity}
                    </td>
                    <td className="product-detail__table-td product-detail__reference">{tx.reference}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="product-detail__actions">
        <button className="product-detail__button product-detail__button--primary">Chỉnh sửa</button>
        <button className="product-detail__button product-detail__button--danger">Xóa sản phẩm</button>
      </div>
    </div>
  );
};

export default ProductDetail;