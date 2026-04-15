import React, { useState, useEffect, useRef } from "react";
import { getAllMovies } from "../../service/landingpage";
import Spline from "@splinetool/react-spline";
import { useNavigate } from "react-router-dom";


const Spline3D = React.memo(({ visible }) => {
	if (!visible) return null;
	return (
		<div
			className="w-full max-w-[240px] sm:max-w-[340px] md:max-w-[420px] lg:max-w-[520px] h-auto max-h-[180px] sm:max-h-[220px] md:max-h-[260px] lg:max-h-[320px] flex items-center justify-center mx-auto relative z-20 overflow-visible"
		>
			<div className="w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] md:w-[400px] md:h-[400px] lg:w-[500px] lg:h-[500px] flex items-center justify-center" style={{ transform: "scale(1.15)" }}>
				<Spline scene="https://prod.spline.design/HfololtWvdCsPSDZ/scene.splinecode" />
			</div>
		</div>
	);
});

const PosterFrame = ({ image, onPrev, onNext, onPosterClick, movieData, isPromotion = false }) => {
	const navigate = useNavigate();
	
	// Hàm normalize để tạo slug từ title
	const normalize = (str) =>
		str
			.toLowerCase()
			.normalize("NFD")
			.replace(/[\u0300-\u036f]/g, "")
			.replace(/\s+/g, "_");

	// Xử lý click vào poster
	const handlePosterClick = () => {
		if (isPromotion) {
			// Nếu là ảnh khuyến mãi, xử lý logic khuyến mãi
			const user = localStorage.getItem('user');
			if (user) {
				navigate('/profile', { state: { tab: 'myVoucher' } });
			} else {
				navigate('/voucher-home');
			}
		} else if (movieData && onPosterClick) {
			onPosterClick(movieData);
		} else if (movieData) {
			// Nếu không có onPosterClick, tự động navigate
			const slug = normalize(movieData.title);
			navigate(`/movies/${slug}`, { state: { from: "landing" } });
		}
	};

	return (
		<div className="relative w-44 h-44 bg-black flex items-center justify-center border-2 border-white mx-auto">
			{/* 4 góc trắng */}
			<div className="absolute left-0 top-0 w-3 h-3 border-t-4 border-l-4 border-white" style={{borderTopLeftRadius:2}} />
			<div className="absolute right-0 top-0 w-3 h-3 border-t-4 border-r-4 border-white" style={{borderTopRightRadius:2}} />
			<div className="absolute left-0 bottom-0 w-3 h-3 border-b-4 border-l-4 border-white" style={{borderBottomLeftRadius:2}} />
			<div className="absolute right-0 bottom-0 w-3 h-3 border-b-4 border-r-4 border-white" style={{borderBottomRightRadius:2}} />
			{/* Poster hoặc khối 3D trắng */}
			{image ? (
				<img 
					src={image} 
					alt="Poster" 
					className="object-contain w-36 h-36 rounded-xl shadow-lg cursor-pointer hover:scale-105 transition-transform duration-200" 
					onClick={handlePosterClick}
					title={isPromotion ? "Click để xem khuyến mãi" : (movieData ? `Click để xem chi tiết ${movieData.title}` : "Click để xem chi tiết")}
				/>
			) : (
				<div className="w-36 h-36 bg-white rounded-full" />
			)}
			{/* Mũi tên điều hướng */}
			<button onClick={onPrev} className="absolute left-1 top-1/2 -translate-y-1/2 bg-[#ff7120] text-white rounded-full w-7 h-7 flex items-center justify-center shadow hover:bg-orange-500 transition-all z-10">
				<svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
			</button>
			<button onClick={onNext} className="absolute right-1 top-1/2 -translate-y-1/2 bg-[#ff7120] text-white rounded-full w-7 h-7 flex items-center justify-center shadow hover:bg-orange-500 transition-all z-10">
				<svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
			</button>
			{/* 4 chấm vuông cam ở 4 góc ngoài */}
			<div className="absolute left-[-8px] top-[-8px] w-2 h-2 bg-[#ff7120] rounded-sm" />
			<div className="absolute right-[-8px] top-[-8px] w-2 h-2 bg-[#ff7120] rounded-sm" />
			<div className="absolute left-[-8px] bottom-[-8px] w-2 h-2 bg-[#ff7120] rounded-sm" />
			<div className="absolute right-[-8px] bottom-[-8px] w-2 h-2 bg-[#ff7120] rounded-sm" />
		</div>
	);
};

const Marquee = ({ text }) => {
	const [marqueeActive, setMarqueeActive] = useState(false);
	const marqueeRef = useRef();

	useEffect(() => {
		const timer = setTimeout(() => setMarqueeActive(true), 1500);
		return () => clearTimeout(timer);
	}, []);

	// Số lần lặp lại để đảm bảo đủ dài
	const repeatCount = 6;
	const marqueeText = Array(repeatCount).fill(text).join("\u00A0\u00A0\u00A0");

	return (
		<div
			className="overflow-hidden w-full bg-transparent relative"
			style={{
				height: '12rem',
				width: '100%',
				pointerEvents: 'none',
				background: 'transparent',
				paddingTop: '0rem',
				paddingBottom: '1.5rem',
			}}
		>
			<div
				ref={marqueeRef}
				className="flex whitespace-nowrap font-extrabold uppercase text-black"
				style={{
					fontFamily: "'VT323', monospace",
					fontSize: 'clamp(4rem, 12vw, 8rem)',
					letterSpacing: '0.25em',
					animation: marqueeActive ? 'marqueeLoop 140s linear infinite' : 'none',
					textShadow: '0 2px 0 #fff',
					willChange: 'transform',
					display: 'flex',
				}}
			>
				<span>{marqueeText}</span>
				<span aria-hidden="true">{marqueeText}</span>
			</div>
			<style>{`
				@keyframes marqueeLoop {
					0% { transform: translateX(0); }
					100% { transform: translateX(-50%); }
				}
			`}</style>
		</div>
	);
};

