// src/components/StackedViewContainer.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, Outlet, useNavigate } from 'react-router-dom';
import * as LucideIcons from "lucide-react";
import '../styles/StackView.css'
import StackedViewModal from './StackedViewModal';

import Dashboard from "../pages/scm/Dashboard";
import ProductsList from "../pages/scm/product/ProductsList";
import ProductDetail from "../pages/scm/ProductDetail";
import POManage from "../pages/scm/POManage";
import UserManage from "../pages/user/user/UserManage";
import GroupUser from "../pages/user/GroupUser";
import RolesManagement from "../pages/user/RolesManagement";
import NotFound from "../pages/auth/NotFound";
import PODetail from '../pages/scm/PODetail';

const objectComponentMap = {
  // scm module
  'scm-home.list': Dashboard,
  'product.list': ProductsList, // -> path /products
  'product.detail': ProductDetail, // -> /products/:productId
  'product.new': NotFound, // -> /products/new
  'product.id': ProductDetail, //  -> stacked /product.id/:id 
  'po.list': POManage, // -> path /po
  'po.detail': PODetail, // -> /po/:poId
  'po.id': Dashboard, //  -> stacked /po.id/:id
  // user module
  'user-home.list': UserManage, // -> path /user-home
  'user.list': UserManage, // -> path /user
  'user.detail': UserManage, // -> path /user/:id
  'user.id': UserManage, //  -> stacked /user.id/:id
  'groupuser.list': GroupUser, // -> path /groupuser
  'role.list': RolesManagement, // -> path /groupuser
  // finance module
};

const allViewTypeOptions = [
  { viewtype: 'list', icon: 'List', label: 'List' },
  { viewtype: 'kanban', icon: 'LayoutGrid', label: 'Kanban' },
  { viewtype: 'chart', icon: 'BarChart2', label: 'Chart' },
  { viewtype: 'gallery', icon: 'LayoutGrid', label: 'Gallery' },
  { viewtype: 'board', icon: 'AlignStartHorizontal', label: 'Board' },
  { viewtype: 'calendar', icon: 'Calendar', label: 'Calendar' },
];

const resolveComponentKey = (segment, type) => { // type on of {list , detail, new}
  if (segment.includes('.')) return segment;
  return `${segment}.${type}`;
};
const MAX_VISIBLE_TABS = 3;

