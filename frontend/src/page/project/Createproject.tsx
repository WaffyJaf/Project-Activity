import { useForm, SubmitHandler } from 'react-hook-form';
import { submitProject } from '../../api/createpj';
import Navbar from "../../component/navbar";
import { FormData } from '../../api/createpj';
import { useNavigate } from 'react-router-dom'; // Added useNavigate
import Swal from 'sweetalert2'; // Added SweetAlert2

function Createproject() {
  const navigate = useNavigate(); // Added navigate hook
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    const result = await submitProject(data);
    
    if (result.success) {
      Swal.fire({
        icon: 'success',
        title: 'สำเร็จ!',
        text: result.message || 'ข้อมูลโครงการถูกส่งสำเร็จ!',
        confirmButtonText: 'ตกลง',
        confirmButtonColor: '#9333ea', // Matches purple-600
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/Projectlist'); // Redirect to Projectlist after clicking "OK"
        }
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: result.message || 'ส่งข้อมูลไม่สำเร็จ',
        confirmButtonText: 'ตกลง',
        confirmButtonColor: '#9333ea',
      });
    }
  };

  return (
    <div>
      <Navbar /> 
      <div className="bg-gray-100 min-h-screen flex flex-col items-center py-8 ml-50">
        <section className="text-3xl font-bold text-purple-800 mb-6">เปิดโครงการ</section>
        <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-3xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                ชื่อโครงการ<span className="text-red-500">*</span>
              </label>
              <input 
                {...register("project_name", { required: "กรุณากรอกชื่อโครงการ" })} 
                className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              {errors.project_name && <p className="text-red-500 text-sm mt-1">{errors.project_name.message}</p>}
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                รายละเอียด<span className="text-red-500">*</span>
              </label>
              <input 
                {...register("project_description", { required: "กรุณากรอกรายละเอียด" })} 
                className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              {errors.project_description && <p className="text-red-500 text-sm mt-1">{errors.project_description.message}</p>}
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                หน่วยงาน/คณะ<span className="text-red-500">*</span>
              </label>
              <input 
                {...register("department", { required: "กรุณากรอกหน่วยงาน/คณะ" })} 
                className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              {errors.department && <p className="text-red-500 text-sm mt-1">{errors.department.message}</p>}
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                สถานที่<span className="text-red-500">*</span>
              </label>
              <input 
                {...register("location", { required: "กรุณากรอกสถานที่" })} 
                className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>}
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                งบประมาณ<span className="text-red-500">*</span>
              </label>
              <input 
                {...register("budget", { required: "กรุณากรอกงบประมาณ" })} 
                className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              {errors.budget && <p className="text-red-500 text-sm mt-1">{errors.budget.message}</p>}
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                จำนวนชั่วโมงที่ได้<span className="text-red-500">*</span>
              </label>
              <input 
                type="number" 
                {...register("hours", { required: "กรุณากรอกจำนวนชั่วโมง", valueAsNumber: true })} 
                className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              {errors.hours && <p className="text-red-500 text-sm mt-1">{errors.hours.message}</p>}
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                วันที่/เวลา<span className="text-red-500">*</span>
              </label>
              <input 
                type="datetime-local" 
                {...register("project_datetime", { required: "กรุณาเลือกวันที่/เวลา" })} 
                className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              {errors.project_datetime && <p className="text-red-500 text-sm mt-1">{errors.project_datetime.message}</p>}
            </div>

            <button 
              type="submit" 
              className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition duration-300"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Createproject;