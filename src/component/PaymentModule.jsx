import React, { useEffect, useState } from "react";

import { Link, useNavigate, useParams } from "react-router-dom";
import ApiClient from "./ApiClient";

const PaymentModule = ({ data = {} }) => {
  console.log({ data });
  const { postRequestApiwithLogin } = ApiClient();
  const [paymentMessage, setPaymentMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const { paymentdata = null } = useParams();

  const generatePaymentMsg = async () => {
    const predata = await postRequestApiwithLogin(`event/generateHash`, data);
    if (predata.status) {
      if (predata.data.hash)
        setPaymentMessage(predata.data.hash);
      if (predata.data.navigate_free) {
        return 1;
      } else {
        return 0;
      }
    }
  };

  useEffect(() => {
    if (data.id) {
      generatePaymentMsg();

      const script = document.createElement("script");
      script.src =
        "https://pgi.billdesk.com/payments-checkout-widget/src/app.bundle.js";
      script.async = true;
      script.onload = () => console.log("BillDesk script loaded");
      document.body.appendChild(script);

      return () => {
        document.body.removeChild(script);
      };
    }

  }, [data]);

  const navigate = useNavigate();
  const processToPay = async (e) => {
    e.preventDefault();
    setShowPopup(false); // Close popup

    if (!paymentMessage) {
      await generatePaymentMsg();
      // if (loaddata == 1) {
      //   navigate(`/upload/${data.slug}`);
      // }
    }

    setTimeout(() => {
      if (window.bdPayment) {
        window.bdPayment.initialize({
          msg: paymentMessage,
          options: {
            enableChildWindowPosting: true,
            enablePaymentRetry: true,
            retry_attempt_count: 3,
          },
          callbackUrl:
            "https://wavex.wavesbazaar.com/wavexapi/waves-seller/film/paymentResponseIndiaINC",
        });
      } else {
        console.error("BillDesk script not loaded yet");
      }
    }, 100);
  };

  return (
    <>
      <button
        className="btn btn-apply mt-auto"
        style={{
          padding: "10px 20px",
          borderRadius: "8px",
          fontWeight: "600",
          fontSize: "15px",
        }}
        onClick={processToPay}
      >
        {
          data?.fee > 0 ? "Proceed for Payment" : "Register Now"
        }
      </button>
    </>
  );
};

export default PaymentModule;
