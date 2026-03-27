import React from "react";
import MainLayout from "../component/layout/MainLayout";

import Compliance from "../component/Auth/Compliance";
import OtpLogin from "../component/Auth/OtpLogin";
import VerifyEmail from "../component/Auth/VerifyEmail";
import ForgotPassword from "../component/Auth/ForgotPassword";
import UserProfile from "../component/Auth/UserProfile";
import MyBooking from "../component/Auth/myBooking";
import DelegateHome from "../component/home/DelegateHome";
import Participant from "../component/pages/Participant";
import AddUser from "../component/Auth/AddUser";
import ListTeam from "../component/Auth/ListTeam";
import ParticipantDocument from "../component/pages/ParticipantDocument";
import DelegateRegistration from "../component/Auth/DelegateRegistration";
import FormAvailableFor from "../component/pages/FormAvailableFor";
import DelegateRegistrationWithSnackbar from "../component/Auth/DelegateRegistration";
import DelegateUser from "../component/Auth/DelegateUser";
import DelegateAdmin from "../component/Auth/DelegateAdmin";
import DelegateAdminFormWithSnackbar from "../component/Auth/DelegateAdminForm";
import LocationIndex from "../component/home/LocationIndex";
import RequestDahBoard from "../component/Auth/RequestDahBoard";
import CreateRequest from "../component/Auth/CreateRequest";
import Resources from "../component/Auth/Resources";
import OtpLoginV2 from "../component/Auth/OtpLoginV2";

export const routes = [
  {
    path: "/",
    element: <OtpLogin />,
  },
  {
    path: "/compliance/:order_id",
    element: <Compliance />,
  },
  {
    path: "/login",
    element: <OtpLoginV2 />,
  },
  {
    path: "/prahari",
    element: <OtpLoginV2 />,
  },
  {
    path: "/",
    element: <MainLayout />, // Layout is rendered for all nested routes
    //   errorElement: <ErrorBoundary />,
    children: [
      {
        path: "/request-list",
        element: <RequestDahBoard />,
      },
      {
        path: "/request/create",
        element: <CreateRequest />,
      },
      {
        path: "/resources",
        element: <Resources />,
      },
    ],

    loader: async ({ request }) => {
      //    return redirect('/login');
      return null;
    },
  },
];
