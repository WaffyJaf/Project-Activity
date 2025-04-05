import { Link } from "react-router-dom";

function Navbar() {
  return (
    <>
      <div className="fixed top-2 right-2 ">
        <Link to="/Projectlist" className= " text-3xl p-4 font-bold no-underline" style={{ textDecoration: 'none' }}>
          <i className="fa-solid fa-envelope  text-purple-700 fa-xl"></i>
        </Link>
        <Link to="/Projectlist" className=" text-3xl p-4 font-bold no-underline" style={{ textDecoration: 'none' }}>
          <i className="fa-solid fa-circle-user text-purple-700 fa-xl "></i>
        </Link>
      </div>

      <div className="fixed top-0 left-0 h-screen w-64 bg-purple-900 text-white shadow-lg p-4">
        <div className="flex items-center">
          <Link to="/" className="no-underline" style={{ textDecoration: 'none' }}>
            <img src="/logoup.png" alt="logo" className="w-24" />
          </Link>
          <span className="text-3xl ml-2 font-bold">MENU</span>
        </div>

        <ul className="mt-8">
          <li className="relative group py-4">
            <Link to="/" className="flex items-center text-xl font-bold text-white p-2 hover:bg-purple-950 no-underline" style={{ textDecoration: 'none' }}>
              <i className="fa-solid fa-file mr-3"></i> โครงการ 
              <i className="fa-solid fa-play absolute right-4 text-xs top-1/2 transform -translate-y-1/2"></i>
            </Link>
            <ul className="hidden group-hover:block absolute left-full top-0 bg-purple-800 border border-purple-700 shadow-lg rounded-lg p-2 w-max transition-all duration-300">
              <li>
                <Link to="/createproject" className="block p-2 text-white hover:bg-purple-950 rounded  no-underline" style={{ textDecoration: 'none' }}>
                  เปิดโครงการ
                </Link>
              </li>
              <li>
                <Link to="/Projectlist" className="block p-2 text-white hover:bg-purple-950 rounded  no-underline" style={{ textDecoration: 'none' }}>
                  ประวัติเปิดโครงการ
                </Link>
              </li>
            </ul>
          </li>
          <li className="relative group py-4">
            <Link to="/activity" className="flex items-center text-xl font-bold text-white p-2 hover:bg-purple-950 no-underline" style={{ textDecoration: 'none' }}>
              <i className="fa-solid fa-font-awesome mr-2"></i> Activity 
              <i className="fa-solid fa-play absolute right-4 text-xs top-1/2 transform -translate-y-1/2"></i>
            </Link>
            <ul className="hidden group-hover:block absolute left-full top-0 bg-purple-800 border border-purple-700 shadow-lg rounded-lg p-2 w-max transition-all duration-300">
              <li>
                <Link to="/Eventlist" className="block p-2 text-white hover:bg-purple-950 rounded font-bold no-underline" style={{ textDecoration: 'none' }}>
                  ประวัติ Post กิจกรรม
                </Link>
              </li>
              <li>
                <Link to="/Eventlist" className="block p-2 text-white hover:bg-purple-950 rounded font-bold no-underline" style={{ textDecoration: 'none' }}>
                รายชื่อลงทะเบียน
                </Link>
              </li>
            </ul>
          </li>
          <li className="py-4">
            <Link to="/log-hours" className="flex items-center text-xl font-bold text-white p-2 hover:bg-purple-950 no-underline" style={{ textDecoration: 'none' }}>
              <i className="fa-solid fa-download mr-2"></i> บันทึกชั่วโมง
            </Link>
          </li>
          <li className="relative group py-4">
            <Link to="/record" className="flex items-center text-xl font-bold text-white p-2 hover:bg-purple-950 no-underline" style={{ textDecoration: 'none' }}>
              <i className="fa-solid fa-bars mr-2"></i> Record 
              <i className="fa-solid fa-play absolute right-4 text-xs top-1/2 transform -translate-y-1/2"></i>
            </Link>
            <ul className="hidden group-hover:block absolute left-full top-0 bg-purple-800 border border-purple-700 shadow-lg rounded-lg p-2 w-max transition-all duration-300">
              <li>
                <Link to="/registration-list" className="block p-2 text-white hover:bg-purple-950 rounded font-bold no-underline" style={{ textDecoration: 'none' }}>
                  รายชื่อลงทะเบียน
                </Link>
              </li>
              <li>
                <Link to="/evaluation-summary" className="block p-2 text-white hover:bg-purple-950 rounded font-bold no-underline" style={{ textDecoration: 'none' }}>
                  สรุปประเมิน
                </Link>
              </li>
              <li>
                <Link to="/search-history" className="block p-2 text-white hover:bg-purple-950 rounded font-bold no-underline" style={{ textDecoration: 'none' }}>
                  ค้นหาประวัตินิสิต
                </Link>
              </li>
            </ul>
          </li>
          
        </ul>
      </div>
    </>
  );
}

export default Navbar;