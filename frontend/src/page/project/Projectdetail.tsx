import { useEffect, useState } from "react";
import { fetchProjectByID, Project } from "../../api/projectget";
import { useParams } from "react-router-dom";
import Navbar from "../../component/navbar";
import "../css/Projectdetail.css"

function Projectdetail() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function getProjectDetail() {
      setLoading(true);
      try {
        const data = await fetchProjectByID(id);
        setProject(data);
      } catch (err) {
        setError("ไม่สามารถดึงข้อมูลโครงการได้");
      } finally {
        setLoading(false); 
      }
    }

    if (id) {
      getProjectDetail();
    }
  }, [id]);

  return (
    <div>
      <Navbar />
      <div className="detail-container">
        <h1 className="head">รายละเอียดโครงการ</h1>

        {loading && <p>กำลังโหลดข้อมูล...</p>}
        {error && <p className="error-message">{error}</p>}

        {project && (
          <div className="pj-content">
            <div className="pj-detail">
            <h2 className="pj_name">{project.project_name}</h2>
              <p><strong>รหัสโครงการ :</strong> {project.project_id}</p> 
              <p><strong>สถานะ :</strong> {project.project_status}</p>
              <p><strong>หน่วยงาน/คณะ :</strong> {project.department}</p>
              <p><strong>สถานที่ :</strong> {project.location}</p>
              <p><strong>งบประมาณ :</strong> {project.budget}</p>
              <p><strong>จำนวนชั่วโมงที่ได้รับ :</strong> {project.hours}</p>
              <p><strong>วัน เวลา ที่จัดกิจกรรม :</strong> {new Date(project.project_datetime).toLocaleString()}</p>
              <p><strong className="description">รายละเอียด :</strong> {project.project_description}</p>
            </div>
            
          </div>
          
        )}
      </div>
    </div>
  );
}

export default Projectdetail;
