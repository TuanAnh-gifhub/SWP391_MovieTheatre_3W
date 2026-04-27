import { motion } from "framer-motion"; // Import framer-motion
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaArrowRight, FaMapMarkerAlt, FaEnvelope, FaPhone } from "react-icons/fa";
import logoImg from "../../../assets/img/logo.png";
import contactImg from "../../../assets/img/journal1.png";
import clusterMapImg from "../../../assets/img/ban-do-viet-nam.png"; // Thay ảnh thực tế

// ScrambleText: Hiệu ứng giải mã chữ (copy từ LandingPage)
const ScrambleText = ({ text, triggerKey, duration = 400, interval = 30, className = "" }) => {
  const [display, setDisplay] = useState(text);
  useEffect(() => {
    let mounted = true;
    let frame = 0;
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=<>?";
    const textArr = text.split("");
    let revealCount = 0;
    setDisplay(textArr.map(() => "").join(""));
    const totalFrames = Math.ceil(duration / interval);
    const scramble = () => {
      if (!mounted) return;
      if (frame < totalFrames) {
        // Reveal progressively
        revealCount = Math.floor((frame / totalFrames) * textArr.length);
        const scrambled = textArr.map((c, i) => {
          if (i < revealCount) return c;
          if (c === " ") return " ";
          return chars[Math.floor(Math.random() * chars.length)];
        });
        setDisplay(scrambled.join(""));
        frame++;
        setTimeout(scramble, interval);
      } else {
        setDisplay(text);
      }
    };
    scramble();
    return () => { mounted = false; };
    // eslint-disable-next-line
  }, [triggerKey, text]);
  return <span className={className}>{display}</span>;
};

const cinemaClusters = [
  {
    title: "TRỤ SỞ | HEADQUARTER",
    details: [
      { icon: <FaMapMarkerAlt className="text-red-600 mr-2" />, text: "135 Công Nghệ Cao, Phường Long Thạnh Mỹ, Quận 9" },
      { icon: <FaEnvelope className="text-red-600 mr-2" />, text: "cskh@sixcinema.vn" },
      { icon: <FaPhone className="text-red-600 mr-2" />, text: "1800.6969.6969" },
    ],
  },
  {
    title: "SIX Cinema (TP.HCM)",
    details: [
      { text: "Hân hạnh được phục vụ quý khách" },
      { text: "271 Công Nghệ Cao, Phường Long Thạnh Mỹ , Quận 9, Thành Phố Hồ Chí Minh" },
    ],
  },
  {
    title: "SIX Cinema (Cần Thơ)",
    details: [
      { text: "Hân hạnh được phục vụ quý khách" },
      { text: "Tầng 6, TTTM Vincom, 1466 Võ Văn Kiệt, Phường Ninh Kiều, Cần Thơ" },
    ],
  },
  {
    title: "SIX Cinema (Hà Nội)",
    details: [
      { text: "Hân hạnh được phục vụ quý khách" },
      { text: "135 Hai Bà Trưng, Quận Hai Bà Trưng, Hà Nội" },
    ],
  },
];

const ageRatingOptions = [
  { value: "P", label: "P - Phim được phép phổ biến đến người xem ở mọi độ tuổi." },
  { value: "K", label: "K - Phim được phép phổ biến đến người xem dưới 13 tuổi và có người bảo hộ đi kèm." },
  { value: "T13", label: "T13 - Phim được phép phổ biến đến người xem từ đủ 13 tuổi trở lên (13+)." },
  { value: "T16", label: "T16 - Phim được phép phổ biến đến người xem từ đủ 16 tuổi trở lên (16+)." },
  { value: "T18", label: "T18 - Phim được phép phổ biến đến người xem từ đủ 18 tuổi trở lên (18+)." },
  { value: "C", label: "C - Phim không được phép phổ biến." },
];

