import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../api/login';

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
}

const Navbar: React.FC = () => {
  const { currentUser, logout } = useAuth(); // ดึง currentUser และ logout จาก context
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // สถานะสำหรับควบคุม Dropdown

  const handleUserClick = () => {
    setIsDropdownOpen((prev) => !prev); // สลับสถานะ Dropdown (เปิด/ปิด)
  };

  const handleDropdownClose = () => {
    setIsDropdownOpen(false); // ปิด Dropdown
  };



  const menuItems: MenuItem[] = [
    {
      path: '/',
      label: 'โครงการ',
      allowedRoles: [ 'organizer'],
      icon: 'fa-solid fa-file',
      subMenu: [
        { path: '/createproject', label: 'เปิดโครงการ', allowedRoles: ['admin', 'organizer'] },
        { path: '/Projectlist', label: 'ประวัติเปิดโครงการ', allowedRoles: ['admin', 'organizer'] },
      ],
    },
    {
      path: '/Eventlist',
      label: 'Activity',
      allowedRoles: [ 'organizer'],
      icon: 'fa-solid fa-font-awesome',
    },
    {
      path: '/adminrole',
      label: 'บันทึกชั่วโมง',
      allowedRoles: ['admin', 'organizer'],
      icon: 'fa-solid fa-download',
    },
    {
      path: '/record',
      label: 'Record',
      allowedRoles: ['admin', 'organizer'],
      icon: 'fa-solid fa-bars',
      subMenu: [
        { path: '/registration-list', label: 'รายชื่อลงทะเบียน', allowedRoles: ['admin', 'organizer'] },
        { path: '/evaluation-summary', label: 'สรุปประเมิน', allowedRoles: ['admin', 'organizer'] },
        { path: '/search-history', label: 'ค้นหาประวัตินิสิต', allowedRoles: ['admin', 'organizer'] },
      ],
    },
    {
      path: '/',
      label: 'Admin',
      allowedRoles: ['admin'],
      icon: 'fa-solid fa-user-tie',
      subMenu: [
        { path: '/projectstatus', label: 'คำร้องเปิดโครงการ', allowedRoles: ['admin', 'organizer'] },
        { path: '/adminrole', label: 'กำหนด Role', allowedRoles: ['admin', 'organizer'] },
      ],
      
    },
  ];

  return (
    <>
      {/* Top-right icons */}
      {currentUser && (
        <div className="fixed top-2 right-2">
          <Link to="/Projectlist" className="text-3xl p-4 font-bold no-underline" style={{ textDecoration: 'none' }}>
            <i className="fa-solid fa-envelope text-sky-600 text-4xl"></i>
          </Link>

                {/* User Dropdown ข้อมูลผู้ใช้ */}
<div className="relative inline-block">
  <button
    onClick={handleUserClick}
    className="p-3 text-sky-600 hover:text-purple-900 focus:outline-none transition-colors duration-200"
    aria-label="User Profile"
  >
    <i className="fa-solid fa-circle-user text-4xl"></i>
  </button>

  {isDropdownOpen && (
    <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 transform transition-all duration-300 ease-in-out">
      {/* Header ส่วนข้อมูลผู้ใช้ */}
      <div className="p-6 border-b border-gray-100">
        <span className="text-lg font-semibold text-purple-800 mb-3 ml-25">ข้อมูลผู้ใช้</span>
        <div className="space-y-4 mt-3">
          <p className="text-sm text-gray-600 ">
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
        onClick={() => {
          logout();
          handleDropdownClose();
        }}
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
      <div className="fixed top-0 left-0 h-screen w-64 bg-sky-600 text-white shadow-lg p-4">
        <div className="flex items-center">
          <Link to="/" className="no-underline" style={{ textDecoration: 'none' }}>
            <img src="/logoup.png" alt="logo" className="w-24" />
          </Link>
          <span className="text-3xl ml-2 font-bold">MENU</span>
        </div>

        <ul className="mt-8">
          {currentUser ? (
            menuItems.map((item) =>
              item.allowedRoles.includes(currentUser.role) ? (
                <li key={item.path} className="relative group py-4">
                  <Link
                    to={item.path}
                    className="flex items-center text-xl font-bold text-white p-2 hover:bg-purple-950 no-underline"
                    style={{ textDecoration: 'none' }}
                  >
                    <i className={`${item.icon} mr-3`}></i> {item.label}
                    {item.subMenu && (
                      <i className="fa-solid fa-play absolute right-4 text-xs top-1/2 transform -translate-y-1/2"></i>
                    )}
                  </Link>
                  {item.subMenu && (
                    <ul className="hidden group-hover:block absolute left-full top-0 bg-purple-800 border border-purple-700 shadow-lg rounded-lg p-2 w-max transition-all duration-300">
                      {item.subMenu.map((subItem) =>
                        subItem.allowedRoles.includes(currentUser.role) ? (
                          <li key={subItem.path}>
                            <Link
                              to={subItem.path}
                              className="block p-2 text-white hover:bg-purple-950 rounded no-underline"
                              style={{ textDecoration: 'none' }}
                            >
                              {subItem.label}
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
            <li className="py-4">
              <Link
                to="/login"
                className="flex items-center text-xl font-bold text-white p-2 hover:bg-purple-950 no-underline"
                style={{ textDecoration: 'none' }}
              >
                <i className="fa-solid fa-sign-in-alt mr-3"></i> Login
              </Link>
            </li>
          )}
        </ul>
      </div>
    </>
  );
};

export default Navbar;