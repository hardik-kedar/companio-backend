
// import mongoose, { Schema, Document, Types } from "mongoose";

// /*
// ========================================
// WALLET TYPE
// ========================================
// */

// export interface IWallet {
//   balance: number;          // available for withdrawal
//   totalEarnings: number;    // lifetime earnings
//   pendingEarnings: number;  // escrow pending release
// }


// /*
// ========================================
// USER DOCUMENT TYPE
// ========================================
// */

// export interface IUser extends Document {

//   name: string;

//   email: string;

//   password: string;

//   state: string;

//   city: string;

//   role: "renter" | "companion" | "admin";

//   acceptedTerms: boolean;

//   bio?: string;

//   profilePhoto?: string;

//   lastSeen: Date;


//   walletBalance: number;
// totalEarnings: number;

//   wallet: {
//   balance: number;
//   pending: number;
//   totalEarned: number;
// };


//   posts: {
//     _id?: Types.ObjectId;
//     imageUrl: string;
//     createdAt: Date;
//     isFlagged: boolean;
//   }[];


//   subscription: {
//     isActive: boolean;
//     expiresAt: Date | null;
//   };


//   location: {
//     isVisible: boolean;
//     coordinates?: {
//       type: "Point";
//       coordinates: [number, number];
//     };
//   };


//   averageRating: number;

//   totalRatings: number;

//   pricePerHour: number;


//   /*
//   ADMIN MODERATION
//   */

//   isBanned: boolean;

//   isSuspended: boolean;

//   suspensionExpiresAt: Date | null;

//   isApproved: boolean;

//   reports: {
//     reporter: Types.ObjectId;
//     reason: string;
//     createdAt: Date;
//   }[];


//   createdAt: Date;

//   updatedAt: Date;
// }


// /*
// ========================================
// WALLET SUBSCHEMA
// ========================================
// */

// const walletSchema = new Schema<IWallet>(
//   {
//     balance: {
//       type: Number,
//       default: 0
//     },

//     totalEarnings: {
//       type: Number,
//       default: 0
//     },

//     pendingEarnings: {
//       type: Number,
//       default: 0
//     }
//   },
//   { _id: false }
// );


// /*
// ========================================
// USER SCHEMA
// ========================================
// */

// const UserSchema = new Schema<IUser>(
//   {

//     name: {
//       type: String,
//       required: true
//     },

//     email: {
//       type: String,
//       required: true,
//       unique: true,
//       index: true
//     },

//     password: {
//       type: String,
//       required: true,
//       select: false
//     },

//     role: {
//       type: String,
//       enum: ["renter", "companion", "admin"],
//       required: true
//     },

//     acceptedTerms: {
//       type: Boolean,
//       required: true
//     },


//     /*
//     LOCATION TEXT
//     */

//     state: {
//       type: String,
//       required: true,
//       index: true
//     },

//     city: {
//       type: String,
//       required: true,
//       index: true
//     },


//     bio: {
//       type: String,
//       default: ""
//     },

//     profilePhoto: {
//       type: String,
//       default: ""
//     },


//     /*
//     LAST SEEN
//     */

//     lastSeen: {
//       type: Date,
//       default: Date.now,
//       index: true
//     },


//     /*
//     WALLET
//     */

//     wallet: {
//   balance: {
//     type: Number,
//     default: 0
//   },

//   pending: {
//     type: Number,
//     default: 0
//   },

//   totalEarned: {
//     type: Number,
//     default: 0
//   },
//   pushSubscription: {
//   type: Object
// }
// },

//     /*
//     POSTS
//     */

//     posts: [
//       {
//         imageUrl: {
//           type: String,
//           required: true
//         },

//         createdAt: {
//           type: Date,
//           default: Date.now
//         },

//         isFlagged: {
//           type: Boolean,
//           default: false
//         }
//       }
//     ],


//     /*
//     SUBSCRIPTION
//     */

//     subscription: {
//       isActive: {
//         type: Boolean,
//         default: false
//       },

//       expiresAt: {
//         type: Date,
//         default: null
//       }
//     },


//     /*
//     GEO (optional)
//     */

//     location: {
//       isVisible: {
//         type: Boolean,
//         default: false
//       },

//       coordinates: {
//         type: {
//           type: String,
//           enum: ["Point"],
//           default: "Point"
//         },

//         coordinates: {
//           type: [Number],
//           default: [0, 0]
//         }
//       }
//     },


//     /*
//     RATINGS
//     */

//     averageRating: {
//       type: Number,
//       default: 0
//     },

//     totalRatings: {
//       type: Number,
//       default: 0
//     },


//     pricePerHour: {
//       type: Number,
//       default: 0,
//       index: true
//     },


//     /*
//     ADMIN FIELDS
//     */

//     isBanned: {
//       type: Boolean,
//       default: false,
//       index: true
//     },

//     isSuspended: {
//       type: Boolean,
//       default: false
//     },

//     suspensionExpiresAt: {
//       type: Date,
//       default: null
//     },

//     isApproved: {
//       type: Boolean,
//       default: true,
//       index: true
//     },


//     reports: [
//       {
//         reporter: {
//           type: Schema.Types.ObjectId,
//           ref: "User"
//         },

//         reason: String,

//         createdAt: {
//           type: Date,
//           default: Date.now
//         }
//       }
//     ]

//   },
//   {
//     timestamps: true
//   }
// );


