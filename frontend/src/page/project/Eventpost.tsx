import React, { useState, useRef } from "react";
import { useForm, SubmitHandler } from 'react-hook-form';
import Navbar from "../../component/navbar";
import { FormPost, submitFormToAPI, uploadImage } from "../../api/createpost";
import '../css/Eventpost.css'

function Eventpost() {
  // State for modal
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  // State for image upload
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileToUpload = useRef<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize react-hook-form
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormPost>({
    defaultValues: {
      project_id: 0,
      post_content: "",
      image_url: "",
    },
  });

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setImagePreview(objectUrl);
      fileToUpload.current = file;
    }
  };

  // Handle upload button click
  const handleUploadButtonClick = () => {
    fileInputRef.current?.click();
  };

  // Form submission handler
  const onSubmit: SubmitHandler<FormPost> = async (formData) => {
    try {
      if (fileToUpload.current) {
        const imageUrl = await uploadImage(fileToUpload.current);
        formData.image_url = imageUrl;

      }

      const result = await submitFormToAPI(formData);

      if (result.success) {
        setModalMessage("โพสต์ถูกบันทึกสำเร็จ! 🎉");
        reset();
        setImagePreview(null);
        fileToUpload.current = null;
      } else {
        setModalMessage("เกิดข้อผิดพลาดในการบันทึกโพสต์ ❌");
      }

      setShowModal(true);
    } catch (error) {
      console.error("Error:", error);
      setModalMessage("เกิดข้อผิดพลาด กรุณาลองใหม่ ❌");
      setShowModal(true);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="body">
        <section className="content">
          <span className="head">สร้างโพสต์</span>
        </section>
        <div className="container">
          <form onSubmit={handleSubmit(onSubmit)} className="form">
            <div className="form-group">
              <label>รหัสกิจกรรม<span className="required">*</span></label>
              <input type="number"{...register("project_id", { required: "กรุณากรอกรหัสกิจกรรม",min: { value: 1, message: "รหัสกิจกรรมต้องมีค่ามากกว่า 0" }})}/>
              {errors.project_id && <p className="error">{errors.project_id.message}</p>}
              
              <label>เนื้อหากิจกรรม<span className="required">*</span></label>
              <textarea {...register("post_content", { required: "จำเป็นต้องกรอกเนื้อหาโพสต์",minLength: { value: 10, message: "กรุณากรอกเนื้อหาอย่างน้อย 10 ตัวอักษร" }})}/>
              {errors.post_content && <p className="error">{errors.post_content.message}</p>}
              
              <div className="form-group">
                <label className="form-label">อัพโหลดรูปภาพ</label>
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden-input"/>
                <input type="hidden" {...register('image_url')} />

                <div className="upload-container">
                  <button type="button" onClick={handleUploadButtonClick} className="upload-button"> เลือกรูปภาพ</button>
                  <span className="file-name">
                    {fileToUpload.current ? `ไฟล์: ${fileToUpload.current.name}` : 'ยังไม่ได้เลือกไฟล์'}
                  </span>
                </div>
               
                {/* Image preview */}
                {imagePreview && (
                  <div className="image-preview">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="preview-image"
                    />
                  </div>
                )}
              </div>
              
              <div className="form-actions">
                <button type="submit" className="submit-button"disabled={isSubmitting}>
                  {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกโพสต์'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
      
      {/* Show modal if showModal is true */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <p>{modalMessage}</p> {/* ✅ แสดง modalMessage */}
            <button onClick={() => setShowModal(false)}>ปิด</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Eventpost;
