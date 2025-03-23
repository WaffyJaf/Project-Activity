import axios from 'axios';

export interface FormData{
  project_name: string;
  project_description: string;
  department: string;
  location: string;
  budget: number;
  hours: number;
  project_datetime: string;  
}


export async function submitProject(data: FormData): Promise<void> {
  try {
    const response = await axios.post(
      "http://localhost:3000/project/createproject", 
      data, 
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    console.log("Form submitted successfully:", response.data);


    // คุณสามารถใช้ข้อมูล response ถ้าจำเป็น
    if (response.data && response.data.message) {
      console.log(response.data.message); // แสดงข้อความจาก server ถ้ามี
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // ถ้าเป็น Axios error
      console.error("Axios error:", error.response?.data || error.message);
      alert(`ส่งข้อมูลไม่สำเร็จ: ${error.response?.data?.message || error.message}`);
    } else {
      // ถ้าไม่ใช่ Axios error
      console.error("Unexpected error:", error);
      
    }
  }
}