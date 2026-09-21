import bcrypt from "bcryptjs";

import Admin from "../models/Admin.js";
import Registration from "../models/Registration.js";

import {
  createAdminToken,
  getAdminCookieOptions,
  getAdminClearCookieOptions,
} from "../utils/adminAuth.js";

/*
|--------------------------------------------------------------------------
| ADMIN LOGIN
|--------------------------------------------------------------------------
|
| POST /api/admin/login
|
*/

export const loginAdmin = async (
  req,
  res,
  next
) => {
  try {
    const email = String(
      req.body?.email || ""
    )
      .trim()
      .toLowerCase();

    const password = String(
      req.body?.password || ""
    );

    /*
    |--------------------------------------------------------------------------
    | VALIDATION
    |--------------------------------------------------------------------------
    */

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Email and password are required.",
      });
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please enter a valid email address.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | FIND ADMIN
    |--------------------------------------------------------------------------
    */

    const admin =
      await Admin.findOne({
        email,
      });

    /*
     * Same response for:
     *
     * - email doesn't exist
     * - wrong password
     *
     * Avoids revealing admin accounts.
     */
    if (!admin) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | CHECK ACTIVE STATUS
    |--------------------------------------------------------------------------
    */

    if (!admin.active) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | VERIFY HASHED PASSWORD
    |--------------------------------------------------------------------------
    */

    const passwordMatches =
      await bcrypt.compare(
        password,
        admin.passwordHash
      );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | CREATE JWT
    |--------------------------------------------------------------------------
    */

    const token =
      createAdminToken(admin._id);

    /*
    |--------------------------------------------------------------------------
    | STORE JWT IN HTTP-ONLY COOKIE
    |--------------------------------------------------------------------------
    */

    res.cookie(
      "admin_token",
      token,
      getAdminCookieOptions()
    );

    /*
    |--------------------------------------------------------------------------
    | UPDATE LAST LOGIN
    |--------------------------------------------------------------------------
    */

    admin.lastLoginAt =
      new Date();

    await admin.save();

    /*
    |--------------------------------------------------------------------------
    | RESPONSE
    |--------------------------------------------------------------------------
    |
    | Never return passwordHash.
    |
    */

    return res.status(200).json({
      success: true,

      message:
        "Login successful.",

      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        lastLoginAt:
          admin.lastLoginAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| GET CURRENT ADMIN
|--------------------------------------------------------------------------
|
| GET /api/admin/me
|
| protectAdmin has already verified the cookie.
|
*/

export const getCurrentAdmin = async (
  req,
  res
) => {
  return res.status(200).json({
    success: true,

    admin: {
      id: req.admin._id,
      name: req.admin.name,
      email: req.admin.email,
      role: req.admin.role,
      lastLoginAt:
        req.admin.lastLoginAt,
    },
  });
};

/*
|--------------------------------------------------------------------------
| ADMIN LOGOUT
|--------------------------------------------------------------------------
|
| POST /api/admin/logout
|
*/

export const logoutAdmin = async (
  req,
  res
) => {
  res.clearCookie(
    "admin_token",
    getAdminClearCookieOptions()
  );

  return res.status(200).json({
    success: true,
    message:
      "Logged out successfully.",
  });
};

/*
|--------------------------------------------------------------------------
| DASHBOARD SUMMARY
|--------------------------------------------------------------------------
|
| Existing functionality retained.
|
*/
/*
|--------------------------------------------------------------------------
| DASHBOARD SUMMARY
|--------------------------------------------------------------------------
|
| GET /api/admin/dashboard/summary
|
| Protected by protectAdmin.
|
| Only successfully PAID registrations are included.
|
*/

export const getDashboardSummary = async (
  req,
  res,
  next
) => {
  try {
    /*
    |--------------------------------------------------------------------------
    | TODAY RANGE
    |--------------------------------------------------------------------------
    |
    | createdAt is stored by MongoDB as a Date.
    |
    | For now this uses the server's local day boundary.
    | We can make event timezone handling explicit during deployment.
    |
    */

    const startOfToday = new Date();

    startOfToday.setHours(
      0,
      0,
      0,
      0
    );

    const startOfTomorrow =
      new Date(startOfToday);

    startOfTomorrow.setDate(
      startOfTomorrow.getDate() + 1
    );

    /*
    |--------------------------------------------------------------------------
    | RUN DASHBOARD QUERIES IN PARALLEL
    |--------------------------------------------------------------------------
    |
    | These queries are independent, so Promise.all avoids waiting for each
    | one sequentially.
    |
    */

    const [
      overallStats,
      todayRegistrations,
      lastRegistration,
      jerseySummary,
      checkedInCount,
    ] = await Promise.all([
      /*
      |--------------------------------------------------------------------------
      | 1. TOTAL REGISTERED + TOTAL REVENUE
      |--------------------------------------------------------------------------
      */

      Registration.aggregate([
        {
          $match: {
            paymentStatus: "paid",
          },
        },

        {
          $group: {
            _id: null,

            totalRegistered: {
              $sum: 1,
            },

            totalRevenue: {
              $sum: "$amountPaid",
            },
          },
        },
      ]),

      /*
      |--------------------------------------------------------------------------
      | 2. TODAY'S REGISTRATIONS
      |--------------------------------------------------------------------------
      */

      Registration.countDocuments({
        paymentStatus: "paid",

        createdAt: {
          $gte: startOfToday,
          $lt: startOfTomorrow,
        },
      }),

      /*
      |--------------------------------------------------------------------------
      | 3. MOST RECENT REGISTRATION
      |--------------------------------------------------------------------------
      */

      Registration.findOne({
        paymentStatus: "paid",
      })
        .sort({
          createdAt: -1,
        })
        .select(
          "registrationId fullName parish jerseySize amountPaid createdAt"
        )
        .lean(),

      /*
      |--------------------------------------------------------------------------
      | 4. JERSEY SIZE SUMMARY
      |--------------------------------------------------------------------------
      */

      Registration.aggregate([
        {
          $match: {
            paymentStatus: "paid",
          },
        },

        {
          $group: {
            _id: "$jerseySize",

            count: {
              $sum: 1,
            },
          },
        },

        {
          $sort: {
            _id: 1,
          },
        },
      ]),

      /*
      |--------------------------------------------------------------------------
      | 5. CHECKED-IN PARTICIPANTS
      |--------------------------------------------------------------------------
      */

      Registration.countDocuments({
        paymentStatus: "paid",
        checkedIn: true,
      }),
    ]);

    /*
    |--------------------------------------------------------------------------
    | OVERALL STATS
    |--------------------------------------------------------------------------
    */

    const stats =
      overallStats[0] || {
        totalRegistered: 0,
        totalRevenue: 0,
      };

    /*
    |--------------------------------------------------------------------------
    | JERSEY SUMMARY
    |--------------------------------------------------------------------------
    |
    | Always return every supported jersey size.
    |
    | This means the frontend doesn't have to guess whether a missing size
    | means zero.
    |
    */

    const jerseySizes = {
      XS: 0,
      S: 0,
      M: 0,
      L: 0,
      XL: 0,
      XXL: 0,
      XXXL: 0,
    };

    jerseySummary.forEach(
      (item) => {
        if (
          Object.prototype.hasOwnProperty.call(
            jerseySizes,
            item._id
          )
        ) {
          jerseySizes[item._id] =
            item.count;
        }
      }
    );

    /*
    |--------------------------------------------------------------------------
    | CHECK-IN SUMMARY
    |--------------------------------------------------------------------------
    */

    const remainingCount =
      Math.max(
        stats.totalRegistered -
          checkedInCount,
        0
      );

    /*
    |--------------------------------------------------------------------------
    | RESPONSE
    |--------------------------------------------------------------------------
    |
    | amountPaid is currently stored in paise.
    |
    | Example:
    |
    | ₹300 = 30000 paise
    |
    | We keep money in the backend response as paise.
    | The frontend will format it into rupees.
    |
    */

    return res.status(200).json({
      success: true,

      summary: {
        totalRegistered:
          stats.totalRegistered,

        totalRevenue:
          stats.totalRevenue,

        todayRegistrations,

        lastRegistration:
          lastRegistration
            ? {
                registrationId:
                  lastRegistration.registrationId,

                fullName:
                  lastRegistration.fullName,

                parish:
                  lastRegistration.parish,

                jerseySize:
                  lastRegistration.jerseySize,

                amountPaid:
                  lastRegistration.amountPaid,

                registeredAt:
                  lastRegistration.createdAt,
              }
            : null,
      },

      jerseySummary:
        jerseySizes,

      checkInSummary: {
        totalRegistered:
          stats.totalRegistered,

        checkedIn:
          checkedInCount,

        remaining:
          remainingCount,
      },
    });
  } catch (error) {
    next(error);
  }
};


/*
|--------------------------------------------------------------------------
| GET CONFIRMED REGISTRATIONS
|--------------------------------------------------------------------------
|
| GET /api/admin/registrations
|
| Query parameters:
|
| search=
| jerseySize=
| checkIn=
| sort=
| page=
| limit=
|
| Only PAID registrations are returned.
|
*/

export const getAdminRegistrations = async (
  req,
  res,
  next
) => {
  try {
    /*
    |--------------------------------------------------------------------------
    | QUERY PARAMETERS
    |--------------------------------------------------------------------------
    */

    const search = String(
      req.query.search || ""
    ).trim();

    const jerseySize = String(
      req.query.jerseySize || ""
    )
      .trim()
      .toUpperCase();

    const checkIn = String(
      req.query.checkIn || ""
    )
      .trim()
      .toLowerCase();

    const sort = String(
      req.query.sort || "newest"
    )
      .trim()
      .toLowerCase();

    /*
    |--------------------------------------------------------------------------
    | PAGINATION
    |--------------------------------------------------------------------------
    */

    let page = Number.parseInt(
      req.query.page,
      10
    );

    let limit = Number.parseInt(
      req.query.limit,
      10
    );

    if (
      !Number.isInteger(page) ||
      page < 1
    ) {
      page = 1;
    }

    if (
      !Number.isInteger(limit) ||
      limit < 1
    ) {
      limit = 20;
    }

    /*
     * Prevent requesting thousands
     * of rows at once.
     */
    limit = Math.min(limit, 100);

    /*
    |--------------------------------------------------------------------------
    | BASE FILTER
    |--------------------------------------------------------------------------
    |
    | This is the most important rule:
    |
    | ONLY successfully paid registrations.
    |
    */

    const filter = {
      paymentStatus: "paid",
    };

    /*
    |--------------------------------------------------------------------------
    | JERSEY FILTER
    |--------------------------------------------------------------------------
    */

    const validJerseySizes = [
      "XS",
      "S",
      "M",
      "L",
      "XL",
      "XXL",
      "XXXL",
    ];

    if (
      jerseySize &&
      validJerseySizes.includes(
        jerseySize
      )
    ) {
      filter.jerseySize =
        jerseySize;
    }

    /*
    |--------------------------------------------------------------------------
    | CHECK-IN FILTER
    |--------------------------------------------------------------------------
    */

    if (checkIn === "checked-in") {
      filter.checkedIn = true;
    }

    if (checkIn === "not-checked-in") {
      filter.checkedIn = false;
    }

    /*
    |--------------------------------------------------------------------------
    | SEARCH
    |--------------------------------------------------------------------------
    |
    | Search:
    |
    | - Ticket ID
    | - Name
    | - Email
    | - Phone
    | - Parish
    | - Razorpay Payment ID
    |
    */

    if (search) {
      /*
       * Escape special RegExp characters
       * from user input.
       */
      const escapedSearch =
        search.replace(
          /[.*+?^${}()|[\]\\]/g,
          "\\$&"
        );

      const searchRegex =
        new RegExp(
          escapedSearch,
          "i"
        );

      filter.$or = [
        {
          registrationId:
            searchRegex,
        },
        {
          fullName:
            searchRegex,
        },
        {
          email:
            searchRegex,
        },
        {
          phone:
            searchRegex,
        },
        {
          parish:
            searchRegex,
        },
        {
          razorpayPaymentId:
            searchRegex,
        },
      ];
    }

    /*
    |--------------------------------------------------------------------------
    | SORTING
    |--------------------------------------------------------------------------
    */

    const sortOptions = {
      newest: {
        createdAt: -1,
      },

      oldest: {
        createdAt: 1,
      },

      "name-asc": {
        fullName: 1,
        createdAt: -1,
      },

      "name-desc": {
        fullName: -1,
        createdAt: -1,
      },

      "parish-asc": {
        parish: 1,
        fullName: 1,
      },

      "parish-desc": {
        parish: -1,
        fullName: 1,
      },
    };

    const selectedSort =
      sortOptions[sort] ||
      sortOptions.newest;

    /*
    |--------------------------------------------------------------------------
    | COUNT + FETCH
    |--------------------------------------------------------------------------
    */

    const skip =
      (page - 1) * limit;

    const [
      totalRegistrations,
      registrations,
    ] = await Promise.all([
      Registration.countDocuments(
        filter
      ),

      Registration.find(filter)
        .sort(selectedSort)
        .skip(skip)
        .limit(limit)

        /*
         * IMPORTANT:
         *
         * ticketToken is NOT returned.
         * checkInToken will also NOT be
         * returned when we add it later.
         */
        .select(
          [
            "registrationId",
            "fullName",
            "email",
            "phone",
            "parish",
            "jerseySize",
            "amountPaid",
            "currency",
            "razorpayPaymentId",
            "checkedIn",
            "checkedInAt",
            "createdAt",
          ].join(" ")
        )
        .lean(),
    ]);

    /*
    |--------------------------------------------------------------------------
    | PAGINATION METADATA
    |--------------------------------------------------------------------------
    */

    const totalPages =
      totalRegistrations === 0
        ? 0
        : Math.ceil(
            totalRegistrations /
              limit
          );

    /*
    |--------------------------------------------------------------------------
    | RESPONSE
    |--------------------------------------------------------------------------
    */

    return res.status(200).json({
      success: true,

      registrations,

      pagination: {
        page,
        limit,
        totalRegistrations,
        totalPages,

        hasPreviousPage:
          page > 1,

        hasNextPage:
          totalPages > 0 &&
          page < totalPages,
      },

      filters: {
        search,
        jerseySize:
          jerseySize || "",
        checkIn:
          checkIn || "",
        sort,
      },
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| EXPORT CONFIRMED REGISTRATIONS AS CSV
|--------------------------------------------------------------------------
|
| GET /api/admin/registrations/export
|
| Protected admin route.
|
| Only PAID registrations are exported.
|
*/

export const exportAdminRegistrations = async (
  req,
  res,
  next
) => {
  try {
    /*
    |--------------------------------------------------------------------------
    | FETCH CONFIRMED PARTICIPANTS
    |--------------------------------------------------------------------------
    */

    const registrations =
      await Registration.find({
        paymentStatus: "paid",
      })
        .sort({
          createdAt: -1,
        })
        .select(
          [
            "registrationId",
            "fullName",
            "email",
            "phone",
            "parish",
            "jerseySize",
            "razorpayPaymentId",
            "amountPaid",
            "currency",
            "checkedIn",
            "checkedInAt",
            "createdAt",
          ].join(" ")
        )
        .lean();

    /*
    |--------------------------------------------------------------------------
    | CSV ESCAPE HELPER
    |--------------------------------------------------------------------------
    |
    | CSV values can contain:
    |
    | commas
    | quotes
    | line breaks
    |
    | Therefore every value is safely escaped.
    |
    */

    const escapeCsvValue = (value) => {
      if (
        value === null ||
        value === undefined
      ) {
        return "";
      }

      let stringValue =
        String(value);

      /*
       * Protect spreadsheet programs from
       * interpreting participant-controlled
       * values as formulas.
       */
      if (
        /^[=+\-@]/.test(
          stringValue.trimStart()
        )
      ) {
        stringValue =
          `'${stringValue}`;
      }

      /*
       * Escape double quotes.
       */
      stringValue =
        stringValue.replace(
          /"/g,
          '""'
        );

      return `"${stringValue}"`;
    };

    /*
    |--------------------------------------------------------------------------
    | DATE FORMATTER
    |--------------------------------------------------------------------------
    */

    const formatDate = (value) => {
      if (!value) {
        return "";
      }

      const date =
        new Date(value);

      if (
        Number.isNaN(
          date.getTime()
        )
      ) {
        return "";
      }

      return new Intl.DateTimeFormat(
        "en-IN",
        {
          timeZone:
            "Asia/Kolkata",

          year: "numeric",
          month: "2-digit",
          day: "2-digit",

          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",

          hour12: true,
        }
      ).format(date);
    };

    /*
    |--------------------------------------------------------------------------
    | CSV HEADERS
    |--------------------------------------------------------------------------
    */

    const headers = [
      "Ticket ID",
      "Full Name",
      "Email",
      "Phone",
      "Parish",
      "Jersey Size",
      "Payment ID",
      "Amount Paid (INR)",
      "Registration Date",
      "Check-In Status",
      "Check-In Time",
    ];

    /*
    |--------------------------------------------------------------------------
    | CSV ROWS
    |--------------------------------------------------------------------------
    */

    const rows =
      registrations.map(
        (registration) => [
          registration.registrationId,

          registration.fullName,

          registration.email,

          registration.phone,

          registration.parish,

          registration.jerseySize,

          registration.razorpayPaymentId ||
            "",

          (
            Number(
              registration.amountPaid ||
                0
            ) / 100
          ).toFixed(2),

          formatDate(
            registration.createdAt
          ),

          registration.checkedIn
            ? "Checked In"
            : "Not Checked In",

          registration.checkedInAt
            ? formatDate(
                registration.checkedInAt
              )
            : "",
        ]
      );

    /*
    |--------------------------------------------------------------------------
    | BUILD CSV
    |--------------------------------------------------------------------------
    */

    const csvLines = [
      headers
        .map(escapeCsvValue)
        .join(","),

      ...rows.map((row) =>
        row
          .map(escapeCsvValue)
          .join(",")
      ),
    ];

    /*
     * UTF-8 BOM improves compatibility
     * with Microsoft Excel.
     */
    const csv =
      "\uFEFF" +
      csvLines.join("\r\n");

    /*
    |--------------------------------------------------------------------------
    | FILE NAME
    |--------------------------------------------------------------------------
    */

    const dateStamp =
      new Intl.DateTimeFormat(
        "en-CA",
        {
          timeZone:
            "Asia/Kolkata",

          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }
      )
        .format(new Date())
        .replace(/\//g, "-");

    const filename =
      `UNARVV26_Registrations_${dateStamp}.csv`;

    /*
    |--------------------------------------------------------------------------
    | RESPONSE
    |--------------------------------------------------------------------------
    */

    res.setHeader(
      "Content-Type",
      "text/csv; charset=utf-8"
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filename}"`
    );

    res.setHeader(
      "Cache-Control",
      "no-store"
    );

    return res
      .status(200)
      .send(csv);
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| QR CHECK-IN
|--------------------------------------------------------------------------
|
| POST /api/admin/check-in/qr
|
| Protected admin endpoint.
|
*/

export const checkInByQr = async (
  req,
  res,
  next
) => {
  try {
    const qrData = String(
      req.body?.qrData || ""
    ).trim();

    if (!qrData) {
      return res.status(400).json({
        success: false,
        code: "QR_REQUIRED",
        message:
          "QR data is required.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | EXPECTED QR FORMAT
    |--------------------------------------------------------------------------
    |
    | UNARVV26:<checkInToken>
    |
    */

    const prefix =
      "UNARVV26:";

    if (
      !qrData.startsWith(prefix)
    ) {
      return res.status(400).json({
        success: false,
        code: "INVALID_QR",
        message:
          "This is not a valid UNARVV '26 pass.",
      });
    }

    const checkInToken =
      qrData
        .slice(prefix.length)
        .trim();

    /*
     * randomBytes(32).toString("hex")
     * creates exactly 64 hexadecimal
     * characters.
     */
    if (
      !/^[a-f0-9]{64}$/i.test(
        checkInToken
      )
    ) {
      return res.status(400).json({
        success: false,
        code: "INVALID_QR",
        message:
          "This is not a valid UNARVV '26 pass.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | ATOMIC CHECK-IN
    |--------------------------------------------------------------------------
    |
    | checkedIn:false is part of the update
    | condition.
    |
    | This prevents two admins/scanners from
    | successfully checking in the same person
    | at the same time.
    |
    */

    const checkedInAt =
      new Date();

    const registration =
      await Registration.findOneAndUpdate(
        {
          checkInToken,
          paymentStatus: "paid",
          checkedIn: false,
        },

        {
          $set: {
            checkedIn: true,
            checkedInAt,
          },
        },

        {
          new: true,
        }
      )
        .select(
          [
            "registrationId",
            "fullName",
            "email",
            "phone",
            "parish",
            "jerseySize",
            "amountPaid",
            "checkedIn",
            "checkedInAt",
          ].join(" ")
        )
        .lean();

    /*
    |--------------------------------------------------------------------------
    | SUCCESS
    |--------------------------------------------------------------------------
    */

    if (registration) {
      return res
        .status(200)
        .json({
          success: true,

          code:
            "CHECK_IN_SUCCESS",

          message:
            "Participant checked in successfully.",

          participant:
            registration,
        });
    }

    /*
    |--------------------------------------------------------------------------
    | DETERMINE WHY UPDATE DID NOT OCCUR
    |--------------------------------------------------------------------------
    */

    const existingRegistration =
      await Registration.findOne({
        checkInToken,
        paymentStatus: "paid",
      })
        .select(
          [
            "registrationId",
            "fullName",
            "email",
            "phone",
            "parish",
            "jerseySize",
            "amountPaid",
            "checkedIn",
            "checkedInAt",
          ].join(" ")
        )
        .lean();

    /*
    |--------------------------------------------------------------------------
    | INVALID TOKEN
    |--------------------------------------------------------------------------
    */

    if (!existingRegistration) {
      return res
        .status(404)
        .json({
          success: false,

          code:
            "PASS_NOT_FOUND",

          message:
            "No valid paid registration was found for this QR code.",
        });
    }

    /*
    |--------------------------------------------------------------------------
    | ALREADY CHECKED IN
    |--------------------------------------------------------------------------
    */

    if (
      existingRegistration.checkedIn
    ) {
      return res
        .status(409)
        .json({
          success: false,

          code:
            "ALREADY_CHECKED_IN",

          message:
            "Participant has already checked in.",

          participant:
            existingRegistration,
        });
    }

    return res
      .status(400)
      .json({
        success: false,

        code:
          "CHECK_IN_FAILED",

        message:
          "Unable to check in this participant.",
      });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| MANUAL PARTICIPANT CHECK-IN
|--------------------------------------------------------------------------
|
| POST /api/admin/check-in/manual
|
| Used only as a fallback when QR scanning is unavailable.
|
| Requirements:
|
| ✓ Admin must be authenticated
| ✓ Registration must exist
| ✓ Registration must be paid
| ✓ Participant must not already be checked in
|
| Request:
|
| {
|   "registrationId": "UN26-XXXXXXXX"
| }
|
*/

export const checkInManually = async (
  req,
  res,
  next
) => {
  try {
    /*
    |--------------------------------------------------------------------------
    | 1. READ + NORMALIZE REGISTRATION ID
    |--------------------------------------------------------------------------
    */

    const registrationId =
      String(
        req.body.registrationId ||
          ""
      )
        .trim()
        .toUpperCase();

    /*
    |--------------------------------------------------------------------------
    | 2. BASIC VALIDATION
    |--------------------------------------------------------------------------
    |
    | Current registration IDs are generated as:
    |
    | UN26-XXXXXXXX
    |
    | where XXXXXXXX is 8 hexadecimal characters.
    |
    */

    if (
      !/^UN26-[A-F0-9]{8}$/.test(
        registrationId
      )
    ) {
      return res
        .status(400)
        .json({
          success: false,

          code:
            "INVALID_REGISTRATION_ID",

          message:
            "Invalid registration ID.",
        });
    }

    /*
    |--------------------------------------------------------------------------
    | 3. ATOMIC CHECK-IN
    |--------------------------------------------------------------------------
    |
    | Only update when:
    |
    | - registration ID matches
    | - payment is confirmed
    | - participant has NOT already checked in
    |
    | This protects against two admins checking in the same participant
    | simultaneously.
    |
    */

    const checkedInAt =
      new Date();

    const registration =
      await Registration.findOneAndUpdate(
        {
          registrationId,

          paymentStatus:
            "paid",

          checkedIn: false,
        },

        {
          $set: {
            checkedIn: true,

            checkedInAt,
          },
        },

        {
          new: true,
        }
      )
        .select(
          [
            "registrationId",
            "fullName",
            "email",
            "phone",
            "parish",
            "jerseySize",
            "amountPaid",
            "checkedIn",
            "checkedInAt",
          ].join(" ")
        )
        .lean();

    /*
    |--------------------------------------------------------------------------
    | 4. SUCCESS
    |--------------------------------------------------------------------------
    */

    if (registration) {
      return res
        .status(200)
        .json({
          success: true,

          code:
            "CHECK_IN_SUCCESS",

          message:
            "Participant checked in successfully.",

          participant:
            registration,
        });
    }

    /*
    |--------------------------------------------------------------------------
    | 5. DETERMINE WHY CHECK-IN FAILED
    |--------------------------------------------------------------------------
    |
    | The atomic update returning null can mean:
    |
    | 1. Registration doesn't exist
    | 2. Registration isn't paid
    | 3. Participant is already checked in
    |
    */

    const existingRegistration =
      await Registration.findOne({
        registrationId,

        paymentStatus:
          "paid",
      })
        .select(
          [
            "registrationId",
            "fullName",
            "email",
            "phone",
            "parish",
            "jerseySize",
            "amountPaid",
            "checkedIn",
            "checkedInAt",
          ].join(" ")
        )
        .lean();

    /*
    |--------------------------------------------------------------------------
    | 6. REGISTRATION NOT FOUND
    |--------------------------------------------------------------------------
    */

    if (
      !existingRegistration
    ) {
      return res
        .status(404)
        .json({
          success: false,

          code:
            "REGISTRATION_NOT_FOUND",

          message:
            "No confirmed paid registration was found with this registration ID.",
        });
    }

    /*
    |--------------------------------------------------------------------------
    | 7. ALREADY CHECKED IN
    |--------------------------------------------------------------------------
    */

    if (
      existingRegistration.checkedIn
    ) {
      return res
        .status(409)
        .json({
          success: false,

          code:
            "ALREADY_CHECKED_IN",

          message:
            "This participant has already checked in.",

          participant:
            existingRegistration,
        });
    }

    /*
    |--------------------------------------------------------------------------
    | 8. FALLBACK
    |--------------------------------------------------------------------------
    */

    return res
      .status(400)
      .json({
        success: false,

        code:
          "CHECK_IN_FAILED",

        message:
          "Unable to check in this participant.",
      });
  } catch (error) {
    next(error);
  }
};