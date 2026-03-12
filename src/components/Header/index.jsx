import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { courseService } from "../../service/courseService";
import { useSelector, useDispatch } from "react-redux";
import { setInfoUser } from "../../stores/user";
import { debounce } from "lodash";

const HeaderPages = () => {
    const [showMenu, setShowMenu] = useState(false);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    const searchRef = useRef(null);
    const userMenuRef = useRef(null);
    const categoriesMenuRef = useRef(null);

    const dispatch = useDispatch();
    const { infoUser } = useSelector((state) => state.userSlice);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth' // Cuộn mượt
        });
    };

    // Hàm xử lý điều hướng và cuộn lên đầu trang
    const handleNavigate = (path) => {
        navigate(path);
        scrollToTop();
    };

    // Đóng dropdown khi click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSearchResults(false);
            }
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setUserMenuOpen(false);
            }
            if (categoriesMenuRef.current && !categoriesMenuRef.current.contains(event.target)) {
                setShowMenu(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Hàm xử lý tìm kiếm
    const debouncedSearch = debounce(async (query) => {
        if (query.trim().length < 2) {
            setSearchResults([]);
            setShowSearchResults(false);
            return;
        }

        setIsSearching(true);
        try {
            const res = await courseService.searchCourses(query);
            setSearchResults(res.data || []);
            setShowSearchResults(true);
        } catch (error) {
            console.error("Search error:", error);
            setSearchResults([]);
        }
        setIsSearching(false);
    }, 300);

    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        debouncedSearch(query);
    };

    // Hàm submit search
    const handleSearchSubmit = (e) => {
        if (e.key === "Enter" && searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
            setShowSearchResults(false);
            setSearchQuery("");
            setMobileMenuOpen(false); // Đóng mobile menu
            scrollToTop(); // THÊM DÒNG NÀY
        }
    };

    // Hàm click kết quả tìm kiếm
    const handleResultClick = (course) => {
        navigate(`/detail/${course.maKhoaHoc}`);
        setShowSearchResults(false);
        setSearchQuery("");
        setMobileMenuOpen(false);
        scrollToTop(); // THÊM DÒNG NÀY
    };

    const handleShowMenu = async () => {
        if (categories.length === 0) {
            setLoading(true);
            try {
                const res = await courseService.getCategory();
                setCategories(res.data);
            } catch (err) {
                console.error(err);
                if (err.response?.status === 401) {
                    handleLogout();
                }
            }
            setLoading(false);
        }
        setShowMenu(true);
    };

    useEffect(() => {
        if (mobileMenuOpen && categories.length === 0) {
            handleShowMenu();
        }
    }, [mobileMenuOpen]);

    const handleLogout = () => {
        localStorage.removeItem("INFO_USER");
        dispatch(setInfoUser(null));
        navigate("/login");
        scrollToTop(); // THÊM DÒNG NÀY
        // Thêm toast notification
        if (window.showToast) {
            window.showToast("Đăng xuất thành công", "success");
        }
    };

    const handleQuickAction = (action) => {
        setUserMenuOpen(false);
        navigate(action);
        scrollToTop(); // THÊM DÒNG NÀY
    };

    const isLoggedIn = infoUser && Object.keys(infoUser).length > 0;

    return (
        <header className="flex items-center justify-between px-4 lg:px-6 py-3 bg-white shadow-md sticky top-0 z-50">
            {/* Logo với animation */}
            <div
                className="font-bold text-xl lg:text-2xl text-blue-500 tracking-wide cursor-pointer transition-transform hover:scale-105 active:scale-95"
                onClick={() => handleNavigate("/")} // CẬP NHẬT
                onKeyPress={(e) => e.key === "Enter" && handleNavigate("/")} // CẬP NHẬT
                tabIndex={0}
                role="button"
                aria-label="Trang chủ"
            >
                <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                    E-LEARNING
                </span>
            </div>

            {/* Desktop nav */}
            <nav className="hidden lg:flex gap-6 items-center font-medium text-gray-700">
                {[
                    { path: "/", label: "Trang chủ", icon: "🏠" },
                    { path: "/blog", label: "Blog", icon: "📝" },
                    { path: "/events", label: "Sự kiện", icon: "🎉" },
                    { path: "/info", label: "Thông tin", icon: "ℹ️" },

                ].map((item) => (
                    <button
                        key={item.path}
                        onClick={() => handleNavigate(item.path)} // CẬP NHẬT
                        className="flex items-center gap-1 hover:text-blue-500 transition-all duration-200 hover:scale-105"
                        aria-label={item.label}
                    >
                        <span className="text-sm">{item.icon}</span>
                        {item.label}
                    </button>
                ))}

                {/* Categories Menu với animation */}
                <div
                    ref={categoriesMenuRef}
                    className="relative"
                    onMouseEnter={handleShowMenu}
                    onMouseLeave={() => setShowMenu(false)}
                ><button
                    className="flex items-center gap-1 hover:text-blue-500 transition-all duration-200 ease-in-out hover:scale-105 will-change-transform will-change-color "
                    aria-expanded={showMenu}
                    aria-haspopup="true"
                    onClick={() => {
                        setShowMenu(!showMenu);
                        if (!showMenu) {
                            handleNavigate("/course");
                        }
                    }}
                >
                        <span className="text-sm">📚</span>
                        Khóa học
                        <svg
                            width="16"
                            height="16"
                            className={`transition-transform duration-200 ease-in-out ${showMenu ? "rotate-180" : ""} will-change-transform`}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <path d="M4 6l4 4 4-4" />
                        </svg>
                    </button>
                    {showMenu && (
                        <div className="absolute top-full left-0 mt-3 bg-white rounded-xl shadow-lg border border-gray-200 w-64 animate-fadeInUp">
                            <div className="p-2 border-b border-gray-100">
                                <h3 className="font-semibold text-gray-700 text-sm">Danh mục khóa học</h3>
                            </div>
                            {/* Thêm nút "Tất cả khóa học" */}
                            <button
                                onClick={() => {
                                    navigate("/course");
                                    setShowMenu(false);
                                    scrollToTop();
                                }}
                                className="w-full px-4 py-3 text-left bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors duration-150 flex items-center gap-3 group border-b border-gray-100"
                            >
                                <div className="w-2 h-2 bg-blue-500 rounded-full group-hover:scale-150 transition-transform"></div>
                                <span className="flex-1 text-sm font-medium">Tất cả khóa học</span>
                                <svg width="12" height="12" fill="none" stroke="currentColor" className="opacity-100">
                                    <path d="M5 2l4 4-4 4" />
                                </svg>
                            </button>
                            <div className="max-h-64 overflow-y-auto">
                                {loading ? (
                                    <div className="p-4 text-center">
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                                        <p className="text-sm text-gray-500 mt-2">Đang tải...</p>
                                    </div>
                                ) : categories.length === 0 ? (
                                    <div className="p-4 text-center text-gray-400 text-sm">
                                        Không có danh mục
                                    </div>
                                ) : (
                                    categories.map((cat, idx) => (
                                        <button
                                            key={cat.maDanhMuc || idx}
                                            onClick={() => {
                                                navigate(`/course-page/${cat.maDanhMuc}`);
                                                setShowMenu(false);
                                                scrollToTop();
                                            }}
                                            className="w-full px-4 py-3 text-left hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150 flex items-center gap-3 group"
                                        >
                                            <div className="w-2 h-2 bg-blue-300 rounded-full group-hover:scale-150 transition-transform"></div>
                                            <span className="flex-1 text-sm">{cat.tenDanhMuc}</span>
                                            <svg width="12" height="12" fill="none" stroke="currentColor" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                <path d="M5 2l4 4-4 4" />
                                            </svg>
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </nav>

            {/* Search + User Section */}
            <div className="hidden lg:flex items-center gap-4">
                {/* Search với kết quả tìm kiếm */}
                <div ref={searchRef} className="relative">
                    <div className="relative">
                        <input
                            value={searchQuery}
                            onChange={handleSearchChange}
                            onKeyPress={handleSearchSubmit}
                            onFocus={() => searchQuery && setShowSearchResults(true)}
                            placeholder="Tìm kiếm khóa học..."
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all w-64"
                            aria-label="Tìm kiếm"
                        />
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                            🔍
                        </div>
                        {isSearching && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                            </div>
                        )}
                    </div>

                    {/* Search Results Dropdown - ĐÃ CẬP NHẬT */}
                    {showSearchResults && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 max-h-80 overflow-y-auto z-50 animate-fadeIn">
                            {searchResults.length > 0 ? (
                                <>
                                    <div className="p-3 border-b border-gray-100">
                                        <p className="text-sm font-medium text-gray-600">
                                            Tìm thấy {searchResults.length} kết quả
                                        </p>
                                    </div>
                                    {searchResults.map((result) => (
                                        <button
                                            key={result.maKhoaHoc}
                                            onClick={() => handleResultClick(result)}
                                            className="w-full p-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 flex items-start gap-3"
                                        >
                                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                📚
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-sm truncate">{result.tenKhoaHoc}</p>
                                                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{result.moTa}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-xs text-yellow-600">⭐ {result.danhGia || 4.5}</span>
                                                    <span className="text-xs text-gray-400">•</span>
                                                    <span className="text-xs text-gray-500">{result.nguoiTao?.hoTen || "Admin"}</span>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </>
                            ) : searchQuery.trim().length >= 2 && (
                                <div className="p-4 text-center text-gray-500">
                                    Không tìm thấy kết quả nào
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* User Menu với animation */}
                {isLoggedIn ? (
                    <div ref={userMenuRef} className="relative">
                        <button
                            onClick={() => setUserMenuOpen(!userMenuOpen)}
                            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-full hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 hover:shadow-sm group"
                            aria-expanded={userMenuOpen}
                        >
                            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold shadow-sm group-hover:scale-110 transition-transform">
                                {infoUser.hoTen?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <span className="font-medium max-w-32 truncate">{infoUser.hoTen || 'User'}</span>
                            <svg
                                width="16"
                                height="16"
                                className={`transition-transform duration-200 ${userMenuOpen ? "rotate-180" : ""}`}
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <path d="M4 6l4 4 4-4" />
                            </svg>
                        </button>

                        {/* User Dropdown Menu */}
                        {userMenuOpen && (
                            <div className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 w-56 animate-fadeInUp z-50">
                                <div className="p-4 border-b border-gray-100">
                                    <p className="font-semibold text-gray-800 truncate">{infoUser.hoTen}</p>
                                    <p className="text-sm text-gray-500 truncate">{infoUser.email}</p>
                                </div>

                                {[
                                    { path: "/profile", label: "👤 Hồ sơ cá nhân", action: "/profile" },
                                    { path: "/my-courses", label: "📚 Khóa học của tôi", action: "/my-courses" },
                                    ...(infoUser.maLoaiNguoiDung === "GV"
                                        ? [{ path: "/admin", label: "🛠️ Trang Quản Trị", action: "/admin" }]
                                        : []),
                                ].map((item) => (
                                    <button
                                        key={item.path}
                                        onClick={() => handleQuickAction(item.action)}
                                        className="w-full px-4 py-3 text-left hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150 flex items-center gap-3 text-sm"
                                    >
                                        <span className="text-base">{item.label.split(' ')[0]}</span>
                                        {item.label.split(' ').slice(1).join(' ')}
                                    </button>
                                ))}

                                <div className="p-2 border-t border-gray-100">
                                    <button
                                        onClick={handleLogout}
                                        className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-150 flex items-center gap-3 text-sm font-medium"
                                    >
                                        <span>🚪</span>
                                        Đăng xuất
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex gap-2">
                        <button
                            onClick={() => handleNavigate("/login")} // CẬP NHẬT
                            className="px-6 py-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0 font-medium"
                        >
                            Đăng nhập
                        </button>
                        <button
                            onClick={() => handleNavigate("/register")} // CẬP NHẬT
                            className="px-6 py-2 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-white hover:from-yellow-500 hover:to-yellow-600 transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0 font-medium"
                        >
                            Đăng ký
                        </button>
                    </div>
                )}
            </div>

            {/* Mobile menu button với animation */}
            <button
                className="lg:hidden text-2xl p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Menu"
            >
                {mobileMenuOpen ? "✕" : "☰"}
            </button>

            {/* Mobile Menu Overlay với animation */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-50 animate-fadeIn"
                    onClick={() => setMobileMenuOpen(false)}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="absolute top-0 right-0 w-80 max-w-full bg-white h-full shadow-xl animate-slideInRight overflow-y-auto"
                    >
                        <div className="p-4 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div
                                    className="font-bold text-lg text-blue-500 cursor-pointer"
                                    onClick={() => {
                                        handleNavigate("/"); // CẬP NHẬT
                                        setMobileMenuOpen(false);
                                    }}
                                >
                                    ELEARNING
                                </div>
                                <button
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="p-2 rounded-full hover:bg-gray-100 transition-colors text-xl"
                                    aria-label="Đóng menu"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        {/* User Info Section */}
                        {isLoggedIn && (
                            <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                                        {infoUser.hoTen?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-semibold text-gray-800 truncate">{infoUser.hoTen}</div>
                                        <div className="text-sm text-gray-600 truncate">{infoUser.email}</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Search Section - ĐÃ CẬP NHẬT */}
                        <div className="p-4 border-b border-gray-200">
                            <div className="relative">
                                <input
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                    onKeyPress={handleSearchSubmit}
                                    placeholder="Tìm kiếm..."
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                                />
                                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                    🔍
                                </div>
                                {isSearching && (
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                                    </div>
                                )}
                            </div>

                            {/* Hiển thị kết quả tìm kiếm trên mobile */}
                            {showSearchResults && searchQuery.trim().length >= 2 && !isSearching && searchResults.length > 0 && (
                                <div className="mt-2 max-h-60 overflow-y-auto bg-gray-50 rounded-lg">
                                    {searchResults.slice(0, 3).map((result) => (
                                        <button
                                            key={result.maKhoaHoc}
                                            onClick={() => handleResultClick(result)}
                                            className="w-full p-3 text-left hover:bg-white transition-colors border-b border-gray-200 last:border-b-0"
                                        >
                                            <p className="font-medium text-sm">{result.tenKhoaHoc}</p>
                                            <p className="text-xs text-gray-500 mt-1">{result.moTa?.substring(0, 60)}...</p>
                                        </button>
                                    ))}
                                    {searchResults.length > 3 && (
                                        <button
                                            onClick={() => {
                                                navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
                                                setMobileMenuOpen(false);
                                                setShowSearchResults(false);
                                                setSearchQuery("");
                                                scrollToTop(); // THÊM DÒNG NÀY
                                            }}
                                            className="w-full p-3 text-center text-blue-600 hover:bg-white transition-colors text-sm font-medium"
                                        >
                                            Xem thêm {searchResults.length - 3} kết quả
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Navigation Links */}
                        <div className="p-4 space-y-2">
                            {[
                                { path: "/", label: "🏠 Trang chủ" },
                                { path: "/blog", label: "📝 Blog" },
                                { path: "/events", label: "🎉 Sự kiện" },
                                { path: "/info", label: "ℹ️ Thông tin" },
                                { path: "/course", label: "📚 Khóa học" },

                            ].map((item) => (
                                <button
                                    key={item.path}
                                    onClick={() => {
                                        handleNavigate(item.path); // CẬP NHẬT
                                        setMobileMenuOpen(false);
                                    }}
                                    className="w-full text-left p-3 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150 flex items-center gap-3"
                                >
                                    {item.label}
                                </button>
                            ))}

                            {/* Mobile Categories */}
                            <div className="border-t border-gray-200 pt-3 mt-3">
                                <div className="font-semibold text-gray-700 mb-2 px-3">📚 Khóa học</div>
                                {loading ? (
                                    <div className="px-3 py-2 text-center text-gray-500">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mx-auto"></div>
                                    </div>
                                ) : categories.length === 0 ? (
                                    <div className="px-3 py-2 text-gray-400 text-sm">Không có danh mục</div>
                                ) : (
                                    categories.map((cat, idx) => (
                                        <button
                                            key={cat.maDanhMuc || idx}
                                            onClick={() => {
                                                navigate(`/course-page/${cat.maDanhMuc}`);
                                                setMobileMenuOpen(false);
                                                scrollToTop();
                                            }}
                                            className="w-full text-left p-3 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150 flex items-center gap-3 text-sm"
                                        >
                                            <span className="w-1.5 h-1.5 bg-blue-300 rounded-full"></span>
                                            {cat.tenDanhMuc}
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="p-4 border-t border-gray-200 mt-auto">
                            {isLoggedIn ? (
                                <div className="space-y-3">
                                    {[
                                        { path: "/profile", label: "👤 Hồ sơ cá nhân", action: "/profile" },
                                        { path: "/my-courses", label: "📚 Khóa học của tôi", action: "/my-courses" },
                                    ].map((item) => (
                                        <button
                                            key={item.path}
                                            onClick={() => {
                                                handleQuickAction(item.action);
                                            }}
                                            className="w-full px-4 py-3 text-left hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150 flex items-center gap-3 text-sm"
                                        >
                                            <span className="text-base">{item.label.split(' ')[0]}</span>
                                            {item.label.split(' ').slice(1).join(' ')}
                                        </button>
                                    ))}
                                    <button
                                        onClick={handleLogout}
                                        className="w-full p-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-200 font-medium mt-4"
                                    >
                                        🚪 Đăng xuất
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <button
                                        onClick={() => {
                                            handleNavigate("/login"); // CẬP NHẬT
                                            setMobileMenuOpen(false);
                                        }}
                                        className="w-full p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors duration-200 font-medium"
                                    >
                                        Đăng nhập
                                    </button>
                                    <button
                                        onClick={() => {
                                            handleNavigate("/register"); // CẬP NHẬT
                                            setMobileMenuOpen(false);
                                        }}
                                        className="w-full p-3 bg-yellow-500 text-white rounded-full hover:bg-yellow-600 transition-colors duration-200 font-medium"
                                    >
                                        Đăng ký
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};

export default HeaderPages;