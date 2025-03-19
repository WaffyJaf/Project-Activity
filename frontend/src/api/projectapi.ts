export interface Project {
  project_id: number;
  project_name: string;
  created_date: string;
  project_status: string;
  project_description: string;
  department: string;
  location: string;
  budget: string;
  hours: number;
  project_datetime: string;
}

export async function fetchProjects(): Promise<Project[]>{
    try {
      const response = await fetch("http://localhost:3000/project/getproject"); 
      if(!response.ok){
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data: Project[] = await response.json();
      return data;
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการดึงข้อมูลโครงการ", error);
      return[];
    }
}

export async function fetchProjectByID(id: string | undefined): Promise<Project> {
  if(!id){
    throw new Error("ไม่ได้ระบุ id โครงการ")
  }
  try{
    const response = await fetch(`http://localhost:3000/project/projectid/${id}`);
    if(!response.ok){
      throw new Error("ไม่สามารถดึงข้อมูลโครงการได้");  
    }
    const data: Project = await response.json(); 
    return data;
  }catch(error){
    console.error(`Error fetching project ${id}:`, error);
    throw error;
  }
 
}
