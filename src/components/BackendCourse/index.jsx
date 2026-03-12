import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { courseService } from "../../service/courseService";

const BackendCourse = () => {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 4; // số item hiển thị trên 1 dòng
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };
    const DEFAULT_IMG =
        "https://canhme.com/wp-content/uploads/2018/09/Nodejs.png";

    useEffect(() => {
        let active = true;
        const fetchBackendCourses = async () => {
            try {
                setLoading(true);
                const res = await courseService.getCoursesByCategory("BackEnd", "GP01");
                if (!active) return;
                setCourses(res.data || []);
            } catch (e) {
                if (!active) return;
                console.error("Lỗi tải khóa học BackEnd:", e);
                setCourses([]);
            } finally {
                if (active) setLoading(false);
            }
        };
        fetchBackendCourses();
        return () => {
            active = false;
        };
    }, []);

    const openDetail = (id) => {
        navigate(`/detail/${id}`);
        scrollToTop();
    };
    const openAll = () => {
        navigate("/course-page/BackEnd");
        scrollToTop();
    };


    // Tính toán dữ liệu phân trang
    const totalPages = Math.ceil(courses.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const visibleCourses = courses.slice(startIndex, startIndex + pageSize);

    return (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                        Khóa học Backend nổi bật
                    </h2>
                    <p className="text-gray-500 mt-1">
                        Khám phá những khóa học về Node.js, Database, API, .NET, Java,...
                    </p>
                </div>
                <button
                    onClick={openAll}
                    className="w-full sm:w-auto text-indigo-700 hover:text-white border border-indigo-200 hover:border-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-600 transition text-center"
                >
                    Xem tất cả
                </button>
            </div>

            {loading ? (
                // Skeleton loading
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div
                            key={i}
                            className="animate-pulse rounded-xl border border-gray-200 bg-white p-4"
                        >
                            <div className="h-40 bg-gray-200 rounded mb-4"></div>
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                    ))}
                </div>
            ) : courses.length === 0 ? (
                <div className="text-gray-600">Chưa có khóa học BackEnd nào.</div>
            ) : (
                <>
                    {/* Chỉ 1 dòng (4 khóa học / trang) */}
                    <div className="flex overflow-x-auto pb-4 lg:grid lg:grid-cols-4 gap-6 lg:pb-0 scroll-smooth no-scrollbar">
                        {visibleCourses.map((course) => (
                            <div
                                key={course.maKhoaHoc}
                                onClick={() => openDetail(course.maKhoaHoc)}
                                className="group cursor-pointer rounded-xl overflow-hidden bg-white border border-gray-200 shadow-sm hover:shadow-lg transition flex-shrink-0 w-[280px] sm:w-[300px] lg:w-auto"
                                title={course.tenKhoaHoc}
                            >
                                <div className="relative">
                                    <img
                                        src={course.hinhAnh || DEFAULT_IMG}
                                        alt={course.tenKhoaHoc}
                                        className="h-40 w-full object-cover"
                                        onError={(e) => {
                                            e.currentTarget.src = DEFAULT_IMG;
                                        }}
                                    />
                                    <span className="absolute top-2 left-2 bg-emerald-600 text-white text-xs font-semibold px-2 py-1 rounded">
                                        BackEnd
                                    </span>
                                </div>
                                <div className="p-4">
                                    <h3 className="font-semibold text-gray-900 line-clamp-2 min-h-[44px] group-hover:text-indigo-700">
                                        {course.tenKhoaHoc}
                                    </h3>
                                    <p className="mt-2 text-sm text-gray-500 line-clamp-2 min-h-[40px]">
                                        {course.moTa}
                                    </p>
                                    <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                                        <span>
                                            👁️{" "}
                                            {course.luotXem?.toLocaleString?.() || course.luotXem || 0}
                                        </span>
                                        <span>👨‍🎓 {course.soLuongHocVien || 0}</span>
                                    </div>
                                </div>
                                <div className="px-4 pb-4">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            openDetail(course.maKhoaHoc);
                                        }}
                                        className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium text-sm hover:bg-indigo-700 transition"
                                    >
                                        Xem chi tiết
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center mt-10 gap-2 select-none">
                            {/* Prev */}
                            <button
                                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                                disabled={currentPage === 1}
                                className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 shadow-sm"
                            >
                                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>

                            {/* Page Numbers */}
                            <div className="flex items-center gap-1">
                                {Array.from({ length: totalPages }).map((_, i) => {
                                    const page = i + 1;
                                    if (
                                        page === 1 ||
                                        page === totalPages ||
                                        (page >= currentPage - 1 && page <= currentPage + 1)
                                    ) {
                                        return (
                                            <button
                                                key={page}
                                                onClick={() => setCurrentPage(page)}
                                                className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-semibold transition-all duration-300 ${currentPage === page
                                                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 translate-y-[-2px]"
                                                    : "text-gray-600 hover:bg-indigo-50 hover:text-indigo-600"
                                                    }`}
                                            >
                                                {page}
                                            </button>
                                        );
                                    }
                                    if (page === currentPage - 2 || page === currentPage + 2) {
                                        return (
                                            <span key={page} className="w-8 text-center text-gray-400 font-bold">
                                                ...
                                            </span>
                                        );
                                    }
                                    return null;
                                })}
                            </div>

                            {/* Next */}
                            <button
                                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 shadow-sm"
                            >
                                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    )}
                </>
            )}
        </section>
    );
};

export default BackendCourse;
