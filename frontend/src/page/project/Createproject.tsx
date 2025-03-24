import { useForm, SubmitHandler } from 'react-hook-form';
import { useState } from "react";
import { submitProject } from '../../api/create';
import Navbar from "../../component/navbar";
import { FormData } from '../../api/create';
import '../css/Createproject.css'
import { Link } from 'react-router-dom';



function Createproject() {
  const [showModal, setShowModal] = useState(false); //ควบคุมการแสดงผลของ modal
  const [modalMessage, setModalMessage] = useState(""); 
  const [modalType, setModalType] = useState(""); 

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    const result = await submitProject(data); 
    
    if (result.success) {
      setModalMessage(result.message); 
      setModalType("success");
    } else {
      setModalMessage(result.message); 
      setModalType("error");
    }
  
    console.log("Modal show: ", true);
    setShowModal(true); 
  };
  

  return (
    <div>
      <Navbar /> 
      <div className="body">
        <section className="content"><span className='head'>เปิดโครงการ</span></section>
        <div className='container'>
          <form onSubmit={handleSubmit(onSubmit)} className="form">
            <div className="input-box">
              <label>ชื่อโครงการ<span className="required">*</span></label>
              <input {...register("project_name", { required: "กรุณากรอกชื่อโครงการ" })} />
              {errors.project_name && <p className="error">{errors.project_name.message}</p>}
              
              <label>รายละเอียด<span className="required">*</span></label>
              <input {...register("project_description", { required: "กรุณากรอกรายละเอียด" })} />
              {errors.project_description && <p className="error">{errors.project_description.message}</p>}
              
              <label>หน่วยงาน/คณะ<span className="required">*</span></label>
              <input {...register("department", { required: "กรุณากรอกหน่วยงาน/คณะ" })} />
              {errors.department && <p className="error">{errors.department.message}</p>}
              
              <label>สถานที่<span className="required">*</span></label>
              <input {...register("location", { required: "กรุณากรอกสถานที่" })} />
              {errors.location && <p className="error">{errors.location.message}</p>}
              
              <label>งบประมาณ<span className="required">*</span></label>
              <input {...register("budget", { required: "กรุณากรอกงบประมาณ" })} />
              {errors.budget && <p className="error">{errors.budget.message}</p>}
              
              <label>จำนวนชั่วโมงที่ได้<span className="required">*</span></label>
              <input type="number" {...register("hours", { required: "กรุณากรอกจำนวนชั่วโมง", valueAsNumber: true })} />
              {errors.hours && <p className="error">{errors.hours.message}</p>}
              
              <label>วันที่/เวลา<span className="required">*</span></label>
              <input type="datetime-local" {...register("project_datetime", { required: "กรุณาเลือกวันที่/เวลา" })} />
              {errors.project_datetime && <p className="error">{errors.project_datetime.message}</p>}
              
              <button type="submit" className="btn btn-primary w-100">Submit</button>
            </div>
          </form>
        </div>
        
        {/* Modal สำหรับแสดงข้อความ */}
          {showModal && (
            <div className={`modal-overlay ${showModal ? 'show' : ''}`}>
              <div className={`modal ${modalType}`}>
                <h2>{modalType === "success" ? "ข้อมูลโครงการถูกส่งสำเร็จ!" : "ส่งข้อมูลไม่สำเร็จ"}</h2>
                <p>{modalMessage}</p>
                <Link to="/Projectlist"><button className="btn" onClick={() => setShowModal(false)}>ปิด</button></Link>
               
              </div>
            </div>
          )}


      </div>
    </div>
    
  );
}

export default Createproject;
