import axios, { AxiosError} from "axios";

export interface RegisAC {
  post_id: number;
  register_id:number;
  student_id: string;
  student_name: string;
  faculty: string;
}

export interface RegisACInput {
  post_id: number;
  student_id: string;
  student_name: string;
  faculty: string;
}



export interface AddRegisResponse {
  registrations: RegisAC[];
  
}

export const getregisACtivity = async (post_id: number): Promise<RegisAC[]> => {
  try {
    const response = await axios.get(`http://localhost:3000/event/getregisactivity/${post_id}`);
   
    return response.data || [];
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string }>;
    console.error("Axios Error:", axiosError.response?.data || axiosError.message);
    
    throw new Error(axiosError.response?.data?.message || "ยังไม่มีผู้ลงทะเบียน");
  }
};

export const deleteRegis = async (register_id: number) => {
  try {
    const response = await axios.delete(`http://localhost:3000/event/deleteregis/${register_id}`);
    return response.data;
  } catch (error) {
    throw new Error('ไม่สามารถลบกิจกรรมได้');
  }
};

export async function addRegis(data: RegisACInput): Promise<AddRegisResponse> {
  if (!data.post_id || !data.student_id || !data.student_name || !data.faculty) {
    throw new Error("ข้อมูลไม่ครบถ้วน: ต้องระบุ post_id, student_id, student_name, และ faculty");
  }

  try {
    const response = await axios.post<AddRegisResponse>(`http://localhost:3000/event/addregis`,data);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string }>;
    console.error("Axios Error:", axiosError.response?.data || axiosError.message);
    throw new Error(axiosError.response?.data?.message || "ไม่สามารถเพิ่มผู้ลงทะเบียนได้");
  }
}