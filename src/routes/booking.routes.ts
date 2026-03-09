
// // import { Router } from "express";
// // import { protect } from "../middlewares/auth.middleware";

// // import {

// //   /*
// //   BOOKING FLOW
// //   */
// //   createBooking,
// //   acceptBooking,
// //   rejectBooking,     // ✅ REQUIRED for Reject button

// //   /*
// //   PAYMENT FLOW
// //   */
// //   createPaymentOrder,
// //   payBooking,

// //   /*
// //   BOOKING ACTIONS
// //   */
// //   completeBooking,
// //   cancelBooking,
// //   rateBooking,
// //   getMyBookings,
// //   canChat,

// //   /*
// //   WALLET
// //   */
// //   getMyWallet,

// //   /*
// //   DISPUTE
// //   */
// //   raiseDispute,
// //   getInboxCount,
// //   getBookingHistory

// // } from "../controllers/booking.controller";


// // const router = Router();



// // /*
// // ================================
// // BOOKING REQUEST FLOW
// // ================================
// // */

// // router.post(
// //   "/create",
// //   protect,
// //   createBooking
// // );

// // router.post(
// //   "/accept",
// //   protect,
// //   acceptBooking
// // );

// // router.post(
// //   "/reject",          // ✅ REQUIRED
// //   protect,
// //   rejectBooking
// // );



// // /*
// // ================================
// // ESCROW PAYMENT FLOW
// // ================================
// // */

// // router.post(
// //   "/create-payment-order",
// //   protect,
// //   createPaymentOrder
// // );

// // router.post(
// //   "/pay",
// //   protect,
// //   payBooking
// // );



// // /*
// // ================================
// // BOOKING ACTIONS
// // ================================
// // */

// // router.get(
// //   "/history",
// //   protect,
// //   getBookingHistory
// // );



// // router.post(
// //   "/complete",
// //   protect,
// //   completeBooking
// // );

// // router.post(
// //   "/cancel",
// //   protect,
// //   cancelBooking
// // );
// // router.post(
// //   "/:bookingId/cancel",
// //   protect,
// //   cancelBooking
// // );


// // router.post(
// //   "/rate",
// //   protect,
// //   rateBooking
// // );

// // router.get(
// //   "/my",
// //   protect,
// //   getMyBookings
// // );

// // router.get(
// //   "/can-chat/:otherUserId",
// //   protect,
// //   canChat
// // );



// // /*
// // ================================
// // WALLET
// // ================================
// // */

// // router.get(
// //   "/wallet",
// //   protect,
// //   getMyWallet
// // );



// // /*
// // ================================
// // DISPUTE
// // ================================
// // */

// // router.post(
// //   "/raise-dispute",
// //   protect,
// //   raiseDispute
// // );




// // router.get(
// //   "/inbox-count",
// //   protect,
// //   getInboxCount
// // );

// // export default router;


// import { Router } from "express";
// import { protect } from "../middlewares/auth.middleware";

// import {

//   /*
//   BOOKING FLOW
//   */
//   createBooking,
//   acceptBooking,
//   rejectBooking,

//   /*
//   PAYMENT FLOW
//   */
//   createPaymentOrder,
//   payBooking,

//   /*
//   BOOKING ACTIONS
//   */
//   completeBooking,
//   cancelBooking,
//   rateBooking,
//   getMyBookings,
//   canChat,
//   getBookingById,

//   /*
//   WALLET
//   */
//   getMyWallet,

//   /*
//   DISPUTE
//   */
//   raiseDispute,
//   getInboxCount,
//   getBookingHistory

// } from "../controllers/booking.controller";

// const router = Router();


// /*
// ================================
// BOOKING REQUEST FLOW
// ================================
// */

// router.post(
//   "/create",
//   protect,
//   createBooking
// );

// router.post(
//   "/accept",
//   protect,
//   acceptBooking
// );

// router.post(
//   "/reject",
//   protect,
//   rejectBooking
// );


// /*
// ================================
// ESCROW PAYMENT FLOW
// ================================
// */

// router.post(
//   "/create-payment-order",
//   protect,
//   createPaymentOrder
// );

// router.post(
//   "/pay",
//   protect,
//   payBooking
// );


// /*
// ================================
// BOOKING DATA
// ================================
// */

// router.get(
//   "/:bookingId",
//   protect,
//   getBookingById
// );

// router.get(
//   "/my",
//   protect,
//   getMyBookings
// );

// router.get(
//   "/history",
//   protect,
//   getBookingHistory
// );


// /*
// ================================
// BOOKING ACTIONS
// ================================
// */

// router.post(
//   "/complete",
//   protect,
//   completeBooking
// );

// router.post(
//   "/:bookingId/cancel",
//   protect,
//   cancelBooking
// );

// router.post(
//   "/rate",
//   protect,
//   rateBooking
// );

// router.get(
//   "/can-chat/:otherUserId",
//   protect,
//   canChat
// );


// /*
// ================================
// WALLET
// ================================
// */

// router.get(
//   "/wallet",
//   protect,
//   getMyWallet
// );


// /*
// ================================
// DISPUTE
// ================================
// */

// router.post(
//   "/raise-dispute",
//   protect,
//   raiseDispute
// );

// router.get(
//   "/inbox-count",
//   protect,
//   getInboxCount
// );

// export default router;
import { Router } from "express";
import { protect } from "../middlewares/auth.middleware";

import {

  /*
  BOOKING FLOW
  */
  createBooking,
  acceptBooking,
  rejectBooking,

  /*
  PAYMENT FLOW
  */
  createPaymentOrder,
  payBooking,

  /*
  BOOKING ACTIONS
  */
  completeBooking,
  cancelBooking,
  rateBooking,
  getMyBookings,
  canChat,
  getBookingById,

  /*
  WALLET
  */
  getMyWallet,

  /*
  DISPUTE
  */
  raiseDispute,
  getInboxCount,
  getBookingHistory

} from "../controllers/booking.controller";

const router = Router();


/*
================================
BOOKING LIST / DATA
STATIC ROUTES FIRST
================================
*/

router.get(
  "/my",
  protect,
  getMyBookings
);

router.get(
  "/history",
  protect,
  getBookingHistory
);

router.get(
  "/wallet",
  protect,
  getMyWallet
);

router.get(
  "/can-chat/:otherUserId",
  protect,
  canChat
);

router.get(
  "/inbox-count",
  protect,
  getInboxCount
);


/*
================================
BOOKING REQUEST FLOW
================================
*/

router.post(
  "/create",
  protect,
  createBooking
);

router.post(
  "/accept",
  protect,
  acceptBooking
);

router.post(
  "/reject",
  protect,
  rejectBooking
);


/*
================================
ESCROW PAYMENT FLOW
================================
*/

router.post(
  "/create-payment-order",
  protect,
  createPaymentOrder
);

router.post(
  "/pay",
  protect,
  payBooking
);


/*
================================
BOOKING ACTIONS
================================
*/

router.post(
  "/complete",
  protect,
  completeBooking
);

router.post(
  "/:bookingId/cancel",
  protect,
  cancelBooking
);

router.post(
  "/rate",
  protect,
  rateBooking
);


/*
================================
SINGLE BOOKING (MUST BE LAST)
================================
*/

router.get(
  "/:bookingId",
  protect,
  getBookingById
);


/*
================================
DISPUTE
================================
*/

router.post(
  "/raise-dispute",
  protect,
  raiseDispute
);

export default router;