const HeroSection = ({ promotionImages }) => {
	const [cards, setCards] = useState([]);
	const [currentIndex, setCurrentIndex] = useState(0);
	const [visible, setVisible] = useState(true);
	const sectionRef = useRef();

	const posterImages = cards.map(card => card.poster);
	const promoImages = promotionImages && promotionImages.length > 0 ? promotionImages : [];

	useEffect(() => {
		const fetchMovies = async () => {
			const res = await getAllMovies();
			if (!res.error) {
				const nowShowing = res.result.filter((m) => m.status === "Now Showing");
				setCards(nowShowing);
			}
		};
		fetchMovies();
	}, []);

	// Thời gian chuyển ảnh tự động (ms)
	const AUTO_ROTATE_INTERVAL = 5000;

	// Đồng bộ chuyển ảnh cho cả hai khung
	useEffect(() => {
		const maxLen = Math.max(posterImages.length, promoImages.length);
		if (maxLen === 0) return;
		const timer = setInterval(() => {
			setCurrentIndex((prev) => (prev + 1) % maxLen);
		}, AUTO_ROTATE_INTERVAL);
		return () => clearInterval(timer);
	}, [posterImages.length, promoImages.length]);

	// Intersection Observer để chỉ render Spline khi HeroSection trong viewport
	useEffect(() => {
		const handleVisibility = (entries) => {
			if (entries[0].isIntersecting) {
				setVisible(true);
			} else {
				setVisible(false);
			}
		};
		const observer = new window.IntersectionObserver(handleVisibility, {
			root: null,
			threshold: 0.01,
		});
		if (sectionRef.current) {
			observer.observe(sectionRef.current);
		}
		return () => {
			if (sectionRef.current) observer.unobserve(sectionRef.current);
		};
	}, []);

	const handlePrev = () => {
		const maxLen = Math.max(posterImages.length, promoImages.length);
		setCurrentIndex((prev) => (prev === 0 ? maxLen - 1 : prev - 1));
	};
	const handleNext = () => {
		const maxLen = Math.max(posterImages.length, promoImages.length);
		setCurrentIndex((prev) => (prev + 1) % maxLen);
	};

	return (
		<section id="hero-section" ref={sectionRef} className="relative w-full min-h-[80vh] flex flex-col items-center justify-center bg-[#e4e4e4] font-mono text-[#0e0e0e] text-base leading-[1.4] overflow-hidden border-b border-[#e0e0e0]">
			{/* Grid lines overlay */}
			<div className="absolute inset-0 pointer-events-none z-0 w-full h-full">
				{/* Vertical lines */}
				<div className="absolute top-0 bottom-0 left-1/4 w-px bg-black opacity-80" />
				<div className="absolute top-0 bottom-0 left-1/2 w-px bg-black opacity-80" />
				<div className="absolute top-0 bottom-0 left-3/4 w-px bg-black opacity-80" />
				{/* Horizontal lines in each column (grid) */}
				<div className="grid grid-cols-4 grid-rows-3 w-full h-full">
					<div className="col-span-1 row-start-2 row-end-2 h-px bg-black opacity-80" />
					<div className="col-start-2 col-span-1 row-start-2 row-end-2 h-px bg-black opacity-80" />
					<div className="col-start-3 col-span-1 row-start-2 row-end-2 h-px bg-black opacity-80" />
					<div className="col-start-4 col-span-1 row-start-2 row-end-2 h-px bg-black opacity-80" />
				</div>
			</div>
			{/* Marquee SIX CINEMA */}
			<div style={{ marginTop: '-2.5rem' }}>
				<Marquee text="SIX CINEMA " />
			</div>
			{/* Spline 3D robot ở giữa */}
			<div className="relative flex flex-col items-center justify-center w-full z-10 mt-[-1rem] md:ml-8">
				<Spline3D visible={visible} />
			</div>
			{/* PosterFrame khuyến mãi bên trái (nếu có) */}
			{promoImages.length > 0 && (
				<div className="hidden md:flex absolute right-[75%] top-[33.333%] z-20 items-center pointer-events-auto" style={{ transform: "translate(0, 0)" }}>
					<PosterFrame
						image={promoImages[currentIndex % promoImages.length]}
						onPrev={handlePrev}
						onNext={handleNext}
						movieData={null} // Khuyến mãi không có thông tin phim cụ thể
						isPromotion={true} // Đánh dấu đây là ảnh khuyến mãi
					/>
				</div>
			)}
			{/* PosterFrame phim bên phải */}
			<div className="hidden md:flex absolute left-[75%] top-[33.333%] z-20 items-center pointer-events-auto" style={{ transform: "translate(0, 0)" }}>
				<PosterFrame
					image={posterImages[currentIndex % posterImages.length]}
					onPrev={handlePrev}
					onNext={handleNext}
					movieData={cards[currentIndex % cards.length]} // Truyền thông tin phim hiện tại
				/>
			</div>
		</section>
	);
};

export default HeroSection;
