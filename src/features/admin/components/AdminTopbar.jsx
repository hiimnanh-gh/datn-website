import React from 'react';
import { useLocation } from 'react-router-dom';
import useTopbarStore from '../../../store/useTopbarStore';
import HeaderUserProfile from '../../../components/HeaderUserProfile';

/* ── Route → Page title mapping ─────────────────────────── */
const PAGE_META = {
  '/admin/dashboard':     { title: 'Tổng quan vận hành',        desc: 'Chỉ số thống kê & hiệu suất hệ thống thời gian thực' },
  '/admin/incidents':     { title: 'Lịch sử ca cấp cứu',        desc: 'Tra cứu & báo cáo chi tiết các ca cấp cứu' },
  '/admin/users':         { title: 'Quản lý Người dùng',        desc: 'Danh sách và phân quyền tài khoản người dùng' },
  '/admin/providers':     { title: 'Quản lý Đơn vị',            desc: 'Danh sách các đơn vị và nhà cung cấp dịch vụ' },
  '/admin/hospitals':     { title: 'Bệnh viện & TT Cấp cứu',    desc: 'Danh mục cơ sở y tế và bệnh viện tiếp nhận' },
  '/admin/service-types': { title: 'Loại dịch vụ',              desc: 'Cấu hình các loại phương tiện và dịch vụ y tế' },
  '/admin/files':         { title: 'Lưu trữ Tệp (MinIO)',       desc: 'Quản lý tệp tin và dữ liệu đính kèm hệ thống' },
  '/admin/profile':       { title: 'Hồ sơ cá nhân',             desc: 'Thông tin tài khoản và đổi mật khẩu quản trị' },
};

const AdminTopbar = ({ onMenuClick }) => {
  const location = useLocation();
  const pageMeta = PAGE_META[location.pathname] || { title: 'Quản trị hệ thống', desc: 'Trung tâm Quản trị SmartEMS' };
  const slot = useTopbarStore((s) => s.slot);

  return (
    <header className="h-16 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-sm flex justify-between items-center px-4 sm:px-6 w-full shrink-0">
      {/* ── LEFT: Mobile hamburger + Page Title ── */}
      <div className="flex items-center gap-3 min-w-0">
        <button 
          onClick={onMenuClick}
          className="md:hidden text-slate-300 hover:bg-slate-800 p-2 rounded-xl transition-colors shrink-0 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">menu</span>
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-slate-100 text-base sm:text-lg truncate">
              {pageMeta.title}
            </h1>
            {slot}
          </div>
          {pageMeta.desc && (
            <p className="text-xs text-slate-400 truncate hidden sm:block">
              {pageMeta.desc}
            </p>
          )}
        </div>
      </div>

      {/* ── RIGHT: User Profile Pill (No mock search / notifications) ── */}
      <div className="flex items-center gap-3">
        <HeaderUserProfile profilePath="/admin/profile" />
      </div>
    </header>
  );
};

export default AdminTopbar;
