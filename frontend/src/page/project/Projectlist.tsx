import { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import { fetchProjects,} from "../../api/projectapi";
import { Project } from "../../api/projectapi";
import Navbar from "../../component/navbar";
import '../css/Projectlist.css'

function Projectlist() {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    async function getProjects() {
      const data = await fetchProjects();
      setProjects(data);
    }
    getProjects();
  }, []);

  
  function getStatusClass(status: string): string {
    if (status === 'approved') return 'status-approved';
    if (status === 'rejected') return 'status-rejected';
    if (status === 'pending') return 'status-pending';
    return '';
  }


  return (
    <div>
        <Navbar />
      <div className="pj-container">
        <span className="header">ประวัติการเปิดโครงการ</span>
        {projects.length > 0 ? (
          <div className="pj-grid">
            <div className="pj-header">
              <div className="pj-H">ชื่อโครงการ</div>
              <div className="pj-S">สถานะ</div>
            </div>

            {projects.map((item) => (
              <Link to={`/Projectdetail/${item.project_id}`} key={item.project_id} className="pj-id">
                <div className="pj-name">{item.project_name}</div>
                <div className="pj-date">{new Date(item.created_date).toLocaleDateString()}</div>
                <div className={`pj-status ${getStatusClass(item.project_status)}`}>
                  {item.project_status}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p>กำลังโหลดข้อมูล...</p>
        )}
      </div>
    </div>
  );
}

export default Projectlist;
