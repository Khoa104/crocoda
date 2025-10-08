// src/pages/scm/ProductsList.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getProducts } from "../../../api/api";
import * as LucideIcons from "lucide-react";
import "./ProductsList.css"
import { useDropdown } from '../../../hooks/useDropdown'; // Thay đổi đường dẫn

import FilterModal from '../../../components/FilterModal';
import RightPanel from '../../../components/RightPanel';
import DropdownPanel from '../../../components/DropdownPanel';
import SortDropdown from '../../../components/SortDropdown';
import GroupDropdown from '../../../components/GroupDropdown';

// Import các component cho từng dạng xem
import ProductListView from './ProductListView';
import ProductGalleryView from './ProductGalleryView';
import ListView from '../../../components/ListView/ListView';
import GalleryView from '../../../components/GalleryView';
// import PageList from '../../../components/PageList';
// Import modal mới
import AddCustomViewModal from '../../../components/AddCustomViewModal';
import { allViewTypeOptions } from '../../../utils/config';
import { initialFilterState, getFieldValue } from '../../../utils/filterUtils';
import { columnDefinitions, supportedViewTypes, PAGE_KEY, filtercolumns, groupablecolumns, sortablecolumns } from '../../../utils/ProductConfig';
import { hasActiveFilters, applyViewFiltersSortAndGroup, extractAllItemIds } from '../../../utils/filterUtils';
import { getStoredAppSettings, saveStoredAppSettings, getPageSettings, updatePageSetting, updatePageDefaultViewId, unsetPageDefaultViewId } from '../../../utils/PageSettingConfig';

