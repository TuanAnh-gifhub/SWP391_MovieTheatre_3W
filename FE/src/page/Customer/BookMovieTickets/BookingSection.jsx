import React, { useState } from "react";
import BookMovieTicket from "./BookMovieTicket";

const BookingSection = ({
  movie,
  isComingSoon = false,
  quickBooking,
  bookingInfo,
  setBookingInfo,
  onShowtimeChange,
  selectedFoods,
  setSelectedFoods,
}) => {
  if (!movie) return null;
  return (
    <div className="booking-section w-full max-w-4xl mx-auto mb-20 rounded-2xl shadow-2xl bg-white/10 backdrop-blur-md border border-white/20 p-4" style={{ fontSize: "80%" }}>
      <BookMovieTicket
        movieId={movie.movieID}
        movieTitle={movie.title}
        poster={movie.poster}
        isComingSoon={isComingSoon}
        quickBooking={quickBooking}
        bookingInfo={bookingInfo}
        setBookingInfo={setBookingInfo}
        onShowtimeChange={onShowtimeChange}
        selectedFoods={selectedFoods}
        setSelectedFoods={setSelectedFoods}
      />
    </div>
  );
};

export default BookingSection;