function StackedViewContainer() {
  const location = useLocation();
  const navigate = useNavigate();
  const [stackedViews, setStackedViews] = useState([]);
  const selectedmodule = (localStorage.getItem("selectedModule") || "scm").toLowerCase();
  const [currentViewType, setCurrentViewType] = useState('list')
  const [currentSupportedViewTypes, setCurrentSupportedViewTypes] = useState([])
  const isInternalNavigation = useRef(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showHiddenTabsDropdown, setShowHiddenTabsDropdown] = useState(false); // Đổi tên state cho rõ ràng hơn


  const handleSupportedViewTypesChange = useCallback((supportedTypesFromChild) => {
    const filteredSupportedOptions = allViewTypeOptions.filter(v =>
      supportedTypesFromChild.includes(v.viewtype)
    );
    setCurrentSupportedViewTypes(filteredSupportedOptions);
    console.log(currentSupportedViewTypes);
    ;
    if (!supportedTypesFromChild.includes(currentViewType)) {
      setCurrentViewType(supportedTypesFromChild[0] || 'list'); // Mặc định là 'list' hoặc kiểu đầu tiên
    }
  }, [currentViewType, location.pathname]);
  const handleCurrentViewTypeChange = (viewType) => {
    setCurrentViewType(viewType);
    stackedViews[stackedViews.length - 1].props.viewType = viewType;
    console.log(viewType);
  };
  const handleSearchChange = (e) => { // Hàm xử lý thay đổi cho ô tìm kiếm
    setSearchTerm(e.target.value);
  };

  // Hàm để phân tích URL và xây dựng stack của các views
  const parseUrlToStackedViews = useCallback(() => {
    if (isInternalNavigation.current) {
      isInternalNavigation.current = false; // Reset cờ sau khi kiểm tra
      return; // Bỏ qua nếu đây là điều hướng nội bộ
    }
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const newStack = [];
    let currentAccumulatedPath = '';
    //Check module
    if (pathSegments.length === 0 || pathSegments[0].toLowerCase() !== selectedmodule) {
      setStackedViews([]);
      setCurrentSupportedViewTypes([]);
      setCurrentViewType('list');
      return;
    }

    for (let i = 1; i < pathSegments.length; i++) {
      let currentSegment = pathSegments[i];
      let nextSegment = pathSegments[i + 1];
      currentAccumulatedPath += `/${currentSegment}`;
      let ComponentToRender = null;
      let id = null;
      let viewType = null; // Ví dụ: 'list', 'kanban', 'chart'
      let resourceName = null

      // Nếu segment có dấu chấm → luôn có ID → chỉ tạo tab chi tiết
      if (currentSegment.includes('.') && nextSegment && objectComponentMap[currentSegment]) {
        resourceName = currentSegment;
        viewType = "Default";
        id = nextSegment;
        ComponentToRender = (nextSegment === "new") ? objectComponentMap[resolveComponentKey(currentSegment, "new")] : objectComponentMap[currentSegment];
        currentAccumulatedPath += `/${id}`;
        i++;
      }
      // Nếu segment không có dấu chấm và có ID → tạo 2 tab: list và detail
      else if (nextSegment && objectComponentMap[resolveComponentKey(currentSegment, "detail")]) {
        let listKey = `tab${newStack.length + 1}-${currentSegment}-list`;
        if (!newStack.some(v => v.key === listKey)) {
          newStack.push({
            key: listKey,
            path: `/${selectedmodule}${currentAccumulatedPath}`,
            Component: objectComponentMap[resolveComponentKey(currentSegment, "list")],
            props: { resourceName: currentSegment, viewType: "Default" }
          });
        }
        resourceName = resolveComponentKey(currentSegment, "detail");
        viewType = "Default";
        id = nextSegment;
        ComponentToRender = (nextSegment === "new") ? objectComponentMap[resolveComponentKey(currentSegment, "new")] : objectComponentMap[resolveComponentKey(currentSegment, "detail")];
        currentAccumulatedPath += `/${id}`;
        i++;
      }
      // Nếu không có ID → chỉ tạo tab danh sách
      else if (objectComponentMap[resolveComponentKey(currentSegment, "list")]) {
        resourceName = resolveComponentKey(currentSegment, "list");
        viewType = "Default";
        ComponentToRender = objectComponentMap[resourceName];
      }

      // Tạo tab nếu chưa tồn tại
      if (ComponentToRender) {
        const key = `tab${newStack.length + 1}-${id ? `${resourceName}-${id}` : `${resourceName}-list`}`;
        const propName = id
          ? resourceName.includes('.')
            ? resourceName.split('.')[0] + 'Id'
            : resourceName + 'Id'
          : undefined;

        newStack.push({
          key,
          path: `/${selectedmodule}${currentAccumulatedPath}`,
          Component: ComponentToRender,
          props: {
            ...(id ? { [propName]: id } : {}),
            viewType,
            resourceName
          }
        });
      }
    }
    setStackedViews(newStack);
    // console.log(newStack);
  }, [location.pathname, selectedmodule, currentViewType, handleSupportedViewTypesChange]);

  useEffect(() => {
    parseUrlToStackedViews();
  }, [parseUrlToStackedViews]);

  // Hàm đóng một lớp trong stack và điều hướng về lớp trước đó
  const handleCloseView = useCallback((closedViewKey) => {
    console.log(closedViewKey);
    const indexToClose = stackedViews.findIndex(view => view.key === closedViewKey);
    if (indexToClose !== -1) {
      const remainingStack = stackedViews.slice(0, indexToClose);
      if (remainingStack.length > 0) {
        isInternalNavigation.current = true;
        navigate(remainingStack[remainingStack.length - 1].path);
      } else {
        const basePath = location.pathname.split('/').filter(Boolean)[0];
        isInternalNavigation.current = true;
        navigate(`/${basePath}`); // Về danh sách
      }
    }
  }, [stackedViews, navigate]);

  const backToTab = useCallback((targetTabKey) => {
    const targetIndex = stackedViews.findIndex(view => view.key === targetTabKey);
    if (targetIndex !== -1) {
      // Cắt ngắn stack để chỉ giữ lại các tab đến targetIndex
      const newStackedViews = stackedViews.slice(0, targetIndex + 1);
      setStackedViews(newStackedViews);

      // Đặt cờ trước khi điều hướng để parseUrlToStackedViews không chạy lại
      isInternalNavigation.current = true;
      navigate(newStackedViews[targetIndex].path);
      setShowHiddenTabsDropdown(false)
    }
  }, [stackedViews, navigate]);

  const handleNewStack = useCallback((resourceSegment, id = null, type = 'detail') => {
    let componentKey;
    if (id === 'new') {
      componentKey = resolveComponentKey(resourceSegment, 'new');
    } else {
      componentKey = resolveComponentKey(resourceSegment, type);
    }

    const ComponentToRender = objectComponentMap[componentKey];

    if (!ComponentToRender) {
      console.error(`Component for key "${componentKey}" not found.`);
      return;
    }

    const newPathSegment = id ? `${resourceSegment}/${id}` : resourceSegment;
    const newPath = `/${selectedmodule}/${newPathSegment}`;

    const currentStackCopy = [...stackedViews];

    const idPropName = id
      ? resourceSegment.includes('.')
        ? resourceSegment.split('.')[0] + 'Id'
        : resourceSegment + 'Id'
      : undefined;

    const newView = {
      key: `tab-${resourceSegment}-${id || 'list'}-${currentStackCopy.length + 1}`,
      path: newPath,
      Component: ComponentToRender,
      props: {
        ...(id ? { [idPropName]: id } : {}),
        currentViewType: currentViewType,
        resourceName: resourceSegment,
      }
    };
    // Cập nhật stackedViews ngay lập tức
    const updatedStack = [...currentStackCopy, newView];
    setStackedViews(updatedStack);
    // --- ĐẶT CỜ TRƯỚC KHI NAVIGATE NỘI BỘ ---
    isInternalNavigation.current = true;
    navigate(newPath);
    // console.log(newView);
  }, [stackedViews, navigate, selectedmodule, currentViewType, handleSupportedViewTypesChange, handleCloseView]);

  const visibleTabs = stackedViews.slice(Math.max(0, stackedViews.length - MAX_VISIBLE_TABS));
  const breadcrumbTabs = visibleTabs.slice(0, visibleTabs.length - 1)
  const hiddenTabs = stackedViews.slice(0, Math.max(0, stackedViews.length - MAX_VISIBLE_TABS));
  const currentTab = stackedViews[stackedViews.length - 1] || '';

  return (
    <div className='stackview-container'>
      <Outlet />
      {/* Tab Navigation */}
      <div className='control-panel'>
        <div className='left-section'>
          <div className='action-button'>
            <button
              onClick={() => {
                if (stackedViews.length > 1) { // Nếu có ít nhất 2 tab, quay về tab trước đó
                  backToTab(stackedViews[stackedViews.length - 2].key);
                } else if (stackedViews.length === 1) { // Nếu chỉ có 1 tab (base view), đóng nó (về gốc module)
                  // Logic để đóng hoàn toàn view nếu cần
                  navigate(`/${selectedmodule}`); // Ví dụ: về trang chủ module
                }
              }}
              className="button back-button" // Sử dụng class button từ StackView.css
              title='Back'
              disabled={stackedViews.length <= 1} // Vô hiệu hóa nút khi không có gì để quay lại
            >
              <LucideIcons.Undo2 size={16} />
            </button>
          </div>
          {/* Breadcrumb section*/}
          <div className='breadcrumb-section'>
            <ul className='breadcrumb-list'> {/* Đổi tên class cho rõ ràng */}
              {hiddenTabs.length > 0 && (
                <>
                  <li className='breadcrumb-item breadcrumb-ellipsis-item'>
                    <button
                      onClick={() => {
                        setShowHiddenTabsDropdown(!showHiddenTabsDropdown);
                        console.log(showHiddenTabsDropdown);
                      }}
                      className="button ellipsis-button" // Sử dụng class button
                      title="Xem các tab ẩn"
                    >
                      <LucideIcons.Ellipsis size={14} />
                    </button>

                    {showHiddenTabsDropdown && (
                      <div className="hidden-tabs-dropdown"> {/* Bỏ style inline */}
                        {hiddenTabs.slice().reverse().map(tab => (
                          <button
                            key={tab.key}
                            onClick={() => {
                              backToTab(tab.key);
                              setShowHiddenTabsDropdown(false); // Đóng dropdown sau khi chọn
                            }}
                            className="dropdown-tab-item" // Bỏ style inline
                          >
                            {tab.props?.resourceName} {tab.props?.productId || tab.props?.poId || ''}
                          </button>
                        ))}
                      </div>
                    )}
                  </li>
                  <span className="breadcrumb-separator"> / </span>
                </>
              )}

              {/* Các tab hiển thị trong breadcrumb (trừ tab hiện tại) */}
              {breadcrumbTabs.map((tab) => (
                <React.Fragment key={tab.key}> {/* Dùng tab.key cho key, không dùng index */}
                  <li
                    onClick={() => { backToTab(tab.key); }}
                    className="breadcrumb-item breadcrumb-link-item" // Class riêng cho item có thể click
                  >
                    {tab.props?.resourceName} {tab.props?.productId || tab.props?.poId || ''}
                  </li>
                  <span className="breadcrumb-separator">/</span>
                </React.Fragment>
              ))}

              {/* Tab hiện tại - hiển thị luôn, không click được (thường là vậy) */}
              {currentTab && (
                <li className="breadcrumb-item breadcrumb-current-item"> {/* Class riêng cho tab hiện tại */}
                  {currentTab.props?.resourceName} {currentTab.props?.productId || currentTab.props?.poId || ''}
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Phần giữa: Ô tìm kiếm */}
        <div className='middle-section'>
          <input
            type="text"
            placeholder="Search..."
            className="search-input form-input" // Thêm form-input để dùng style chung
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>

        {/* Phần bên phải: Bộ chọn kiểu hiển thị */}
        <div className='right-section view-type-selector'>
          {/* {currentSupportedViewTypes.map((viewTypeOption) => {
            const Icon = LucideIcons[viewTypeOption.icon] || LucideIcons.Box;
            return (
              <button
                key={viewTypeOption.viewtype}
                onClick={() => handleCurrentViewTypeChange(viewTypeOption.viewtype)}
                className={`button view-type-button ${currentViewType === viewTypeOption.viewtype ? 'active' : ''}`} // Thêm class button
                title={viewTypeOption.label}
              >
                <Icon size={14} />
              </button>
            );
          })} */}
        </div>
      </div>
      <div className="stackview-page">
          {/* Render các stacked views dưới dạng Modals */}
      {stackedViews.map((view, index) => {
        const Component = view.Component;
        const isTopMost = index === stackedViews.length - 1;
        return (
          <StackedViewModal
            className='stackview-component'
            key={view.key}
            isOpen={true} // Luôn mở nếu nó nằm trong stack
            style={{
              zIndex: 100 + index,
              visibility: isTopMost ? 'visible' : 'hidden',
              pointerEvents: isTopMost ? 'auto' : 'none',
            }} // Tạo hiệu ứng xếp chồng
          >
            <Component
              {...view.props}
              onCloseSelf={() => handleCloseView(view.key)}
              // onSupportedViewTypesChange={handleSupportedViewTypesChange}
              onOpenNewStack={handleNewStack}
              searchTerm={isTopMost ? searchTerm : ""}
            />
          </StackedViewModal>
        )
      })}
      </div>
      
    </div>
  );
};

export default StackedViewContainer;