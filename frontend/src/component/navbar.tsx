import { Link } from "react-router-dom";
import './navbar.css';



function Navbar() {
  return (
    <>
       <div className="user">
          <a href="#"><i className="fa-solid fa-envelope"></i></a>
          <a href="#"><i className="fa-solid fa-circle-user"></i></a>
       </div>

        <div className="sidebar">
          <div className="logo">
          <Link to="/"><img src="/logoup.png" alt="logo" /></Link>
            <span className="menutext">MENU</span>
          </div>

          <ul className="menu-list">
            <li className="project">
              <Link to="/"><i className="fa-solid fa-file"></i> โครงการ <i className="fa-solid fa-play"></i></Link>
              <ul className="dropdown">
                <li><Link to="/createproject">เปิดโครงการ</Link></li>
                <li><Link to="/Projectlist">ประวัติเปิดโครงการ</Link></li>
              </ul>
            </li>
            <li className="activity">
              <Link to="/activity"><i className="fa-solid fa-font-awesome"></i> Activity <i className="fa-solid fa-play"></i></Link>
              <ul className="dropdown">
                <li><Link to="/post-activity">Post กิจกรรม</Link></li>
                <li><Link to="/Eventlist">ประวัติ Post</Link></li>
              </ul>
            </li>
            <li className="project">
              <Link to="/log-hours"><i className="fa-solid fa-download"></i> บันทึกชั่วโมง</Link>
            </li>
            <li className="project">
              <Link to="/record"><i className="fa-solid fa-bars"></i> Record <i className="fa-solid fa-play"></i></Link>
              <ul className="dropdown">
                <li><Link to="/registration-list">รายชื่อลงทะเบียน</Link></li>
                <li><Link to="/evaluation-summary">สรุปประเมิน</Link></li>
                <li><Link to="/search-history">ค้นหาประวัตินิสิต</Link></li>
              </ul>
            </li>
          </ul>
        </div>
    </>
  );
}

export default Navbar