function ProductsList({ onOpenNewStack, searchTerm = '' }) {
  // Lấy cài đặt ban đầu cho trang này từ localStorage
  const initialPageSettings = getPageSettings(PAGE_KEY);

  // Cài đặt mặc định cho một trang nếu chưa có trong localStorage
  const defaultEmptyPageSettings = useCallback(() => {
    const defaultVisible = {};
    const defaultWidths = {};
    const defaultOrder = columnDefinitions.map(col => col.id);
    columnDefinitions.forEach(col => {
      defaultVisible[col.id] = col.defaultVisible;
      defaultWidths[col.id] = col.defaultWidth;
    });
    return {
      columnSettings: { visible: defaultVisible, widths: defaultWidths, order: defaultOrder },
      customViews: [],
      appliedFilters: initialFilterState,
      appliedGroups: [],
      appliedSort: [],
      defaultViewId: null // Mặc định không có default view cụ thể
    };
  }, []);

  // STATES
  const [defaultViewId, setDefaultViewId] = useState(initialPageSettings.defaultViewId || null);
  const [customViews, setCustomViews] = useState(initialPageSettings.customViews || []);
  const [columnSettings, setColumnSettings] = useState(initialPageSettings.columnSettings || defaultEmptyPageSettings().columnSettings);


  // `viewType` sẽ là kiểu xem hiện tại, có thể là 'list', 'gallery' hoặc ID của custom view
  const [viewType, setViewType] = useState(() => {
    const storedDefaultId = initialPageSettings.defaultViewId;
    const initialCustomViews = initialPageSettings.customViews || [];

    // Nếu có defaultViewId được lưu và nó là một custom view hợp lệ
    if (storedDefaultId && initialCustomViews.some(cv => cv.id === storedDefaultId)) {
      return storedDefaultId;
    }
    // Fallback về kiểu xem đầu tiên được hỗ trợ
    return supportedViewTypes[0] || 'list';
  });


  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const searchTimeoutRef = useRef(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProductIds, setSelectedProductIds] = useState(new Set()); // State để lưu ID các sản phẩm đã chọn
  const [isAddViewModalOpen, setIsAddViewModalOpen] = useState(false); // State cho modal

  const useDropdown_MoreActions = useDropdown();
  const useDropdown_CustomViews = useDropdown();
  const useDropdown_SortDropdown = useDropdown();
  const useDropdown_GroupDropdown = useDropdown();

  // ---States để quản lý hiển thị các panel Filter/Group/Sort
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  // const [showGroupPanel, setShowGroupPanel] = useState(false);
  // const [showSortPanel, setShowSortPanel] = useState(false);
  // --- State để lưu trữ các bộ lọc đang được áp dụng ---
  const [appliedFilters, setAppliedFilters] = useState(initialPageSettings.filters || initialFilterState);
  const [appliedSorts, setAppliedSorts] = useState(initialPageSettings.sort || []);
  const [appliedGroups, setAppliedGroups] = useState(initialPageSettings.groups || []);
  // ---State cho Custom Views ---




  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); // Bắt đầu tải dữ liệu
      try {
        const res = await getProducts();
        setProducts(res);
      } catch (error) {
        console.error("Failed to fetch data:", error.message);
      } finally {
        setLoading(false); // Kết thúc tải dữ liệu
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm); // Update debouncedSearchTerm after the delay
    }, 500); // 500ms debounce delay

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm]); // Re-run whenever SearchTerm changes

  // useEffect để lưu các thay đổi của state vào localStorage
  useEffect(() => {
    updatePageSetting(PAGE_KEY, 'columnSettings', columnSettings);
  }, [columnSettings]);

  useEffect(() => {
    updatePageSetting(PAGE_KEY, 'customViews', customViews);
  }, [customViews]);

  // Luôn cập nhật defaultViewId trong localStorage khi nó thay đổi
  useEffect(() => {
    if (defaultViewId !== null) {
      updatePageDefaultViewId(PAGE_KEY, defaultViewId);
    } else {
      unsetPageDefaultViewId(PAGE_KEY); // Xóa khỏi localStorage nếu không có default view
    }
  }, [defaultViewId]);

  const applyViewConfig = useCallback((viewConfig) => {
    // Áp dụng bộ lọc, nhóm, sắp xếp từ viewConfig
    setAppliedFilters(viewConfig.filters || { operator: 'AND', conditions: [] });
    setAppliedGroups(viewConfig.groups || []);
    setAppliedSorts(viewConfig.sort || { field: null, direction: 'asc' });

    // Áp dụng cài đặt cột từ viewConfig
    if (viewConfig.columnSettings) {
      setColumnSettings(viewConfig.columnSettings);
    } else {
      // Reset column settings về mặc định nếu viewConfig không cung cấp
      setColumnSettings(defaultEmptyPageSettings().columnSettings);
    }
  }, [defaultEmptyPageSettings]); // Thêm defaultEmptyPageSettings vào dependency

  useEffect(() => {
    const activeCustomView = customViews.find(cv => cv.id === viewType);
    if (activeCustomView) {
      applyViewConfig(activeCustomView);
    } else {
      // Reset về cài đặt mặc định của trang khi không phải custom view
      // const defaultPageSettings = defaultEmptyPageSettings();
      // setAppliedFilters(defaultPageSettings.appliedFilters);
      // setAppliedGroups(defaultPageSettings.appliedGroups);
      // setAppliedSorts(defaultPageSettings.appliedSort);
      // setColumnSettings(defaultPageSettings.columnSettings);
    }
  }, [viewType, customViews, applyViewConfig, defaultEmptyPageSettings]);

  useEffect(() => {
    // Đảm bảo viewType luôn hợp lệ với supportedViewTypes của chính nó hoặc là một custom view
    if (!supportedViewTypes.includes(viewType) && !customViews.some(cv => cv.id === viewType)) {
      setViewType(supportedViewTypes[0] || 'list');
    }
  }, [viewType, customViews, supportedViewTypes]); // Thêm customViews vào dependency

  //  useEffect để áp dụng filter/group/sort khi viewType thay đổi thành Custom View ---
  const handleApplyViewConfig = (viewid) => {
    setViewType(viewid);
    console.log('handleApplyViewConfig');
    const activeCustomView = customViews.find(cv => cv.id === viewid);
    if (activeCustomView) {
      // Áp dụng các cấu hình từ custom view
      setAppliedFilters(activeCustomView.filters || initialFilterState);
      setAppliedGroups(activeCustomView.groups || []);
      setAppliedSorts(activeCustomView.sort || []);

      // Lưu ý: searchTerm là một prop từ component cha, không thể thay đổi trực tiếp ở đây.
      // Nếu bạn muốn searchTerm cũng được lưu và áp dụng, bạn cần quản lý nó dưới dạng state trong ProductsList
      // hoặc có một callback để gửi lên component cha thay đổi prop searchTerm.
      // Hiện tại, searchTerm sẽ vẫn là giá trị từ prop ban đầu.
    } else {
      // Nếu không phải custom view (ví dụ: quay lại 'list' hoặc 'gallery' mặc định)
      // thì có thể reset các bộ lọc/nhóm/sắp xếp về trạng thái mặc định hoặc để người dùng tự điều chỉnh
      // Tùy thuộc vào UX mong muốn, ở đây ta sẽ không reset tự động để giữ lại cài đặt panel cuối cùng.
      // Nếu muốn reset:
      setAppliedFilters(initialFilterState);
      setAppliedGroups([]);
      setAppliedSorts([]);
    }
  };


  // Hàm xử lý khi checkbox "Chọn tất cả" thay đổi
  const handleSelectAllChange = (event) => {
    if (event.target.checked) {
      const allProductIds = new Set(extractAllItemIds(displayedProducts, 'item_id'));
      setSelectedProductIds(allProductIds);
      console.log(allProductIds);
      console.log('a', displayedProducts);
      console.log(extractAllItemIds(displayedProducts, 'item_id'));
    } else {
      setSelectedProductIds(new Set());
    }

  };
  // const handleSelectAllChange = useCallback((event) => {
  //   if (event.target.checked) {
  //     // Lấy tất cả item_id từ displayedProducts, bất kể có nhóm hay không
  //     const allProductIds = new Set(extractAllItemIds(displayedProducts, 'item_id'));
  //     setSelectedProductIds(allProductIds);
  //   } else {
  //     setSelectedProductIds(new Set());
  //   }
  // }, [displayedProducts, extractAllItemIds]);

  // Hàm xử lý khi một checkbox riêng lẻ thay đổi
  const handleProductSelectChange = useCallback((itemId, event) => {
    // Ngăn chặn sự kiện lan truyền nếu click vào checkbox
    if (event.target.type === 'checkbox') {
      event.stopPropagation();
    }
    setSelectedProductIds(prevSelected => {
      const newSelected = new Set(prevSelected);
      // Nếu sự kiện đến từ checkbox, sử dụng trạng thái checked của nó
      if (event.target.type === 'checkbox') {
        if (event.target.checked) {
          newSelected.add(itemId);
        } else {
          newSelected.delete(itemId);
        }
      } else {
        // Nếu sự kiện đến từ click vào hàng (không phải checkbox), chuyển đổi trạng thái
        if (newSelected.has(itemId)) {
          newSelected.delete(itemId);
        } else {
          newSelected.add(itemId);
        }
      }
      return newSelected;
    });
  }, []);

  // Hàm xử lý khi click vào hàng để mở chi tiết
  const handleRowClickForDetail = (itemId) => {
    onOpenNewStack('product', itemId);
  };

  const handleOpenNewStackForDetail = useCallback((itemId) => {
    onOpenNewStack('product', itemId);
  }, [onOpenNewStack]);

  // --- Hàm xử lý thêm View tùy chỉnh ---
  const handleAddCustomView = useCallback((newViewConfig) => {
    const viewId = `custom-${Date.now()}`;
    // Lưu cài đặt cột, bộ lọc, nhóm, sắp xếp hiện tại vào custom view mới
    const fullNewView = {
      id: viewId,
      ...newViewConfig,
      columnSettings: columnSettings,
      filters: appliedFilters,
      groups: appliedGroups,
      sort: appliedSorts,
    };
    setCustomViews(prevViews => {
      const updatedViews = [...prevViews, fullNewView];
      updatePageSetting(PAGE_KEY, 'customViews', updatedViews); // Cập nhật localStorage
      return updatedViews;
    });
    setIsAddViewModalOpen(false);
    setViewType(fullNewView.id);
  }, [columnSettings, appliedFilters, appliedGroups, appliedSorts]);

  // Hàm cập nhật một custom view hiện có
  const handleUpdateCustomView = useCallback((viewIdToUpdate, updatedConfig) => {
    setCustomViews(prevViews => {
      const updatedViews = prevViews.map(view =>
        view.id === viewIdToUpdate ? { ...view, ...updatedConfig } : view
      );
      updatePageSetting(PAGE_KEY, 'customViews', updatedViews); // Cập nhật localStorage
      return updatedViews;
    });
  }, []);

  const handleSetDefaultView = useCallback((viewId) => {
    setDefaultViewId(viewId); // Cập nhật state và useEffect sẽ lưu vào localStorage
    console.log('Chế độ xem mặc định đã được cập nhật cho trang này!');
  }, []);

  const handleUnsetDefaultView = useCallback(() => {
    setDefaultViewId(null); // Cập nhật state và useEffect sẽ xóa khỏi localStorage
    alert('Chế độ xem mặc định đã được hủy!');
  }, []);

  const handleDeleteCustomView = useCallback((viewIdToDelete, event) => {
    event.stopPropagation();
    setCustomViews(prevViews => {
      const updatedViews = prevViews.filter(view => view.id !== viewIdToDelete);
      updatePageSetting(PAGE_KEY, 'customViews', updatedViews); // Cập nhật localStorage
      // Nếu view bị xóa là view mặc định, hãy hủy đặt nó
      if (defaultViewId === viewIdToDelete) {
        setDefaultViewId(null);
      }
      // Nếu view hiện tại đang chọn là view bị xóa, chuyển về view mặc định
      if (viewType === viewIdToDelete) {
        const newViewType = (defaultViewId && updatedViews.some(cv => cv.id === defaultViewId))
          ? defaultViewId
          : (supportedViewTypes[0] || 'list');
        setViewType(newViewType);
      }
      return updatedViews;
    });
  }, [viewType, supportedViewTypes, defaultViewId]);

  // --- THÊM MỚI: Hàm lưu view hiện tại (cập nhật view đã có) ---
  const handleSaveCurrentView = useCallback((viewId) => {
    const activeCustomView = customViews.find(v => v.id === viewType);
    if (activeCustomView) {
      const selectedOption = allViewTypeOptions.find(option => option.viewtype === activeCustomView.viewType);
      const icon = selectedOption.icon;
      const updatedConfig = {
        viewType: activeCustomView.viewType,
        icon: icon,
        // name: activeCustomView.name,
        filters: appliedFilters,
        groups: appliedGroups,
        sort: appliedSorts,
        searchTerm: debouncedSearchTerm,
        columnSettings: columnSettings,
      };
      handleUpdateCustomView(viewId, updatedConfig);
      console.log(`View "${activeCustomView.name}" đã được cập nhật!`);
    } else {
      const selectedOption = allViewTypeOptions.find(option => option.viewtype === viewType);
      const icon = selectedOption.icon;
      const updatedConfig = {
        viewType: viewType,
        icon: icon,
        // name: activeCustomView.name,
        filters: appliedFilters,
        groups: appliedGroups,
        sort: appliedSorts,
        searchTerm: debouncedSearchTerm,
        columnSettings: columnSettings,
      };
      handleUpdateCustomView(viewId, updatedConfig);
      console.log("Không có view tùy chỉnh nào đang hoạt động để lưu. Vui lòng tạo một view mới.");
    }
  }, [viewType, customViews, appliedFilters, appliedGroups, appliedSorts, searchTerm, columnSettings, handleUpdateCustomView]);

  const displayedProducts = applyViewFiltersSortAndGroup(products, appliedFilters, appliedSorts, appliedGroups, debouncedSearchTerm, filtercolumns);

  // Lấy các cột hiển thị và sắp xếp chúng theo columnSettings.order
  const orderedVisibleColumns = columnSettings.order
    .map(colId => columnDefinitions.find(def => def.id === colId))
    .filter(col => col && columnSettings.visible[col.id]); // Chỉ lấy các cột tồn tại và được hiển thị
  // console.log(orderedVisibleColumns);

  // Callbacks để cập nhật columnSettings
  const handleColumnOrderChange = useCallback((newOrderIds) => {
    setColumnSettings(prev => ({
      ...prev,
      order: newOrderIds
    }));
    // useEffect sẽ tự động lưu vào localStorage
  }, []);

  const handleColumnWidthChange = useCallback((colId, newWidth) => {
    setColumnSettings(prev => ({
      ...prev,
      widths: {
        ...prev.widths,
        [colId]: newWidth
      }
    }));
    // useEffect sẽ tự động lưu vào localStorage
  }, []);

  const handleToggleColumnVisibility = useCallback((colId) => {
    setColumnSettings(prev => {
      const newVisible = {
        ...prev.visible,
        [colId]: !prev.visible[colId]
      };
      if (colId === 'select') newVisible.select = true; // Đảm bảo cột select luôn visible

      // useEffect sẽ tự động lưu vào localStorage
      return { ...prev, visible: newVisible };
    });
  }, []);

  // Kiểm tra xem có cài đặt cột tùy chỉnh nào đang hoạt động không
  const hasCustomColumnSettings = useCallback(() => {
    const defaultSettings = defaultEmptyPageSettings().columnSettings;
    const isVisibleDefault = Object.keys(columnSettings.visible).every(key =>
      columnSettings.visible[key] === defaultSettings.visible[key]
    );
    const isWidthsDefault = Object.keys(columnSettings.widths).every(key =>
      columnSettings.widths[key] === defaultSettings.widths[key]
    );
    const isOrderDefault = JSON.stringify(columnSettings.order) === JSON.stringify(defaultSettings.order);

    return !(isVisibleDefault && isWidthsDefault && isOrderDefault);
  }, [columnSettings, defaultEmptyPageSettings]);


  const commonProps = {
    data: displayedProducts, // Truyền dữ liệu đã lọc/sắp xếp
    loading: loading,
    selectedItemIds: selectedProductIds,
    onItemSelectChange: handleProductSelectChange,
    onSelectAllChange: handleSelectAllChange,
    onOpenDetailView: handleOpenNewStackForDetail,
    searchTerm: debouncedSearchTerm,
    appliedGroups: appliedGroups,
    groupableFields: filtercolumns,
    columnDefinitions: columnDefinitions,
    columnWidths: columnSettings.widths,
    onSortChange: setAppliedSorts,
    appliedSorts: appliedSorts,
    onGroupChange: setAppliedGroups,
    onColumnOrderChange: handleColumnOrderChange,
    onColumnWidthChange: handleColumnWidthChange,
    onToggleColumnVisibility: handleToggleColumnVisibility,
    idField: 'item_id', // Chỉ định trường ID cho Product
    getFieldValue: getFieldValue,
  };

  const renderView = () => {
    // Lấy kiểu view từ custom view nếu có
    const activeCustomView = customViews.find(v => v.id === viewType);
    const currentRenderViewType = activeCustomView ? activeCustomView.viewType : viewType;

    switch (currentRenderViewType) {
      case 'list':
        return <ProductListView {...commonProps} />;
      // case 'grid':
      //   return <ProductGridView {...commonProps} />;
      case 'gallery':
        // return <GalleryView {...commonProps} />;
        return <ListView {...commonProps} />;
      case 'calendar':
        return <GalleryView {...commonProps} />;
      // case 'calendar':
      //   return <ProductCalendarView {...commonProps} />;
      // case 'board':
      //   return <ProductBoardView {...commonProps} />;
      default:
        // Nếu là một custom view không có viewType hoặc viewType không được hỗ trợ
        // Có thể fallback về ProductListView hoặc hiển thị cảnh báo
        return <ProductListView {...commonProps} />;
    }
  };

  // Các tùy chọn view mặc định được hỗ trợ
  const defaultViewOptions = allViewTypeOptions.filter(option => supportedViewTypes.includes(option.viewtype));
  // --- THÊM MỚI: Hàm xử lý áp dụng bộ lọc từ FilterPanel ---
  const handleApplyFilters = useCallback((filters) => {
    setAppliedFilters(filters);
    // updatePageSetting(PAGE_KEY, 'filters', filters); // Lưu bộ lọc vào localStorage
  }, []);

  const handleApplySorts = useCallback((sortConfig) => {
    setAppliedSorts(sortConfig);
    // updatePageSetting(PAGE_KEY, 'sort', sortConfig); // Lưu sắp xếp vào localStorage
  }, []);

  const handleApplyGroups = useCallback((groupConfig) => {
    setAppliedGroups(groupConfig);
    //updatePageSetting(PAGE_KEY, 'groups', groupConfig); // Lưu nhóm vào localStorage
  }, []);

  // --- THÊM MỚI: Hàm xử lý xóa tất cả bộ lọc từ FilterPanel ---
  const handleClearAllFilters = useCallback(() => {
    setShowFilterPanel(false); // Đóng panel sau khi xóa
    setAppliedFilters(initialFilterState);
  }, []);

  // Hàm xử lý áp dụng cài đặt cột từ ColumnSettingsPanel
  const handleApplyColumnSettings = useCallback((newSettings) => {
    setColumnSettings(newSettings);
    // useEffect sẽ tự động lưu vào localStorage
    setIsColumnSettingsPanelOpen(false);
  }, []);

  // Kiểm tra xem có bộ lọc nào đang hoạt động không

  return (
    <div className="product-page-container" id='nextto-right-panel'>
      <div className="action-panel" >
        <div className="action-section">
          <button className='new-product-button'
            onClick={() => handleRowClickForDetail('new')}>
            <LucideIcons.Plus size={18} />
            <span>New</span>
          </button>
        </div>
        {selectedProductIds.size > 0 && (
          <div className="selected-action-section">
            <button
              className="selected-action-button"
              onClick={() => setSelectedProductIds(new Set())}
            >
              {selectedProductIds.size} Selected <LucideIcons.X size={16} />
            </button>
            {selectedProductIds.size === 1 && (
              <button
                className="selected-action-button"
                onClick={() => handleRowClickForDetail(Array.from(selectedProductIds)[0])}
              >
                Edit <LucideIcons.Edit size={16} />
              </button>
            )}
            <div className="more-action-section">
              <button
                className="selected-action-button"
                ref={useDropdown_MoreActions.triggerRef}
                onClick={useDropdown_MoreActions.toggle}
              >
                More Actions <LucideIcons.ChevronDown size={16} />
              </button>
              {useDropdown_MoreActions.isOpen && (
                <DropdownPanel className="selected-actions-dropdown" isOpen={useDropdown_MoreActions.isOpen}
                  onClose={useDropdown_MoreActions.close}
                  ref={useDropdown_MoreActions.panelRef}
                >
                  <button onClick={() => console.log('Delete')}
                    style={{ color: 'var(--danger-color)' }}>
                    <LucideIcons.Trash2 size={16} /> Delete Selected
                  </button>
                  <button onClick={() => console.log('Print')}>
                    <LucideIcons.Printer size={16} /> Print Selected
                  </button>
                  {/* Thêm các hành động khác tại đây */}
                </DropdownPanel>
                // <div className="selected-actions-dropdown">

                // </div>
              )}
            </div>

          </div>
        )}
        <div className='view-section'>
          <div className="view-action-section">
            <button className="view-action-button filter"
              onClick={() => { setShowFilterPanel(!showFilterPanel); console.log('filter') }}>
              <LucideIcons.Funnel size={16} />
              {hasActiveFilters(appliedFilters) && (
                <span className="new-indicator"> <LucideIcons.Dot size={32} /> </span>
              )}
            </button>
            <button className={`view-action-button group ${useDropdown_GroupDropdown.isOpen ? 'focus' : ''}`}
              onClick={() => {
                useDropdown_GroupDropdown.toggle();
                console.log('group', appliedGroups)
              }}
              ref={useDropdown_GroupDropdown.triggerRef}
            >
              <LucideIcons.ListCollapse size={16} />
              {appliedGroups && appliedGroups.length > 0 && (
                <span className="new-indicator"> <LucideIcons.Dot size={32} /> </span>
              )}
              <GroupDropdown
                isOpen={useDropdown_GroupDropdown.isOpen}
                onClose={useDropdown_GroupDropdown.toggle}
                className='product'
                availableFields={groupablecolumns}
                onChange={handleApplyGroups}
                ref={useDropdown_GroupDropdown.panelRef}
                groupConfig={appliedGroups}
              />
            </button>
            <button className={`view-action-button sort ${useDropdown_SortDropdown.isOpen ? 'focus' : ''}`}
              onClick={() => {
                useDropdown_SortDropdown.toggle();
                console.log('sort', appliedSorts)
              }}
              ref={useDropdown_SortDropdown.triggerRef}
            >
              <LucideIcons.ArrowDownWideNarrow size={16} />
              {appliedSorts && appliedSorts.length > 0 && (
                <span className="new-indicator"> <LucideIcons.Dot size={32} /> </span>
              )}
              <SortDropdown
                isOpen={useDropdown_SortDropdown.isOpen}
                onClose={useDropdown_SortDropdown.toggle}
                className='product'
                availableFields={sortablecolumns}
                onChange={handleApplySorts}
                ref={useDropdown_SortDropdown.panelRef}
                sortConfig={appliedSorts}
              />
            </button>
          </div>
          <div className="view-type-selector" >
            {defaultViewOptions.map((option) => {
              const Icon = LucideIcons[option.icon] || LucideIcons.Box;
              const isActive = viewType === option.viewtype;
              return (
                <div className='view-choice' key={option.viewtype}>
                  <button
                    onClick={() => { setViewType(option.viewtype); }}
                    className={`view-type-button ${isActive ? 'active' : ''}`}
                    title={option.label}
                  >
                    <Icon size={18} />
                    {/* <span>{option.label}</span> */}
                  </button>
                </div>
              );
            })}
          </div>
          <div className='view-choice custom-views-dropdown-container'>
            <button
              ref={useDropdown_CustomViews.triggerRef}
              onClick={() => {
                if (customViews.length > 0) {
                  useDropdown_CustomViews.toggle();
                  console.log('a');
                } else {
                  setIsAddViewModalOpen(!isAddViewModalOpen)
                }
              }}
              className={`view-type-button ${customViews.some(cv => cv.id === viewType) ? 'active' : ''}`}
              title={customViews.length > 0 ? 'Custom Views' : 'Create New View'}
            >
              <LucideIcons.Star size={18} /> {/* Icon cho Custom Views */}
            </button>

            {(useDropdown_CustomViews.isOpen && customViews.length > 0) && (
              <DropdownPanel className='custom-views-dropdown' isOpen={useDropdown_CustomViews.isOpen}
                onClose={useDropdown_CustomViews.close}
                ref={useDropdown_CustomViews.panelRef}>
                {customViews.map((view) => {
                  const Icon = LucideIcons[view.icon] || LucideIcons.Box;
                  const isActive = viewType === view.id;
                  const isDefaultView = defaultViewId === view.id;
                  return (
                    <div key={view.id} className="custom-view-item">
                      <li
                        onClick={() => {
                          setViewType(view.id);
                          //useDropdown_CustomViews.close(); // Đóng dropdown sau khi chọn
                        }}
                        className={`custom-view-button ${isActive ? 'active' : ''}`}
                      >
                        <Icon size={16} />
                        <span className='custom-view-name'>{view.name}</span>
                        {isDefaultView && (
                          <LucideIcons.Pin size={12} className="default-pin" title="Default view" />
                        )}
                        {true//isActive 
                          && (
                            <div className="actived-view-action">
                              <button className='save-custom-view'
                                onClick={(e) => {
                                  e.stopPropagation();
                                  console.log('Save view');
                                  handleSaveCurrentView(view.id);
                                }}
                                title="Save view"
                              >
                                <LucideIcons.Save size={12} />
                              </button>
                              {isDefaultView ?
                                (
                                  <button className="set-default-custom-view"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleUnsetDefaultView();
                                      console.log('unset default view');
                                    }}
                                    title='Unset default view'
                                  >
                                    <LucideIcons.PinOff size={12} />
                                  </button>
                                )

                                : (
                                  <button className="set-default-custom-view"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSetDefaultView(view.id);
                                      console.log('set default view');
                                    }}
                                    title='The default view'
                                  >
                                    <LucideIcons.Pin size={12} />
                                  </button>
                                )

                              }



                              <button className='delete-custom-view'
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteCustomView(view.id, e)
                                }}
                                title="Delete custom view"
                              >
                                <LucideIcons.Trash2 size={12} />
                              </button>
                            </div>
                          )}

                      </li>
                    </div>
                  );
                })}
                <div className="custom-view-function">
                  <div className="custom-view-item">
                    <button
                      onClick={() => { setIsAddViewModalOpen(!isAddViewModalOpen); console.log(isAddViewModalOpen); }}
                      className="custom-view-button .action-view-button"
                      title="Add View"
                    >
                      <LucideIcons.Plus size={18} />
                      <span className='custom-view-name'>Create new view</span>

                    </button>
                  </div>
                  <div className="custom-view-item">
                    <button
                      onClick={() => { setIsAddViewModalOpen(!isAddViewModalOpen); console.log(isAddViewModalOpen); }}
                      className=" custom-view-button .action-view-button"
                      title="Add View"
                    >
                      <LucideIcons.Save size={18} />
                      <span className='custom-view-name'>Save current view as...</span>
                    </button>
                  </div>
                </div>

              </DropdownPanel>

            )}
          </div>

        </div>
      </div>

      <div className="render-product-view">
        {renderView()}
      </div>
      {/* --- THÊM MỚI: Placeholder cho Filter Panel --- */}
      <FilterModal
        isOpen={showFilterPanel}
        onClose={() => setShowFilterPanel(false)}
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearAllFilters}
        initialFilters={appliedFilters}
        filterableFields={filtercolumns}
        container={document.getElementById('nextto-right-panel')?.parentElement}
      />


      {/* <RightPanel
        isOpen={showFilterPanel}
        onClose={() => setShowFilterPanel(false)}
        title='Filters'
        className='filter-panel'
        onApply={handleApplyFilters}
        onClear={handleClearAllFilters}
        container={document.getElementById('nextto-right-panel')?.parentElement}>
        <h3>Fitler Rows</h3>
        <p>Apply one or more filter conditions to the rows in this list.</p>

      </RightPanel> */}

      {/* grouppanel */}
      {/* <RightPanel
        isOpen={showGroupPanel}
        onClose={() => setShowGroupPanel(false)}
        title='Group Panel'
        className='group-panel'
        // onApply={handleApplyFilters}
        // onClear={handleClearAllFilters}
        container={document.getElementById('nextto-right-panel')?.parentElement}>

        <h3>Group</h3>
        <p>Đây là new right panel GROUP.</p>
      </RightPanel> */}

      {/* sortpanel */}
      {/* <RightPanel
        isOpen={showSortPanel}
        onClose={() => setShowSortPanel(false)}
        title='Sort Panel'
        className='sort-panel'
        // onApply={handleApplyFilters}
        // onClear={handleClearAllFilters}
        container={document.getElementById('nextto-right-panel')?.parentElement}>
        <h3>Group</h3>
        <p>Đây là new right panel GROUP.</p>
      </RightPanel> */}


      {/* Modal Add Custom View */}
      {
        isAddViewModalOpen && (
          <AddCustomViewModal
            isOpen={isAddViewModalOpen}
            onClose={() => setIsAddViewModalOpen(false)}
            onSave={handleAddCustomView}
            supportedViewTypes={supportedViewTypes} // Truyền các loại view được hỗ trợ
            availableColumns={Object.keys(products[0] || {}).filter(key =>
              !['item_id', 'vendor'].includes(key) && typeof products[0][key] !== 'object'
            )} // Truyền các cột khả dụng để lọc/sắp xếp
          />
        )
      }


    </div >
  );
}

export default ProductsList;
