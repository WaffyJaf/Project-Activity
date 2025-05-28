import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../type/user';

interface MenuItem {
  path: string;
  label: string;
  allowedRoles: UserRole[];
  icon: string;
  subMenu?: SubMenuItem[];
}

interface SubMenuItem {
  path: string;
  label: string;
  allowedRoles: UserRole[];
  icon?: string;
}

const Sidebar: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleUserClick = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const handleDropdownClose = () => {
    setIsDropdownOpen(false);
  };

  const handleLogout = () => {
    logout();
    handleDropdownClose();
    navigate('/login');
  };

  const menuItems: MenuItem[] = [
    {
      path: '/',
      label: 'หน้าแรก',
      allowedRoles: ['organizer'],
      icon: 'fa-solid fa-clipboard-list',
    },
    {
      path: '/projectrecord',
      label: 'บันทึกชั่วโมง',
      allowedRoles: ['admin', 'organizer'],
      icon: 'fa-solid fa-clock',
    },
    {
      path: '/record',
      label: 'สรุปประเมิน',
      allowedRoles: ['admin', 'organizer'],
      icon: 'fa-solid fa-file-lines',
    },
    {
      path: '/adminrole',
      label: 'กำหนด Role',
      allowedRoles: ['admin', 'organizer'],
      icon: 'fa-solid fa-user-shield',
    },
    {
      path: '/petition',
      label: 'คำร้อง',
      allowedRoles: ['admin', 'organizer'],
      icon: 'fa-solid fa-comments',
      subMenu: [
        { path: '/projectstatus', label: 'ยื่นคำร้อง', allowedRoles: ['organizer'], icon: 'fa-solid fa-inbox' },
        { path: '/adminrole', label: 'ตรวจสอบคำร้อง', allowedRoles: ['organizer'], icon: 'fa-solid fa-bars' },
        { path: '/projectstatus', label: 'คำร้องเปิดโครงการ', allowedRoles: ['admin'], icon: 'fa-solid fa-inbox' },
        { path: '/changerole', label: 'คำร้องขอเป็นผู้จัดกิจกรรม', allowedRoles: ['admin'], icon: 'fa-solid fa-check' },
      ],
    },
  ];

  return (
    <>
      {/* Top-right icons */}
      {currentUser && (
        <div className="fixed top-2 right-2 z-50">
          {/* User Dropdown ข้อมูลผู้ใช้ */}
          <div className="relative inline-block">
            <button
              onClick={handleUserClick}
              className=" text-purple-800 hover:text-purple-900 focus:outline-none transition-colors duration-200"
              aria-label="User Profile"
            >
              <i className="fa-solid fa-circle-user text-5xl"></i>
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 transform transition-all duration-300 ease-in-out">
                {/* Header ส่วนข้อมูลผู้ใช้ */}
                <div className="p-6 border-b border-gray-100">
                  <span className="text-lg font-semibold text-purple-800 mb-3 ml-25">ข้อมูลผู้ใช้</span>
                  <div className="space-y-4 mt-3">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium text-gray-800">รหัสนิสิต:</span>{' '}
                      <span className="text-gray-900">{currentUser.ms_id}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium text-gray-800">ชื่อผู้ใช้:</span>{' '}
                      <span className="text-gray-900">{currentUser.displayName}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium text-gray-800">ตำแหน่ง:</span>{' '}
                      <span className="text-gray-900">{currentUser.jobTitle}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium text-gray-800">หน่วยงาน:</span>{' '}
                      <span className="text-gray-900">{currentUser.department}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium text-green-600">Role:</span>{' '}
                      <span className="text-gray-900">{currentUser.role}</span>
                    </p>
                  </div>
                </div>

                {/* ปุ่มออกจากระบบ */}
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-6 py-4 text-sm text-gray-700 hover:bg-gray-50 hover:text-purple-700 focus:outline-none transition-colors duration-200 rounded-b-xl flex items-center"
                >
                  <i className="fa-solid fa-sign-out-alt mr-2 text-gray-500"></i>
                  ออกจากระบบ
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div className="fixed top-0 left-0 h-screen w-64 bg-purple-800 text-white shadow-lg z-40">
        {/* Header/Logo */}
        <div className="px-4 py-3 flex items-center border-b border-purple-700">
          <Link to="/" className="no-underline" style={{ textDecoration: 'none' }}>
            <img src="/logoup.png" alt="logo" className="w-16 h-14" />
          </Link>
          <span className="text-2xl ml-2 font-bold text-white">MENU</span>
        </div>

        {/* Menu Items */}
        <ul className="mt-6 px-2">
          {currentUser ? (
            menuItems.map((item) =>
              item.allowedRoles.includes(currentUser.role) ? (
                <li key={item.path} className="relative group mb-2">
                  <Link
                    to={item.path}
                    className="flex items-center justify-between text-xl font-medium text-white py-4 px-4 rounded-md hover:bg-purple-950 transition-colors duration-200 no-underline"
                    style={{ textDecoration: 'none' }}
                  >
                    <div className="flex items-center">
                      <i className={`${item.icon} mr-3`}></i>
                      <span>{item.label}</span>
                    </div>
                    {item.subMenu && (
                      <i className="fa-solid fa-angle-right text-sm"></i>
                    )}
                  </Link>
                  
                  {item.subMenu && (
                    <ul className="hidden group-hover:block absolute left-full top-0 bg-purple-800 shadow-lg rounded-md p-2 w-53 z-40">
                      {item.subMenu.map((subItem) =>
                        subItem.allowedRoles.includes(currentUser.role) ? (
                          <li key={subItem.path}>
                            <Link
                              to={subItem.path}
                              className="flex items-center py-2 px-2 text-white hover:bg-purple-950 rounded-md transition-colors duration-200 no-underline"
                              style={{ textDecoration: 'none' }}
                            >
                              <i className={`${subItem.icon} mr-3`}></i>
                              <span>{subItem.label}</span>
                            </Link>
                          </li>
                        ) : null
                      )}
                    </ul>
                  )}
                </li>
              ) : null
            )
          ) : (
            <li className="mb-2">
              <Link
                to="/login"
                className="flex items-center text-xl font-medium text-white py-3 px-4 rounded-md hover:bg-purple-700 transition-colors duration-200 no-underline"
                style={{ textDecoration: 'none' }}
              >
                <i className="fa-solid fa-sign-in-alt mr-3"></i>
                <span>Login</span>
              </Link>
            </li>
          )}
        </ul>
      </div>

      {/* Main content area with padding to accommodate sidebar */}
      <div className="ml-64">
        {/* Your page content goes here */}
      </div>
    </>
  );
};

export default Sidebar;