import axios from "axios";

export interface RegisAC {
  post_id: number;
  student_id: string;
  student_name: string;
  faculty: string;
}

export interface ApiResponse {
  registrations: RegisAC[];
  
}

export async function getregisACtivity(post_id: number): Promise<RegisAC[]> {
  try {
    const response = await axios.get<ApiResponse>(`http://localhost:3000/event/getregisactivity/${post_id}`);

    
    if (Array.isArray(response.data.registrations)) {
      return response.data.registrations; 
    } else {
      console.error("รูปแบบข้อมูลไม่ถูกต้อง:", response.data.registrations);
      throw new Error("รูปแบบข้อมูลไม่ถูกต้อง: registrations ไม่ใช่อาร์เรย์");
    }
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการดึงข้อมูลการลงทะเบียน:", error);
    throw error; 
  }
}
