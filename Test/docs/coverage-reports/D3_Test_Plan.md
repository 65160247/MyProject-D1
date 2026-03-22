Test Plan Document
    1. Introduction
        โปรเจกต์: ระบบตัวกลางสำหรับค้นหาและบริหารจัดการห้องเช่า / หอพัก
        เวอร์ชัน: 1.0
        วันที่: 22 มีนาคม 2569
        ผู้้เขียน: กฤตภาส ศิริภภาวรรณ
    2. Testing Scope
        ฟีัเจอร์ที่ทดสอบ
            User Authentication & Authorization
            Dormitory Management (Owner Side)
            Search & Advanced Filtering (Student Side)
            Booking & Inquiry System
            User Interaction (Favorites)
        ฟีเจอร์ที่ไม่ทดสอบ
            Payment Gateway
            Real-time Chat
            Email Verification
            Performance Under High Load
    3. Testing Strategy
        Unit Testing
            ทดสอบ: ฟังก์ชัน, Methods, Logic
            ขอบเขต: 68 test cases
            Coverage: >= 80%
            Framework: Jest
            ยูทิลิตี้ — `serializeBigInt` (6 Cases)
                test_serializeBigInt_nullAndUndefined_unchanged
                test_serializeBigInt_bigInt_convertsToNumber
                test_serializeBigInt_date_convertsToIsoString
                test_serializeBigInt_array_mapsRecursively
                test_serializeBigInt_plainObject_mapsRecursively
                test_serializeBigInt_primitives_unchanged
                test_role_assignment
            Middleware — JWT และ RBAC (`auth`, `requireRole`) (7 Cases)
                test_auth_missingAuthorizationHeader_returns401
                test_auth_invalidToken_returns401
                test_auth_expiredToken_returns401
                test_auth_validToken_attachesUserAndCallsNext
                test_requireRole_missingUser_returns401
                test_requireRole_roleMismatch_returns403
                test_requireRole_matchingAllowedRole_callsNext
            API — Health, CORS, Auth, Listings, Favorites, Admin (55 Cases)
                test_getHealth_returnsOk`
                test_getHealth_corsAllowedOrigin_succeeds
                test_getHealth_corsDisallowedOrigin_returns500
                test_postAuthRegister_validationFails_returns400
                test_postAuthRegister_duplicateUser_returns400
                test_postAuthRegister_validPayload_returns201WithToken
                test_postAuthRegister_databaseError_returns500
                test_postAuthLogin_invalidBody_returns400
                test_postAuthLogin_userNotFound_returns401
                test_postAuthLogin_userBanned_returns403
                test_postAuthLogin_passwordMismatch_returns401
                test_postAuthLogin_validCredentials_returns200WithToken
                test_getAuthMe_userRowMissing_returns404
                test_getAuthMe_validToken_returnsProfile
                test_putAuthProfile_invalidNames_returns400
                test_putAuthProfile_validPayload_updatesUser
                test_putAuthChangePassword_wrongCurrent_returns400
                test_putAuthChangePassword_validPayload_returns200
                test_getListings_emptyDatabase_returnsEmptyArray
                test_getListings_withListings_loadsAmenitiesMap
                test_getListings_databaseError_returns500
                test_getListings_queryFilters_appliesParams
                test_getListingById_notFound_returns404
                test_getListingById_found_returnsImagesAndAmenities
                test_getListingsAmenitiesAll_returnsAmenities
                test_getLandlordMyListings_asTenant_returns403
                test_getLandlordMyListings_asLandlord_returnsListings
                test_postListing_validationFails_returns400
                test_postListing_validPayload_createsWithTransaction_returns201
                test_patchListingToggleAvailability_owner_togglesFlag
                test_patchListingToggleAvailability_notFound_returns404
                test_patchListingToggleAvailability_otherLandlord_returns403
                test_deleteListing_owner_returns200
                test_deleteListing_nonOwnerLandlord_returns403
                test_putListing_owner_updates_returns200
                test_putListing_nonOwner_returns403
                test_postListing_disallowedFileType_returns400Or500
                test_deleteListingImage_owner_deletes_returns200
                test_deleteListingImage_primaryRemoved_promotesAnother_returns200
                test_patchListingImagePrimary_owner_setsPrimary_returns200
                test_postFavorite_tenant_addsFavorite_returns200
                test_postFavorite_alreadyFavorited_returns400
                test_getFavorites_tenant_returnsList
                test_getFavoriteCheck_reportsFavoritedState
                test_deleteFavorite_removes_returns200
                test_deleteFavorite_databaseError_returns500
                test_getAdminListingsPending_admin_returnsPending
                test_postAdminListingApprove_admin_returns200
                test_postAdminListingReject_withReason_returns200
                test_getAdminUsers_admin_returnsUsers
                test_postAdminUserBan_selfBan_returns400
                test_postAdminUserBan_otherUser_updatesBan_returns200
                test_getAdminStats_aggregatesDashboard_returns200
                test_getAdminStats_queryFails_returns500
                test_postFavorite_listingNotFound_returns404            
        Integration Testing
            ทดสอบ: การทำงานร่วมกันระหว่างโมดูล
            ขอบเขต: 5 ชุดทดสอบ
            สิ่งที่ทดสอบ
                Suite IT-01: Authentication & Authorization
                    1. เรียก POST /api/auth/register เพื่อสร้าง User ในฐานข้อมูล
                    2. เรียก POST /api/auth/login เพื่อขอรับ JWT Token
                    การบูรณาการ: ทดสอบการทำงานระหว่าง Logic การสมัครสมาชิกกับระบบจัดเก็บ Password (Hash) ในฐานข้อมูล
                    ผลการตรวจสอบ (DBeaver): พบข้อมูลในตาราง users โดยรหัสผ่านถูกเข้ารหัสเรียบร้อย
                    ผลลัพธ์ที่คาดหวัง (Expected Output): Status 201 Created
                Suite IT-02: Listing Creation (Owner Only)
                    1. เรียก POST /api/listings โดยแนบ Header Authorization: Bearer <Token>
                    การบูรณาการ: ทดสอบ Middleware ตรวจสอบสิทธิ์ (JWT) ร่วมกับการเขียนข้อมูลลงตาราง listings
                    ผลการตรวจสอบ (DBeaver): ข้อมูล title, price, latitude, longitude ถูกต้องตรงตาม JSON ที่ส่งไป
                    ผลลัพธ์ที่คาดหวัง (Expected Output): Status 200 OK
                Suite IT-03: Data Display & Filtering
                    1. เรียก GET /api/listings และ GET /api/listings/:id
                    การบูรณาการ: ทดสอบการ Query ข้อมูลจาก Database มาแปลงเป็น JSON เพื่อส่งให้ Frontend
                    ผลการตรวจสอบ: ข้อมูลที่ดึงออกมามีโครงสร้างครบถ้วน (Object/Array) และแสดงรูปภาพผ่านทาง /uploads ได้
                    ผลลัพธ์ที่คาดหวัง (Expected Output): Status 200 OK
                Suite IT-04: Favorites Interaction
                    1. เรียก POST /api/favorites พร้อมส่ง listingId
                    การบูรณาการ: ทดสอบความสัมพันธ์แบบ Many-to-Many ระหว่างตาราง users และ listings ผ่านตารางกลาง favorites
                    ผลการตรวจสอบ (DBeaver): มี Row ใหม่เกิดขึ้นในตาราง favorites ที่ระบุ ID ของผู้ใช้และหอพักที่ถูกต้อง
                    ผลลัพธ์ที่คาดหวัง (Expected Output): Status 200 OK
                Suite IT-05: Admin Management
                    1. เรียก GET /api/admin/stats และ DELETE /api/admin/listings/:id
                    การบูรณาการ: ทดสอบสิทธิ์ระดับ Admin ในการเข้าถึงข้อมูลสรุป (Aggregation) และการลบข้อมูล (Delete)
                    ผลการตรวจสอบ: ข้อมูลสถิติจำนวนหอพักตรงกับจำนวน Record จริง และข้อมูลที่ถูกลบหายไปจาก Database ทันที
                    ผลลัพธ์ที่คาดหวัง (Expected Output): Status 200 OK
        System Testing (e2e)
            ทดสอบ: กระบวนการทำงานตั้งแต่ต้นจนจบ
            Scenarios: 3
            Scenario 1: การประกาศเช่าหอพัก
                เจ้าของหอเข้าสู่ระบบ ➔ ไปที่เมนู "ลงประกาศ" ➔ กรอกข้อมูลหอพักพิมล ➔ อัปโหลดรูปภาพ ➔ กดบันทึก
            Scenario 2: การค้นหาและบันทึกหอพักที่สนใจ
                นิสิตเข้าสู่ระบบ ➔ ใช้ตัวกรองราคา (3,000 - 5,000) ➔ เลือกสิ่งอำนวยความสะดวก "เลี้ยงสัตว์ได้" ➔ กดดูรายละเอียดหอพัก ➔ กดปุ่ม "Favorite"
            Scenario 3: การนัดหมายดูห้องพัก
                นิสิตกดปุ่ม "ติดต่อสอบถาม" ในหน้าหอพักพิมล ➔ กรอกข้อความนัดหมาย ➔ กดส่ง
        UAT (User Acceptance Testing)
            ทดสอบ: ทดสอบกับผู้ใช้จริง
            Scenarios: 3
            Scenario 1: การค้นหาและบันทึกหอพักที่สนใจ (สำหรับนิสิต)
            Scenario 2: การลงประกาศและจัดการสถานะห้องพัก (สำหรับเจ้าของหอ)
            Scenario 3: การนัดหมายเข้าดูห้องพัก (End-to-End Workflow)


    4. Test Tools & Enviroment
        ทดสอบหน่วย: Jest
        ทดสอบการผสานระบบ: Supertest / Postman
        ทดสอบครบวงจร: Playwright
        สภาพแวดล้อม: URL
        พัฒนา: (Development) localhost:3000
        ทดสอบ: (Staging) stagingrentroom.com
        ใช้งานจริง: (Production) rentroom.com
        Test Database: MySQL (phpMyAdmin) — rental_system
        ตัวชี้วัดการทดสอบ: (Test Metrics)
        ความครอบคลุมโค้ด: >= 80%
        อัตราการผ่านการทดสอบ: 100% (ทุกกรณีต้องผ่าน)
        จำนวนข้อผิดพลาดระดับวิกฤตที่ยอมรับได้: 0
        เวลาในการรันการทดสอบทั้งหมด: < 2.728 วินาที