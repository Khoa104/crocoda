
// Khóa chính trong localStorage để lưu tất cả cài đặt của các trang
const APP_SETTINGS_KEY = 'appPageSettings'; 

export const getStoredAppSettings = () => {
  try {
    const stored = localStorage.getItem(APP_SETTINGS_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error("Failed to load app settings from localStorage:", error);
    return {};
  }
};

// Hàm để lưu toàn bộ đối tượng cài đặt vào localStorage
export const saveStoredAppSettings = (settings) => {
  try {
    localStorage.setItem(APP_SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error("Failed to save app settings to localStorage:", error);
  }
};

// Hàm để lấy cài đặt cho một pageKey cụ thể
export const getPageSettings = (pageKey) => {
  const allSettings = getStoredAppSettings();
  return allSettings[pageKey] || {}; // Trả về đối tượng rỗng nếu pageKey không tìm thấy
};


// Hàm để cập nhật và lưu một cài đặt cụ thể cho một trang cụ thể
export const updatePageSetting = (pageKey, settingName, value) => {
  const allSettings = getStoredAppSettings();
  const pageSpecificSettings = allSettings[pageKey] || {};
  
  // Tạo một bản sao sâu cho các đối tượng hoặc mảng để tránh đột biến state trực tiếp
  let newValue = value;
  if (settingName === 'customViews' || settingName === 'columnSettings' || settingName === 'filters' || settingName === 'groups') {
    newValue = JSON.parse(JSON.stringify(value));
  }

  saveStoredAppSettings({
    ...allSettings,
    [pageKey]: {
      ...pageSpecificSettings,
      [settingName]: newValue
    }
  });
};

// Hàm để cập nhật và lưu ID của kiểu xem mặc định cho một trang
export const updatePageDefaultViewId = (pageKey, viewId) => {
  updatePageSetting(pageKey, 'defaultViewId', viewId);
};

// Hàm để hủy đặt ID kiểu xem mặc định cho một trang
export  const unsetPageDefaultViewId = (pageKey) => {
  const allSettings = getStoredAppSettings();
  const pageSpecificSettings = allSettings[pageKey] || {};
  const { defaultViewId, ...rest } = pageSpecificSettings; // Bỏ defaultViewId
  saveStoredAppSettings({
    ...allSettings,
    [pageKey]: rest
  });
};