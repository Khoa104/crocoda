export const columnDefinitions = [
    { id: 'select', label: '', type: 'checkbox', defaultVisible: true, defaultWidth: 40, isAlwaysVisible: true, isDraggable: false, isResizable: false },
    { id: 'item_id', label: 'ID', type: 'text', defaultVisible: true, defaultWidth: 80, isSortable: true, isDraggable: true, isResizable: true },
    { id: 'wrin', label: 'WRIN', type: 'text', defaultVisible: true, defaultWidth: 120, isSortable: true, isDraggable: true, isResizable: true },
    { id: 'description', label: 'Description', type: 'text', defaultVisible: true, defaultWidth: 250, isSortable: true, isDraggable: true, isResizable: true },
    { id: 'vendor.vendor_name', label: 'Vendor', type: 'text', defaultVisible: true, defaultWidth: 150, isSortable: true, isDraggable: true, isResizable: true },
    { id: 'supplier', label: 'Supplier', type: 'text', defaultVisible: true, defaultWidth: 150, isSortable: true, isDraggable: true, isResizable: true },
    { id: 'is_active', label: 'Status', type: 'text', defaultVisible: true, defaultWidth: 100, isSortable: true, isDraggable: true, isResizable: true },
    { id: 'price', label: 'Price', type: 'number', defaultVisible: false, defaultWidth: 100, isSortable: true, isDraggable: true, isResizable: true },
    { id: 'category', label: 'Category', type: 'text', defaultVisible: false, defaultWidth: 120, isSortable: true, isDraggable: true, isResizable: true },
    { id: 'created_date', label: 'Created Date', type: 'date', defaultVisible: true, defaultWidth: 150, isSortable: true, isDraggable: true, isResizable: true },
];


export const supportedViewTypes = ['list', 'gallery', 'calendar'];

export const filtercolumns = columnDefinitions.filter(col => !col.isAlwaysVisible && col.type !== 'checkbox').map(col => ({
    id: col.id,
    label: col.label,
    type: col.type,
}));

// ĐỊNH NGHĨA CÁC TRƯỜNG CÓ THỂ NHÓM
export const groupablecolumns = columnDefinitions.filter(col => !col.isAlwaysVisible && col.type !== 'checkbox').map(col => ({
    id: col.id,
    label: col.label,
    type: col.type,
}));
// ĐỊNH NGHĨA CÁC TRƯỜNG CÓ THỂ SẮP XẾP
export const sortablecolumns = columnDefinitions.filter(col => col.isSortable).map(col => ({
    id: col.id,
    label: col.label,
    type: col.type,
}));

// Định nghĩa khóa trang cho ProductsList
export const PAGE_KEY = '2';