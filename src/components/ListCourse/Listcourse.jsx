import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setListCourseAction } from "../../stores/course";
import { courseService } from "../../service/courseService";
import { Card } from "antd";
import {
  EyeOutlined,
  TeamOutlined,
  CalendarOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Meta } = Card;

const Listcourse = () => {
  const dispatch = useDispatch();
  const listCourse = useSelector((state) => state.courseSlice.listCourse);
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 4;

  const fetchListCourse = async () => {
    try {
      const resListcourse = await courseService.getListCourse();
      dispatch(setListCourseAction(resListcourse.data));
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  useEffect(() => {
    fetchListCourse();
  }, []);

  const handleCourseDetailPage = (courseID) => {
    navigate(`/detail/${courseID}`);
  };

  const paginatedCourses = listCourse?.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const totalPages = Math.ceil((listCourse?.length || 0) / pageSize);

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white  sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-3">
            🚀 Danh Sách Khóa Học Nổi Bật
          </h2>
          <p className="text-lg text-gray-500">
            Cập nhật những khóa học hot nhất giúp bạn chinh phục lập trình.
          </p>
        </div>

        {/* Course Cards */}
        <div className="flex overflow-x-auto pb-4 lg:grid lg:grid-cols-4 gap-8 lg:pb-0 scroll-smooth no-scrollbar">
          {paginatedCourses?.map((course) => (
            <Card
              onClick={() => handleCourseDetailPage(course.maKhoaHoc)}
              key={course.maKhoaHoc}
              hoverable
              cover={
                <div className="relative overflow-hidden">
                  <img
                    alt={course.tenKhoaHoc}
                    src="https://ectimes.wordpress.com/wp-content/uploads/2019/03/cac-ngon-ngu-lap-trinh-pho-bien-2.jpg"
                    className="h-48 w-full object-cover transition-transform duration-300 ease-in-out hover:scale-110 rounded-t-xl"
                    onError={(e) =>
                    (e.target.src =
                      "https://via.placeholder.com/400x200/4F46E5/FFFFFF?text=Course")
                    }
                  />
                  <span className="absolute top-3 left-3 bg-indigo-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow">
                    Hot
                  </span>
                </div>
              }
              className="rounded-xl overflow-hidden bg-white border border-gray-200 shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex-shrink-0 w-[280px] sm:w-[300px] lg:w-auto"
            >
              <div className="p-5">
                <Meta
                  title={
                    <h3 className="font-semibold text-lg text-gray-900 mb-2 leading-tight line-clamp-2">
                      {course.tenKhoaHoc}
                    </h3>
                  }
                  description={
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2 min-h-[42px]">
                      {course.moTa}
                    </p>
                  }
                />

                {/* Info */}
                <div className="flex justify-between items-center text-xs text-gray-500 mb-5 pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-1">
                    <EyeOutlined />
                    <span>{course.luotXem?.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TeamOutlined />
                    <span>{course.soLuongHocVien}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CalendarOutlined />
                    <span>{course.ngayTao}</span>
                  </div>
                </div>

                {/* Button */}
                <button
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-medium text-sm flex items-center justify-center gap-2 hover:opacity-90 hover:scale-[1.02] transition"
                >
                  Xem Chi Tiết
                  <ArrowRightOutlined className="text-xs" />
                </button>
              </div>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-12 gap-2 select-none">
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
      </div>
    </div>
  );
};

export default Listcourse;
