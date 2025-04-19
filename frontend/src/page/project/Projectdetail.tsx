import React, { useEffect, useState, useRef } from "react";
import { fetchProjectByID, Project } from "../../api/projectget";
import { FormPost, uploadImage, submitFormToAPI } from "../../api/createpost";
import { useForm, SubmitHandler } from 'react-hook-form';
import { useParams, useNavigate,  } from "react-router-dom";
import Navbar from "../../component/navbar";
import Swal from 'sweetalert2';
import { motion } from 'framer-motion'; 
import { useAuth } from "../../context/AuthContext"; // Import AuthContext

function Projectdetail() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);  
  const [loading, setLoading] = useState<boolean>(true);  
  const [error, setError] = useState<string | null>(null);
  const [postStatus, setPostStatus] = useState<string>("");  
  const [showModal, setShowModal] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileToUpload = useRef<File | null>(null); 
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  
  // ใช้ AuthContext เพื่อเข้าถึงข้อมูล user ปัจจุบัน
  const { currentUser } = useAuth();
  
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { isSubmitting },
  } = useForm<FormPost>({
    defaultValues: {
      project_id: 0,
      post_content: "",
      imge_url: "",
      location_post: "",
      post_datetime: "",
      hour_post: 0,
    },
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];  
    if (file) {
      const objectUrl = URL.createObjectURL(file);  
      setImagePreview(objectUrl);  
      fileToUpload.current = file;  
    }
  };

  const handleUploadButtonClick = () => {
    fileInputRef.current?.click();  
  };

  const onSubmit: SubmitHandler<FormPost> = async (formData) => {
    try {
      
      if (project) {
        formData.project_id = Number(id);
        formData.post_content = project.project_description || "";
        formData.location_post = project.location || "";
        formData.post_datetime = project.project_datetime || "";
        formData.hour_post = project.hours || 0;
      }

      if (fileToUpload.current) {
        const imageUrl = await uploadImage(fileToUpload.current);
        if (imageUrl) {
          formData.imge_url = imageUrl;  
        } else {
          Swal.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาด',
            text: 'ไม่สามารถอัปโหลดรูปภาพได้ กรุณาลองใหม่ ❌',
            confirmButtonText: 'ตกลง',
            confirmButtonColor: '#9333ea',
          });
          return;
        }
      }

      const result = await submitFormToAPI(formData);

      if (result.success) {
        Swal.fire({
          icon: 'success',
          title: 'สำเร็จ!',
          text: 'โพสต์ถูกบันทึกสำเร็จ! 🎉',
          confirmButtonText: 'ตกลง',
          confirmButtonColor: '#9333ea',
        }).then((result) => {
          if (result.isConfirmed) {
            reset(); 
            setImagePreview(null);  
            fileToUpload.current = null;  
            setShowModal(false);
            navigate('/Eventlist');
          }
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: 'เกิดข้อผิดพลาดในการบันทึกโพสต์ ❌',
          confirmButtonText: 'ตกลง',
          confirmButtonColor: '#9333ea',
        });
      }
    } catch (error) {
      console.error("Error:", error);
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'เกิดข้อผิดพลาด กรุณาลองใหม่ ❌',
        confirmButtonText: 'ตกลง',
        confirmButtonColor: '#9333ea',
      });
    }
  };

  function getStatusClass(status: string): string {
    if (status === 'approved') return 'bg-green-100 text-green-800 border-green-300';
    if (status === 'rejected') return 'bg-red-100 text-red-800 border-red-300';
    if (status === 'pending') return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-gray-100 text-gray-800 border-gray-300';
  }

  useEffect(() => {
    async function getProjectDetail() {
      setLoading(true);  
      try {
        const data = await fetchProjectByID(id);  
        setProject(data);
        setPostStatus(data.project_status);  
      } catch (err) {
        setError("ไม่สามารถดึงข้อมูลโครงการได้");  
      } finally {
        setLoading(false);  
      }
    }

    if (id) {
      getProjectDetail();  
    }
  }, [id]);

  const handlePostClick = () => {
    console.log("Current status:", postStatus); 
    if (postStatus !== "approved") {
      setWarningMessage("โครงการนี้ยังไม่ได้รับการอนุมัติ ❌");
      console.log("Setting warning modal to true"); 
    } else {
      // Pre-fill the post_content with project description when opening the modal
      if (project && project.project_description) {
        setValue("post_content", project.project_description);
      }
      setShowModal(true);
    }
  };

  // ตรวจสอบว่าผู้ใช้ปัจจุบันเป็น admin หรือไม่
  const isAdmin = currentUser?.role === "admin";

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white ml-60">
      <Navbar />
      <div className="container mx-auto px-6 py-12 flex flex-col items-center pl-5">
        <motion.span 
          className="text-3xl font-extrabold text-purple-900 mb-12 drop-shadow-lg"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          รายละเอียดโครงการ
        </motion.span>

        {loading && (
          <motion.p
            className="text-xl text-gray-600 animate-pulse"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            กำลังโหลดข้อมูล...
          </motion.p>
        )}
        {error && (
          <motion.p
            className="text-red-600 bg-red-50 p-4 rounded-lg shadow-md text-base"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            {error}
          </motion.p>
        )}

        {project && (
          <motion.div
            className="w-full max-w-4xl bg-white rounded-3xl shadow-xl p-5"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <span className="text-2xl font-extrabold text-green-700 ml-90 py-3.5">{project.project_name}</span>
            <div className="space-y-4 text-gray-700 text-base">
              <p><strong>รหัสโครงการ:</strong> {project.project_id}</p>
              <p>
                <strong>สถานะ:</strong> 
                <span className={`inline-block py-1 px-3 rounded-full border ${getStatusClass(project.project_status)}`}>
                  {project.project_status}
                </span>
                <i className="fa-solid fa-eye ml-2 text-gray-600">  ดูรายละเอียด</i>
              </p>
              <p><strong>หน่วยงาน/คณะ:</strong> {project.department}</p>
              <p><strong>สถานที่:</strong> {project.location}</p>
              <p><strong>งบประมาณ:</strong> {project.budget}</p>
              <p><strong>จำนวนชั่วโมงที่ได้รับ:</strong> {project.hours}</p>
              <p><strong>วัน เวลา ที่จัดกิจกรรม:</strong> {new Date(project.project_datetime).toLocaleString('th-TH')}</p>
              <p><strong>รายละเอียด:</strong> {project.project_description}</p>
            </div>

            {/* ซ่อนปุ่มโพสต์กิจกรรมเมื่อ user เป็น admin */}
            {!isAdmin && (
              <motion.button
                onClick={handlePostClick}
                className="mt-8 bg-green-700 text-white py-2 px-3 rounded hover:bg-green-900 transition-colors duration-300 shadow-md font-semibold ml-50"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                โพสต์กิจกรรม
                <i className="fa-solid fa-arrow-up-from-bracket ml-2 text-white text-lg"></i>
              </motion.button>
            )}

            {warningMessage && (
              <motion.p
                className="text-red-600 mt-4 text-center text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {warningMessage}
              </motion.p>
            )}
          </motion.div>
        )}
      </div>

      {showModal && postStatus === "approved" && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-[1000]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="bg-white p-8 rounded-2xl w-[95%] py-15 max-w-3xl shadow-2xl max-h-[90vh] overflow-y-auto relative"
            initial={{ scale: 0.8, y: -50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: -50 }}
            transition={{ duration: 0.4 }}
          >
            <button
              type="button"
              className="absolute top-4 right-5 text-xl text-gray-500 hover:text-gray-800 transition-colors"
              onClick={() => setShowModal(false)}
              aria-label="Close Modal"
            >
              ×
            </button>
            <h2 className="text-xl font-bold text-purple-800 mb-6 pb-3 border-b border-purple-100">สร้างโพสต์กิจกรรม</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-sm">
                  เนื้อหากิจกรรม
                </label>
                <div className="w-full min-h-[160px] p-3 border border-gray-300 rounded-lg text-sm bg-gray-50">
                  {project?.project_description}
                  <input 
                    type="hidden" 
                    {...register("post_content")} 
                    value={project?.project_description || ""} 
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-sm">สถานที่จัดกิจกรรม</label>
                <div className="w-full p-3 border border-gray-300 rounded-lg text-sm bg-gray-50">
                  {project?.location || "-"}
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-sm">วันและเวลา</label>
                <div className="w-full p-3 border border-gray-300 rounded-lg text-sm bg-gray-50">
                  {project?.project_datetime ? new Date(project.project_datetime).toLocaleString('th-TH') : "-"}
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-sm">จำนวนชั่วโมงที่ได้รับ</label>
                <div className="w-full p-3 border border-gray-300 rounded-lg text-sm bg-gray-50">
                  {project?.hours || "-"} ชั่วโมง
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-sm">อัพโหลดรูปภาพ</label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
                <motion.button
                  type="button"
                  onClick={handleUploadButtonClick}
                  className="mb-4 text-gray-600 py-2 px-3 rounded hover:bg-gray-300 transition-colors duration-300 bg-gray-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  เลือกไฟล์
                </motion.button>
                <input type="hidden" {...register('imge_url')} />

                <div className="mt-4 text-sm text-gray-600">
                  {fileToUpload.current ? `File: ${fileToUpload.current.name}` : 'No file selected'}
                </div>

                {imagePreview && (
                  <motion.div
                    className="mt-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-w-full max-h-48 rounded-lg shadow-md"
                    />
                  </motion.div>
                )}
              </div>

              <motion.button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 bg-green-700 text-white rounded-lg font-semibold text-sm hover:bg-green-900 transition-colors shadow-md ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : ''}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกโพสต์'}
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

export default Projectdetail;