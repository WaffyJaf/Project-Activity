import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../component/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../component/ui/Table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../component/ui/Select';
import { fetchDashboardStats, fetchActivities } from '../api/dashboard';
import { useNavigate } from 'react-router-dom';
import Navbar from '../component/navbar';

const toAD = (yearStr: string) => {
  const y = parseInt(yearStr, 10);
  return y > 2400 ? y - 543 : y; // แปลง พ.ศ. -> ค.ศ.
};

const getAcademicYearOptions = (count = 5): { value: string; label: string }[] => {
  const now = new Date();
  const m = now.getMonth(); // 0-11
  const adYear = m >= 5 ? now.getFullYear() : now.getFullYear() - 1; // เริ่ม มิ.ย.
  return Array.from({ length: count }, (_, i) => {
    const ad = adYear - i;
    const be = ad + 543;
    return { value: String(ad), label: `ปีการศึกษา ${be}` };
  });
};

interface DashboardStats {
  totalActivities: number;
  activitiesByFaculty: { faculty: string; count: number }[];
  activitiesByStatus: { status: string; count: number }[];
  activitiesByDepartment: { department: string | null; count: number }[]; // ✅ ต้องมีให้ตรงหลังบ้าน
}

interface Activity {
  project_id: number;
  project_name: string;
  project_status: 'pending' | 'approved' | 'rejected' | string;
  department: string;
  created_date: string;
  registration_activity: { faculty: string }[];
}

const statusChip = (s: string) => {
  if (s === 'approved') return 'bg-green-100 text-green-800 border border-green-200';
  if (s === 'pending') return 'bg-amber-100 text-amber-900 border border-amber-200';
  if (s === 'rejected') return 'bg-rose-100 text-rose-800 border border-rose-200';
  return 'bg-gray-100 text-gray-800 border border-gray-200';
};

