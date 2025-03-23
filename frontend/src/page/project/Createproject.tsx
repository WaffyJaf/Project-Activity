import { useForm, SubmitHandler } from 'react-hook-form';
import Navbar from "../../component/navbar";
import { submitProject, FormData } from '../../api/create';
import '../css/Createproject.css'

interface ProjectFormProps {
  onSubmitSuccess: () => void; 
}

function Createproject({ onSubmitSuccess }: ProjectFormProps): JSX.Element {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    if (Object.values(data).some(value => value === "" || value === undefined)){
      alert("กรุณากรอกข้อมูลให้ครบ")
      return;
    }

    try {
      await submitProject(data); 
      reset(); 

      if (typeof onSubmitSuccess === 'function') {
        onSubmitSuccess();
      }
      alert("ข้อมูลโครงการถูกส่งสำเร็จ"); 
    } catch (error) {
      console.error("Error submitting project:", error);
      alert("ส่งข้อมูลไม่สำเร็จ กรุณาลองใหม่");
    }
  };
  return (
    <div>
      <Navbar /> 
      <div className="body">
        <section className="content"><span className='head'>เปิดโครงการ</span></section>
        <div className='container'>
          <form onSubmit={handleSubmit(onSubmit)} className="form">
          
            <div className="input-box">
              <label>ชื่อโครงการ</label>
              <input {...register("project_name", { required: "กรุณากรอกชื่อโครงการ" })} />
              {errors.project_name && <p className="error">{errors.project_name.message}</p>}
              
              <label>รายละเอียด</label>
              <input {...register("project_description", { required: "กรุณากรอกรายละเอียด" })} />
              {errors.project_description && <p className="error">{errors.project_description.message}</p>}
              
              <label>หน่วยงาน/คณะ</label>
              <input {...register("department", { required: "กรุณากรอกหน่วยงาน/คณะ" })} />
              {errors.department && <p className="error">{errors.department.message}</p>}
              
              <label>สถานที่</label>
              <input {...register("location", { required: "กรุณากรอกสถานที่" })} />
              {errors.location && <p className="error">{errors.location.message}</p>}
              
              <label>งบประมาณ</label>
              <input {...register("budget", { required: "กรุณากรอกงบประมาณ" })} />
              {errors.budget && <p className="error">{errors.budget.message}</p>}
              
              <label>จำนวนชั่วโมงที่ได้</label>
              <input type="number" {...register("hours", { required: "กรุณากรอกจำนวนชั่วโมง", valueAsNumber: true })} />
              {errors.hours && <p className="error">{errors.hours.message}</p>}
              
              <label>วันที่/เวลา</label>
              <input type="datetime-local" {...register("project_datetime", { required: "กรุณาเลือกวันที่/เวลา" })} />
              {errors.project_datetime && <p className="error">{errors.project_datetime.message}</p>}
              
              <button type="submit" className="btn btn-primary w-100">Submit</button>
            </div>
          </form>
        </div>
        
        <div className="user">
          <a href="#"><i className="fa-solid fa-envelope"></i></a>
          <a href="#"><i className="fa-solid fa-circle-user"></i></a>
        </div>
      </div>
    </div>
  );
}

export default Createproject;