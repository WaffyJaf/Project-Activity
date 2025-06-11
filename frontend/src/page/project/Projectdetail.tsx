import React, { useEffect, useState, useRef } from "react";
import { fetchProjectByID, Project } from "../../api/projectget";
import { FormPost, uploadImage, submitFormToAPI } from "../../api/createpost";
import { useForm, SubmitHandler } from 'react-hook-form';
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../component/navbar";
import Swal from 'sweetalert2';
import { motion } from 'framer-motion';
import { useAuth } from "../../context/AuthContext";

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
      ms_id: "",
      registration_start: "",
      registration_end: "",
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
      if (!currentUser?.ms_id) {
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่พบข้อมูลผู้ใช้ กรุณาล็อกอินใหม่ ❌',
          confirmButtonText: 'ตกลง',
          confirmButtonColor: '#7c3aed',
        });
        return;
      }

      if (project) {
        formData.project_id = Number(id);
        formData.post_content = project.project_description || "";
        formData.location_post = project.location || "";
        formData.post_datetime = project.project_datetime ? new Date(project.project_datetime).toISOString() : "";
        formData.hour_post = project.hours || 0;
        formData.ms_id = currentUser.ms_id;
      }

      // Validate registration period
      if (formData.registration_start && formData.registration_end) {
        const start = new Date(formData.registration_start);
        const end = new Date(formData.registration_end);
        if (start >= end) {
          Swal.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาด',
            text: 'วันที่เริ่มลงทะเบียนต้องมาก่อนวันที่สิ้นสุด ❌',
            confirmButtonText: 'ตกลง',
            confirmButtonColor: '#7c3aed',
          });
          return;
        }
        if (start < new Date()) {
          Swal.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาด',
            text: 'วันที่เริ่มลงทะเบียนต้องอยู่ในอนาคต ❌',
            confirmButtonText: 'ตกลง',
            confirmButtonColor: '#7c3aed',
          });
          return;
        }
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
            confirmButtonColor: '#7c3aed',
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
          confirmButtonColor: '#7c3aed',
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
          text: result.message || 'เกิดข้อผิดพลาดในการบันทึกโพสต์ ❌',
          confirmButtonText: 'ตกลง',
          confirmButtonColor: '#7c3aed',
        });
      }
    } catch (error) {
      console.error("Error:", error);
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'เกิดข้อผิดพลาด กรุณาลองใหม่ ❌',
        confirmButtonText: 'ตกลง',
        confirmButtonColor: '#7c3aed',
      });
    }
  };

  function getStatusClass(status: string): string {
    if (status === 'approved') return 'bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border border-emerald-200 shadow-sm';
    if (status === 'rejected') return 'bg-gradient-to-r from-red-50 to-rose-50 text-red-700 border border-red-200 shadow-sm';
    if (status === 'pending') return 'bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-700 border border-amber-200 shadow-sm';
    return 'bg-gradient-to-r from-gray-50 to-slate-50 text-gray-700 border border-gray-200 shadow-sm';
  }

  function getStatusIcon(status: string): string {
    if (status === 'approved') return 'fa-check-circle text-emerald-600';
    if (status === 'rejected') return 'fa-times-circle text-red-600';
    if (status === 'pending') return 'fa-clock text-amber-600';
    return 'fa-question-circle text-gray-600';
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
    if (postStatus !== "approved") {
      setWarningMessage("โครงการนี้ยังไม่ได้รับการอนุมัติ ❌");
    } else {
      if (project && project.project_description) {
        setValue("post_content", project.project_description);
      }
      setShowModal(true);
    }
  };

  const isAdmin = currentUser?.role === "admin";

  return (
    <div className="min-h-screen bg-gradient-to-br  mt-20 ml-50">
      <Navbar />
      
      {/* Hero Section with Academic Look */}
      

      <div className="max-w-6xl mx-auto px-6 lg:px-8 -mt-8 relative z-10">
        {loading && (
          <motion.div
            className="bg-white rounded-2xl shadow-lg p-8 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="flex items-center justify-center space-x-3">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent"></div>
              <span className="text-lg text-gray-600">กำลังโหลดข้อมูล...</span>
            </div>
          </motion.div>
        )}

        {error && (
          <motion.div
            className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="flex items-center space-x-3">
              <i className="fa-solid fa-exclamation-triangle text-red-500 text-xl"></i>
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </motion.div>
        )}

        {project && (
          <motion.div
            className="bg-white rounded-xl shadow-xl overflow-hidden mb-8"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Project Header */}
            <div className=" bg-purple-800 px-8 py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">{project.project_name}</h2>
                  <div className="flex items-center space-x-4 text-indigo-100">
                    <span className="flex items-center space-x-2">
                      <span>รหัสโครงการ: {project.project_id}</span>
                    </span>
                    <span className="flex items-center space-x-2">
                      <i className="fa-solid fa-building"></i>
                      <span>{project.department}</span>
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full font-medium ${getStatusClass(project.project_status)}`}>
                    <i className={`fa-solid ${getStatusIcon(project.project_status)}`}></i>
                    <span className="capitalize">{project.project_status}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Project Details Grid */}
            <div className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50  p-6 border border-blue-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <i className="fa-solid fa-info-circle text-blue-600 mr-3"></i>
                      ข้อมูลพื้นฐาน
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <i className="fa-solid fa-map-marker-alt text-gray-500 mt-1"></i>
                        <div>
                          <span className="text-sm font-medium text-gray-600">สถานที่</span>
                          <p className="text-gray-800">{project.location}</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <i className="fa-solid fa-dollar-sign text-gray-500 mt-1"></i>
                        <div>
                          <span className="text-sm font-medium text-gray-600">งบประมาณ</span>
                          <p className="text-gray-800 font-semibold">{project.budget}</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <i className="fa-solid fa-clock text-gray-500 mt-1"></i>
                        <div>
                          <span className="text-sm font-medium text-gray-600">จำนวนชั่วโมง</span>
                          <p className="text-gray-800 font-semibold">{project.hours} ชั่วโมง</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-emerald-50  p-6 border border-green-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <i className="fa-solid fa-calendar-alt text-green-600 mr-3"></i>
                      กำหนดการ
                    </h3>
                    <div className="bg-white rounded-lg p-4 border border-green-200">
                      <p className="text-gray-800 font-medium">
                        {new Date(project.project_datetime).toLocaleString('th-TH', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-purple-50 to-violet-50  p-6 border border-purple-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <i className="fa-solid fa-file-text text-purple-600 mr-3"></i>
                      รายละเอียดโครงการ
                    </h3>
                    <div className="bg-white rounded-lg p-4 border border-purple-200 max-h-64 overflow-y-auto">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {project.project_description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              {!isAdmin && (
                <motion.div 
                  className="mt-8 flex justify-center "
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <motion.button
                    onClick={handlePostClick}
                    className="bg-gradient-to-r   from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-4 px-8  shadow-lg transition-all duration-300 flex items-center space-x-3"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <i className="fa-solid fa-paper-plane text-lg "></i>
                    <span>โพสต์กิจกรรม</span>
                  </motion.button>
                </motion.div>
              )}

              {warningMessage && (
                <motion.div
                  className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div className="flex items-center space-x-3">
                    <i className="fa-solid fa-exclamation-triangle text-red-500"></i>
                    <p className="text-red-700 font-medium">{warningMessage}</p>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Enhanced Modal */}
      {showModal && postStatus === "approved" && (
        <motion.div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl max-h-[90vh] overflow-hidden"
            initial={{ scale: 0.9, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 30 }}
            transition={{ type: "spring", damping: 20 }}
          >
            {/* Modal Header */}
            <div className=" bg-purple-700 px-8 py-6 relative">
              <button
                type="button"
                className="absolute top-4 right-6 text-white/80 hover:text-white text-2xl transition-colors"
                onClick={() => setShowModal(false)}
              >
                <i className="fa-solid fa-times"></i>
              </button>
              <h2 className="text-2xl font-bold text-white flex items-center">
                <i className="fa-solid fa-plus-circle mr-3"></i>
                สร้างโพสต์กิจกรรม
              </h2>
              <p className="text-indigo-100 mt-2">กรอกข้อมูลเพื่อเผยแพร่กิจกรรมสู่สาธารณะ</p>
            </div>

            {/* Modal Body */}
            <div className="p-8 overflow-y-auto max-h-[calc(90vh-120px)]">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* Content Preview */}
                <div className="bg-gradient-to-r from-gray-100 to-indigo-50 rounded-xl p-6 border border-blue-100">
                  <label className=" text-gray-800 font-semibold mb-4 flex items-center">
                    <i className="fa-solid fa-file-text text-blue-600 mr-2"></i>
                    เนื้อหากิจกรรม
                  </label>
                  <div className="bg-white rounded-lg p-4 border border-blue-200 min-h-32 max-h-48 overflow-y-auto">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {project?.project_description}
                    </p>
                    <input
                      type="hidden"
                      {...register("post_content")}
                      value={project?.project_description || ""}
                    />
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-100 rounded-xl p-6 border border-green-100">
                    <label className=" text-gray-800 font-semibold mb-3 flex items-center">
                      <i className="fa-solid fa-map-marker-alt text-green-600 mr-2"></i>
                      สถานที่จัดกิจกรรม
                    </label>
                    <div className="bg-white rounded-lg p-4 border border-green-200">
                      <p className="text-gray-700">{project?.location || "-"}</p>
                    </div>
                  </div>

                  <div className="bg-gray-100 rounded-xl p-6 border border-purple-100">
                    <label className=" text-gray-800 font-semibold mb-3 flex items-center">
                      <i className="fa-solid fa-clock text-purple-600 mr-2"></i>
                      จำนวนชั่วโมงที่ได้รับ
                    </label>
                    <div className="bg-white rounded-lg p-4 border border-purple-200">
                      <p className="text-gray-700 font-semibold">{project?.hours || "-"} ชั่วโมง</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-100  rounded-xl p-6 border border-amber-100">
                  <label className=" text-gray-800 font-semibold mb-3 flex items-center">
                    <i className="fa-solid fa-calendar-alt text-amber-600 mr-2"></i>
                    วันและเวลา
                  </label>
                  <div className="bg-white rounded-lg p-4 border border-amber-200">
                    <p className="text-gray-700 font-medium">
                      {project?.project_datetime ? new Date(project.project_datetime).toLocaleString('th-TH', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : "-"}
                    </p>
                  </div>
                </div>

                {/* Registration Period */}
                <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl p-6 border border-rose-100">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <i className="fa-solid fa-user-plus text-rose-600 mr-2"></i>
                    ช่วงเวลาลงทะเบียน
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">เริ่มลงทะเบียน</label>
                      <input
                        type="datetime-local"
                        {...register("registration_start")}
                        className="w-full p-3 border border-rose-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">สิ้นสุดลงทะเบียน</label>
                      <input
                        type="datetime-local"
                        {...register("registration_end")}
                        className="w-full p-3 border border-rose-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Image Upload */}
                <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl p-6 border border-teal-100">
                  <label className=" text-gray-800 font-semibold mb-4 flex items-center">
                    <i className="fa-solid fa-image text-teal-600 mr-2"></i>
                    อัพโหลดรูปภาพ
                  </label>
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
                    className="bg-white border-2 border-dashed border-teal-300 rounded-lg p-6 w-full hover:border-teal-400 hover:bg-teal-50 transition-colors flex flex-col items-center space-y-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <i className="fa-solid fa-cloud-upload-alt text-3xl text-teal-500"></i>
                    <span className="text-teal-700 font-medium">คลิกเพื่อเลือกไฟล์</span>
                    <span className="text-teal-600 text-sm">หรือลากไฟล์มาวางที่นี่</span>
                  </motion.button>
                  <input type="hidden" {...register('imge_url')} />

                  {fileToUpload.current && (
                    <div className="mt-4 bg-white rounded-lg p-3 border border-teal-200">
                      <div className="flex items-center space-x-3">
                        <i className="fa-solid fa-file-image text-teal-600"></i>
                        <span className="text-gray-700">{fileToUpload.current.name}</span>
                      </div>
                    </div>
                  )}

                  {imagePreview && (
                    <motion.div
                      className="mt-4"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="max-w-full max-h-64 rounded-xl shadow-md object-cover"
                      />
                    </motion.div>
                  )}
                </div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-semibold text-lg shadow-lg transition-all duration-300 flex items-center justify-center space-x-3 ${
                    isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  whileHover={!isSubmitting ? { scale: 1.02, y: -2 } : {}}
                  whileTap={!isSubmitting ? { scale: 0.98 } : {}}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      <span>กำลังบันทึก...</span>
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-paper-plane"></i>
                      <span>บันทึกโพสต์</span>
                    </>
                  )}
                </motion.button>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

export default Projectdetail;