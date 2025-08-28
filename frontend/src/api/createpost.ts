import axios from "axios";

export interface FormPost {
  project_id: number;
  post_content: string;
  imge_url: string;
  location_post: string;
  post_datetime: string; 
  hour_post: number;
  ms_id: string;
  registration_start?: string; 
  registration_end?: string;   
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


export const submitFormToAPI = async (
  formData: FormPost
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await axios.post(
      "http://localhost:3000/event/postevent",
      formData,
      { headers: { "Content-Type": "application/json" } }
    );

    const payload = response?.data ?? {};
    const okStatus = response.status >= 200 && response.status < 300;

    // ถือว่าสำเร็จถ้า:
    // 1) backend ระบุ success=true หรือ
    // 2) สถานะ 2xx และมี message หรือ data ใด ๆ กลับมา
    const success =
      payload?.success === true ||
      (okStatus &&
        (typeof payload?.message === "string" || payload?.data != null));

    return {
      success,
      message:
        payload?.message ??
        (success ? "บันทึกโพสต์กิจกรรมและส่งการแจ้งเตือนสำเร็จ" : "ส่งข้อมูลไม่สำเร็จ กรุณาลองใหม่"),
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const msg =
        error.response?.data?.message ||
        error.message ||
        "ส่งข้อมูลไม่สำเร็จ กรุณาลองใหม่";
      return { success: false, message: msg };
    }
    return { success: false, message: "เกิดข้อผิดพลาดบางประการ กรุณาลองใหม่" };
  }
};
