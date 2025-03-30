import axios from 'axios';

export interface FormData{
  project_name: string;
  project_description: string;
  department: string;
  location: string;
  budget: number;
  hours: number;
  project_datetime: string;  
};



export async function submitProject(data: FormData): Promise<{ success: boolean, message: string }> {
  try {
    const response = await axios.post("http://localhost:3000/project/createproject", data, {
        headers: {
          "Content-Type": "application/json", 
        },
      });

    
    if (response.status === 200 || response.status === 201) { 
      if (response.data.message === 'Project activity created successfully') {
        console.log("Form submitted successfully:", response.data);
        return { success: true, message: "Project successfully sent." };
      } else {
        console.error("Unexpected response:", response.data);
        return { success: false, message: "ส่งข้อมูลไม่สำเร็จ กรุณาลองใหม่" };
      }
    } else {
    
      console.error("Unexpected response status:", response.status);
      return { success: false, message: "ส่งข้อมูลไม่สำเร็จ กรุณาลองใหม่" };
    }
  } catch (error) {
    
    if (axios.isAxiosError(error)) {
      console.error("Axios error:", error.response?.data || error.message);
      return { success: false, message: "ส่งข้อมูลไม่สำเร็จ กรุณาลองใหม่" };
    } else {
      
      console.error("Unexpected error:", error);
      return { success: false, message: "เกิดข้อผิดพลาดบางประการ กรุณาลองใหม่" };
    }
  }
}





