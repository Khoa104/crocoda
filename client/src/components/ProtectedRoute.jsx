// src/components/ProtectedRoute.jsx
import React, { useContext } from "react";
import { Navigate, Outlet, useLocation, matchPath } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import '../styles/ProtectedRoute.css'; // File CSS riêng cho spinner
import NoPermission from "../pages/auth/NoPermission";

const ProtectedRoute = ({ requiredModule, requiredResource }) => { // Giữ nguyên props ban đầu của bạn
    // GIỮ NGUYÊN TÊN BIẾN GỐC CỦA BẠN
    const { accessToken, loading, modules, resources, resourcesList } = useContext(AuthContext);
    const location = useLocation();

    // 1. Hiển thị spinner khi dữ liệu xác thực đang được tải
    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p className="loading-text">Loading, please wait...</p>
            </div>
        );
    }

    // 2. Nếu không được xác thực (không có accessToken) sau khi tải xong, chuyển hướng đến trang login
    if (!accessToken) {
        // Đã thay đổi: Sử dụng 'replace' và 'state' để cải thiện UX
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    // 3. Đã xác thực - bây giờ kiểm tra quyền hạn nếu có tài nguyên khớp với đường dẫn hiện tại
    const currentPath = location.pathname;
    const matchedResource = resourcesList.find((r) =>
        // Đảm bảo r.path tồn tại và là chuỗi
        r.path && matchPath({ path: r.path, end: false }, currentPath)
    );

    if (matchedResource) {
        const { module_key, resource_name } = matchedResource;

        // Đảm bảo modules và resources là mảng trước khi kiểm tra
        // GIỮ NGUYÊN TÊN BIẾN GỐC CỦA BẠN
        const hasModule = Array.isArray(modules) && modules.includes(module_key);
        const hasResource = Array.isArray(resources) && resources.includes(resource_name);

        if (!hasModule || !hasResource) {
            console.log("Permission denied for:", currentPath, "Module:", module_key, "Resource:", resource_name);
            return <NoPermission />;
        }
    }
    
    // (Giữ lại phần code comment của bạn - nếu bạn có ý định dùng lại logic này sau)
    // if (requiredModule && (!modules || !modules.includes(requiredModule))) {
    //    return <NoPermission />;
    // }
    // if (requiredResource && (!resources || !resources.includes(requiredResource))) {
    //    return <NoPermission />;
    // }

    // Nếu không tìm thấy tài nguyên khớp hoặc quyền đã được cấp, render Outlet
    return <Outlet />;
};

export default ProtectedRoute;