function getThaiStatus(status: string): string {
    switch (status) {
      case 'approved':
        return 'อนุมัติ';
      case 'rejected':
        return 'ปฏิเสธ';
      case 'pending':
        return 'รอดำเนินการ';
      default:
        return 'ไม่ระบุ';
    }
  }

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [facultyFilter, setFacultyFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('');
  const [academicYear, setAcademicYear] = useState<string>('');

  const [page, setPage] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const limit = 10;
  const navigate = useNavigate();

  const AY_OPTIONS = getAcademicYearOptions(6);

  // ✅ reset หน้าเมื่อเปลี่ยน filter ใด ๆ
  useEffect(() => {
    setPage(1);
  }, [facultyFilter, statusFilter, departmentFilter, academicYear]);

  // ✅ โหลดข้อมูล (ใส่ page ใน deps ด้วย)
  useEffect(() => {
    const rangeParams = academicYear ? { ay: academicYear } : {};

    fetchDashboardStats(rangeParams as any).then(setStats);

    fetchActivities({
      faculty: facultyFilter,
      status: statusFilter,
      department: departmentFilter,
      page,
      limit,
      ...(rangeParams as any),
    }).then((data) => {
      setActivities(data.activities);
      setTotal(data.total);
    });
  }, [facultyFilter, statusFilter, departmentFilter, academicYear, page]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  // ✅ เตรียม options ของ Department เป็น string ล้วน กัน TS แดง
  const deptOptions: string[] = ((stats?.activitiesByDepartment ?? []) as {
    department: string | null;
    count: number;
  }[])
    .filter((d) => typeof d.department === 'string' && d.department.trim() !== '')
    .map((d) => d.department as string);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 ml-64">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Header + Filters + Stat cards */}
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-purple-700 to-fuchsia-600 bg-clip-text text-transparent">
                  ภาพรวมกิจกรรม
                </h1>
                <p className="text-sm text-purple-700/70 mt-1">ภาพรวมกิจกรรม • ตารางกิจกรรม</p>
              </div>

              {/* Filters */}
              <div className="mt-4 flex flex-wrap gap-3">
                {/* ปีการศึกษา */}
                <div className="flex items-center gap-2 bg-white/70 border border-purple-200 rounded-xl px-3 py-2 shadow-sm">
                  <i className="fa-solid fa-calendar-days text-purple-700/90"></i>
                  <Select value={academicYear} onValueChange={setAcademicYear}>
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกปีการศึกษา" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">ทุกปีการศึกษา</SelectItem>
                      {AY_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Department */}
                <div className="flex items-center gap-2 bg-white/70 border border-purple-200 rounded-xl px-3 py-2 shadow-sm">
                  <i className="fa-solid fa-sitemap text-purple-700/90"></i>
                  <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by Department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">ทั้งหมด</SelectItem>
                      {deptOptions.map((dep) => (
                        <SelectItem key={dep} value={dep}>
                          {dep}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* สถานะ */}
                <div className="flex items-center gap-2 bg-white/70 border border-purple-200 rounded-xl px-3 py-2 shadow-sm">
                  <i className="fa-solid fa-filter text-purple-700/90"></i>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">ทั้งหมด</SelectItem>
                      <SelectItem value="pending">รอดำเนินการ</SelectItem>
                      <SelectItem value="approved">อนุมัติ</SelectItem>
                      <SelectItem value="rejected">ปฏิเสธ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Stat cards */}
              {stats ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 bg">
                  <Card className=" bg-gradient-to-br from-violet-800 to-purple-800 text-white border-transparent shadow-xl">
                    <CardHeader className="flex items-center justify-between">
                      <CardTitle className="text-purple-900">กิจกรรมทั้งหมด</CardTitle>
                      <i className="fa-solid fa-layer-group text-white"></i>
                    </CardHeader>
                    <CardContent>
                      <p className="text-4xl font-extrabold text-white">{stats.totalActivities}</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/80 border-purple-100 shadow-lg hover:shadow-xl transition-shadow">
                    <CardHeader className="flex items-center justify-between">
                      <CardTitle className="text-purple-900">คณะ / หน่วยงาน</CardTitle>
                      <i className="fa-solid fa-building text-purple-600"></i>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-1">
                        {stats.activitiesByFaculty.map((item, index) => (
                          <div key={index} className="flex items-center justify-between text-sm">
                            <span className="text-purple-900/90">{item.faculty}</span>
                            <span className="font-semibold text-purple-700">{item.count}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/80 border-purple-100 shadow-lg hover:shadow-xl transition-shadow">
                    <CardHeader className="flex items-center justify-between">
                      <CardTitle className="text-purple-900">สถานะ</CardTitle>
                      <i className="fa-solid fa-signal text-purple-600"></i>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {stats.activitiesByStatus.map((item, index) => (
                          <span
                            key={index}
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${statusChip(item.status)}`}
                          >
                            {getThaiStatus(item.status)} : {item.count}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  {[...Array(3)].map((_, i) => (
                    <Card key={i} className="bg-white/60 border-purple-100 shadow-md">
                      <CardHeader>
                        <div className="h-4 bg-purple-100 animate-pulse rounded w-1/2"></div>
                      </CardHeader>
                      <CardContent>
                        <div className="h-8 bg-purple-100 animate-pulse rounded w-1/3"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <Card className="bg-white/90 border-purple-100 shadow-xl">
              <CardHeader className="flex items-center justify-between">
                <CardTitle className="text-purple-900">ตารางกิจกรรม</CardTitle>
                <div className="text-sm text-purple-700/70">
                  รายการ <span className="font-semibold text-purple-900">{activities.length}</span> จาก{' '}
                  <span className="font-semibold text-purple-900">{total}</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto rounded-xl border border-purple-100">
                  <Table className="bg-white/80">
                    <TableHeader>
                      <TableRow className="bg-gradient-to-r from-purple-50 to-fuchsia-50">
                        <TableHead className="bg-purple-50 text-purple-900">ไอดี</TableHead>
                        <TableHead className="bg-purple-50 text-purple-900">ชื่อ</TableHead>
                        <TableHead className="bg-purple-50 text-purple-900">หน่วยงาน</TableHead>
                        <TableHead className="bg-purple-50 text-purple-900">สถานะ</TableHead>
                        <TableHead className="bg-purple-50 text-purple-900">วันที่</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activities.map((activity, idx) => (
                        <TableRow
                          key={activity.project_id}
                          onClick={() => navigate(`/Projectdetail/${activity.project_id}`)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') navigate(`/activities/${activity.project_id}`);
                          }}
                          role="button"
                          tabIndex={0}
                          className={`cursor-pointer hover:bg-purple-200 transition-colors ${idx % 2 === 1 ? 'bg-purple-50/30' : ''}`}
                        >
                          <TableCell className="text-purple-900">{activity.project_id}</TableCell>
                          <TableCell className="text-purple-900 font-medium">{activity.project_name}</TableCell>
                          <TableCell className="text-purple-900/90">{activity.department || '-'}</TableCell>
                          <TableCell>
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusChip(
                                activity.project_status
                              )}`}
                            >
                              {getThaiStatus(activity.project_status)}
                            </span>
                          </TableCell>
                          <TableCell className="text-purple-900/90">
                            {new Date(activity.created_date).toLocaleDateString('th-TH', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                <div className="mt-5 flex flex-col md:flex-row items-center justify-between gap-3">
                  <div className="text-sm text-purple-800/70">
                    หน้า <span className="font-semibold text-purple-900">{page}</span> จาก{' '}
                    <span className="font-semibold text-purple-900">{totalPages}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 rounded-lg border border-purple-200 text-purple-700 bg-white hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <i className="fa-solid fa-chevron-left mr-2"></i> ก่อนหน้า
                    </button>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page >= totalPages}
                      className="px-4 py-2 rounded-lg border border-purple-200 text-white bg-gradient-to-r from-purple-600 to-purple-600 hover:from-purple-700 hover:to-fuchsia-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ต่อไป <i className="fa-solid fa-chevron-right ml-2"></i>
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
