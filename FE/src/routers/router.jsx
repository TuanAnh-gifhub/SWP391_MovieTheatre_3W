import { createBrowserRouter } from "react-router-dom";
import RootLayout from "../layout/RootLayout";
import { ProtectedAdminRoute } from "./ProtectedAdminRoute";

import LandingPage from "../page/Customer/LandingPage/LandingPage";
import LoginModal from "../page/Customer/LoginPage/LoginPage";
import AdminPage from "../page/Admin/AdminPage";
import LoginAdmin from "../page/Admin/LoginAdmin/LoginAdmin";
import MovieDetail from "../page/Customer/MoviePage/MovieDetail";
import BookMovieTicket from "../page/Customer/BookMovieTickets/BookMovieTicket";
import ProfilePage from "../page/Customer/Profile/ProfilePage";
import UserManagement from "../page/Admin/User/UserManagement";
import AboutUsPage from "../page/Customer/AboutUsPage/AboutUsPage";
import MyOrderedDetail from "../page/Customer/Profile/MyOrders/MyOrderedDetail";
import MovieManagement from "../page/Admin/Movie/MovieManagement";
import AdminMovieDetail from "../page/Admin/Movie/MovieDetail"; 
import CalendarManagement from "../page/Admin/Calendar/CalendarManagement";
import TicketManagement from "../page/Admin/Ticket/TicketManagement";
import MovieList from "../page/Customer/MoviePage/MovieList"; 
import ShowTimeCreate from "../page/Admin/ShowTime/ShowTimeCreate";
import ShowTimeManagement from "../page/Admin/ShowTime/ShowTimeManagement";
import VerifyOTP from "../page/Customer/LoginPage/VerifyOTP"; 
import DashBoard from "../page/Admin/DashBoard/DashBoard";
import CinemaRoomManagement from "../page/Admin/CinemaRoom/CinemaRoomManagement";
import ConfirmBooking from "../page/Customer/BookMovieTickets/ConfirmBooking";
import PaymentMethod from "../page/Customer/Payment/PaymentMethod";
import PaymentSuccess from "../page/Customer/Payment/PaymentSuccess";
import TheaterManagement from "../page/Admin/TheaterManagement/TheaterManagement";
import SeatManagement from "../page/Admin/Seat/SeatManagement";
import SeatTypeManagement from "../page/Admin/SeatType/SeatTypeManagement";
import VoucherPage from "../page/Admin/Voucher/VoucherPage"; 
import FoodAndDrinkManagement from "../page/Admin/FoodAndDrink/FoodAndDrinkManagement";

import VoucherHome from "../page/Customer/LandingPage/VoucherHome";
import MiniGame from "../page/Customer/MiniGame/MiniGame";
import SnakeGame from "../page/Customer/MiniGame/SnakeGame";
import GameSelection from "../page/Customer/MiniGame/GameSelection";
import NotFound from "../components/Error/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        path: "",
        element: <LandingPage />,
      },
      {
        path: "/about-us",
        element: <AboutUsPage />,
      },
      {
        path: "/movies/:slug",
        element: <MovieDetail />,
      },
      {
        path: "/movies", 
        element: <MovieList />,
      },
      {
        path: "/book-movie-ticket/:slug",
        element: <BookMovieTicket />,
      },
      {
        path: "/profile",
        element: <ProfilePage />,
      },
      {
        path: "/my-orders/:slug",
        element: <MyOrderedDetail />,
      },
      {
        path: "/verify-otp",
        element: <VerifyOTP />,
      },
      {
        path: "/booking/confirm",
        element: <ConfirmBooking />,
      },
      {
        path: "/payment-method",
        element: <PaymentMethod />,
      },
      {
        path: "/payment-success",
        element: <PaymentSuccess />, 
      },
      {
        path: "/wallet/deposit/result",
        element: <PaymentSuccess />,
      },
      {
        path: "/voucher-home",
        element: <VoucherHome />,
      },
      {
        path: "/minigame",
        element: <MiniGame />,
      },
      {
        path: "/snakegame",
        element: <SnakeGame />,
      },
      {
        path: "/game-selection",
        element: <GameSelection />,
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
  {
    path: "/admin/login",
    element: <LoginAdmin />,
  },
  {
    path: "/admin",
    element: (
      <ProtectedAdminRoute>
        <AdminPage />
      </ProtectedAdminRoute>
    ),
    children: [
      {
        path: "",
        element: <DashBoard />,
      },
      {
        path: "user",
        element: <UserManagement />,
      },
      {
        path: "movie",
        element: <MovieManagement />,
      },
      {
        path: "movie/detail/:id",
        element: <AdminMovieDetail />,
      },
      {
        path: "calendar",
        element: <CalendarManagement />,
      },
      {
        path: "ticket",
        element: <TicketManagement />,
      },
      {
        path: "showtime/create/:movieId",
        element: <ShowTimeCreate />,
      },
      {
        path: "showtime/create",
        element: <ShowTimeCreate />,
      },
      {
        path: "showtimes",
        element: <ShowTimeManagement />,
      },
      {
        path: "systems",
        element: <CinemaRoomManagement />,
      },
      {
        path: "theater",
        element: <TheaterManagement />,
      },
       {
        path: "seats",
        element: <SeatManagement />,
      },
        {
          path: "seat-types",
          element: <SeatTypeManagement />,
        },
      {
        path: "vouchers", 
        element: <VoucherPage />, 
      },
      // Loyalty admin page removed per product decision: feature disabled/removed
      {
        path: "food-and-drink",
        element: <FoodAndDrinkManagement />,
      },

      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);
