import { useForm, SubmitHandler } from 'react-hook-form';
import { submitProject } from '../../api/createpj';
import Navbar from '../../component/navbar';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useAuth } from '../../context/AuthContext';

interface FormData {
  project_name: string;
  project_year: string;
  project_description: string;
  department: string;
  phone: string;
  location: string;
  budget: number;
  hours: number;
  ms_id: string;
  project_datetime: string;
  project_enddate: string;
  has_evaluation: boolean;
  evaluation_form_url?: string;
}

function Createproject() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<FormData>();
  const hasEvaluation = watch('has_evaluation', false);

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    if (!currentUser) {
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่พบข้อมูลผู้ใช้ กรุณาล็อกอินใหม่',
        confirmButtonText: 'ตกลง',
        confirmButtonColor: '#7c3aed',
        background: '#ffffff',
        customClass: {
          popup: 'rounded-xl shadow-2xl',
          confirmButton: 'rounded-lg px-6 py-2',
        },
      });
      return;
    }

    const formDataWithMsId: FormData = {
      ...data,
      ms_id: currentUser.ms_id,
      project_datetime: new Date(data.project_datetime).toISOString(),
      project_enddate: new Date(data.project_enddate).toISOString(),
      has_evaluation: data.has_evaluation,
      evaluation_form_url: data.has_evaluation ? data.evaluation_form_url : undefined,
    };

    const result = await submitProject(formDataWithMsId);

    if (result.success) {
      Swal.fire({
        icon: 'success',
        title: 'ดำเนินการสำเร็จ',
        text: result.message || 'โครงการได้ถูกบันทึกเข้าสู่ระบบเรียบร้อยแล้ว',
        confirmButtonText: 'ดำเนินการต่อ',
        confirmButtonColor: '#7c3aed',
        background: '#ffffff',
        customClass: {
          popup: 'rounded-xl shadow-2xl',
          confirmButton: 'rounded-lg px-6 py-2',
        },
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/Projectlist');
        }
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'ไม่สามารถดำเนินการได้',
        text: result.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาตรวจสอบและลองใหม่อีกครั้ง',
        confirmButtonText: 'ลองใหม่',
        confirmButtonColor: '#7c3aed',
        background: '#ffffff',
        customClass: {
          popup: 'rounded-xl shadow-2xl',
          confirmButton: 'rounded-lg px-6 py-2',
        },
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 py-8 px-4 md:px-8 ml-50">
      <Navbar />
      <div className="mx-auto px-6 max-w-5xl">
        <div className="bg-purple-800 backdrop-blur-sm rounded shadow-xl border border-white/20 p-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex-1">
              <h1 className="text-2xl md:text-4xl font-bold text-white mb-2 tracking-tight">
                เปิดโครงการ
              </h1>
            </div>
            <div className="flex-shrink-0 p-3 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-2xl">
              <i className="fa-solid fa-graduation-cap fa-3x text-purple-700"></i>
            </div>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded shadow-xl border border-white/20 p-8 md:p-10">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="pl-6 mb-8">
              <h2 className="text-xl font-semibold text-slate-700 flex items-center gap-3">
                <i className="fa-solid fa-info-circle text-purple-600"></i>
                ข้อมูลพื้นฐานโครงการ
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div className="md:col-span-2">
                  <label className="block text-slate-700 font-semibold mb-3 text-xm uppercase tracking-wide">
                    ชื่อโครงการ <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    {...register('project_name', {
                      required: 'กรุณาระบุชื่อโครงการ',
                      minLength: { value: 5, message: 'ชื่อโครงการต้องมีความยาวอย่างน้อย 5 ตัวอักษร' },
                    })}
                    className="w-full border-2 border-slate-200 rounded-xl p-3 text-slate-700 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200 bg-white/70"
                    placeholder="ระบุชื่อโครงการที่ชัดเจนและสื่อความหมาย"
                  />
                  {errors.project_name && (
                    <p className="text-red-500 text-sm mt-2 flex items-center gap-2">
                      <i className="fa-solid fa-exclamation-triangle"></i>
                      {errors.project_name.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-3 text-xm uppercase tracking-wide">
                    ปีงบประมาณ <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="number"
                    {...register('project_year', {
                      required: 'กรุณาระบุปีงบประมาณ',
                      minLength: { value: 4, message: 'ปีงบประมาณต้องมี 4 ตัวอักษร' },
                      maxLength: { value: 4, message: 'ปีงบประมาณต้องมี 4 ตัวอักษร' },
                      pattern: {
                        value: /^[0-9]{4}$/,
                        message: 'ปีงบประมาณต้องเป็นตัวเลข 4 หลัก',
                      },
                    })}
                    className="w-full border-2 border-slate-200 rounded-xl p-3 text-slate-700 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200 bg-white/70"
                    placeholder="เช่น 2565"
                  />
                  {errors.project_year && (
                    <p className="text-red-500 text-sm mt-2 flex items-center gap-2">
                      <i className="fa-solid fa-exclamation-triangle"></i>
                      {errors.project_year.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-3 text-xm uppercase tracking-wide">
                    งบประมาณที่ได้รับ (บาท) <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      step="100"
                      {...register('budget', {
                        required: 'กรุณาระบุงบประมาณ',
                        min: { value: 1, message: 'งบประมาณต้องมากกว่า 0 บาท' },
                        valueAsNumber: true,
                      })}
                      className="w-full border-2 border-slate-200 rounded-xl p-3 pr-12 text-slate-700 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all duration-200 bg-white/70"
                      placeholder="0"
                    />
                    <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-500 font-medium">฿</span>
                  </div>
                  {errors.budget && (
                    <p className="text-red-500 text-sm mt-2 flex items-center gap-2">
                      <i className="fa-solid fa-exclamation-triangle"></i>
                      {errors.budget.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-3 text-xm uppercase tracking-wide">
                    หน่วยงาน/คณะที่รับผิดชอบ <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    {...register('department', { required: 'กรุณาระบุหน่วยงาน/คณะ' })}
                    className="w-full border-2 border-slate-200 rounded-xl p-3 text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all duration-200 bg-white/70"
                    placeholder="เช่น คณะวิทยาศาสตร์ มหาวิทยาลัย..."
                  />
                  {errors.department && (
                    <p className="text-red-500 text-sm mt-2 flex items-center gap-2">
                      <i className="fa-solid fa-exclamation-triangle"></i>
                      {errors.department.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-3 text-xm uppercase tracking-wide">
                    หมายเลขโทรศัพท์ <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    {...register('phone', { required: 'กรุณาระบุหมายเลขโทรศัพท์' })}
                    className="w-full border-2 border-slate-200 rounded-xl p-3 text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all duration-200 bg-white/70"
                    placeholder="เช่น 08123XXXXX"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-2 flex items-center gap-2">
                      <i className="fa-solid fa-exclamation-triangle"></i>
                      {errors.phone.message}
                    </p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-slate-700 font-semibold mb-3 text-xm uppercase tracking-wide">
                    รายละเอียด <span className="text-red-500 ml-1">*</span>
                  </label>
                  <textarea
                    {...register('project_description', {
                      required: 'กรุณาระบุรายละเอียดโครงการ',
                      minLength: { value: 20, message: 'รายละเอียดต้องมีความยาวอย่างน้อย 20 ตัวอักษร' },
                    })}
                    rows={4}
                    className="w-full border-2 border-slate-200 rounded-xl p-4 text-slate-700 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200 bg-white/70 resize-none"
                    placeholder="อธิบายวัตถุประสงค์ กิจกรรม และผลลัพธ์ที่คาดหวังของโครงการ"
                  />
                  {errors.project_description && (
                    <p className="text-red-500 text-sm mt-2 flex items-center gap-2">
                      <i className="fa-solid fa-exclamation-triangle"></i>
                      {errors.project_description.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="pl-6 mb-8">
              <h2 className="text-xl font-semibold text-slate-700 flex items-center gap-3">
                <i className="fa-solid fa-info-circle text-purple-600"></i>
                วัน/เวลา/สถานที่การจัดโครงการ
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-3 text-xm uppercase tracking-wide">
                    วันที่เริ่มกิจกรรม <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    {...register('project_datetime', {
                      required: 'กรุณาเลือกวันที่และเวลา',
                      validate: (value) => {
                        const selectedDate = new Date(value);
                        const currentDate = new Date();
                        return selectedDate > currentDate || 'วันที่และเวลาต้องเป็นอนาคต';
                      },
                    })}
                    className="w-full border-2 border-slate-200 rounded-xl p-3 text-slate-700 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all duration-200 bg-white/70"
                  />
                  {errors.project_datetime && (
                    <p className="text-red-500 text-sm mt-2 flex items-center gap-2">
                      <i className="fa-solid fa-exclamation-triangle"></i>
                      {errors.project_datetime.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-3 text-xm uppercase tracking-wide">
                    วันสิ้นสุดกิจกรรม <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    {...register('project_enddate', {
                      required: 'กรุณาเลือกวันที่และเวลา',
                      validate: (value) => {
                        const selectedDate = new Date(value);
                        const currentDate = new Date();
                        return selectedDate > currentDate || 'วันที่และเวลาต้องเป็นอนาคต';
                      },
                    })}
                    className="w-full border-2 border-slate-200 rounded-xl p-3 text-slate-700 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all duration-200 bg-white/70"
                  />
                  {errors.project_enddate && (
                    <p className="text-red-500 text-sm mt-2 flex items-center gap-2">
                      <i className="fa-solid fa-exclamation-triangle"></i>
                      {errors.project_enddate.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-3 text-xm uppercase tracking-wide">
                    จำนวนชั่วโมงกิจกรรม <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      step="0.5"
                      {...register('hours', {
                        required: 'กรุณาระบุจำนวนชั่วโมง',
                        min: { value: 0.5, message: 'จำนวนชั่วโมงต้องมากกว่า 0.5 ชั่วโมง' },
                        valueAsNumber: true,
                      })}
                      className="w-full border-2 border-slate-200 rounded-xl p-3 pr-16 text-slate-700 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all duration-200 bg-white/70"
                      placeholder="0"
                    />
                    <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-500 font-medium text-sm">ชม.</span>
                  </div>
                  {errors.hours && (
                    <p className="text-red-500 text-sm mt-2 flex items-center gap-2">
                      <i className="fa-solid fa-exclamation-triangle"></i>
                      {errors.hours.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-3 text-xm uppercase tracking-wide">
                    สถานที่จัดกิจกรรม <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    {...register('location', { required: 'กรุณาระบุสถานที่ดำเนินการ' })}
                    className="w-full border-2 border-slate-200 rounded-xl p-3 text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all duration-200 bg-white/70"
                    placeholder="ระบุสถานที่ที่ชัดเจน"
                  />
                  {errors.location && (
                    <p className="text-red-500 text-sm mt-2 flex items-center gap-2">
                      <i className="fa-solid fa-exclamation-triangle"></i>
                      {errors.location.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="pl-6 mb-8">
              <h2 className="text-xl font-semibold text-slate-700 flex items-center gap-3">
                <i className="fa-solid fa-poll text-purple-600"></i>
                การประเมินโครงการ
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div className="md:col-span-2">
                  <label className="block text-slate-700 font-semibold mb-3 text-xm uppercase tracking-wide">
                    การประเมิน <span className="text-red-500 ml-1">*</span>
                  </label>
                 <div className="flex items-center gap-6">
                  <label
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border cursor-pointer transition-all duration-200
                      ${hasEvaluation === true ? 'bg-purple-100 border-purple-500 text-purple-700 font-semibold shadow-md' : 'bg-white border-slate-300 text-slate-600'}
                    `}
                  >
                    <input
                      type="radio"
                      value="true"
                      {...register('has_evaluation')}
                      onChange={() => setValue('has_evaluation', true)}
                      className="hidden"
                    />
                    <i className={`fa-solid fa-check-circle ${hasEvaluation === true ? 'text-purple-600' : 'text-slate-400'}`}></i>
                    <span>มีแบบประเมิน</span>
                  </label>

                  <label
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border cursor-pointer transition-all duration-200
                      ${hasEvaluation === false ? 'bg-purple-100 border-purple-500 text-purple-700 font-semibold shadow-md' : 'bg-white border-slate-300 text-slate-600'}
                    `}
                  >
                    <input
                      type="radio"
                      value="false"
                      {...register('has_evaluation')}
                      onChange={() => setValue('has_evaluation', false)}
                      className="hidden"
                    />
                    <i className={`fa-solid fa-circle-xmark ${hasEvaluation === false ? 'text-purple-600' : 'text-slate-400'}`}></i>
                    <span>ไม่มีการประเมิน</span>
                  </label>
                </div>

                  {errors.has_evaluation && (
                    <p className="text-red-500 text-sm mt-2 flex items-center gap-2">
                      <i className="fa-solid fa-exclamation-triangle"></i>
                      {errors.has_evaluation.message}
                    </p>
                  )}
                </div>
                {hasEvaluation && (
                  <div className="md:col-span-2">
                    <label className="block text-slate-700 font-semibold mb-3 text-xm uppercase tracking-wide">
                      ลิงก์ Google Form <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      {...register('evaluation_form_url', {
                        required: hasEvaluation ? 'กรุณาระบุลิงก์ Google Form' : false,
                        pattern: {
                          value: /^https:\/\/(forms\.gle\/|docs\.google\.com\/forms\/)/,
                          message: 'กรุณาระบุลิงก์ Google Form ที่ถูกต้อง',
                        },
                      })}
                      className="w-full border-2 border-slate-200 rounded-xl p-3 text-slate-700 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200 bg-white/70"
                      placeholder="เช่น https://forms.gle/..."
                    />
                    {errors.evaluation_form_url && (
                      <p className="text-red-500 text-sm mt-2 flex items-center gap-2">
                        <i className="fa-solid fa-exclamation-triangle"></i>
                        {errors.evaluation_form_url.message}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-8 border-t border-slate-200">
              <div className="flex flex-col sm:flex-row gap-4 justify-end mr-80">
                <button
                  type="submit"
                  className="px-12 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded focus:outline-none focus:ring-4 focus:ring-purple-200 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 min-w-[200px]"
                >
                  <i className="fa-solid fa-paper-plane"></i>
                  เสนอโครงการ
                </button>
              </div>
              <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-sm text-slate-600 leading-relaxed">
                  <i className="fa-solid fa-info-circle text-slate-500 mr-2"></i>
                  โครงการที่เสนอจะถูกส่งไปยังคณะกรรมการพิจารณาเพื่อการอนุมัติ กรุณาตรวจสอบข้อมูลให้ครบถ้วนและถูกต้องก่อนการเสนอ
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Createproject;