function FAQAccordion({ small }) {
  const [openIdx, setOpenIdx] = useState(null);
  return (
    <div className="flex flex-col gap-0">
      {FAQ_LIST.map((item, idx) => {
        const isOpen = openIdx === idx;
        return (
          <div
            key={idx}
            className={`border-b border-gray-300 bg-[#f7f7f7] transition-all duration-200`}
          >
            <button
              className={`w-full flex items-center justify-between ${small ? 'px-4 py-4 text-base' : 'px-8 py-8 md:py-10 text-lg md:text-xl'} text-left font-mono font-semibold tracking-tight focus:outline-none group hover:bg-gray-100 transition`}
              onClick={() => setOpenIdx(isOpen ? null : idx)}
              aria-expanded={isOpen}
            >
              <span className="block text-black">{item.question}</span>
              <span
                className={`ml-6 flex items-center justify-center rounded-md transition-all duration-200 bg-[#ff7120] text-white font-bold ${small ? 'text-xl w-8 h-8' : 'text-3xl md:text-4xl w-14 h-14 md:w-16 md:h-16'} select-none shadow-lg group-hover:scale-110`}
                style={{ borderRadius: '10%' }}
                aria-label={isOpen ? 'Đóng' : 'Mở'}
              >
                {isOpen ? <span className={small ? 'text-xl' : 'text-4xl'}>×</span> : <span className={small ? 'text-xl' : 'text-4xl'}>+</span>}
              </span>
            </button>
            {isOpen && (
              <div className={`${small ? 'px-4 pb-4' : 'px-8 pb-10'} pt-0 animate-fade-in-slide`}>
                <div className={`font-mono text-gray-700 whitespace-pre-line leading-relaxed ${small ? 'text-sm' : 'text-base md:text-lg'}`}>
                  {item.answer}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

const FAQ_LIST = [
  {
    question: "Làm sao để mua vé xem phim tại SIX CINEMA?",
    answer: "Bạn có thể mua vé trực tuyến qua website, ứng dụng hoặc tại quầy vé rạp.",
  },
  {
    question: "Vé đã mua có thể đổi hoặc trả lại không?",
    answer: "Vé mua được đổi hoặc trả lại, trừ trường hợp đặc biệt do SIX CINEMA quy định.",
  },
  {
    question: "SIX CINEMA có chương trình ưu đãi không?",
    answer: "Chúng tôi thường xuyên có chương trình khuyến mãi, vui lòng theo dõi website và fanpage để cập nhật.",
  },
  {
    question: "Làm thế nào liên hệ khi gặp sự cố vé?",
    answer: "Liên hệ tổng đài 1800.6969.6969 hoặc email support@sixcinema.vn để được hỗ trợ.",
  },
];

const AboutUsPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
  };

  return (
    <div className="pt-2 min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-orange-50 text-[15px] md:text-base">
      {/* 1. Banner giới thiệu */}
      <AboutUsIntroSection small />

      {/* 2. Sứ mệnh & Tầm nhìn + Giá trị cốt lõi */}
      <div className="bg-gradient-to-r from-pink-50 via-orange-50 to-purple-100 py-8">
        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-6">
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="bg-gradient-to-br from-white via-pink-100 to-orange-100 rounded-2xl shadow-xl p-5 hover:shadow-2xl transition-all border-l-8 border-purple-400"
          >
            <h2 className="text-xl font-extrabold mb-3 text-purple-700 drop-shadow-lg">Sứ mệnh & Tầm nhìn</h2>
            <p className="text-gray-800 mb-2 text-base">
              <strong>Sứ mệnh:</strong> Mang đến trải nghiệm điện ảnh đỉnh cao, góp phần nâng tầm văn hóa giải trí Việt Nam.
            </p>
            <p className="text-gray-800 text-base">
              <strong>Tầm nhìn:</strong> Trở thành hệ thống rạp chiếu phim hàng đầu Đông Nam Á với công nghệ hiện đại và dịch vụ xuất sắc.
            </p>
          </motion.section>
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="bg-gradient-to-br from-white via-pink-100 to-orange-100 rounded-2xl shadow-xl p-5 hover:shadow-2xl transition-all border-l-8 border-purple-400"
          >
            <h2 className="text-xl font-extrabold mb-3 text-purple-700 drop-shadow-lg">Giá trị cốt lõi</h2>
            <ul className="list-disc pl-6 text-gray-800 space-y-2 text-base">
              <li className="hover:text-pink-600 transition font-semibold">Khách hàng là trung tâm</li>
              <li className="hover:text-pink-600 transition font-semibold">Đổi mới sáng tạo</li>
              <li className="hover:text-pink-600 transition font-semibold">Chất lượng vượt trội</li>
              <li className="hover:text-pink-600 transition font-semibold">Chuyên nghiệp & tận tâm</li>
              <li className="hover:text-pink-600 transition font-semibold">Trách nhiệm cộng đồng</li>
            </ul>
          </motion.section>
        </div>
      </div>

      {/* 3. Thành tựu nổi bật */}
      <div className="bg-gradient-to-r from-purple-100 via-pink-50 to-orange-100 py-8">
        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-6">
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="bg-gradient-to-br from-white via-pink-100 to-orange-100 rounded-2xl shadow-xl p-5 hover:shadow-2xl transition-all border-l-8 border-pink-400"
          >
            <h2 className="text-xl font-extrabold mb-3 text-pink-700 drop-shadow-lg">Thành tựu nổi bật</h2>
            <ul className="list-disc pl-6 text-gray-800 space-y-2 text-base">
              <li className="hover:text-purple-700 transition font-semibold">Top 3 hệ thống rạp chiếu phim lớn nhất Việt Nam 2024</li>
              <li className="hover:text-purple-700 transition font-semibold">Đạt giải thưởng “Rạp chiếu phim công nghệ xuất sắc” năm 2023</li>
              <li className="hover:text-purple-700 transition font-semibold">Phục vụ hơn 5 triệu lượt khách mỗi năm</li>
            </ul>
          </motion.section>
          <div></div>
        </div>
      </div>

      {/* 4. Điều khoản & Chính sách */}
      <div className="bg-gray-50 py-8">
        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-6">
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <h2 className="text-lg font-semibold mb-2 text-red-700">Điều khoản chung</h2>
            <p className="text-gray-700 mb-2 text-sm">
              Khi sử dụng dịch vụ của SIX CINEMA, bạn đồng ý tuân thủ các điều khoản và quy định nhằm đảm bảo quyền lợi và nghĩa vụ của cả hai bên.
            </p>
            <p className="text-gray-700 text-sm">
              Chúng tôi có quyền điều chỉnh điều khoản mà không cần báo trước, do đó vui lòng kiểm tra thường xuyên để cập nhật.
            </p>
            <h2 className="text-lg font-semibold mt-4 mb-2 text-red-700">Điều khoản giao dịch</h2>
            <p className="text-gray-700 mb-2 text-sm">
              Giao dịch mua vé được thực hiện qua website và ứng dụng chính thức.
            </p>
            <p className="text-gray-700 text-sm">
              Khách hàng chịu trách nhiệm bảo quản vé và thông tin cá nhân khi giao dịch.
            </p>
          </motion.section>
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <h2 className="text-lg font-semibold mb-2 text-red-700">Chính sách thanh toán</h2>
            <p className="text-gray-700 mb-2 text-sm">
              SIX CINEMA hỗ trợ thanh toán đa dạng: thẻ tín dụng, thẻ ghi nợ, ví điện tử và thanh toán tại quầy.
            </p>
            <p className="text-gray-700 text-sm">
              Mọi giao dịch được bảo mật theo tiêu chuẩn quốc tế nhằm bảo vệ thông tin khách hàng.
            </p>
            <h2 className="text-lg font-semibold mt-4 mb-2 text-red-700">Chính sách bảo mật</h2>
            <p className="text-gray-700 text-sm">
              Chúng tôi cam kết bảo vệ thông tin cá nhân của khách hàng theo quy định pháp luật. Thông tin thu thập được sử dụng để nâng cao trải nghiệm và không chia sẻ cho bên thứ ba nếu không có sự đồng ý.
            </p>
          </motion.section>
        </div>
      </div>

      {/* 5. HỆ THỐNG CỤM RẠP (đã bỏ Google Maps embed) */}
      <motion.section
        className="py-8 bg-white container mx-auto px-4 max-w-7xl"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeIn}
      >
        <h2 className="text-xl font-semibold mb-4 text-red-700 text-center">HỆ THỐNG CỤM RẠP</h2>
        <div className="flex flex-col md:flex-row gap-12">
          <div className="md:w-1/2 flex flex-col items-center gap-6">
            <img
              src={clusterMapImg}
              alt="Bản đồ hệ thống cụm rạp"
              className="max-w-full h-auto rounded-lg shadow-lg"
            />
          </div>
          <div className="md:w-1/2 space-y-6 max-h-[700px] overflow-y-auto pr-4 bg-transparent">
            {cinemaClusters.map(({ title, details }, idx) => (
              <div
                key={idx}
                className="bg-white rounded-lg shadow-md p-3 border border-gray-200"
              >
                <h3 className="text-red-700 font-semibold text-base mb-2 uppercase tracking-wide">
                  {title}
                </h3>
                <ul className="text-gray-700 space-y-2 list-none">
                  {details.map(({ icon, text }, i) => (
                    <li key={i} className="flex items-center">
                      {icon && <span className="flex-shrink-0">{icon}</span>}
                      <span className={icon ? "ml-2" : ""}>{text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* 6. FAQ */}
      <AboutUsFAQSection small />

      {/* 7. Liên hệ & Thông tin pháp lý (đã bỏ Google Maps embed) */}
      <motion.section
        className="py-8 bg-white container mx-auto px-4 max-w-4xl"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeIn}
      >
        <h2 className="text-xl font-semibold mb-4 text-red-700">Liên hệ SIX CINEMA</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="text-gray-700 space-y-4">
            <p className="text-sm"><strong>Địa chỉ:</strong>  135 Công Nghệ Cao, Phường Long Thạnh Mỹ, Quận 9</p>
            <p className="text-sm">
              <strong>Email:</strong>{" "}
              <a href="mailto:cskh@sixcinema.vn" className="text-red-700 hover:underline ml-1">
                cskh@sixcinema.vn
              </a>
            </p>
            <p className="text-sm"><strong>Điện thoại:</strong> 1800.6969.6969</p>
            <p className="text-sm">
              <strong>Fanpage:</strong>{" "}
              <a
                href="https://www.facebook.com/tran.le.tuan.anh.830328/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-red-700 hover:underline ml-1"
              >
                facebook.com/sixcinema
              </a>
            </p>
          </div>
          <div>
            <img
              src={contactImg}
              alt="Liên hệ SIX CINEMA"
              className="w-full h-40 object-cover rounded mb-4"
            />
          </div>
        </div>
        <div className="mt-8">
          <h2 className="text-base font-semibold mb-1 text-red-700">Thông tin pháp lý</h2>
          <p className="text-gray-700 text-xs">
            Công ty TNHH SIX CINEMA | Mã số doanh nghiệp: 0123456789 | Cấp ngày: 01/01/2020 tại Sở KHĐT TP.HCM<br />
            Địa chỉ trụ sở: 135 Công Nghệ Cao, Phường Long Thạnh Mỹ, Quận 9, TP.HCM
          </p>
        </div>
      </motion.section>

      {/* BẢNG QUY ĐỊNH ĐỘ TUỔI XEM PHIM */}
      <motion.section
        className="py-8 bg-white container mx-auto px-4 max-w-4xl"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeIn}
      >
        <h2 className="text-xl font-semibold mb-4 text-red-700 text-center">II. PHÂN LOẠI PHIM THEO ĐỘ TUỔI</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 bg-white rounded-lg shadow">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-2 border-b border-gray-300 text-left font-bold text-sm">Phân loại</th>
                <th className="py-2 px-2 border-b border-gray-300 text-left font-bold text-sm">Định nghĩa</th>
              </tr>
            </thead>
            <tbody>
              {ageRatingOptions.map((opt) => (
                <tr key={opt.value} className="hover:bg-orange-50">
                  <td className="py-1 px-2 border-b border-gray-200 font-semibold text-xs">{opt.value}</td>
                  <td className="py-1 px-2 border-b border-gray-200 text-xs">{opt.label}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-6 text-gray-700 text-xs space-y-2">
          <div>
            <b>Lưu ý:</b> Quý khách hàng xem phim được phân loại T13, T16, T18 vui lòng mang theo giấy tờ tùy thân có ảnh nhận diện và ngày tháng năm sinh để đảm bảo việc tuân thủ theo quy định. Rạp có quyền yêu cầu xuất trình giấy tờ xác định độ tuổi.
          </div>
          <div>
            Ban Quản Lý Cụm Rạp Chiếu Phim có quyền kiểm tra và từ chối khách hàng nếu không đúng quy định về độ tuổi.
          </div>
          <div>
            <b>Chế tài:</b> Phạt tiền từ 60.000.000 đồng đến 80.000.000 đồng đối với hành vi không đảm bảo người xem phim đúng độ tuổi theo phân loại phim.
          </div>
        </div>
      </motion.section>
    </div>
  );
};

// Tách phần I. Giới thiệu SIX CINEMA thành component
export function AboutUsIntroSection({ id, showDetailButton, small, triggerDecode }) {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
  };
  return (
    <motion.section
      id={id}
      className={`bg-gradient-to-r from-purple-700 via-pink-500 via-40% to-orange-400 container mx-auto grid grid-cols-1 md:grid-cols-2 items-center shadow-2xl rounded-2xl mb-8 ${small ? 'py-6 px-2 gap-4' : 'py-12 px-8 gap-12'}`}
      initial="hidden"
      animate="visible"
      variants={fadeIn}
    >
      <div>
        <motion.h1
          className={`font-extrabold text-white drop-shadow-xl tracking-tight ${small ? 'text-2xl mb-3' : 'text-5xl mb-8'}`}
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <ScrambleText text="I. Giới thiệu SIX CINEMA" triggerKey={triggerDecode} className="inline-block" />
        </motion.h1>
        <p className={`text-white/90 font-medium drop-shadow ${small ? 'mb-2 text-sm' : 'mb-6 text-lg'}`}>
          SIX CINEMA là hệ thống rạp chiếu phim hiện đại hàng đầu tại Việt Nam, mang đến trải nghiệm điện ảnh đỉnh cao với công nghệ hình ảnh và âm thanh tiên tiến.
        </p>
        <p className={`text-white/90 font-medium drop-shadow ${small ? 'mb-3 text-sm' : 'mb-8 text-lg'}`}>
          Chúng tôi phục vụ đa dạng phim trong nước và quốc tế, không gian thoải mái, dịch vụ chuyên nghiệp. SIX CINEMA là điểm đến lý tưởng cho mọi tín đồ điện ảnh.
        </p>
        <motion.div
          className=" text-white font-bold px-6  items-center justify-between min-w-[180px] mt-2 rounded-lg transition-all text-lg"
        >
          {showDetailButton ? (
            <Link
              to="/about-us"
              className={`inline-flex items-center font-bold bg-gradient-to-r from-pink-500 via-orange-400 to-red-500 hover:from-purple-700 hover:to-orange-400 transition rounded-full shadow-xl border-2 border-white ${small ? 'text-sm px-5 py-2' : 'text-lg px-10 py-4'}`}
            >
              Xem chi tiết <FaArrowRight className="ml-3 text-xl" />
            </Link>
          ) : (
            <Link
              to="/"
              className={`inline-flex items-center font-bold bg-gradient-to-r from-pink-500 via-orange-400 to-red-500 hover:from-purple-700 hover:to-orange-400 transition rounded-full shadow-xl border-2 border-white ${small ? 'text-sm px-5 py-2' : 'text-lg px-10 py-4'}`}
            >
              Mua vé ngay <FaArrowRight className="ml-3 text-xl" />
            </Link>
          )}
        </motion.div>
      </div>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
      >
        <img
          src={logoImg}
          alt="Rạp chiếu phim SIX CINEMA"
          className={`rounded-2xl shadow-2xl border-4 border-pink-300 mx-auto block w-full max-w-[480px] sm:max-w-xs md:max-w-md lg:max-w-lg h-auto aspect-video object-contain bg-white ${small ? 'p-2' : 'p-4'}`}
        />
      </motion.div>
    </motion.section>
  );
}

// Tách phần FAQ thành component
export function AboutUsFAQSection({ small }) {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
  };
  return (
    <motion.section
      className={`bg-gray-50 container mx-auto max-w-4xl rounded-2xl shadow-xl ${small ? 'py-6 px-2' : 'py-16 px-8'}`}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeIn}
    >
      <h2 className={`text-red-700 font-semibold ${small ? 'text-xl mb-4' : 'text-3xl mb-10'}`}>Câu hỏi thường gặp (FAQ)</h2>
      <FAQAccordion small={small} />
    </motion.section>
  );
}

export default AboutUsPage;
