import React, { useEffect, useState, useMemo } from 'react';
import Select from 'react-select';
import '../../styles.css'; // Thêm file CSS cho trang này
import { getPOs, getVendors, getVendorItems, getSenders, getWHs } from "../../api/api";

function POManage({  }) {

  const [poList, setPoList] = useState([]);
  const [filteredPoList, setFilteredPoList] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [sender, setSender] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [vendorItems, setVendorItems] = useState([]);
  const [poItems, setPoItems] = useState([]);
  const [expandedPoId, setExpandedPoId] = useState(null);
  const [editingItemRowID, setEditingItemRowID] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' hoặc 'error'
  const [editingRowId, setEditingRowId] = useState(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');


  // --- STATE MỚI CHO PHÂN TRANG ---
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5); // Hiển thị 10 PO mỗi trang

  // --- STATE MỚI CHO SẮP XẾP ---
  const [sortConfig, setSortConfig] = useState({ key: 'po_id', direction: 'descending' }); // Mặc định sắp xếp theo PO ID mới nhất

  // --- LOGIC SẮP XẾP ---
  const sortedPoList = useMemo(() => {
    let sortableItems = [...poList]; // Tạo bản sao để không thay đổi state gốc
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // --- Xử lý đặc biệt cho các trường cần lookup tên (NẾU bạn muốn sort theo TÊN) ---
        // Ví dụ: Nếu muốn sort theo tên Vendor thay vì vendor_id
        if (sortConfig.key === 'vendor_name') { // Giả sử bạn quyết định dùng key 'vendor_name'
          aValue = vendors.find(v => v.vendor_id === a.vendor_id)?.vendor_name || '';
          bValue = vendors.find(v => v.vendor_id === b.vendor_id)?.vendor_name || '';
        }
        if (sortConfig.key === 'sender_name') { // Giả sử bạn quyết định dùng key 'vendor_name'
          aValue = sender.find(v => v.sender_id === a.sender_id)?.sender_name || '';
          bValue = sender.find(v => v.sender_id === b.sender_id)?.sender_name || '';
        }
        if (sortConfig.key === 'wh_name') { // Giả sử bạn quyết định dùng key 'vendor_name'
          aValue = warehouses.find(v => v.wh_id === a.wh_id_deli_to)?.wh_name || '';
          bValue = warehouses.find(v => v.wh_id === b.wh_id_deli_to)?.wh_name || '';
        }
        // Tương tự cho 'sender_name', 'wh_name' nếu cần
        // --- Xử lý giá trị null/undefined ---
        // Đẩy null/undefined lên đầu khi tăng dần, xuống cuối khi giảm dần
        if (aValue == null && bValue == null) return 0;
        if (aValue == null) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (bValue == null) return sortConfig.direction === 'ascending' ? 1 : -1;
        // --- Xử lý Ngày tháng ---
        if (sortConfig.key === 'created_at' || sortConfig.key === 'eta') {
          // Chuyển đổi sang timestamp để so sánh an toàn
          const dateA = aValue ? new Date(aValue).getTime() : (sortConfig.direction === 'ascending' ? -Infinity : Infinity);
          const dateB = bValue ? new Date(bValue).getTime() : (sortConfig.direction === 'ascending' ? -Infinity : Infinity);
          if (dateA < dateB) {
            return sortConfig.direction === 'ascending' ? -1 : 1;
          }
          if (dateA > dateB) {
            return sortConfig.direction === 'ascending' ? 1 : -1;
          }
          return 0;
        }
        // --- Xử lý Số (ví dụ nếu PO là số) ---
        // Thử chuyển đổi sang số nếu có thể
        const ponumA = String(aValue).toLowerCase();
        const ponumB = String(bValue).toLowerCase();
        // Nếu cả hai đều là số hợp lệ VÀ key là một trường số thực sự (như po_num nếu nó là số)
        if (!isNaN(ponumA) && !isNaN(ponumB) && sortConfig.key === 'po_num') { // Chỉ áp dụng cho các key thực sự là số
          if (ponumA < ponumB) {
            return sortConfig.direction === 'ascending' ? -1 : 1;
          }
          if (ponumA > ponumB) {
            return sortConfig.direction === 'ascending' ? 1 : -1;
          }
          return 0;
        }
        // --- Mặc định xử lý như Chuỗi (không phân biệt hoa thường) ---
        const stringA = String(aValue).toLowerCase();
        const stringB = String(bValue).toLowerCase();

        if (stringA < stringB) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (stringA > stringB) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [poList, sortConfig, vendors, sender, warehouses]);

  const getSortIndicatorClass = (name) => {
    if (!sortConfig || sortConfig.key !== name) {
      // Không sort cột này, hoặc chưa sort gì cả
      return 'sort-none'; // Class cho trạng thái không sort/mặc định
    }
    return sortConfig.direction === 'ascending' ? 'sort-asc' : 'sort-desc';
  };

  const [newPoData, setNewPoData] = useState({
    po_num: '',
    vendor_id: '',
    sender_id: '',
    created_at: new Date().toISOString().split('T')[0],
    eta: '',
    whIdDeliTo: '',
    freight_mode: '',
    storage_condition: '',
    po_status: '',
    currency: ''
  });
  const [editingPoData, setEditingPoData] = useState({
    po_num: '',
    vendor_id: '',
    sender_id: '',
    created_at: '',
    eta: '',
    whIdDeliTo: '',
    freight_mode: '',
    storage_condition: '',
    po_status: '',
    currency: ''
  });
  const vendorOptions = vendors.map(v => ({
    value: v.vendor_id,
    label: v.vendor_name,
  }));
  const whOptions = warehouses.map(v => ({
    value: v.wh_id,
    label: v.wh_name,
  }));
  const senderOptions = sender.map(v => ({
    value: v.sender_id,
    label: v.sender_name,
  }));
  useEffect(() => {
    fetchPOs();
    fetchVendors();
    fetchSender();
    fetchVendorItems();
    fetchWarehouses();
  }, []);
  useEffect(() => {
    // Thực hiện lọc bất cứ khi nào searchTerm hoặc danh sách gốc thay đổi
    const trimmedSearchTerm = searchTerm.trim().toLocaleLowerCase();
    if (!trimmedSearchTerm) {
      setFilteredPoList([...sortedPoList]);
      setCurrentPage(1);
      return;
    }
    const orGroup = trimmedSearchTerm.split(';').filter(group => group.trim().length > 0);
    const filtered = sortedPoList.filter(po => {
      const vendorName = vendors.find(v => v.vendor_id === po.vendor_id)?.vendor_name || '';
      const senderName = sender.find(s => s.sender_id === po.sender_id)?.sender_name || '';
      const whName = warehouses.find(w => w.wh_id === po.wh_id_deli_to)?.wh_name || '';
      const orderDateStr = po.created_at ? new Date(po.created_at).toLocaleDateString().toLowerCase() : '';
      const etaDateStr = po.eta ? new Date(po.eta).toLocaleDateString().toLowerCase() : '';
      const searchableText = [
        po.po_num,
        vendorName,
        senderName,
        whName,
        orderDateStr,
        etaDateStr,
        po.freight_mode,
        po.storage_condition,
        po.po_status,
        po.currency
      ]
        .map(field => String(field || '').toLocaleLowerCase())
        .join(' ');
      return orGroup.some(group => {
        const andConditions = group.split('&').map(condition => condition.trim()).filter(condition => condition.length > 0);
        return andConditions.every(condition => searchableText.includes(condition));
      });
    });
    setFilteredPoList(filtered);
    setCurrentPage(1); // Reset về trang 1 mỗi khi lọc lại
    // Dependencies bao gồm searchTerm và các danh sách dữ liệu gốc
  }, [searchTerm, sortedPoList, vendors, sender, warehouses]);

  // --- TẠO MẢNG searchWordsArray ĐỂ SỬ DỤNG TRONG JSX ---
  // Sử dụng useMemo để chỉ tính toán lại khi searchTerm thay đổi.
  const searchWordsArray = useMemo(() => {
    const trimmedSearchTerm = searchTerm.trim().toLowerCase();
    if (!trimmedSearchTerm) {
      return []; // Trả về mảng rỗng nếu searchTerm rỗng
    }
    return trimmedSearchTerm.split(/[&;]/).map(word => word.trim()).filter(word => word.length > 0);
  }, [searchTerm]); // Dependency là searchTerm

  const highlightText = (textToHighlight, searchWordsArray) => {
    if (!textToHighlight) return textToHighlight; // hoặc return '' nếu muốn chuỗi rỗng khi null
    const textAsString = String(textToHighlight);
    if (!searchWordsArray || searchWordsArray.length === 0) {
      return textAsString
    }
    const escapedWords = searchWordsArray.map(word => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')); // Escape special characters
    if (escapedWords.length === 0) return textAsString;
    const regex = new RegExp(`(${escapedWords.join('|')})`, 'gi');
    const parts = textAsString.split(regex);
    return (
      <>
        {parts.map((part, i) => {
          // Check this part if is one of searchs word
          const isMatch = escapedWords.some(
            (ew) => part.toLocaleLowerCase() === ew.toLowerCase()
          );
          return isMatch ? (
            <span key={i} className='highlight'>{part}</span>
          ) : (
            part
          );
        })}
      </>
    );
  };

  // --- TÍNH TOÁN DỮ LIỆU CHO TRANG HIỆN TẠI ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  // Sử dụng slice trên danh sách ĐÃ LỌC (filteredPoList)
  const currentPoList = useMemo(() =>
    filteredPoList.slice(indexOfFirstItem, indexOfLastItem),
    [filteredPoList, indexOfFirstItem, indexOfLastItem]
  ); // dùng useMemo nếu filteredPoList lớn

  // --- TÍNH TOÁN TỔNG SỐ TRANG ---
  const totalPages = Math.ceil(filteredPoList.length / itemsPerPage);

  // --- HÀM ĐỂ CHUYỂN TRANG ---
  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      // Optional: Cuộn lên đầu bảng khi chuyển trang
      // const tableElement = document.querySelector('.table-responsive');
      // if (tableElement) tableElement.scrollTop = 0; // Hoặc scrollIntoView
    }
  };

  // --- HÀM TẠO CÁC NÚT SỐ TRANG ---
  const renderPageNumbers = () => {
    const pageNumbers = [];
    // Hiển thị tối đa 5 nút số trang xung quanh trang hiện tại (ví dụ)
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);

    if (currentPage <= 3) {
      endPage = Math.min(totalPages, 5);
    }
    if (currentPage > totalPages - 3) {
      startPage = Math.max(1, totalPages - 4);
    }

    if (startPage > 1) {
      pageNumbers.push(<button key={1} onClick={() => handlePageChange(1)}>1</button>);
      if (startPage > 2) {
        pageNumbers.push(<span key="start-ellipsis">...</span>);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={currentPage === i ? 'active' : ''} // Thêm class active cho trang hiện tại
        >
          {i}
        </button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pageNumbers.push(<span key="end-ellipsis">...</span>);
      }
      pageNumbers.push(<button key={totalPages} onClick={() => handlePageChange(totalPages)}>{totalPages}</button>);
    }
    return pageNumbers;
  };

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 9000);
      return () => clearTimeout(timer);
    }
  }, [message]);
  const fetchVendors = async () => {
    const data = await getVendors();
    if (data) setVendors(data);
  };
  const fetchVendorItems = async () => {
    const data = await getVendorItems();
    if (data) setVendorItems(data);
  };
  const fetchPOs = async () => {
    const data = await getPOs();
    console.log(data);
    if (data) setPoList(data);
  };
  const fetchSender = async () => {
    const data = await getSenders();
    if (data) setSender(data);
  };
  const fetchWarehouses = async () => {
    const data = await getWHs();
    if (data) setWarehouses(data);
  };
  const resetnewpo = async () => {
    setNewPoData({
      po_num: '',
      vendor_id: '',
      sender_id: '',
      created_at: new Date().toISOString().split('T')[0],
      eta: '',
      whIdDeliTo: '',
      freight_mode: '',
      storage_condition: '',
      po_status: '',
      currency: ''
    })
  };
  const handleCreatePO = async () => {
    try {
      const { error } = await supabase.from('po').insert({
        po_num: newPoData.po_num,
        vendor_id: newPoData.vendor_id,
        sender_id: newPoData.sender_id,
        created_at: newPoData.created_at,
        eta: newPoData.eta,
        wh_id_deli_to: newPoData.whIdDeliTo,
        freight_mode: newPoData.freight_mode,
        storage_condition: newPoData.storage_condition,
        po_status: newPoData.po_status,
        currency: newPoData.currency
      });
      if (error) {
        setMessageType('error');
        setMessage(`Lỗi tạo PO mới: ${error.message}`);
      } else {
        setMessageType('success');
        setMessage('Tạo PO thành công!');
        setIsCreatingNew(false);
        resetnewpo();
        fetchPOs();
      }
    } catch (e) {
      setMessageType('error');
      setMessage(`Lỗi hệ thống: ${e.message}`);
    }
  };
  const handleUpdateItem = async (item) => {
    setMessage('');
    setMessageType('');
    try {
      if (!item.po_detail_id) {
        throw new Error('Không tìm thấy ID chi tiết PO để cập nhật.');
      }
      const { error } = await supabase
        .from('po_details')
        .update({
          item_id: item.item_id,
          qty: item.qty,
          unit_price: item.unit_price,
          amount: item.amount,
        })
        .eq('po_detail_id', item.po_detail_id);
      if (error) {
        throw new Error(`Error update item: ${error.message}`);
      }
      setMessage('Updated successful!');
      setMessageType('success');
      setEditingItemRowID(null); // Thoát khỏi chế độ chỉnh sửa
      // Có thể bạn muốn gọi handleViewDetails(poId) ở đây để làm mới dữ liệu
      // hoặc cập nhật trực tiếp state poItems để phản ánh thay đổi ngay lập tức.
      const updatedPoItems = poItems.map(pItem =>
        pItem.po_detail_id === item.po_detail_id ? item : pItem
      );
      setPoItems(updatedPoItems);
    } catch (error) {
      setMessage(`Error update item: ${error.message}`);
      setMessageType('error');
    }
  };
  const handleSavePoDetails = async (poId) => {
    setMessage(''); // Reset message trước khi thực hiện hành động
    setMessageType('');
    try {
      const updates = poItems
        .filter(item => item.qty !== 0)
        .map(item => {
          const { po_detail_id, ...itemData } = item;
          return {
            po_detail_id: po_detail_id,
            po_id: poId,
            ...itemData,
          };
        });
      // Lọc ra các item mới (chưa có po_detail_id) và các item cần cập nhật (đã có po_detail_id)
      const newItems = updates
        .filter(item => item.po_detail_id === null && item.item_id !== '')
        .map(item => { // Loại bỏ po_detail_id trước khi insert
          const { po_detail_id, ...rest } = item;
          return rest;
        });
      const updatedItems = updates.filter(item => item.po_detail_id !== null && item.po_detail_id === editingItemRowID);
      const promises = [];
      // Thêm các item mới
      if (newItems.length > 0) {
        const { error: insertError } = await supabase
          .from('po_details')
          .insert(newItems);
        if (insertError) {
          throw new Error(`Error add detail items: ${insertError.message}`);
        }
      }
      // Cập nhật các item đã tồn tại
      if (updatedItems.length > 0) {
        const updatePromises = updatedItems.map(item =>
          supabase
            .from('po_details')
            .update({ qty: item.qty, unit_price: item.unit_price, amount: item.amount, currency: item.currency, item_id: item.item_id })
            .eq('po_detail_id', item.po_detail_id)
        );
        const results = await Promise.all(updatePromises);
        const updateErrors = results.filter(res => res.error);
        if (updateErrors.length > 0) {
          const errorMessages = updateErrors.map(err => err.error.message).join(', ');
          throw new Error(`Error update detail items: ${errorMessages}`);
        }
      }
      if (updatedItems.length > 0 || newItems.length > 0) {
        setMessage('Saved successfull!');
        setMessageType('success');
        refreshdetails(poId);
        setExpandedPoId(poId);
        // Thoát khỏi chế độ chỉnh sửa (nếu cần)
        // Tải lại chi tiết PO để hiển thị dữ liệu mới
      } else {
        setMessage('Nothing change!');
        setMessageType('success');
      }
      setEditingItemRowID(null);
    } catch (error) {
      setMessage(`Error save detail items: ${error.message}`);
      setMessageType('error');
    }
  };

  const handleUpdate = async (poId) => {
    try {
      const { error } = await supabase
        .from('po')
        .update({
          ...editingPoData
        })
        .eq('po_id', poId);

      if (error) {
        setMessageType('error');
        setMessage(`Lỗi khi cập nhật PO: ${error.message}`);  // OK vì có error
      } else {
        setMessageType('success');
        setMessage('Cập nhật thành công!');
        setEditingRowId(null);
        fetchPOs();
      }
    } catch (e) {
      setMessageType('error');
      setMessage(`Lỗi hệ thống: ${e.message}`);  // OK vì trong catch(e)
    }
  };

  const refreshdetails = async (poId) => {
    const { data, error } = await supabase
      .from('po_details')
      .select('*')
      .eq('po_id', poId);
    if (!error) {
      setPoItems(data);
    }
  }

  const handleViewDetails = async (po_id) => {
    if (expandedPoId === po_id) {
      setExpandedPoId(null); // Đóng nếu đang mở
    } else {
      setExpandedPoId(po_id);
      // Gọi API hoặc Supabase để lấy item theo po_id
      refreshdetails(po_id)
    }
  };
  const handleDelete = async (poId) => {
    if (window.confirm('Bạn có chắc chắn muốn xoá PO này?')) {
      const { error } = await supabase.from('po_details').delete().eq('po_id', poId);
      const { error1 } = await supabase.from('po').delete().eq('po_id', poId);
      if (error || error1) {
        setMessageType('error')
        setMessage('Lỗi khi xoá PO:' + error.message);
      } else {
        setMessageType('success')
        setMessage('Xoá thành công!');
        fetchPOs();
      }
    }
  };
  const handleItemChange = (index, field, value) => {
    const updatedItems = [...poItems];
    if (field === 'item_id') {
      const selectedItem = vendorItems.find(i => i.item_id === parseInt(value));
      // Kiểm tra trùng WRIN
      const isDuplicate = poItems.some((item, i) => item.item_id === parseInt(value) && i !== index);
      if (isDuplicate) {
        alert('⚠️ Sản phẩm đã được chọn. Vui lòng chọn sản phẩm khác.');
        return;
      }

    }
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value,
      amount: field === 'qty' || field === 'unit_price'
        ? parseFloat(field === 'qty' ? value : updatedItems[index].qty) *
        parseFloat(field === 'unit_price' ? value : updatedItems[index].unit_price)
        : updatedItems[index].amount,
    };
    setPoItems(updatedItems);
  };
  const removeItemRow = (index) => {
    const updated = [...poItems];
    updated.splice(index, 1);
    setPoItems(updated);
  };

  const handleDeleteItem = async (poDetailId) => {
    setMessage('');
    setMessageType('');
    // if (!window.confirm('Bạn có chắc chắn muốn xóa item này?')) {
    //  return;
    //}
    try {
      const { error } = await supabase
        .from('po_details')
        .delete()
        .eq('po_detail_id', poDetailId);

      if (error) {
        throw new Error(`Lỗi khi xóa chi tiết PO: ${error.message}`);
      }
      // Cập nhật state poItems để loại bỏ item đã xóa
      const updatedPoItems = poItems.filter(item => item.po_detail_id !== poDetailId);
      setPoItems(updatedPoItems);
      setMessageType('success');
      setMessage('Deleted successful!');
    } catch (error) {
      setMessageType('error');
      setMessage(`Error: ${error.message}`);
    }
  };

  const loadAllItems = async (vendorId) => {
    if (!vendorId || isNaN(vendorId)) {
      alert("Please check VendorID again");
      return;
    }
    // Trước khi thêm chi tiết
    const allItemsToAdd = vendorItems
      .filter((i) => i.vendor_id === vendorId)
      .map((item) => ({
        po_detail_id: null,
        item_id: item.item_id,
        qty: 0, // Default quantity
        unit_price: item.price ?? 0, // fallback về 0 nếu price bị undefined
        currency: item.currency || 'USD',
      }));
    const newPoItems = [...poItems];
    let addedCount = 0;
    allItemsToAdd.forEach(newItem => {
      const isDuplicate = newPoItems.some(existingItem => existingItem.item_id === newItem.item_id);
      if (!isDuplicate) {
        newPoItems.push(newItem);
        addedCount++;
      }
    });
    setMessage(`Added ${addedCount} items.`);
    setPoItems(newPoItems);
  };

  const loadrecentpo = async (vendorId) => {
    if (!vendorId || isNaN(vendorId)) {
      alert("Please check VendorID again");
      return;
    }
    const { data, error } = await supabase
      .from('po')
      .select('po_id')
      .eq('vendor_id', vendorId)
      .order('po_id', { ascending: false })
      .limit(2);
    if (error) {
      alert('Can not reload the recent PO: ' + error.message);
      return;
    }
    if (data && data.length > 1) {
      const recentPO = data[1];
      const { data: poDetails, error: detailsError } = await supabase
        .from('po_details')
        .select('*')
        .eq('po_id', recentPO.po_id);

      if (detailsError) {
        alert('Can not reload the detail items: ' + detailsError.message);
        return;
      }
      if (poDetails) {
        const updatedItems = poDetails.map(detail => ({
          po_detail_id: null,
          item_id: detail.item_id,
          qty: detail.qty,
          unit_price: detail.unit_price,
          amount: detail.amount,
          currency: detail.currency,
        }));
        setPoItems(updatedItems);
        setMessageType('success');
        setMessage(`Loaded ${poDetails.length} items.`);
      }
    } else {
      alert('There is no PO from the selected vendor!');
    }
  };

  const addItemRow = () => {
    const newItem = {
      po_detail_id: null, // hoặc UUID
      item_id: '',
      qty: 0,
      unit_price: 0,
      amount: 0,
      currency: 'VND',
    };
    setPoItems([...poItems, newItem]);
    setEditingItemRowID(newItem.po_detail_id);
  };

  const renderWRIN = (id) => {
    const item = vendorItems.find(i => i.item_id === id);
    return item ? `${item.wrin} - ${item.description}` : 'N/A';
  };

  const requestSort = (key) => {
    let direction = 'ascending';
    // Nếu nhấn lại cột đang sort và đang là ascending -> chuyển thành descending
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    // Nếu nhấn cột mới hoặc cột đang descending -> chuyển thành ascending
    setSortConfig({ key, direction });
  };



  return (
    <div className="container">
      <input
        className='searchbox'
        type="text"
        placeholder="Search... Use '&' for AND ';' for OR (e.g., 'Apple & Red; Orange ')"
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
        }}
      />
      <div className='table-responsive'>
        <table className="table table-bordered" border="1" cellPadding="6">
          <thead>
            <tr>
              <th>
                <button className='btn-new' onClick={() => {
                  setIsCreatingNew(true)
                  setEditingRowId(null)
                }}>New</button>
              </th>
              <th>
                {/* Sử dụng key là tên cột trong DB */}
                <button type="button" onClick={() => requestSort('po_num')} className="sortable-header">
                  PO
                  <span className={`sort-indicator ${getSortIndicatorClass('po_num')}`}></span>
                </button>
              </th>
              <th>
                {/* Option 2: Sort theo vendor_name (cần logic trong useMemo và key 'vendor_name') */}
                <button type="button" onClick={() => requestSort('vendor_name')} className="sortable-header">
                  Vendor
                  <span className={`sort-indicator ${getSortIndicatorClass('vendor_name')}`}></span>
                </button>
              </th>
              <th>
                <button type="button" onClick={() => requestSort('sender_name')} className="sortable-header">
                  Sender
                  <span className={`sort-indicator ${getSortIndicatorClass('sender_name')}`}></span>
                </button>
              </th>
              <th>
                <button type="button" onClick={() => requestSort('created_at')} className="sortable-header">
                  Order Date
                  <span className={`sort-indicator ${getSortIndicatorClass('created_at')}`}></span>
                </button>
              </th>
              <th>
                <button type="button" onClick={() => requestSort('eta')} className="sortable-header">
                  ETA
                  <span className={`sort-indicator ${getSortIndicatorClass('eta')}`}></span>
                </button>
              </th>
              <th>
                <button type="button" onClick={() => requestSort('wh_name')} className="sortable-header">
                  WH
                  <span className={`sort-indicator ${getSortIndicatorClass('wh_name')}`}></span>
                </button>
              </th>
              <th>
                <button type="button" onClick={() => requestSort('freight_mode')} className="sortable-header">
                  Freight
                  <span className={`sort-indicator ${getSortIndicatorClass('freight_mode')}`}></span>
                </button>
              </th>
              <th>
                <button type="button" onClick={() => requestSort('storage_condition')} className="sortable-header">
                  Storage
                  <span className={`sort-indicator ${getSortIndicatorClass('storage_condition')}`}></span>
                </button>
              </th>
              <th>
                <button type="button" onClick={() => requestSort('po_status')} className="sortable-header">
                  Status
                  <span className={`sort-indicator ${getSortIndicatorClass('po_status')}`}></span>
                </button>
              </th>
              <th>
                <button type="button" onClick={() => requestSort('currency')} className="sortable-header">
                  Currency
                  <span className={`sort-indicator ${getSortIndicatorClass('currency')}`}></span>
                </button>
              </th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {isCreatingNew && (
              <tr className='new-po-row'>
                <td>
                  {isCreatingNew && (
                    <>
                      <button className='btn-save' onClick={handleCreatePO}>Save</button>
                      <button onClick={() => {
                        resetnewpo()
                        setIsCreatingNew(false)
                      }
                      }>Cancel</button>
                    </>
                  )}
                </td>
                <td>
                  <input
                    type="text"
                    placeholder="PO input"
                    value={newPoData.po_num}
                    onChange={(e) => setNewPoData({ ...newPoData, po_num: e.target.value })}
                  />
                </td>
                <td>
                  <div className='react-select-container'>
                    <Select
                      classNamePrefix="react-select"
                      options={vendorOptions}
                      value={vendorOptions.find(v => v.value === newPoData.vendor_id)}
                      onChange={(selected) =>
                        setNewPoData({ ...newPoData, vendor_id: selected.value })
                      }
                    />
                  </div>
                </td>
                <td>
                  <div className='react-select-container'>
                    <Select className='custom-select-container'
                      classNamePrefix="react-select"
                      options={senderOptions}
                      value={senderOptions.find(v => v.value === newPoData.sender_id)}
                      onChange={(selected) =>
                        setNewPoData({ ...newPoData, sender_id: selected.value })
                      }
                      isSearchable
                    />
                  </div>
                </td>
                <td>
                  <input
                    type="date"
                    value={newPoData.created_at}
                    onChange={(e) =>
                      setNewPoData({ ...newPoData, created_at: e.target.value })
                    }
                  />
                </td>
                <td>
                  <input
                    type="date"
                    value={newPoData.eta}
                    onChange={(e) => setNewPoData({ ...newPoData, eta: e.target.value })}
                  />
                </td>
                <td>
                  <div className='react-select-container'>
                    <Select className='custom-select-container'
                      classNamePrefix="react-select"
                      options={whOptions}
                      value={whOptions.find(v => v.value === newPoData.whIdDeliTo)}
                      onChange={(selected) =>
                        setNewPoData({ ...newPoData, whIdDeliTo: selected.value })
                      }
                    />
                  </div>
                </td>
                <td>
                  <select
                    value={newPoData.freight_mode}
                    onChange={(e) =>
                      setNewPoData({ ...newPoData, freight_mode: e.target.value })
                    }
                  >
                    <option value="">Select Freight Mode </option>
                    <option value="Sea Freight">Sea Freight</option>
                    <option value="Truck">Truck</option>
                  </select>
                </td>
                <td>
                  <select
                    value={newPoData.storage_condition}
                    onChange={(e) =>
                      setNewPoData({ ...newPoData, storage_condition: e.target.value })
                    }
                  >
                    <option value="">Select Storage </option>
                    <option value="Dry product">Dry product</option>
                    <option value="Frozen">Frozen</option>
                    <option value="Chill">Chill</option>
                  </select>
                </td>
                <td>
                  <select
                    value={newPoData.po_status}
                    onChange={(e) =>
                      setNewPoData({ ...newPoData, po_status: e.target.value })
                    }
                  >
                    <option value="">Select status </option>
                    <option value="0-Plan">0-Plan</option>
                    <option value="1-Process">1-Process</option>
                    <option value="2-Sent">2-Sent</option>
                  </select>
                </td>
                <td>
                  <select
                    value={newPoData.currency}
                    onChange={(e) =>
                      setNewPoData({ ...newPoData, currency: e.target.value })
                    }
                  >
                    <option value="">Select Currency </option>
                    <option value="USD">USD</option>
                    <option value="VND">VND</option>
                  </select>
                </td>
                <td> -- </td>
              </tr>
            )}
            {currentPoList.map((po) => (
              <React.Fragment key={po.po_id}>
                <tr key={"row-${po.po_id}"}
                  className={editingRowId === po.po_id ? 'editing-row' : (expandedPoId === po.po_id ? 'expandedPO-row' : "")} >
                  <td>
                    {editingRowId === po.po_id ? (
                      <>
                        <button className='btn-update' onClick={() => handleUpdate(po.po_id)}>Update</button>
                        <button className='btn-cancel' onClick={() => {
                          setEditingRowId(null)
                        }} >Cancel</button>
                      </>
                    ) : (
                      <>
                        <button className='btn-edit' onClick={() => {
                          setEditingPoData({
                            po_num: po.po_num,
                            vendor_id: po.vendor_id,
                            sender_id: po.sender_id,
                            created_at: po.created_at.split('T')[0],
                            eta: po.eta?.split('T')[0] || '',
                            wh_id_deli_to: po.wh_id_deli_to,
                            freight_mode: po.freight_mode,
                            storage_condition: po.storage_condition,
                            po_status: po.po_status,
                            currency: po.currency
                          })
                          setEditingRowId(po.po_id)
                          setIsCreatingNew(false)
                          setExpandedPoId(false)
                        }}>Edit</button>
                        <button className='btn-delete' onClick={() => {
                          handleDelete(po.po_id)
                          setIsCreatingNew(false)
                        }}>Delete</button>
                      </>
                    )}
                  </td>
                  <td>
                    {editingRowId === po.po_id ? (
                      <input
                        type="text"
                        placeholder="PO input"
                        value={editingPoData['po_num'] || ""}
                        onChange={(e) => setEditingPoData({ ...editingPoData, po_num: e.target.value })}
                      />
                    ) : highlightText(po.po_num, searchWordsArray)}
                  </td>
                  <td>
                    {editingRowId === po.po_id ? (
                      <Select
                        options={vendorOptions}
                        value={vendorOptions.find(v => v.value === editingPoData['vendor_id'])}
                        onChange={(selected) => setEditingPoData({ ...editingPoData, vendor_id: selected.value })}
                      />
                    ) : (
                      highlightText(vendors.find(v => v.vendor_id === po.vendor_id)?.vendor_name || '', searchWordsArray)
                    )}
                  </td>

                  <td>
                    {editingRowId === po.po_id ? (
                      <Select
                        options={senderOptions}
                        value={senderOptions.find(v => v.value === editingPoData['sender_id'])}
                        onChange={(selected) => setEditingPoData({ ...editingPoData, sender_id: selected.value })}
                      />
                    ) : (
                      highlightText(sender.find(s => s.sender_id === po.sender_id)?.sender_name || '', searchWordsArray)
                    )}
                  </td>

                  <td>
                    {editingRowId === po.po_id ? (
                      <input
                        type="date"
                        value={editingPoData['created_at']}
                        onChange={(e) => setEditingPoData({ ...editingPoData, created_at: e.target.value })}
                      />
                    ) : (
                      highlightText(new Date(po.created_at).toLocaleDateString(), searchWordsArray)
                    )
                    }
                  </td>
                  <td>
                    {editingRowId === po.po_id ? (
                      <input type="date"
                        value={editingPoData['eta']}
                        onChange={(e) => setEditingPoData({ ...editingPoData, eta: e.target.value })}
                      />
                    ) : (
                      highlightText(po.eta ? new Date(po.eta).toLocaleDateString() : '', searchWordsArray)
                    )
                    }
                  </td>
                  <td>
                    {editingRowId === po.po_id ? (
                      <Select
                        options={whOptions}
                        value={whOptions.find(v => v.value === editingPoData.wh_id_deli_to)}
                        onChange={(e) => setEditingPoData({ ...editingPoData, wh_id_deli_to: e.value })}
                      />
                    ) : (
                      highlightText(warehouses.find(w => w.wh_id === po.wh_id_deli_to)?.wh_name || '', searchWordsArray)
                    )}
                  </td>
                  <td>
                    {editingRowId === po.po_id ? (
                      <select
                        value={editingPoData['freight_mode']}
                        onChange={(e) => setEditingPoData({ ...editingPoData, freight_mode: e.target.value })} required>
                        <option value="">Select Freight Mode </option>
                        <option value="Sea Freight">Sea Freight</option>
                        <option value="Truck">Truck</option>
                      </select>) : (
                      highlightText(po.freight_mode, searchWordsArray)
                    )
                    }
                  </td>
                  <td>
                    {editingRowId === po.po_id ? (
                      <select value={editingPoData['storage_condition']}
                        onChange={(e) => setEditingPoData({ ...editingPoData, storage_condition: e.target.value })}>
                        <option value="">Select Storage </option>
                        <option value="Dry product">Dry product</option>
                        <option value="Frozen">Frozen</option>
                        <option value="Chill">Chill</option>
                      </select>
                    ) : (
                      highlightText(po.storage_condition, searchWordsArray)
                    )}
                  </td>
                  <td>
                    {editingRowId === po.po_id ? (
                      <select value={editingPoData['po_status']}
                        onChange={(e) => setEditingPoData({ ...editingPoData, po_status: e.target.value })}>
                        <option value="">Select status </option>
                        <option value="0-Plan">0-Plan</option>
                        <option value="1-Process">1-Process</option>
                        <option value="2-Sent">2-Sent</option>
                      </select>
                    ) : (
                      highlightText(po.po_status, searchWordsArray)
                    )}
                  </td>
                  <td>
                    {editingRowId === po.po_id ? (
                      <select value={editingPoData['currency']}
                        onChange={(e) => setEditingPoData({ ...editingPoData, currency: e.target.value })}>
                        <option value="">Select currency </option>
                        <option value="USD">USD</option>
                        <option value="VND">VND</option>
                      </select>
                    ) : (
                      highlightText(po.currency, searchWordsArray)
                    )}
                  </td>
                  <td>
                    <button className='btn-view' onClick={() => handleViewDetails(po.po_id)}>
                      {expandedPoId === po.po_id ? 'Close' : 'View'}
                    </button>
                  </td>
                </tr>
                {/* Dòng mới: bảng chi tiết hiển thị nếu đang mở */}
                {expandedPoId === po.po_id && (
                  <tr key={'detail-${po.po_id}'}>
                    <td className='detail-cell' colSpan="12" >
                      <table className="table table-bordered table-detail">
                        <thead>
                          <tr>
                            <th>WRIN</th>
                            <th>Qty</th>
                            <th>Unit Price</th>
                            <th>Amount</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {poItems.map((item, index) => (
                            <tr key={index}
                              className={editingItemRowID === item.po_detail_id ? 'editing-item-row' : ''}>
                              <td>
                                {editingItemRowID === item.po_detail_id ? (
                                  <select
                                    className='wrin-select'
                                    value={item.item_id}
                                    onChange={e => handleItemChange(index, 'item_id', e.target.value)}
                                  >
                                    <option value="">Select WRIN</option>
                                    {vendorItems.filter((it) => it.vendor_id === po.vendor_id).map(v => (
                                      <option key={v.item_id} value={v.item_id}>
                                        {v.wrin} - {v.description}
                                      </option>
                                    ))}
                                  </select>
                                ) : (
                                  renderWRIN(Number(item.item_id))
                                )}
                              </td>
                              <td>
                                {editingItemRowID === item.po_detail_id ? (
                                  <input
                                    type="number"
                                    value={item.qty}
                                    onChange={e => handleItemChange(index, 'qty', e.target.value)}
                                  />
                                ) : (
                                  item.qty
                                )}
                              </td>
                              <td>
                                {editingItemRowID === item.po_detail_id ? (
                                  <input
                                    type="number"
                                    value={item.unit_price}
                                    onChange={e => handleItemChange(index, 'unit_price', e.target.value)}
                                  />
                                ) : (
                                  item.unit_price
                                )}
                              </td>
                              <td>
                                {po.currency === 'USD'
                                  ? (parseFloat(item.amount) || 0).toLocaleString('en-US', {
                                    minimumFractionDigits: 4,
                                    maximumFractionDigits: 4,
                                  })
                                  : (parseFloat(item.amount) || 0).toLocaleString('vi-VN', {
                                    maximumFractionDigits: 0,
                                  })}
                              </td>
                              <td>
                                <button className='btn-delete' onClick={() => {
                                  if (item.po_detail_id) { // Chỉ gọi handleDeleteItem nếu item đã có ID (đã lưu)
                                    handleDeleteItem(item.po_detail_id);
                                  } else {
                                    removeItemRow(index); // Nếu là item mới chưa lưu, chỉ cần xóa khỏi state
                                  }
                                }
                                }>Delete</button>
                                {editingItemRowID === item.po_detail_id ? (
                                  item.po_detail_id !== null ? (
                                    <>
                                      <button className='btn-save' onClick={() => handleUpdateItem(item)}>Save</button>
                                      <button className='btn-cancel' onClick={() => {
                                        setEditingItemRowID(null)
                                      }
                                      }>Cancel</button>
                                    </>
                                  ) : null

                                ) : (
                                  <button className='btn-edit' onClick={() => setEditingItemRowID(item.po_detail_id)}>Edit</button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot style={{ fontWeight: 'bold' }}>
                          <tr>
                            <td style={{ textAlign: 'right' }} colSpan="3"><strong>Total:</strong></td>
                            <td>
                              {(() => {
                                const total = poItems.reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0);
                                const currency = po.currency;

                                if (currency === 'USD') {
                                  return total.toLocaleString('en-US', {
                                    minimumFractionDigits: 4,
                                    maximumFractionDigits: 4,
                                  });
                                }

                                if (currency === 'VND') {
                                  return total.toLocaleString('vi-VN', {
                                    maximumFractionDigits: 0,
                                  });
                                }

                                // fallback
                                return total;
                              })()}
                            </td>
                            <td style={{ textAlign: 'left' }}>
                              {po.currency}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                      <button className='btn-add-item' onClick={() => addItemRow()}>New Item</button>
                      <button className='btn-add-item' onClick={() => loadAllItems(po.vendor_id)}>Load All Items</button>
                      <button className='btn-add-item' onClick={() => loadrecentpo(po.vendor_id)}>Load The Recent PO</button>
                      <button className='btn-save' onClick={() => handleSavePoDetails(po.po_id)} >Save</button>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
      {/* --- THÊM KHỐI ĐIỀU KHIỂN PHÂN TRANG --- */}
      {totalPages > 1 && ( // Chỉ hiển thị nếu có nhiều hơn 1 trang
        <div className="pagination-controls">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            &laquo; Previous {/* Hoặc dùng icon */}
          </button>

          {renderPageNumbers()}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next &raquo; {/* Hoặc dùng icon */}
          </button>

          {/* Optional: Chọn số lượng item mỗi trang */}
          <select
            className="items-per-page-select"
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1); // Reset về trang 1 khi thay đổi số lượng item
            }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <span> items per page </span>

          <span className="page-info">
            Page {currentPage} of {totalPages} ({filteredPoList.length} items found)
          </span>
        </div>
      )}
      {filteredPoList.length === 0 && searchTerm && (
        <p>No purchase orders found matching your search criteria.</p>
      )}
      {poList.length > 0 && filteredPoList.length === 0 && !searchTerm && (
        <>
          <p>No purchase orders available.</p> {/*// Trường hợp có dữ liệu gốc nhưng không có kết quả lọc (ít xảy ra nếu filter đúng)*/}
          <img className="placeHolderImageMusea_0ee45fca" src="https://res-1.cdn.office.net/files/odsp-web-prod_2025-05-09.005/odblightspeedwebpack/images/empty_list_e324c5d2.webp" alt="Empty list"></img>
        </>
      )}
      {poList.length === 0 && ( // Có thể thêm trạng thái loading ở đây
        <>
          <p>Loading purchase orders...</p> {/*// Hoặc "No purchase orders found." nếu đã fetch xong và không có gì */}
          {/* <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <img
                className="placeHolderImageMusea_0ee45fca"
                src="https://res-1.cdn.office.net/files/odsp-web-prod_2025-05-09.005/odblightspeedwebpack/images/empty_list_e324c5d2.webp"
                alt="Empty list"
                style={{ width: "200px", height: "auto" }} 
              />
            </div> */}

        </>
      )}
    </div>
  );
}

export default POManage;