// /*
// ========================================
// PRODUCTION INDEXES (CRITICAL)
// ========================================
// */

// UserSchema.index({ "location.coordinates": "2dsphere" });

// UserSchema.index({
//   role: 1,
//   city: 1,
//   "subscription.isActive": 1,
//   pricePerHour: 1,
//   createdAt: -1
// });

// UserSchema.index({ lastSeen: -1 });


// export const User =
//   mongoose.model<IUser>(
//     "User",
//     UserSchema
//   );

import mongoose, { Schema, Document, Types } from "mongoose";

/*
========================================
WALLET TYPE
========================================
*/

export interface IWallet {
  balance: number;          // withdrawable amount
  pending: number;          // escrow amount
  totalEarned: number;      // lifetime earnings
}

/*
========================================
USER DOCUMENT TYPE
========================================
*/

export interface IUser extends Document {

  name: string;
  email: string;
  password: string;

  state: string;
  city: string;

  role: "renter" | "companion" | "admin";

  acceptedTerms: boolean;

  bio?: string;
  profilePhoto?: string;

  lastSeen: Date;

  /*
  WALLET
  */
  wallet: IWallet;

  pushSubscription?: any;

  posts: {
    _id?: Types.ObjectId;
    imageUrl: string;
    createdAt: Date;
    isFlagged: boolean;
  }[];

  subscription: {
    isActive: boolean;
    expiresAt: Date | null;
  };

  location: {
    isVisible: boolean;
    coordinates?: {
      type: "Point";
      coordinates: [number, number];
    };
  };

  averageRating: number;
  totalRatings: number;
  pricePerHour: number;

  /*
  ADMIN FIELDS
  */

  isBanned: boolean;
  isSuspended: boolean;
  suspensionExpiresAt: Date | null;
  isApproved: boolean;

  reports: {
    reporter: Types.ObjectId;
    reason: string;
    createdAt: Date;
  }[];

  createdAt: Date;
  updatedAt: Date;
  totalEarned: number;
}

/*
========================================
WALLET SUBSCHEMA
========================================
*/

const walletSchema = new Schema<IWallet>(
  {
    balance: {
      type: Number,
      default: 0
    },

    pending: {
      type: Number,
      default: 0
    },

  

    totalEarned: {
      type: Number,
      default: 0
    }
  },
  { _id: false }
);

/*
========================================
USER SCHEMA
========================================
*/

const UserSchema = new Schema<IUser>(
  {

    name: {
      type: String,
      required: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      index: true
    },

    password: {
      type: String,
      required: true,
      select: false
    },

    role: {
      type: String,
      enum: ["renter", "companion", "admin"],
      required: true
    },

    acceptedTerms: {
      type: Boolean,
      required: true
    },

    /*
    LOCATION TEXT
    */

    state: {
      type: String,
      required: true,
      index: true
    },

    city: {
      type: String,
      required: true,
      index: true
    },

    bio: {
      type: String,
      default: ""
    },

    profilePhoto: {
      type: String,
      default: ""
    },

    /*
    LAST SEEN
    */

    lastSeen: {
      type: Date,
      default: Date.now,
      index: true
    },

    /*
    WALLET
    */

    wallet: {
      type: walletSchema,
      default: () => ({
        balance: 0,
        pending: 0,
        totalEarned: 0
      })
    },

    pushSubscription: {
      type: Object,
      default: null
    },

    /*
    POSTS
    */

    posts: [
      {
        imageUrl: {
          type: String,
          required: true
        },

        createdAt: {
          type: Date,
          default: Date.now
        },

        isFlagged: {
          type: Boolean,
          default: false
        }
      }
    ],

    /*
    SUBSCRIPTION
    */

    subscription: {
      isActive: {
        type: Boolean,
        default: false
      },

      expiresAt: {
        type: Date,
        default: null
      }
    },

    /*
    GEO LOCATION
    */

    location: {
      isVisible: {
        type: Boolean,
        default: false
      },

      coordinates: {
        type: {
          type: String,
          enum: ["Point"],
          default: "Point"
        },

        coordinates: {
          type: [Number],
          default: [0, 0]
        }
      }
    },

    /*
    RATINGS
    */

    averageRating: {
      type: Number,
      default: 0
    },

    totalRatings: {
      type: Number,
      default: 0
    },

    pricePerHour: {
      type: Number,
      default: 0,
      index: true
    },

    /*
    ADMIN FIELDS
    */

    isBanned: {
      type: Boolean,
      default: false,
      index: true
    },

    isSuspended: {
      type: Boolean,
      default: false
    },

    suspensionExpiresAt: {
      type: Date,
      default: null
    },

    isApproved: {
      type: Boolean,
      default: true,
      index: true
    },

    reports: [
      {
        reporter: {
          type: Schema.Types.ObjectId,
          ref: "User"
        },

        reason: String,

        createdAt: {
          type: Date,
          default: Date.now
        }
      }
    ]

  },
  {
    timestamps: true
  }
);

/*
========================================
PRODUCTION INDEXES
========================================
*/

UserSchema.index({ "location.coordinates": "2dsphere" });

UserSchema.index({
  role: 1,
  city: 1,
  "subscription.isActive": 1,
  pricePerHour: 1,
  createdAt: -1
});

UserSchema.index({ lastSeen: -1 });

export const User = mongoose.model<IUser>("User", UserSchema);