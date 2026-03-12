import React, { useEffect, useState } from 'react';
import { courseService } from '../../../service/courseService';
import { userService } from '../../../service/userService';
import { 
  BookOutlined, 
  UserOutlined, 
  TeamOutlined, 
  AppstoreOutlined,
  ArrowUpOutlined,
  RiseOutlined,
  CalendarOutlined,
  EllipsisOutlined
} from '@ant-design/icons';
import { Progress, Table, Tag, Space, Card, Skeleton } from 'antd';

const DashboardPage = () => {
    const [stats, setStats] = useState({
        totalCourses: 0,
        totalUsers: 0,
        totalCategories: 0,
        totalStudents: 0,
        recentCourses: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [coursesRes, usersRes, categoriesRes] = await Promise.all([
                    courseService.getListCourse(),
                    userService.getListUser(),
                    courseService.getCategory()
                ]);

                // Sort for recent projects
                const sortedCourses = [...(coursesRes.data || [])].slice(0, 5);

                setStats({
                    totalCourses: coursesRes.data?.length || 0,
                    totalUsers: usersRes.data?.length || 0,
                    totalCategories: categoriesRes.data?.length || 0,
                    totalStudents: usersRes.data?.filter(u => u.maLoaiNguoiDung === 'HV').length || 0,
                    recentCourses: sortedCourses
                });
            } catch (error) {
                console.error("Lỗi khi tải thống kê:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const columns = [
        {
          title: 'Khóa Học',
          dataIndex: 'tenKhoaHoc',
          key: 'tenKhoaHoc',
          render: (text) => <span className="font-semibold text-gray-700">{text}</span>,
        },
        {
          title: 'Lượt Xem',
          dataIndex: 'luotXem',
          key: 'luotXem',
          render: (views) => <Tag color="blue">{views} views</Tag>,
        },
        {
          title: 'Ngày Tạo',
          dataIndex: 'ngayTao',
          key: 'ngayTao',
          render: (date) => (
            <span className="text-gray-500 text-xs">
              <CalendarOutlined className="mr-1" /> {date}
            </span>
          ),
        },
      ];

    const StatCard = ({ title, value, icon, gradient, trend }) => (
        <Card className="rounded-2xl border-none shadow-md overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1">
            <div className={`absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 rounded-full opacity-10 ${gradient}`}></div>
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-gray-400 text-sm font-medium mb-1 uppercase tracking-wider">{title}</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl font-extrabold text-gray-800">
                            {loading ? <Skeleton.Button active size="small" /> : value}
                        </h3>
                        {!loading && trend && (
                            <span className="text-xs font-bold text-green-500 flex items-center">
                                <ArrowUpOutlined className="mr-0.5" /> {trend}%
                            </span>
                        )}
                    </div>
                </div>
                <div className={`p-4 rounded-xl shadow-inner ${gradient}`}>
                    <div className="text-white text-xl flex items-center justify-center">
                        {icon}
                    </div>
                </div>
            </div>
        </Card>
    );

    return (
        <div className="p-4 lg:p-10 bg-[#f9fafb] min-h-screen animate-fadeIn">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Thống Kê Tổng Quan</h1>
                    <p className="text-gray-500 mt-1">Chào mừng bạn quay trở lại, hệ thống đang hoạt động ổn định.</p>
                </div>
                <div className="flex items-center gap-3 bg-white p-2 rounded-xl shadow-sm border border-gray-100">
                   <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                        <RiseOutlined />
                   </div>
                   <div className="pr-4">
                        <p className="text-[10px] uppercase font-bold text-gray-400 leading-none mb-1">Tình trạng</p>
                        <p className="text-xs font-bold text-green-500 leading-none">Healthy System</p>
                   </div>
                </div>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                <StatCard 
                    title="Khóa học" 
                    value={stats.totalCourses} 
                    icon={<BookOutlined />} 
                    gradient="bg-gradient-to-br from-blue-500 to-blue-700"
                    trend="12"
                />
                <StatCard 
                    title="Người dùng" 
                    value={stats.totalUsers} 
                    icon={<UserOutlined />} 
                    gradient="bg-gradient-to-br from-purple-500 to-purple-700"
                    trend="5"
                />
                <StatCard 
                    title="Học viên" 
                    value={stats.totalStudents} 
                    icon={<TeamOutlined />} 
                    gradient="bg-gradient-to-br from-emerald-500 to-emerald-700"
                    trend="8"
                />
                <StatCard 
                    title="Danh mục" 
                    value={stats.totalCategories} 
                    icon={<AppstoreOutlined />} 
                    gradient="bg-gradient-to-br from-amber-500 to-amber-700"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Recent Courses Table */}
                <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-8 border-b border-gray-50 flex justify-between items-center">
                        <h3 className="text-xl font-black text-gray-800 tracking-tight">Khóa học mới nhất</h3>
                        <button className="text-gray-400 hover:text-indigo-600 transition">
                            <EllipsisOutlined style={{ fontSize: '24px' }} />
                        </button>
                    </div>
                    <div className="p-2">
                        <Table 
                            columns={columns} 
                            dataSource={stats.recentCourses} 
                            pagination={false} 
                            loading={loading}
                            rowKey="maKhoaHoc"
                            className="custom-admin-table"
                        />
                    </div>
                </div>

                {/* Right Sidebar Stats */}
                <div className="flex flex-col gap-8">
                    {/* Distribution Card */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-black text-gray-800 mb-6 tracking-tight">Phân bổ người dùng</h3>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm font-bold">
                                    <span className="text-gray-600">Học viên</span>
                                    <span className="text-emerald-600">{loading ? '...' : Math.round((stats.totalStudents/stats.totalUsers)*100)}%</span>
                                </div>
                                <Progress percent={Math.round((stats.totalStudents/stats.totalUsers)*100)} status="active" strokeColor="#10b981" showInfo={false} />
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm font-bold">
                                    <span className="text-gray-600">Quản trị</span>
                                    <span className="text-indigo-600">{loading ? '...' : 100 - Math.round((stats.totalStudents/stats.totalUsers)*100)}%</span>
                                </div>
                                <Progress percent={100 - Math.round((stats.totalStudents/stats.totalUsers)*100)} status="active" strokeColor="#6366f1" showInfo={false} />
                            </div>
                        </div>
                    </div>

                    {/* Quick Tips or Advice */}
                    <div className="bg-indigo-600 p-8 rounded-3xl shadow-xl text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 -mr-8 -mt-8 rounded-full transition-all group-hover:scale-110"></div>
                        <h3 className="text-lg font-bold mb-2">Tư vấn quản trị</h3>
                        <p className="text-indigo-100 text-sm leading-relaxed">
                            Thêm nhiều khóa học mới trong danh mục "Frontend" đang là xu hướng được quan tâm nhất tháng này.
                        </p>
                        <button className="mt-6 bg-white text-indigo-600 px-5 py-2 rounded-xl text-sm font-black shadow-lg transition-transform hover:scale-105 active:scale-95">
                            Xem báo cáo chi tiết
                        </button>
                    </div>
                </div>
            </div>

            {/* Custom CSS (Could be in index.css but simplified here) */}
            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.8s ease-out forwards;
                }
                .ant-table-wrapper .ant-table {
                    background: transparent;
                }
                .ant-table-thead > tr > th {
                    background: transparent !important;
                    border-bottom: 2px solid #f9fafb !important;
                    color: #9ca3af !important;
                    font-size: 12px !important;
                    text-transform: uppercase !important;
                    letter-spacing: 0.05em !important;
                }
            `}} />
        </div>
    );
};

export default DashboardPage;