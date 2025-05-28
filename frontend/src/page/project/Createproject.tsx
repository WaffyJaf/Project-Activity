import { useForm, SubmitHandler } from 'react-hook-form';
import { submitProject, FormData } from '../../api/createpj';
import Navbar from '../../component/navbar';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useAuth } from '../../context/AuthContext'; 

function Createproject() {
  const navigate = useNavigate();
  const { currentUser } = useAuth(); 
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    if (!currentUser) {
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่พบข้อมูลผู้ใช้ กรุณาล็อกอินใหม่',
        confirmButtonText: 'ตกลง',
        confirmButtonColor: '#9333ea',
      });
      return;
    }

    // Include ms_id from currentUser in the form data
    const formDataWithMsId: FormData = {
      ...data,
      ms_id: currentUser.ms_id,
    };

    const result = await submitProject(formDataWithMsId);

    if (result.success) {
      Swal.fire({
        icon: 'success',
        title: 'สำเร็จ!',
        text: result.message || 'ข้อมูลโครงการถูกส่งสำเร็จ!',
        confirmButtonText: 'ตกลง',
        confirmButtonColor: '#9333ea',
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/Projectlist');
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
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-purple-50 to-white py-7 px-4 md:px-6 ml-50">
      <Navbar />
      <div className="mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-3 flex flex-col md:flex-row justify-between items-center">
          <div className="w-full flex justify-between items-center">
            <span className="text-2xl md:text-2xl font-extrabold text-purple-900 tracking-tight drop-shadow-sm">
              เปิดโครงการ
            </span>
            <i className="fa-solid fa-file-invoice fa-2xl text-purple-800"></i>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                ชื่อโครงการ<span className="text-red-500">*</span>
              </label>
              <input
                {...register('project_name', { required: 'กรุณากรอกชื่อโครงการ' })}
                className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              {errors.project_name && <p className="text-red-500 text-sm mt-1">{errors.project_name.message}</p>}
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                รายละเอียด<span className="text-red-500">*</span>
              </label>
              <input
                {...register('project_description', { required: 'กรุณากรอกรายละเอียด' })}
                className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              {errors.project_description && <p className="text-red-500 text-sm mt-1">{errors.project_description.message}</p>}
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                หน่วยงาน/คณะ<span className="text-red-500">*</span>
              </label>
              <input
                {...register('department', { required: 'กรุณากรอกหน่วยงาน/คณะ' })}
                className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              {errors.department && <p className="text-red-500 text-sm mt-1">{errors.department.message}</p>}
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                สถานที่<span className="text-red-500">*</span>
              </label>
              <input
                {...register('location', { required: 'กรุณากรอกสถานที่' })}
                className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>}
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                งบประมาณ<span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                {...register('budget', { required: 'กรุณากรอกงบประมาณ', valueAsNumber: true })}
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
                {...register('hours', { required: 'กรุณากรอกจำนวนชั่วโมง', valueAsNumber: true })}
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
                {...register('project_datetime', { required: 'กรุณาเลือกวันที่/เวลา' })}
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