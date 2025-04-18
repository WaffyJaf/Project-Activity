import React from 'react';
import { useAuth } from '../context/AuthContext';

const UserInfoModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { currentUser } = useAuth();

  if (!isOpen || !currentUser) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="max-w-xl mx-auto p-6 bg-white shadow-lg rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-800">ข้อมูลผู้ใช้</h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800 focus:outline-none"
          >
            <i className="fa-solid fa-times text-xl"></i>
          </button>
        </div>
        <p className="text-lg text-gray-600 mb-6">
          MS_ID: <span className="font-medium text-gray-900">{currentUser.ms_id}</span>
        </p>
        <p className="text-lg text-gray-600 mb-6">
          ชื่อ: <span className="font-medium text-gray-900">{currentUser.displayName}</span>
        </p>
      </div>
    </div>
  );
};

export default UserInfoModal;