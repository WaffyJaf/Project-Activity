import axios from "axios";

export interface FormPost{
  project_id: number;
  post_content: string;
  imge_url: string;
}

// ✅ ฟังก์ชันอัปโหลดรูปภาพและคืนค่า URL
export const uploadImage = async (file: File): Promise<string | null> => {
  const uploadData = new FormData();
  uploadData.append("image", file);

 
  try {
    const response = await axios.post("http://localhost:3000/event/uploadimage", uploadData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    if (response.status === 200) {
      return response.data.imageUrl; 
    } else {
      console.error("Upload failed:", response.data);
      return null;
    }
  } catch (error) {
    console.error("Error uploading image:", error);
    return null;
  }
};



export const submitFormToAPI = async (formData: FormPost) => {
  try {
    const response = await axios.post("http://localhost:3000/event/postevent", formData, {
      headers: { "Content-Type": "application/json" },
    });

    if (response.status === 200 || response.status === 201) {
      // แสดงข้อความที่เซิร์ฟเวอร์ส่งกลับมา
      if (response.data.message === "Event post saved successfully") {
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
};

