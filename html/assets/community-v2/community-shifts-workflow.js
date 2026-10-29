/* Extra-shift demo. Posts live in the adapter's shared Feed store; all other records reference their IDs. */
(() => {
  'use strict';
  const STORAGE_KEY = 'nexora-community-shifts-workflow-v1';
  const HOUR = 3600000, MINUTE = 60000, PAGE_SIZE = 6;
  const OPEN = ['AwaitingDepositProof', 'AwaitingDepositConfirmation', 'PendingApproval', 'Confirmed', 'InProgress'];
  const CANCELLABLE = OPEN.filter(status => status !== 'InProgress');
  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  // Backend CommunityShiftPolicySettings defaults. These are explicitly sample figures, snapshotted at claim.
  const POLICY = Object.freeze({version:1,isSample:true,depositPercent:20,freeCancellationHours:24,workerLateCancelForfeitPercent:50,noShowForfeitPercent:100,businessLateCancelPayPercent:50,lateGraceMinutes:15,checkInOpensMinutesBefore:60,checkInRadiusMeters:200,depositProofMinutes:30,depositConfirmHours:2,settlementProofHours:24,receiptAutoConfirmHours:24,disputeWindowHours:48,autoCompleteHours:12});
  const LOCALES = {"en":{"notification":{"loading":"Loading the shift from your notification…","unavailable":"This shift is no longer available to your account."},"address":{"openMap":"Open map for {address}"},"sampleBadge":"SAMPLE","proof":{"add":"Add photo","remove":"Remove photo","imageAlt":"Zelle receipt","uploading":"Uploading…","invalidFile":"Use a JPG, PNG or WEBP photo up to 10 MB.","uploadFailed":"Upload failed. Try again.","someInvalid":"Skipped {count} file(s) that are not a JPG, PNG or WEBP photo up to 10 MB.","tooManyDropped":"Only {max} photos allowed. Extra photos were skipped."},"zelle":{"title":"Zelle","scanToPay":"Scan to pay","noQr":"No QR code uploaded.","sendTo":"Send with Zelle","copy":"Copy Zelle ID","copied":"Copied","copyFailed":"Couldn't copy","qrAlt":"Zelle QR code","timeLeft":"{minutes}:{seconds} left to send your deposit","holdExpired":"Your hold expired — this spot was released.","uploadBill":"Upload your Zelle receipt","iSent":"I've sent it","sending":"Sending…","sent":"Receipt sent. We'll let the other side know."},"setup":{"staffZelle":{"title":"Add Zelle to get paid","body":"Shift deposits, refunds and pay go straight between you and the salon via Zelle. Add your Zelle in Receive Payment Methods first.","cta":"Set up Zelle"},"businessZelle":{"title":"Add Zelle for your salon","body":"Techs send their deposit to your salon's Zelle. Add it in Receive Payment Methods first.","cta":"Set up Zelle"},"staffProfile":{"title":"Finish your staff profile","body":"You need a staff profile before booking extra shifts.","cta":"Go to profile"}},"overdue":{"message":"You have {count} overdue Zelle payment(s) totaling {amount}. New shifts are paused until they're sent.","payNow":"Pay now"},"penalty":{"free":"Cancel {hours}h+ before · free","late":"Under {hours}h · lose {amount}","noShow":"No-show · lose {amount}"},"policy":{"title":"Cancellation policy","deposit":"Techs send a {percent}% deposit to the salon via Zelle to book.","workerFree":"Tech cancels {hours}h+ before: full deposit back.","workerLate":"Tech cancels under {hours}h: loses {percent}% of the deposit.","noShow":"No check-in within {minutes} min: loses {percent}% of the deposit.","salonLate":"Salon cancels under {hours}h before the shift: pays each booked tech {percent}% of the shift pay.","dispute":"Disputes: {hours}h to report. NEXORA reviews check-ins and receipts."},"reliability":{"worker":{"title":"Your reliability","completed":"completed","noShows":"no-shows","lateCancellations":"late cancels","note":"Salons see these when you book. No-shows and late cancels count against you."},"business":{"title":"Salon reliability","shiftsPosted":"shifts posted","lateCancellations":"late cancels","latePayments":"late payments","note":"Techs see these before booking your shifts."}},"dispute":{"reasonLabel":"What happened?","reasonPlaceholder":"e.g. The transfer hasn't arrived in my Zelle account.","evidence":"Photos (optional)","submit":"Send to NEXORA","sending":"Sending…"},"payments":{"title":"Zelle payments","subtitle":"Money moves directly between you and the other side. Upload the receipt after each transfer.","toPay":"You send","toReceive":"You receive","none":"Nothing here.","overdue":"Overdue","loadFailed":"Couldn't load your Zelle payments. Please try again.","direction":"Payment direction","statusFilter":"Payment status","moreFilters":"More payment filters","roles":{"All":"All","Payer":"You send","Payee":"You receive"},"filters":{"All":"All","NeedsAction":"Needs action","Overdue":"Overdue","AwaitingProof":"Waiting for transfer","AwaitingReceipt":"Waiting for confirmation","Disputed":"Disputed","Received":"Received"}},"breakdown":{"wage":"Shift pay","compensation":"Late-cancel pay","depositRefund":"Deposit back","deposit":"Deposit","alreadyPaid":"Already paid"},"settlement":{"title":"Zelle payment","dueBy":"Send by {when}","autoConfirm":"Marked received automatically on {when} unless reported.","bill":"Receipt","received":"I received it","notReceived":"Not received","notReceivedTitle":"Report a missing transfer","notReceivedBody":"NEXORA will compare both sides' receipts and decide.","reported":"Reported. NEXORA will review.","confirmed":"Marked as received.","disputeOpen":"NEXORA is reviewing this payment.","disputeResolved":"NEXORA decision: {note}","disputeResolvedNoNote":"NEXORA has resolved this payment."},"errors":{"generic":"Something went wrong. Please try again.","loadFailed":"Couldn't load shifts. Please try again."},"types":{"Party":"Party","BusyDay":"Busy day","Urgent":"Short-staffed"},"acceptModes":{"Approval":"Salon reviews","Instant":"Instant book"},"status":{"AwaitingDepositProof":"Send your deposit","AwaitingDepositConfirmation":"Waiting for salon to confirm deposit","PendingApproval":"Waiting for salon review · deposit sent","Confirmed":"Booked","InProgress":"Checked in · working","Completed":"Completed","NoShow":"Marked absent","Rejected":"Not selected","Expired":"Hold ended","WorkerCancelled":"You cancelled","BusinessCancelled":"Salon cancelled"},"settlementTypes":{"Deposit":"Deposit","DepositRefund":"Deposit refund","CompletionPayment":"Shift pay + deposit","CancellationCompensation":"Late-cancel pay + deposit"},"settlementStatus":{"AwaitingProof":"Waiting for transfer","AwaitingReceipt":"Waiting for confirmation","Received":"Received","Disputed":"In review","Cancelled":"Cancelled"},"weekdays":{"Monday":"Mon","Tuesday":"Tue","Wednesday":"Wed","Thursday":"Thu","Friday":"Fri","Saturday":"Sat","Sunday":"Sun"},"committedPay":"Salon commits to pay","pay":"Pay","plusTips":"+ tips","deposit":"Deposit to book","depositViaZelle":"sent to the salon via Zelle","slots":"{filled}/{total} techs","distance":"{miles} mi","honestNote":"Your deposit goes straight to the salon via Zelle. NEXORA records it and reminds the salon to return it when the shift is done — NEXORA does not hold any money.","availability":{"title":"Available for extra shifts","subtitle":"Turn on when you're free — nearby salons short on techs will reach you.","toggle":"Available for extra shifts","visibilityNote":"Salons near you can see your name, photo, skills, reliability and a rounded distance — never your exact location or contact details.","days":"Free days","distance":"Max distance","services":"Services","noServices":"No services yet.","edit":"Edit","cityLocation":"Using your city's location. Allow location access for more accurate matches.","useMyLocation":"Use my current location"},"nearby":{"pagination":"Nearby shifts pages","previous":"Previous","next":"Next","page":"Page {page} of {total}","title":"Shifts near you","count":"{count} shifts","countOne":"{count} shift","off":"off","offHint":"Turn on \"Available for extra shifts\" to see shifts.","empty":"No open shifts near you right now. We'll notify you when one is posted."},"claim":{"instantCta":"⚡ Book & lock in","salonZelleMissing":"This salon has not set up Zelle yet, so this shift cannot be booked right now.","blockedTooltip":"Send your overdue Zelle payments to claim new shifts.","applyCta":"🙋 Apply","refundHint":"Deposit comes back in full when the shift is done","instantConfirm":"Book this shift","applyConfirm":"Apply for this shift","agree":"I've read and agree to this shift's cancellation and no-show policy.","payTitle":"Send your deposit"},"checkIn":{"cta":"📍 Check in at the salon","locating":"Finding your location…","success":"Checked in — your location matches the salon.","denied":"Location access is off for this site.","unavailable":"We couldn't get your location.","outOfRadius":"You're {distance} m away; check-in works within {radius} m.","askSalon":"Ask the salon to confirm I'm here","requested":"Sent — the salon will confirm you're here.","waitingSalon":"Waiting for the salon to confirm you're here.","windowClosed":"Check-in has closed for this shift. If you were there on time, please contact the salon.","windowHint":"Check-in opens {before} min before the shift and closes {grace} min after it starts."},"cancel":{"title":"Cancel this shift?","noDeposit":"You haven't sent a deposit, so nothing is owed.","free":"You'll get your full {refund} deposit back from the salon via Zelle.","late":"Only {hours} h until the shift. You'll lose {forfeit} of your deposit; the salon returns {refund} via Zelle.","keep":"Keep shift","confirm":"Cancel shift","done":"Shift cancelled."},"post":{"open":"Post a shift","title":"Post an extra shift","type":"Shift type","titleLabel":"Title","titlePlaceholder":"e.g. Party of 8 — birthday","required":"Required","when":"When","days":{"0":"Today","1":"Tomorrow","2":"In 2 days","3":"In 3 days"},"start":"Start","end":"End","workers":"Techs needed","pay":"Pay per tech ($)","payPlaceholder":"e.g. 150","services":"Services","servicesRequired":"Pick at least 1 service","acceptMode":"How techs join","acceptModeHint":{"Approval":"Techs apply with a deposit; you pick who works.","Instant":"First techs to send a deposit get the spots."},"commitment":"You commit to pay up to {total} ({workers} techs × {pay}).","schedule":{"past":"Pick a start time later than now.","tooLong":"Shifts can be up to 16 hours."},"submit":"Post shift","posting":"Posting…","success":"✓ Shift posted — available techs nearby are notified now."},"invitations":{"title":"Invitations","subtitle":"Salons invited you to these shifts. Booking is still your choice and follows the usual deposit steps.","ownerTitle":"Invitations","withdraw":"Withdraw","withdrawAria":"Withdraw the invitation for {name}","declineAria":"Decline the invitation to {title}","withdrawn":"Invitation withdrawn","declined":"Invitation declined","decline":"Decline","expiresIn":"Expires in {time}","expired":"Expired","status":{"Pending":"Waiting","Accepted":"Accepted","Declined":"Declined","Expired":"Expired","Cancelled":"Withdrawn"}},"availableWorkers":{"title":"Available workers","subtitle":"Free workers near this shift with a matching skill. Tap Invite to notify one; they still book the shift themselves. Distances are rounded and contact details are never shared.","blocked":"Inviting is paused until your overdue Zelle payments are sent.","invite":"Invite","inviteAria":"Invite {name}","invited":"Invited","inviteSent":"Invitation sent","radius":"Search radius","radiusOption":"{miles} mi","empty":"No available workers match this shift yet.","loadFailed":"Couldn't load available workers. Please try again.","alreadyApplied":"Already booked this shift","previous":"Previous","next":"Next","page":"Page {page} of {total}","distance":{"UnderOneMile":"Under 1 mi","OneToThreeMiles":"1–3 mi","ThreeToFiveMiles":"3–5 mi","FiveToTenMiles":"5–10 mi","TenToTwentyFiveMiles":"10–25 mi"}},"owner":{"findWorkers":"Invite workers","title":"Your extra shifts","filters":{"Active":"Upcoming","Past":"Past","Cancelled":"Cancelled"},"empty":"No shifts here yet.","blockedTooltip":"Send your overdue Zelle payments to post new shifts.","counts":"{confirmed}/{total} booked · {pending} pending","noApplicants":"No techs yet.","workerStats":"{completed} completed · {noShows} no-shows · {late} late cancels","confirmDeposit":"Deposit received","depositConfirmed":"🔒 {name} is booked.","approve":"Book","approved":"🔒 {name} is booked — free cancellation no longer applies inside the window.","reject":"Decline","rejected":"Declined. Return {name}'s deposit via Zelle.","present":"They're here","notPresent":"Didn't show","complete":"Done · pay","completed":"Marked done. Send {name}'s pay via Zelle.","reportIssue":"Report a problem","issueTitle":"Report a problem with this tech","issueBody":"NEXORA will review before the shift auto-completes.","sendPay":"Send {amount} via Zelle","saved":"Saved.","needsAction":"{count} need your action","noBusiness":"Set up your salon profile to post extra shifts.","cancelShift":"Cancel shift","cancelTitle":"Cancel this shift?","cancelFree":"No booked tech is inside the free-cancellation window, so no compensation is owed.","cancelLate":"Inside the window: you pay {amount} to each booked tech ({count} techs, {total} total) via Zelle.","cancelRefunds":"{count} deposit(s) will also need to be returned via Zelle.","cancelled":"Shift cancelled."},"my":{"notificationTarget":"Shift from your notification","title":"My shifts","tabs":{"Active":"Upcoming","History":"History"},"empty":"No shifts yet. Book one from \"Shifts near you\".","sendDeposit":"Send {amount} deposit","viewPayment":"Payment {amount}","disputeNoShow":"Dispute no-show","cancel":"Cancel","disputeTitle":"Dispute the no-show","disputeBody":"Tell NEXORA what happened. We'll review check-in data and messages.","filters":{"All":"All","AwaitingDepositProof":"Send your deposit","Confirmed":"Booked","InProgress":"In progress","Completed":"Completed","WorkerCancelled":"You cancelled","BusinessCancelled":"Salon cancelled"}},"navigation":{"label":"Extra shift sections","browse":"Browse shifts","my-shifts":"My extra shifts","payments":"Zelle payments","moreFilters":"More filters","selectStatus":"Select status"},"errorsSource":{"community_shift_not_allowed":"Extra shifts are available to staff and salon owner accounts.","community_shift_not_business_owner":"Only the salon owner can manage these shifts.","community_shift_not_found":"This shift is no longer available.","community_shift_assignment_not_found":"We couldn't find this shift booking.","community_shift_settlement_not_found":"We couldn't find this payment.","community_shift_staff_profile_required":"Set up your staff profile before taking shifts.","community_shift_staff_zelle_not_configured":"Add Zelle in Receive Payment Methods so the salon can pay you.","community_shift_business_zelle_not_configured":"This salon has not set up Zelle yet.","community_shift_business_address_not_geocodable":"Add a full salon address so techs can find you.","community_shift_policy_changed":"The cancellation policy was just updated. Please review it again.","community_shift_full":"This shift just filled up.","community_shift_overlapping":"You already have a shift at this time.","community_shift_already_claimed":"You already booked or applied for this shift.","community_shift_overdue_payment_blocked":"Send your overdue Zelle payments first.","community_shift_check_in_window_closed":"Check-in opens before the shift and closes after the grace period.","community_shift_invalid_state":"This action isn't available anymore. Refresh to see the latest status.","community_shift_already_started":"This shift can no longer be cancelled: it has started or a tech has already checked in.","community_shift_deposit_proof_expired":"Your deposit hold expired. Book the shift again if it's still open.","community_shift_proof_images_invalid":"Upload 1–3 photos of the Zelle receipt.","community_shift_dispute_window_closed":"The time to dispute this has passed.","community_shift_dispute_already_open":"This is already under review.","community_shift_schedule_invalid":"Pick a start time in the next 3 days and an end time within 16 hours.","community_shift_skills_invalid":"Pick at least 1 available service.","community_shift_pay_invalid":"Enter pay greater than $0 and up to $10,000, with at most 2 decimals.","community_shift_dispute_not_found":"We couldn't find this dispute.","community_shift_title_invalid":"Enter a title up to 120 characters.","community_shift_type_invalid":"Choose a shift type.","community_shift_workers_invalid":"Enter a valid number of techs needed.","community_shift_accept_mode_invalid":"Choose how techs can join.","community_shift_distance_invalid":"Pick 5, 10 or 25 miles.","community_shift_location_invalid":"We couldn't read that location.","community_shift_reason_invalid":"Add a short reason (up to 500 characters).","community_shift_page_number_invalid":"Invalid page.","community_shift_page_size_invalid":"Invalid page size.","community_shift_invitation_not_allowed":"This invitation can't be changed anymore.","community_shift_invitation_already_pending":"This worker already has a pending invitation for this shift.","community_shift_invitation_limit_reached":"This shift has reached its limit of pending invitations. Wait for replies or withdraw one.","community_shift_invitation_recently_withdrawn":"You just withdrew this invitation. Wait a few minutes before inviting this worker again.","community_shift_invitation_not_found":"This invitation is no longer available.","community_shift_invitation_expired":"This invitation has expired.","community_shift_worker_not_eligible":"This worker isn't available for this shift."}},"vi":{"notification":{"loading":"Đang tải ca từ thông báo…","unavailable":"Ca này không còn khả dụng với tài khoản của bạn."},"address":{"openMap":"Mở bản đồ tới {address}"},"sampleBadge":"SỐ MẪU","proof":{"add":"Thêm ảnh","remove":"Xoá ảnh","imageAlt":"Bill Zelle","uploading":"Đang tải lên…","invalidFile":"Dùng ảnh JPG, PNG hoặc WEBP tối đa 10 MB.","uploadFailed":"Tải lên thất bại. Thử lại.","someInvalid":"Đã bỏ qua {count} file không phải ảnh JPG, PNG hoặc WEBP tối đa 10 MB.","tooManyDropped":"Chỉ được tối đa {max} ảnh. Các ảnh dư đã bị bỏ qua."},"zelle":{"title":"Zelle","scanToPay":"Quét để thanh toán","noQr":"Chưa tải mã QR.","sendTo":"Chuyển Zelle","copy":"Sao chép Zelle","copied":"Đã sao chép","copyFailed":"Không sao chép được","qrAlt":"Mã QR Zelle","timeLeft":"Còn {minutes}:{seconds} để chuyển cọc","holdExpired":"Hết giữ chỗ — suất này đã mở lại.","uploadBill":"Tải bill Zelle lên","iSent":"Tôi đã chuyển","sending":"Đang gửi…","sent":"Đã gửi bill. Bên kia sẽ được báo."},"setup":{"staffZelle":{"title":"Thêm Zelle để nhận tiền","body":"Cọc, hoàn cọc và tiền công chuyển thẳng giữa bạn và tiệm qua Zelle. Hãy thêm Zelle trong Receive Payment Methods.","cta":"Thiết lập Zelle"},"businessZelle":{"title":"Thêm Zelle cho tiệm","body":"Thợ chuyển cọc vào Zelle của tiệm. Hãy thêm Zelle trong Receive Payment Methods.","cta":"Thiết lập Zelle"},"staffProfile":{"title":"Hoàn tất hồ sơ thợ","body":"Bạn cần có hồ sơ thợ trước khi nhận ca làm thêm.","cta":"Đến hồ sơ"}},"overdue":{"message":"Bạn còn {count} khoản Zelle quá hạn, tổng {amount}. Tạm dừng nhận/đăng ca mới cho tới khi chuyển xong.","payNow":"Thanh toán ngay"},"penalty":{"free":"Huỷ trước {hours}h · miễn phí","late":"Huỷ trong {hours}h · mất {amount}","noShow":"Không đến · mất {amount}"},"policy":{"title":"Chính sách huỷ","deposit":"Thợ chuyển cọc {percent}% tiền công cho tiệm qua Zelle để chốt ca.","workerFree":"Thợ huỷ trước {hours}h: hoàn 100% cọc.","workerLate":"Thợ huỷ trong {hours}h: mất {percent}% cọc.","noShow":"Không check-in sau {minutes} phút: mất {percent}% cọc.","salonLate":"Tiệm huỷ trong {hours}h trước ca: trả mỗi thợ đã chốt {percent}% tiền công.","dispute":"Tranh chấp: {hours}h để khiếu nại, NEXORA xem check-in và bill."},"reliability":{"worker":{"title":"Độ tin cậy của bạn","completed":"ca hoàn thành","noShows":"lần vắng","lateCancellations":"huỷ muộn","note":"Tiệm thấy chỉ số này khi bạn nhận ca. Vắng mặt và huỷ muộn sẽ bị trừ điểm."},"business":{"title":"Độ tin cậy của tiệm","shiftsPosted":"ca đã đăng","lateCancellations":"huỷ muộn","latePayments":"trả trễ","note":"Thợ thấy chỉ số này trước khi nhận ca của bạn."}},"dispute":{"reasonLabel":"Chuyện gì đã xảy ra?","reasonPlaceholder":"VD: Tiền chưa vào tài khoản Zelle của tôi.","evidence":"Ảnh (không bắt buộc)","submit":"Gửi NEXORA","sending":"Đang gửi…"},"payments":{"title":"Thanh toán Zelle","subtitle":"Tiền chuyển trực tiếp giữa hai bên. Tải bill lên sau mỗi lần chuyển.","toPay":"Bạn cần chuyển","toReceive":"Bạn sẽ nhận","none":"Không có.","overdue":"Quá hạn","loadFailed":"Không tải được các khoản Zelle. Vui lòng thử lại.","direction":"Chiều thanh toán","statusFilter":"Trạng thái thanh toán","moreFilters":"Bộ lọc thanh toán khác","roles":{"All":"Tất cả","Payer":"Bạn chuyển","Payee":"Bạn nhận"},"filters":{"All":"Tất cả","NeedsAction":"Cần xử lý","Overdue":"Quá hạn","AwaitingProof":"Chờ chuyển tiền","AwaitingReceipt":"Chờ xác nhận","Disputed":"Tranh chấp","Received":"Đã nhận"}},"breakdown":{"wage":"Tiền công","compensation":"Bồi thường huỷ muộn","depositRefund":"Hoàn cọc","deposit":"Cọc","alreadyPaid":"Đã trả trước đó"},"settlement":{"title":"Khoản Zelle","dueBy":"Chuyển trước {when}","autoConfirm":"Tự xác nhận đã nhận lúc {when} nếu không báo lại.","bill":"Bill","received":"Tôi đã nhận","notReceived":"Chưa nhận được","notReceivedTitle":"Báo chưa nhận được tiền","notReceivedBody":"NEXORA sẽ đối chiếu bill hai bên và phân xử.","reported":"Đã báo. NEXORA sẽ xem xét.","confirmed":"Đã xác nhận nhận tiền.","disputeOpen":"NEXORA đang xem xét khoản này.","disputeResolved":"NEXORA kết luận: {note}","disputeResolvedNoNote":"NEXORA đã giải quyết khoản này."},"errors":{"generic":"Có lỗi xảy ra. Vui lòng thử lại.","loadFailed":"Không tải được danh sách ca. Vui lòng thử lại."},"types":{"Party":"Party","BusyDay":"Khách đông","Urgent":"Thiếu thợ gấp"},"acceptModes":{"Approval":"Tiệm duyệt","Instant":"Nhận ngay"},"status":{"AwaitingDepositProof":"Chuyển cọc để giữ chỗ","AwaitingDepositConfirmation":"Chờ tiệm xác nhận cọc","PendingApproval":"Chờ tiệm duyệt · đã chuyển cọc","Confirmed":"Đã chốt ca","InProgress":"Đã check-in · đang làm","Completed":"Hoàn thành","NoShow":"Vắng mặt","Rejected":"Không được chọn","Expired":"Hết giữ chỗ","WorkerCancelled":"Bạn đã huỷ","BusinessCancelled":"Tiệm đã huỷ"},"settlementTypes":{"Deposit":"Cọc chốt ca","DepositRefund":"Hoàn cọc","CompletionPayment":"Tiền công + hoàn cọc","CancellationCompensation":"Bồi thường huỷ muộn + hoàn cọc"},"settlementStatus":{"AwaitingProof":"Chờ chuyển tiền","AwaitingReceipt":"Chờ xác nhận","Received":"Đã nhận","Disputed":"Đang xem xét","Cancelled":"Đã huỷ"},"weekdays":{"Monday":"T2","Tuesday":"T3","Wednesday":"T4","Thursday":"T5","Friday":"T6","Saturday":"T7","Sunday":"CN"},"committedPay":"Tiệm cam kết trả công","pay":"Trả công","plusTips":"+ tips","deposit":"Cọc để chốt ca","depositViaZelle":"chuyển cho tiệm qua Zelle","slots":"{filled}/{total} thợ","distance":"{miles} mi","honestNote":"Cọc chuyển thẳng cho tiệm qua Zelle. NEXORA ghi nhận và nhắc tiệm hoàn cọc khi xong ca — NEXORA không giữ tiền.","availability":{"title":"Sẵn sàng làm thêm","subtitle":"Bật khi rảnh — tiệm gần bạn thiếu thợ sẽ gửi ca cho bạn","toggle":"Sẵn sàng làm thêm","visibilityNote":"Tiệm gần bạn có thể thấy tên, ảnh, kỹ năng, độ tin cậy và khoảng cách làm tròn — không bao giờ thấy vị trí chính xác hay thông tin liên hệ của bạn.","days":"Ngày rảnh","distance":"Đi xa tối đa","services":"Dịch vụ","noServices":"Chưa có dịch vụ.","edit":"Sửa","cityLocation":"Đang dùng vị trí theo thành phố. Cho phép truy cập vị trí để khớp ca chính xác hơn.","useMyLocation":"Dùng vị trí hiện tại"},"nearby":{"pagination":"Các trang ca gần bạn","previous":"Trang trước","next":"Trang sau","page":"Trang {page} / {total}","title":"Ca gần bạn","count":"{count} ca","countOne":"{count} ca","off":"đang tắt","offHint":"Bật \"Sẵn sàng làm thêm\" để thấy ca.","empty":"Chưa có ca nào gần bạn. Bạn sẽ được báo khi có ca mới."},"claim":{"instantCta":"⚡ Nhận ca & chốt","salonZelleMissing":"Tiệm này chưa thiết lập Zelle nên chưa thể nhận ca này lúc này.","blockedTooltip":"Hãy chuyển các khoản Zelle quá hạn để nhận ca mới.","applyCta":"🙋 Ứng tuyển","refundHint":"Cọc hoàn lại 100% khi làm xong","instantConfirm":"Chốt ca này","applyConfirm":"Ứng tuyển ca này","agree":"Tôi đã đọc và đồng ý chính sách huỷ & vắng mặt của ca này.","payTitle":"Chuyển cọc"},"checkIn":{"cta":"📍 Check-in tại tiệm","locating":"Đang lấy vị trí…","success":"📍 Check-in thành công — vị trí khớp với tiệm","denied":"Trang này chưa được phép truy cập vị trí.","unavailable":"Không lấy được vị trí của bạn.","outOfRadius":"Bạn đang cách tiệm {distance} m; check-in trong bán kính {radius} m.","askSalon":"Nhờ tiệm xác nhận có mặt","requested":"Đã gửi — tiệm sẽ xác nhận bạn có mặt.","waitingSalon":"Đang chờ tiệm xác nhận bạn có mặt.","windowClosed":"Đã hết thời gian check-in cho ca này. Nếu bạn có mặt đúng giờ, hãy liên hệ tiệm.","windowHint":"Check-in mở {before} phút trước ca · trễ tối đa {grace} phút"},"cancel":{"title":"Huỷ ca này?","noDeposit":"Bạn chưa chuyển cọc nên không phát sinh khoản nào.","free":"Tiệm sẽ hoàn đủ {refund} cọc cho bạn qua Zelle.","late":"Còn {hours} giờ tới ca (dưới hạn huỷ miễn phí). Bạn sẽ mất {forfeit} cọc; tiệm hoàn {refund} qua Zelle.","keep":"Giữ ca","confirm":"Huỷ ca","done":"Đã huỷ ca."},"post":{"open":"Đăng ca","title":"Đăng ca làm thêm","type":"Loại ca","titleLabel":"Tiêu đề","titlePlaceholder":"VD: Party 8 khách – tiệc sinh nhật","required":"Bắt buộc","when":"Khi nào","days":{"0":"Hôm nay","1":"Ngày mai","2":"2 ngày nữa","3":"3 ngày nữa"},"start":"Bắt đầu","end":"Kết thúc","workers":"Số thợ cần","pay":"Trả công mỗi thợ ($)","payPlaceholder":"VD: 150","services":"Dịch vụ","servicesRequired":"Chọn ít nhất 1 dịch vụ","acceptMode":"Chế độ nhận","acceptModeHint":{"Approval":"Thợ đặt cọc ứng tuyển, bạn chọn người làm.","Instant":"Thợ chuyển cọc trước được chỗ trước."},"commitment":"Bạn cam kết trả tối đa {total} ({workers} thợ × {pay}).","schedule":{"past":"Chọn giờ bắt đầu sau thời điểm hiện tại.","tooLong":"Ca tối đa 16 tiếng."},"submit":"Đăng ca","posting":"Đang đăng…","success":"✓ Đã đăng ca — thợ rảnh gần tiệm được báo ngay"},"invitations":{"title":"Lời mời","subtitle":"Tiệm mời bạn vào các ca này. Bạn vẫn tự quyết định nhận ca và đi theo các bước cọc như bình thường.","ownerTitle":"Lời mời","withdraw":"Thu hồi","withdrawAria":"Thu hồi lời mời của {name}","declineAria":"Từ chối lời mời vào ca {title}","withdrawn":"Đã thu hồi lời mời","declined":"Đã từ chối lời mời","decline":"Từ chối","expiresIn":"Hết hạn sau {time}","expired":"Đã hết hạn","status":{"Pending":"Đang chờ","Accepted":"Đã nhận","Declined":"Đã từ chối","Expired":"Hết hạn","Cancelled":"Đã thu hồi"}},"availableWorkers":{"title":"Thợ đang rảnh","subtitle":"Thợ rảnh gần ca này và có kỹ năng phù hợp. Bấm Mời để báo cho thợ; thợ vẫn tự nhận ca. Khoảng cách được làm tròn và không chia sẻ thông tin liên hệ.","blocked":"Tạm dừng mời thợ cho đến khi bạn chuyển các khoản Zelle quá hạn.","invite":"Mời","inviteAria":"Mời {name}","invited":"Đã mời","inviteSent":"Đã gửi lời mời","radius":"Bán kính tìm","radiusOption":"{miles} mi","empty":"Chưa có thợ rảnh phù hợp với ca này.","loadFailed":"Không tải được danh sách thợ rảnh. Vui lòng thử lại.","alreadyApplied":"Đã nhận ca này","previous":"Trước","next":"Sau","page":"Trang {page}/{total}","distance":{"UnderOneMile":"Dưới 1 mi","OneToThreeMiles":"1–3 mi","ThreeToFiveMiles":"3–5 mi","FiveToTenMiles":"5–10 mi","TenToTwentyFiveMiles":"10–25 mi"}},"owner":{"findWorkers":"Mời thợ","title":"Ca làm thêm của tiệm","filters":{"Active":"Sắp tới","Past":"Đã qua","Cancelled":"Đã huỷ"},"empty":"Chưa có ca nào.","blockedTooltip":"Hãy chuyển các khoản Zelle quá hạn để đăng ca mới.","counts":"{confirmed}/{total} đã chốt · {pending} đang chờ","noApplicants":"Chưa có thợ.","workerStats":"{completed} ca hoàn thành · {noShows} lần vắng · {late} huỷ muộn","confirmDeposit":"Đã nhận cọc","depositConfirmed":"🔒 Đã chốt {name}.","approve":"Chốt","approved":"🔒 Đã chốt {name} — cả 2 bên không huỷ miễn phí trong cửa sổ trước ca","reject":"Từ chối","rejected":"Đã từ chối. Hãy hoàn cọc cho {name} qua Zelle.","present":"Thợ đã có mặt","notPresent":"Không có mặt","complete":"Xong ca · trả tiền","completed":"Đã xác nhận xong ca. Hãy chuyển tiền công cho {name} qua Zelle.","reportIssue":"Có vấn đề","issueTitle":"Báo vấn đề với thợ","issueBody":"NEXORA sẽ xem xét trước khi ca tự hoàn thành.","sendPay":"Chuyển {amount} qua Zelle","saved":"Đã lưu.","needsAction":"{count} việc cần bạn xử lý","noBusiness":"Hãy hoàn tất hồ sơ tiệm để đăng ca làm thêm.","cancelShift":"Huỷ ca","cancelTitle":"Huỷ ca này?","cancelFree":"Không có thợ đã chốt nào trong cửa sổ huỷ miễn phí, nên không phát sinh bồi thường.","cancelLate":"Trong cửa sổ huỷ: tiệm trả {amount} cho mỗi thợ đã chốt ({count} thợ, tổng {total}) qua Zelle.","cancelRefunds":"Cần hoàn {count} khoản cọc qua Zelle.","cancelled":"Đã huỷ ca."},"my":{"notificationTarget":"Ca từ thông báo của bạn","title":"Ca của tôi","tabs":{"Active":"Sắp tới","History":"Lịch sử"},"empty":"Chưa có ca nào. Nhận ca ở mục \"Ca gần bạn\".","sendDeposit":"Chuyển cọc {amount}","viewPayment":"Khoản {amount}","disputeNoShow":"Khiếu nại vắng mặt","cancel":"Huỷ","disputeTitle":"Khiếu nại vắng mặt","disputeBody":"Kể cho NEXORA chuyện đã xảy ra. Chúng tôi sẽ xem dữ liệu check-in và tin nhắn.","filters":{"All":"Tất cả","AwaitingDepositProof":"Gửi tiền cọc","Confirmed":"Đã chốt","InProgress":"Đang làm","Completed":"Hoàn thành","WorkerCancelled":"Bạn đã huỷ","BusinessCancelled":"Tiệm đã huỷ"}},"navigation":{"label":"Các mục ca làm thêm","browse":"Tìm ca","my-shifts":"Ca làm thêm của tôi","payments":"Thanh toán Zelle","moreFilters":"Bộ lọc khác","selectStatus":"Chọn trạng thái"},"errorsSource":{"community_shift_not_allowed":"Ca làm thêm dành cho tài khoản thợ và chủ tiệm.","community_shift_not_business_owner":"Chỉ chủ tiệm mới quản lý được các ca này.","community_shift_not_found":"Ca này không còn nữa.","community_shift_assignment_not_found":"Không tìm thấy lượt nhận ca này.","community_shift_settlement_not_found":"Không tìm thấy khoản thanh toán này.","community_shift_staff_profile_required":"Hãy thiết lập hồ sơ thợ trước khi nhận ca.","community_shift_staff_zelle_not_configured":"Thêm Zelle trong Receive Payment Methods để tiệm trả tiền cho bạn.","community_shift_business_zelle_not_configured":"Tiệm này chưa thiết lập Zelle.","community_shift_business_address_not_geocodable":"Hãy nhập đầy đủ địa chỉ tiệm để thợ tìm được.","community_shift_policy_changed":"Chính sách huỷ vừa được cập nhật. Vui lòng xem lại.","community_shift_full":"Ca này vừa đủ thợ.","community_shift_overlapping":"Bạn đã có ca khác trùng giờ.","community_shift_already_claimed":"Bạn đã nhận hoặc ứng tuyển ca này rồi.","community_shift_overdue_payment_blocked":"Hãy chuyển các khoản Zelle quá hạn trước.","community_shift_check_in_window_closed":"Check-in mở trước giờ ca và đóng sau thời gian cho trễ.","community_shift_invalid_state":"Thao tác này không còn khả dụng. Hãy tải lại để xem trạng thái mới.","community_shift_already_started":"Không thể huỷ ca nữa: ca đã bắt đầu hoặc đã có thợ check-in.","community_shift_deposit_proof_expired":"Hết thời gian giữ chỗ. Nhận lại ca nếu vẫn còn chỗ.","community_shift_proof_images_invalid":"Tải lên 1–3 ảnh bill Zelle.","community_shift_dispute_window_closed":"Đã hết thời gian khiếu nại.","community_shift_dispute_already_open":"Việc này đang được xem xét.","community_shift_schedule_invalid":"Chọn giờ bắt đầu trong 3 ngày tới và giờ kết thúc trong vòng 16 tiếng.","community_shift_skills_invalid":"Chọn ít nhất 1 dịch vụ khả dụng.","community_shift_pay_invalid":"Nhập tiền công lớn hơn $0 và tối đa $10,000, tối đa 2 chữ số thập phân.","community_shift_dispute_not_found":"Không tìm thấy tranh chấp này.","community_shift_title_invalid":"Nhập tiêu đề tối đa 120 ký tự.","community_shift_type_invalid":"Chọn loại ca.","community_shift_workers_invalid":"Vui lòng nhập số thợ cần hợp lệ.","community_shift_accept_mode_invalid":"Chọn chế độ nhận.","community_shift_distance_invalid":"Chọn 5, 10 hoặc 25 dặm.","community_shift_location_invalid":"Không đọc được vị trí này.","community_shift_reason_invalid":"Nhập lý do ngắn (tối đa 500 ký tự).","community_shift_page_number_invalid":"Trang không hợp lệ.","community_shift_page_size_invalid":"Số mục mỗi trang không hợp lệ.","community_shift_invitation_not_allowed":"Không thể thay đổi lời mời này nữa.","community_shift_invitation_already_pending":"Thợ này đã có lời mời đang chờ cho ca này.","community_shift_invitation_limit_reached":"Ca này đã đạt giới hạn lời mời đang chờ. Hãy chờ phản hồi hoặc thu hồi bớt.","community_shift_invitation_recently_withdrawn":"Bạn vừa thu hồi lời mời này. Hãy chờ vài phút rồi mời lại thợ này.","community_shift_invitation_not_found":"Lời mời này không còn khả dụng.","community_shift_invitation_expired":"Lời mời này đã hết hạn.","community_shift_worker_not_eligible":"Thợ này không rảnh cho ca này."}}};
  const COMMON = {"en":{"needWorker":"SHIFT HELP NEEDED","availablePost":"AVAILABLE FOR A SHIFT","viewShift":"View extra shift","save":"Save","close":"Close","contact":"Contact","accountName":"Account Holder Name","accountInfo":"Email or Phone"},"vi":{"needWorker":"CẦN NGƯỜI THEO CA","availablePost":"RẢNH NHẬN CA","viewShift":"Xem ca làm thêm","save":"Lưu","close":"Đóng","contact":"Liên hệ","accountName":"Tên chủ tài khoản","accountInfo":"Email hoặc SĐT"}};
  const clone = value => JSON.parse(JSON.stringify(value));
  const html = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const round = value => Math.round((Number(value) + Number.EPSILON) * 100) / 100;
  const number = value => Number.isFinite(Number(value)) ? Number(value) : 0;
  let mounted;

  function mount(adapter) {
    mounted?.destroy();
    const esc = adapter.escape || html;
    const member = () => String(typeof adapter.currentMember === 'function' ? adapter.currentMember() : adapter.currentMember || '');
    const role = () => (typeof adapter.role === 'function' ? adapter.role() : adapter.role) === 'owner' ? 'owner' : 'staff';
    const lang = () => document.documentElement.lang === 'en' ? 'en' : 'vi';
    const t = (key, values = {}) => {
      let text = key.split('.').reduce((value, part) => value?.[part], LOCALES[lang()]);
      if (typeof text !== 'string') text = COMMON[lang()]?.[key] || key;
      return String(text).replace(/\{(\w+)\}/g, (match, key) => values[key] == null ? match : String(values[key]));
    };
    const error = code => LOCALES[lang()]?.errorsSource?.['community_shift_' + code] || t('errors.generic');
    const now = () => typeof adapter.now === 'function' ? Number(adapter.now()) : Date.now();
    const iso = value => new Date(value).toISOString();
    const uid = prefix => prefix + '-' + now() + '-' + Math.random().toString(36).slice(2, 9);
    const money = value => new Intl.NumberFormat('en-US', {style:'currency',currency:'USD',maximumFractionDigits:2}).format(number(value));
    const date = value => { const valueDate = new Date(value); return Number.isNaN(+valueDate) ? '' : valueDate.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}); };
    const when = value => { const valueDate = new Date(value); return Number.isNaN(+valueDate) ? '' : date(value) + ' · ' + valueDate.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'}); };
    const getShifts = () => Array.isArray(adapter.getShifts?.()) ? adapter.getShifts() : [];
    const shiftById = id => getShifts().find(row => String(row.id) === String(id));
    const owned = shift => !!member() && shift?.owner === member();
    const profile = () => adapter.getProfile?.() || null;
    const hasProfile = () => {const value=profile();return !!(value?.exists&&value.basicSavedAt)&&value.hasJobProfile!==false;};
    const scope = () => role() + ':' + member();
    const safeMap = value => value && typeof value === 'object' && !Array.isArray(value) ? Object.assign(Object.create(null), value) : Object.create(null);
    function read() {
      let value;
      try { value = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch { value = {}; }
      return {version:1,availability:safeMap(value?.availability),zelle:safeMap(value?.zelle),assignments:Array.isArray(value?.assignments) ? value.assignments.filter(row=>row?.id&&row.shiftId&&row.worker) : [],settlements:Array.isArray(value?.settlements) ? value.settlements.filter(row=>row?.id&&row.assignmentId&&row.shiftId) : [],invitations:Array.isArray(value?.invitations) ? value.invitations.filter(row=>row?.id&&row.shiftId&&row.worker) : []};
    }
    function seedDemo() {
      const samples=window.NEXORA_COMMUNITY_DEMO?.shiftWorkflow;if(!samples)return;
      const state=read();let changed=false;
      for(const row of samples.assignments)if(shiftById(row.shiftId)&&!state.assignments.some(item=>item.id===row.id)){state.assignments.push(clone(row));changed=true;}
      for(const row of samples.settlements)if(state.assignments.some(item=>item.id===row.assignmentId)&&!state.settlements.some(item=>item.id===row.id)){state.settlements.push(clone(row));changed=true;}
      if(changed)try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));}catch{}
    }
    let view = {tab:role()==='owner'?'my-shifts':'browse',filter:'Active',paymentRole:'All',paymentFilter:'All',page:1,shiftId:null,assignmentId:null,settlementId:null}, lastScope = scope(), dialog = null, destroyed = false, errorMessage = '';
    const tell = text => adapter.toast?.(text);
    const fail = code => { throw new Error(error(code)); };
    const requireRole = expected => { if(role() !== expected) fail('not_allowed'); };
    const starts = shift => {
      if (shift?.startsAt) return +new Date(shift.startsAt);
      const matches = String(shift?.hours || '').match(/(\d{1,2}):(\d{2})/g);
      const start = matches?.[0] || shift?.startTime;
      return shift?.date && start ? +new Date(shift.date + 'T' + start.padStart(5,'0') + ':00') : NaN;
    };
    const ends = shift => {
      if (shift?.endsAt) return +new Date(shift.endsAt);
      const matches = String(shift?.hours || '').match(/(\d{1,2}):(\d{2})/g);
      const end = matches?.[1] || shift?.endTime;
      if (!shift?.date || !end) return NaN;
      let value = +new Date(shift.date + 'T' + end.padStart(5,'0') + ':00');
      if(value <= starts(shift)) value += 24 * HOUR;
      return value;
    };
    const pay = shift => {
      const amount = number(shift?.payPerWorker ?? shift?.pay);
      return /giờ|hour/i.test(shift?.period || '') ? round(amount * Math.max(0,(ends(shift)-starts(shift))/HOUR)) : amount;
    };
    const closed = shift => !shift || ['closed','cancelled','Cancelled'].includes(shift.status);
    const mode = shift => shift?.acceptMode === 'Instant' ? 'Instant' : 'Approval';
    const policy = assignment => ({...POLICY,...assignment?.policy});
    const deposits = (state, assignment) => state.settlements.find(row=>row.assignmentId===assignment.id&&row.type==='Deposit');
    const assignmentsFor = (state, shift) => state.assignments.filter(row=>row.shiftId===shift.id);
    const occupied = (state, shift) => assignmentsFor(state,shift).filter(row => (mode(shift)==='Instant'?['AwaitingDepositProof','AwaitingDepositConfirmation','Confirmed','InProgress','Completed']:['Confirmed','InProgress','Completed']).includes(row.status)).length;
    const countNeeded = shift => Math.max(1,Math.min(200,Math.trunc(number(shift.workersNeeded)||1)));
    const isPayer = settlement => settlement.payer === member() && settlement.payerRole === role();
    const isPayee = settlement => settlement.payee === member() && settlement.payeeRole === role();
    const visibleSettlement = settlement => settlement && (isPayer(settlement)||isPayee(settlement));
    const overdue = (state, who=member(), whoRole=role()) => state.settlements.filter(row=>row.payer===who&&row.payerRole===whoRole&&row.type!=='Deposit'&&row.status==='AwaitingProof'&&+new Date(row.proofDueAt)<now());
    const ensureUnblocked = state => { if(overdue(state).length) fail('overdue_payment_blocked'); };
    const zelle = (state, who, whoRole, shift) => state.zelle[whoRole+':'+who] || (whoRole==='owner' ? shift?.businessZelle || shift?.zelle : null);
    const hasZelle = account => !!String(account?.accountInfo || '').trim();
    const validEvidence = images => Array.isArray(images)&&images.length<=3&&images.every(url=>typeof url==='string'&&/^data:image\/(jpeg|png|webp);base64,[a-z0-9+/=]+$/i.test(url));
    function availability(state, who=member()) {
      const postTime=row=>number(Date.parse(row?.lastEditedAt||row?.createdAt||''));
      const post = getShifts().filter(row=>row.kind==='daywork'&&row.owner===who&&!closed(row)&&(!row.date||+new Date(row.date+'T23:59:59')>=now())).sort((a,b)=>postTime(b)-postTime(a))[0];
      const ownProfile=who===member()?profile():null;
      const result={isAvailable:!!post,availableDays:[],maxDistanceMiles:10,city:post?.city||ownProfile?.city||[ownProfile?.cityName,ownProfile?.stateCode].filter(Boolean).join(', ')||ownProfile?.location||'',skills:post?.skills||ownProfile?.skills||'',photoUrl:post?.photoUrl||ownProfile?.photoUrl||ownProfile?.avatar||'',...state.availability[who]};
      // Publishing the PO availability post is the source of truth; it needs no second persistence operation.
      if(post&&postTime(post)>number(Date.parse(state.availability[who]?.updatedAt||'')))Object.assign(result,{isAvailable:true,city:post.city,skills:post.skills,industry:post.industry});
      return result;
    }
    function createSettlement(state, assignment, shift, type, amount, breakdown, dueAt) {
      const deposit = type === 'Deposit';
      const row = {id:uid('settlement'),assignmentId:assignment.id,shiftId:shift.id,type,amount:round(amount),breakdown,status:'AwaitingProof',payer:deposit?assignment.worker:shift.owner,payerRole:deposit?'staff':'owner',payee:deposit?shift.owner:assignment.worker,payeeRole:deposit?'owner':'staff',payeeZelle:clone(deposit?zelle(state,shift.owner,'owner',shift):assignment.workerZelle||{}),proofDueAt:iso(dueAt),proofImageUrls:[],createdAt:iso(now())};
      state.settlements.push(row);
      return row;
    }
    function reconcile(state, assignment, shift) {
      if(OPEN.includes(assignment.status)) return;
      const deposit = deposits(state,assignment);
      if(!deposit || ['AwaitingReceipt','Disputed'].includes(deposit.status)) return;
      const received = deposit.status==='Received'?deposit.amount:0, p=policy(assignment);
      const breakdown = {wage:0,compensation:0,depositRefund:received,deposit:0,alreadyPaid:0};
      if(assignment.status==='Completed') breakdown.wage=assignment.payAmount;
      if(assignment.status==='BusinessCancelled'&&assignment.isLateCancellation) breakdown.compensation=round(assignment.payAmount*p.businessLateCancelPayPercent/100);
      if(assignment.status==='WorkerCancelled'&&assignment.isLateCancellation) breakdown.depositRefund=round(received*(100-p.workerLateCancelForfeitPercent)/100);
      if(assignment.status==='NoShow') breakdown.depositRefund=round(received*(100-p.noShowForfeitPercent)/100);
      const total=round(breakdown.wage+breakdown.compensation+breakdown.depositRefund);
      const payouts=state.settlements.filter(row=>row.assignmentId===assignment.id&&row.type!=='Deposit'&&row.status!=='Cancelled');
      if(round(payouts.reduce((sum,row)=>sum+row.amount,0))===total) return;
      breakdown.alreadyPaid=round(payouts.filter(row=>row.status!=='AwaitingProof').reduce((sum,row)=>sum+row.amount,0));
      payouts.filter(row=>row.status==='AwaitingProof').forEach(row=>{row.status='Cancelled';});
      if(total<=breakdown.alreadyPaid) return;
      const type=assignment.status==='Completed'?'CompletionPayment':assignment.status==='BusinessCancelled'&&assignment.isLateCancellation?'CancellationCompensation':'DepositRefund';
      createSettlement(state,assignment,shift,type,total-breakdown.alreadyPaid,breakdown,now()+p.settlementProofHours*HOUR);
    }
    function closeAssignment(state, assignment, shift, status) {
      assignment.isLateCancellation=['WorkerCancelled','BusinessCancelled'].includes(status)&&assignment.status==='Confirmed'&&starts(shift)-now()<policy(assignment).freeCancellationHours*HOUR;
      assignment.status=status;assignment.closedAt=iso(now());
      const deposit=deposits(state,assignment);
      if(deposit?.status==='AwaitingProof') deposit.status='Cancelled';
      else if(deposit?.status==='AwaitingReceipt') {deposit.status='Received';deposit.receivedAt=iso(now());}
      reconcile(state,assignment,shift);
    }
    function received(state, settlement) {
      settlement.status='Received';settlement.receivedAt=iso(now());
      const assignment=state.assignments.find(row=>row.id===settlement.assignmentId),shift=shiftById(settlement.shiftId);
      if(!assignment||!shift)return;
      if(settlement.type==='Deposit'&&assignment.status==='AwaitingDepositConfirmation') {
        if(now()>starts(shift)+policy(assignment).lateGraceMinutes*MINUTE) closeAssignment(state,assignment,shift,'Expired');
        else {assignment.status='Confirmed';assignment.confirmedAt=iso(now());}
      }
      reconcile(state,assignment,shift);
    }
    function checkInAssignment(assignment, method) {assignment.status='InProgress';assignment.checkInAt=iso(now());assignment.checkInMethod=method;}
    function sweep(state) {
      const before=JSON.stringify(state);
      state.invitations.filter(row=>row.status==='Pending'&&+new Date(row.expiresAt)<now()).forEach(row=>{row.status='Expired';});
      state.assignments.forEach(assignment=>{
        const shift=shiftById(assignment.shiftId);if(!shift)return;
        const p=policy(assignment),deposit=deposits(state,assignment);
        if(assignment.status==='AwaitingDepositProof'&&+new Date(assignment.depositProofDueAt)<now())closeAssignment(state,assignment,shift,'Expired');
        if(assignment.status==='AwaitingDepositConfirmation'&&deposit?.status==='AwaitingReceipt'&&+new Date(deposit.autoConfirmAt)<now())received(state,deposit);
        if((assignment.status==='PendingApproval'||assignment.status==='AwaitingDepositConfirmation'&&deposit?.status==='Disputed')&&starts(shift)<=now())closeAssignment(state,assignment,shift,'Expired');
        if(assignment.status==='Confirmed'&&!assignment.presenceRequestedAt&&starts(shift)+p.lateGraceMinutes*MINUTE<now())closeAssignment(state,assignment,shift,'NoShow');
        if(assignment.status==='Confirmed'&&assignment.presenceRequestedAt&&ends(shift)<=now())checkInAssignment(assignment,'DeemedPresent');
        if(assignment.status==='InProgress'&&!assignment.dispute&&ends(shift)+p.autoCompleteHours*HOUR<now())closeAssignment(state,assignment,shift,'Completed');
      });
      state.settlements.filter(row=>row.status==='AwaitingReceipt'&&+new Date(row.autoConfirmAt)<now()).forEach(row=>received(state,row));
      return before!==JSON.stringify(state);
    }
    function persist(state, rows) {
      const previous=localStorage.getItem(STORAGE_KEY);
      localStorage.setItem(STORAGE_KEY,JSON.stringify(state));
      if(rows) {
        let saved=false;
        try {saved=adapter.saveShifts?.(rows)===true;} catch {}
        if(!saved) {
          if(previous===null)localStorage.removeItem(STORAGE_KEY);else localStorage.setItem(STORAGE_KEY,previous);
          // The adapter owns rollback of its shared post store when saveShifts returns false.
          throw new Error(t('errors.generic'));
        }
      }
    }
    function transaction(change, success) {
      try {
        const state=read();sweep(state);const rows=clone(getShifts());
        const result=change(state,rows);
        persist(state,JSON.stringify(rows)===JSON.stringify(getShifts())?null:rows);
        errorMessage='';render();
        if(success)tell(success);
        return result===undefined?true:result;
      } catch(caught) {
        errorMessage=caught?.message||t('errors.generic');
        render();
        const alert=document.querySelector('[data-shifts-dialog-error]');if(alert)alert.textContent=errorMessage;
        tell(errorMessage);return false;
      }
    }
    function requireAssignment(state,id,expected) {
      requireRole(expected);
      const assignment=state.assignments.find(row=>row.id===id),shift=assignment&&shiftById(assignment.shiftId);
      if(!assignment||!shift||(expected==='owner'?!owned(shift):assignment.worker!==member()))fail('not_allowed');
      return {assignment,shift};
    }
    function overlaps(state, shift, worker, ignoreId) {
      return state.assignments.some(row=>row.worker===worker&&row.id!==ignoreId&&OPEN.includes(row.status)&&row.shiftId!==shift.id&&starts(shift)<ends(shiftById(row.shiftId))&&ends(shift)>starts(shiftById(row.shiftId)));
    }
    function act(action,id,data={}) {
      return transaction((state,rows)=>{
        if(action==='availability') {
          requireRole('staff');
          const current=availability(state),next={...current,...data};
          next.availableDays=(next.availableDays||[]).filter(day=>DAYS.includes(day));
          if(![5,10,25].includes(Number(next.maxDistanceMiles)))fail('distance_invalid');
          if(data.latitude!=null&&(!Number.isFinite(data.latitude)||Math.abs(data.latitude)>90||!Number.isFinite(data.longitude)||Math.abs(data.longitude)>180))fail('location_invalid');
          next.updatedAt=iso(now());state.availability[member()]=next;return true;
        }
        if(action==='zelle') {
          const accountInfo=String(data.accountInfo||'').trim(),accountName=String(data.accountName||'').trim();
          if(!accountInfo||accountInfo.length>255)fail(role()==='owner'?'business_zelle_not_configured':'staff_zelle_not_configured');
          state.zelle[scope()]={accountInfo,accountName};return true;
        }
        if(action==='claim') {
          requireRole('staff');ensureUnblocked(state);
          const shift=shiftById(id);
          if(!shift||shift.kind!=='dayhire'||owned(shift)||closed(shift)||!Number.isFinite(starts(shift))||starts(shift)<=now())fail('invalid_state');
          if(!data.agreed)fail('policy_changed');
          if(!hasProfile())fail('staff_profile_required');
          const account=zelle(state,member(),'staff');if(!hasZelle(account))fail('staff_zelle_not_configured');
          if(!hasZelle(zelle(state,shift.owner,'owner',shift)))fail('business_zelle_not_configured');
          if(pay(shift)<=0||pay(shift)>10000)fail('pay_invalid');
          if(assignmentsFor(state,shift).some(row=>row.worker===member()&&OPEN.includes(row.status)))fail('already_claimed');
          if(overlaps(state,shift,member()))fail('overlapping');
          if(occupied(state,shift)>=countNeeded(shift))fail('full');
          const invitation=state.invitations.find(row=>row.shiftId===shift.id&&row.worker===member()&&(data.invitationId?row.id===data.invitationId:row.status==='Pending'));
          if(data.invitationId&&(!invitation||invitation.status!=='Pending'||+new Date(invitation.expiresAt)<=now()))fail('invitation_expired');
          const assignment={id:uid('assignment'),shiftId:shift.id,worker:member(),owner:shift.owner,status:'AwaitingDepositProof',payAmount:pay(shift),depositAmount:Math.max(1,Math.round(pay(shift)*POLICY.depositPercent/100)),policy:clone(POLICY),workerZelle:clone(account),createdAt:iso(now()),depositProofDueAt:iso(now()+POLICY.depositProofMinutes*MINUTE)};
          state.assignments.push(assignment);
          const settlement=createSettlement(state,assignment,shift,'Deposit',assignment.depositAmount,{deposit:assignment.depositAmount},now()+POLICY.depositProofMinutes*MINUTE);
          if(invitation){invitation.status='Accepted';invitation.assignmentId=assignment.id;invitation.respondedAt=iso(now());}
          if(mode(shift)==='Instant'&&occupied(state,shift)>=countNeeded(shift))state.invitations.filter(row=>row.shiftId===id&&row.status==='Pending').forEach(row=>{row.status='Expired';});
          return {...assignment,settlementId:settlement.id};
        }
        if(action==='invite') {
          requireRole('owner');ensureUnblocked(state);
          const shift=shiftById(id),worker=String(data.worker||'');
          if(!owned(shift)||shift.kind!=='dayhire'||closed(shift)||starts(shift)<=now()||occupied(state,shift)>=countNeeded(shift)||worker===member())fail('invitation_not_allowed');
          if(!availableWorkers(state,shift,25).some(row=>row.owner===worker))fail('worker_not_eligible');
          if(assignmentsFor(state,shift).some(row=>row.worker===worker&&OPEN.includes(row.status)))fail('invitation_not_allowed');
          if(state.invitations.some(row=>row.shiftId===id&&row.worker===worker&&row.status==='Pending'))fail('invitation_already_pending');
          if(state.invitations.filter(row=>row.shiftId===id&&row.status==='Pending').length>=10)fail('invitation_limit_reached');
          if(state.invitations.some(row=>row.shiftId===id&&row.worker===worker&&row.status==='Cancelled'&&+new Date(row.respondedAt)+5*MINUTE>now()))fail('invitation_recently_withdrawn');
          state.invitations.push({id:uid('invitation'),shiftId:id,owner:member(),worker,status:'Pending',createdAt:iso(now()),expiresAt:iso(Math.min(now()+12*HOUR,starts(shift)))});return true;
        }
        if(action==='declineInvitation'||action==='withdrawInvitation') {
          const invitation=state.invitations.find(row=>row.id===id);
          if(!invitation||invitation.status!=='Pending'||(action==='declineInvitation'?role()!=='staff'||invitation.worker!==member():role()!=='owner'||invitation.owner!==member()))fail('invitation_not_allowed');
          invitation.status=action==='declineInvitation'?'Declined':'Cancelled';invitation.respondedAt=iso(now());return true;
        }
        if(action==='cancelShift') {
          requireRole('owner');const shift=rows.find(row=>row.id===id);
          if(!owned(shift)||shift.kind!=='dayhire'||closed(shift)||starts(shift)<=now()||assignmentsFor(state,shift).some(row=>row.status==='InProgress'))fail('already_started');
          assignmentsFor(state,shift).filter(row=>CANCELLABLE.includes(row.status)).forEach(row=>closeAssignment(state,row,shift,'BusinessCancelled'));
          shift.status='closed';shift.shiftStatus='Cancelled';shift.cancelledAt=iso(now());
          state.invitations.filter(row=>row.shiftId===id&&row.status==='Pending').forEach(row=>{row.status='Cancelled';});return true;
        }
        if(action==='proof'||action==='receive'||action==='disputeSettlement') {
          const settlement=state.settlements.find(row=>row.id===id);if(!visibleSettlement(settlement))fail('not_allowed');
          const {assignment,shift}=requireAssignment(state,settlement.assignmentId,role());
          if(action==='proof') {
            if(!isPayer(settlement)||settlement.status!=='AwaitingProof')fail('invalid_state');
            const images=Array.isArray(data.images)?data.images:[];
            if(images.length<1||!validEvidence(images))fail('proof_images_invalid');
            if(settlement.type==='Deposit'&&+new Date(settlement.proofDueAt)<=now())fail('deposit_proof_expired');
            settlement.proofImageUrls=images;settlement.proofUploadedAt=iso(now());settlement.status='AwaitingReceipt';
            settlement.autoConfirmAt=iso(now()+policy(assignment).receiptAutoConfirmHours*HOUR);
            if(settlement.type==='Deposit') {
              if(assignment.status!=='AwaitingDepositProof')fail('invalid_state');
              assignment.status=mode(shift)==='Instant'?'AwaitingDepositConfirmation':'PendingApproval';
              if(mode(shift)==='Instant')settlement.autoConfirmAt=assignment.depositConfirmDueAt=iso(Math.min(now()+policy(assignment).depositConfirmHours*HOUR,starts(shift)));
            }
          } else if(action==='receive') {
            if(!isPayee(settlement)||settlement.status!=='AwaitingReceipt')fail('invalid_state');received(state,settlement);
          } else {
            if(!isPayee(settlement)||!['AwaitingReceipt','Received'].includes(settlement.status))fail('invalid_state');
            const deadline=settlement.receivedAt?+new Date(settlement.receivedAt)+policy(assignment).disputeWindowHours*HOUR:Infinity;
            if(now()>deadline)fail('dispute_window_closed');
            if(settlement.status==='Received'&&settlement.type==='Deposit'&&now()>=starts(shift))fail('dispute_window_closed');
            const reason=String(data.reason||'').trim();if(!reason||reason.length>500)fail('reason_invalid');
            if(!validEvidence(data.images||[]))fail('proof_images_invalid');
            settlement.dispute={id:uid('dispute'),status:'Open',reason,evidenceUrls:data.images||[],createdAt:iso(now())};settlement.status='Disputed';
            if(settlement.type==='Deposit')state.settlements.filter(row=>row.assignmentId===assignment.id&&row.type!=='Deposit'&&row.status==='AwaitingProof').forEach(row=>{row.status='Cancelled';});
          }
          return true;
        }
        const expected=['cancelAssignment','checkIn','requestPresence','disputeOutcome'].includes(action)?'staff':'owner';
        const {assignment,shift}=requireAssignment(state,id,expected),deposit=deposits(state,assignment),p=policy(assignment);
        if(action==='cancelAssignment') {
          if(!CANCELLABLE.includes(assignment.status)||assignment.status==='Confirmed'&&starts(shift)<=now())fail('already_started');
          closeAssignment(state,assignment,shift,'WorkerCancelled');return true;
        }
        if(action==='approve') {
          ensureUnblocked(state);
          if(assignment.status!=='PendingApproval'||starts(shift)<=now()||!['AwaitingReceipt','Received'].includes(deposit?.status))fail('invalid_state');
          if(occupied(state,shift)>=countNeeded(shift))fail('full');
          if(overlaps(state,shift,assignment.worker,assignment.id))fail('overlapping');
          if(deposit.status==='AwaitingReceipt')received(state,deposit);
          assignment.status='Confirmed';assignment.confirmedAt=iso(now());
          if(occupied(state,shift)>=countNeeded(shift)) {
            assignmentsFor(state,shift).filter(row=>row.id!==id&&row.status==='PendingApproval').forEach(row=>closeAssignment(state,row,shift,'Rejected'));
            state.invitations.filter(row=>row.shiftId===shift.id&&row.status==='Pending').forEach(row=>{row.status='Expired';});
          }
          return true;
        }
        if(action==='reject') {if(assignment.status!=='PendingApproval')fail('invalid_state');closeAssignment(state,assignment,shift,'Rejected');return true;}
        if(action==='checkIn'||action==='requestPresence'||action==='present'||action==='absent') {
          if(assignment.status!=='Confirmed'||now()<starts(shift)-p.checkInOpensMinutesBefore*MINUTE||now()>(['present','absent'].includes(action)?ends(shift):starts(shift)+p.lateGraceMinutes*MINUTE))fail('check_in_window_closed');
          if(action==='requestPresence') {assignment.presenceRequestedAt=iso(now());return true;}
          if(action==='present') {checkInAssignment(assignment,'BusinessConfirmed');return true;}
          if(action==='absent') {if(now()<=starts(shift)+p.lateGraceMinutes*MINUTE)fail('check_in_window_closed');closeAssignment(state,assignment,shift,'NoShow');return true;}
          const distance=distanceMeters(data,shift);
          if(!Number.isFinite(distance)||distance>p.checkInRadiusMeters)fail('location_invalid');
          assignment.checkInDistanceMeters=Math.round(distance);checkInAssignment(assignment,'Gps');return true;
        }
        if(action==='complete') {if(assignment.status!=='InProgress')fail('invalid_state');if(assignment.dispute)fail('dispute_already_open');closeAssignment(state,assignment,shift,'Completed');return true;}
        if(action==='disputeOutcome'||action==='reportIssue') {
          if(assignment.dispute)fail('dispute_already_open');
          if(action==='disputeOutcome'&&(assignment.status!=='NoShow'||now()>+new Date(assignment.closedAt)+p.disputeWindowHours*HOUR))fail('dispute_window_closed');
          if(action==='reportIssue'&&assignment.status!=='InProgress')fail('invalid_state');
          const reason=String(data.reason||'').trim();if(!reason||reason.length>500)fail('reason_invalid');
          if(!validEvidence(data.images||[]))fail('proof_images_invalid');
          assignment.dispute={id:uid('dispute'),status:'Open',subject:'Outcome',reason,evidenceUrls:data.images||[],createdAt:iso(now())};return true;
        }
        fail('invalid_state');
      });
    }
    function distanceMeters(a,b) {
      const lat1=Number(a?.latitude ?? a?.lat),lon1=Number(a?.longitude ?? a?.lng),lat2=Number(b?.latitude ?? b?.lat),lon2=Number(b?.longitude ?? b?.lng);
      if([a?.latitude??a?.lat,a?.longitude??a?.lng,b?.latitude??b?.lat,b?.longitude??b?.lng].some(value=>value==null)||![lat1,lon1,lat2,lon2].every(Number.isFinite))return NaN;
      const radians=value=>value*Math.PI/180,dlat=radians(lat2-lat1),dlon=radians(lon2-lon1);
      const h=Math.sin(dlat/2)**2+Math.cos(radians(lat1))*Math.cos(radians(lat2))*Math.sin(dlon/2)**2;
      return 6371000*2*Math.atan2(Math.sqrt(h),Math.sqrt(1-h));
    }
    const normalized = value => String(value||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim();
    function distanceMiles(a,b) {const distance=distanceMeters(a,b);return Number.isFinite(distance)?distance/1609.344:Number.isFinite(Number(b?.distanceMiles))&&b?.distanceMiles!=null?Number(b.distanceMiles):NaN;}
    function matchesLocation(availability,shift,radius) {
      const distance=distanceMiles(availability,shift);
      if(Number.isFinite(distance))return distance<=radius;
      return !availability.city||!shift.city||normalized(availability.city)===normalized(shift.city);
    }
    function availableWorkers(state,shift,radius) {
      const names=new Set([...Object.keys(state.availability),...getShifts().filter(row=>row.kind==='daywork'&&!closed(row)).map(row=>row.owner)]);
      return [...names].filter(name=>name&&name!==member()).map(name=>{
        const entry=availability(state,name),post=getShifts().find(row=>row.kind==='daywork'&&row.owner===name&&!closed(row)&&row.date===shift.date);
        if(!entry.isAvailable||!matchesLocation(entry,shift,radius))return null;
        const day=DAYS[(new Date(starts(shift)).getDay()+6)%7];if(entry.availableDays.length&&!entry.availableDays.includes(day))return null;
        if(post?.industry&&shift.industry&&post.industry!==shift.industry)return null;
        const skills=String(post?.skills||entry.skills||'').split(/[,;·]/).map(normalized).filter(Boolean),required=String(shift.skills||'').split(/[,;·]/).map(normalized).filter(Boolean);
        if(required.length&&skills.length&&!required.some(required=>skills.some(skill=>skill.includes(required)||required.includes(skill))))return null;
        if(post&&Number.isFinite(starts(post))&&(starts(post)>starts(shift)||ends(post)<ends(shift)))return null;
        if(overlaps(state,shift,name))return null;
        return {owner:name,skills:post?.skills||entry.skills||'',photoUrl:entry.photoUrl||'',distance:distanceMiles(entry,shift)};
      }).filter(Boolean);
    }
    function policyMarkup(p=POLICY) {return `<details class="shifts-policy"><summary>${esc(t('policy.title'))}</summary><ul>${[
      t('policy.deposit',{percent:p.depositPercent}),t('policy.workerFree',{hours:p.freeCancellationHours}),t('policy.workerLate',{hours:p.freeCancellationHours,percent:p.workerLateCancelForfeitPercent}),t('policy.noShow',{minutes:p.lateGraceMinutes,percent:p.noShowForfeitPercent}),t('policy.salonLate',{hours:p.freeCancellationHours,percent:p.businessLateCancelPayPercent}),t('policy.dispute',{hours:p.disputeWindowHours})
    ].map(text=>`<li>${esc(text)}</li>`).join('')}</ul></details>`;}
    function button(action,id,label,extra='',style='') {return `<button type="button" class="btn small ${style}" data-shifts-action="${action}" data-shifts-id="${esc(id||'')}" ${extra}>${esc(label)}</button>`;}
    function empty(text) {return `<p class="shifts-empty">${esc(text)}</p>`;}
    function card(shift,state,tools='') {
      const assignment=role()==='staff'&&state.assignments.find(row=>row.shiftId===shift.id&&row.worker===member()&&OPEN.includes(row.status));
      return `<article class="panel shifts-card" id="workflow-shift-${esc(shift.id)}" data-workflow-shift="${esc(shift.id)}" tabindex="-1"><div class="shifts-card-heading"><span class="kind ${shift.kind==='dayhire'?'sale':'want'}">${esc(t(shift.kind==='dayhire'?'needWorker':'availablePost'))}</span>${shift.shiftType?`<span class="shifts-badge">${esc(t('types.'+shift.shiftType))}</span>`:''}</div><h3>${esc(shift.title||shift.role)}</h3><p class="meta">${esc(shift.owner)} · ${esc(shift.city)}</p><div class="chips"><span class="chip">${esc(date(shift.date?shift.date+'T12:00:00':starts(shift)))} · ${esc(shift.hours||'')}</span><span class="chip">${esc(shift.industry||'')}</span><span class="chip">${esc(shift.role||'')}</span>${shift.pay?`<span class="chip">${esc(money(shift.pay))} ${esc(shift.period||'')}</span>`:''}</div>${shift.skills?`<p class="meta">${esc(shift.skills)}</p>`:''}${shift.description?`<p>${esc(shift.description)}</p>`:''}${shift.kind==='dayhire'?`<p class="shifts-status">${esc(t('owner.counts',{confirmed:assignmentsFor(state,shift).filter(row=>['Confirmed','InProgress'].includes(row.status)).length,total:countNeeded(shift),pending:assignmentsFor(state,shift).filter(row=>['AwaitingDepositProof','AwaitingDepositConfirmation','PendingApproval'].includes(row.status)).length}))} · ${esc(t('acceptModes.'+mode(shift)))}</p>`:''}<div class="shifts-actions">${tools|| (assignment?button('openAssignment',assignment.id,t('my.title')):button('details',shift.id,t('viewShift')))}</div></article>`;
    }
    function availabilityMarkup(state) {
      const entry=availability(state);
      return `<section class="panel shifts-availability" aria-labelledby="shift-availability-title"><div class="shifts-section-heading"><h3 id="shift-availability-title">${esc(t('availability.title'))}</h3><label class="shifts-toggle"><input type="checkbox" data-shifts-availability ${entry.isAvailable?'checked':''} aria-label="${esc(t('availability.toggle'))}"></label></div><p class="meta">${esc(t('availability.subtitle'))}</p><p class="meta">${esc(t('availability.visibilityNote'))}</p>${entry.isAvailable?`<div class="shifts-days" role="group" aria-label="${esc(t('availability.days'))}">${DAYS.map(day=>button('day',day,t('weekdays.'+day),`aria-pressed="${entry.availableDays.includes(day)}"`,entry.availableDays.includes(day)?'primary':'soft')).join('')}</div><div class="shifts-form-row"><label>${esc(t('availability.distance'))}<select data-shifts-distance>${[5,10,25].map(distance=>`<option value="${distance}" ${entry.maxDistanceMiles==distance?'selected':''}>${esc(t('distance',{miles:distance}))}</option>`).join('')}</select></label><div><strong>${esc(t('availability.services'))}</strong><p class="meta">${esc(Array.isArray(entry.skills)?entry.skills.join(', '):entry.skills||t('availability.noServices'))}</p>${button('profile','',t('availability.edit'),'','soft')}</div></div><p class="meta">${esc(entry.city||'')}${entry.latitude==null?' · '+esc(t('availability.cityLocation')):''}</p>${button('location','',t('availability.useMyLocation'),'','soft')}`:''}</section>`;
    }
    function invitationsMarkup(state) {
      const rows=state.invitations.filter(row=>row.worker===member()&&row.status==='Pending');
      if(!rows.length)return '';
      return `<section class="panel shifts-section"><h3>${esc(t('invitations.title'))}</h3><p class="meta">${esc(t('invitations.subtitle'))}</p>${rows.map(row=>{const shift=shiftById(row.shiftId);return shift?`<article class="shifts-inner-card"><strong>${esc(shift.title||shift.role)}</strong><p class="meta">${esc(shift.owner)} · ${esc(when(starts(shift)))}</p><p class="meta">${esc(t('invitations.expiresIn',{time:Math.max(0,Math.ceil((+new Date(row.expiresAt)-now())/MINUTE))+' min'}))}</p><div class="shifts-actions">${button('acceptInvitation',row.id,t('claim.'+(mode(shift)==='Instant'?'instantConfirm':'applyConfirm')))}${button('declineInvitation',row.id,t('invitations.decline'),'','soft')}</div></article>`:'';}).join('')}</section>`;
    }
    function paged(rows,markup) {
      const pages=Math.max(1,Math.ceil(rows.length/PAGE_SIZE));view.page=Math.max(1,Math.min(view.page,pages));
      return rows.slice((view.page-1)*PAGE_SIZE,view.page*PAGE_SIZE).map(markup).join('')+(pages>1?`<nav class="shifts-pagination" aria-label="${esc(t('nearby.pagination'))}">${button('page',view.page-1,t('nearby.previous'),view.page===1?'disabled':'','soft')}<span>${esc(t('nearby.page',{page:view.page,total:pages}))}</span>${button('page',view.page+1,t('nearby.next'),view.page===pages?'disabled':'','soft')}</nav>`:'');
    }
    function filterButtons(items,key) {return `<div class="shifts-filters" role="group" aria-label="${esc(t('navigation.selectStatus'))}">${items.map(([value,label])=>button(key,value,label,`aria-pressed="${view[key==='paymentRole'?'paymentRole':'filter']===value}"`,view[key==='paymentRole'?'paymentRole':'filter']===value?'primary':'soft')).join('')}</div>`;}
    function browseMarkup(state) {
      const entry=availability(state),rows=getShifts().filter(shift=>shift.kind==='dayhire'&&!owned(shift)&&!closed(shift)&&starts(shift)>now()&&matchesLocation(entry,shift,entry.maxDistanceMiles)&&(!entry.availableDays.length||entry.availableDays.includes(DAYS[(new Date(starts(shift)).getDay()+6)%7])));
      return availabilityMarkup(state)+invitationsMarkup(state)+`<section class="shifts-section"><div class="shifts-section-heading"><h3>${esc(t('nearby.title'))}</h3><span class="meta">${entry.isAvailable?rows.length:esc(t('nearby.off'))}</span></div>${!entry.isAvailable?empty(t('nearby.offHint')):rows.length?paged(rows,row=>card(row,state)):empty(t('nearby.empty'))}</section>`;
    }
    function assignmentMarkup(assignment,state) {
      const shift=shiftById(assignment.shiftId);if(!shift)return '';
      const owner=role()==='owner',deposit=deposits(state,assignment),p=policy(assignment);
      const payouts=state.settlements.filter(row=>row.assignmentId===assignment.id&&row.type!=='Deposit'&&row.status!=='Cancelled');
      let actions='';
      if(owner) {
        if(assignment.status==='AwaitingDepositConfirmation'&&deposit?.status==='AwaitingReceipt')actions+=button('receive',deposit.id,t('owner.confirmDeposit'));
        if(assignment.status==='PendingApproval') {
          if(starts(shift)>now()&&['AwaitingReceipt','Received'].includes(deposit?.status))actions+=button('approve',assignment.id,t('owner.approve'),overdue(state).length?'disabled':'');
          actions+=button('reject',assignment.id,t('owner.reject'),'','soft');
        }
        if(assignment.status==='Confirmed'&&assignment.presenceRequestedAt&&now()>=starts(shift)-p.checkInOpensMinutesBefore*MINUTE&&now()<ends(shift)) {
          actions+=button('present',assignment.id,t('owner.present'));
          if(now()>starts(shift)+p.lateGraceMinutes*MINUTE)actions+=button('absent',assignment.id,t('owner.notPresent'),'','soft');
        }
        if(assignment.status==='InProgress') {if(!assignment.dispute)actions+=button('complete',assignment.id,t('owner.complete'))+button('reportIssue',assignment.id,t('owner.reportIssue'),'','soft');}
      } else {
        if(assignment.status==='AwaitingDepositProof'&&deposit)actions+=button('settlement',deposit.id,t('my.sendDeposit',{amount:money(deposit.amount)}));
        if(assignment.status==='Confirmed') {
          if(assignment.presenceRequestedAt)actions+=`<p class="shifts-status">${esc(t('checkIn.waitingSalon'))}</p>`;
          else if(now()<starts(shift)-p.checkInOpensMinutesBefore*MINUTE)actions+=`<p class="meta">${esc(t('checkIn.windowHint',{before:p.checkInOpensMinutesBefore,grace:p.lateGraceMinutes}))}</p>`;
          else if(now()<=starts(shift)+p.lateGraceMinutes*MINUTE)actions+=button('checkIn',assignment.id,t('checkIn.cta'));
          else actions+=`<p class="meta">${esc(t('checkIn.windowClosed'))}</p>`;
        }
        if(CANCELLABLE.includes(assignment.status)&&!(assignment.status==='Confirmed'&&starts(shift)<=now()))actions+=button('cancelAssignment',assignment.id,t('my.cancel'),'','soft');
        if(assignment.status==='NoShow'&&!assignment.dispute&&now()<=+new Date(assignment.closedAt)+p.disputeWindowHours*HOUR)actions+=button('disputeOutcome',assignment.id,t('my.disputeNoShow'),'','soft');
      }
      if(deposit)actions+=button('settlement',deposit.id,t('deposit'),'','soft');
      payouts.forEach(row=>{actions+=button('settlement',row.id,t(owner?'owner.sendPay':'my.viewPayment',{amount:money(row.amount)}),'','soft');});
      return `<article class="shifts-inner-card" id="shift-assignment-${esc(assignment.id)}" tabindex="-1"><div class="shifts-card-heading"><strong>${esc(owner?assignment.worker:shift.title||shift.role)}</strong><span class="shifts-badge">${esc(t('status.'+assignment.status))}</span></div><p class="meta">${esc(owner?shift.title:shift.owner)} · ${esc(when(starts(shift)))}</p><p class="meta">${esc(shift.city)} · ${esc(shift.hours||'')} · ${esc(money(assignment.payAmount))}</p>${assignment.dispute?`<p class="shifts-status">${esc(t('settlement.disputeOpen'))}</p>`:''}<div class="shifts-actions">${actions}</div></article>`;
    }
    function ownerMarkup(state) {
      const rows=getShifts().filter(shift=>owned(shift)&&shift.kind==='dayhire').filter(shift=>view.filter==='Cancelled'?closed(shift):view.filter==='Past'?!closed(shift)&&ends(shift)<now():!closed(shift)&&ends(shift)>=now());
      return `<section class="shifts-section"><div class="shifts-section-heading"><h3>${esc(t('owner.title'))}</h3>${button('post','',t('post.open'),overdue(state).length?'disabled':'','primary')}</div>${filterButtons(['Active','Past','Cancelled'].map(value=>[value,t('owner.filters.'+value)]),'filter')}${rows.length?paged(rows,shift=>{
        const canManage=!closed(shift)&&starts(shift)>now()&&!assignmentsFor(state,shift).some(row=>row.status==='InProgress');
        const tools=button('details',shift.id,t('viewShift'))+(canManage?button('edit',shift.id,t('availability.edit'),'','soft')+button('workers',shift.id,t('owner.findWorkers'),occupied(state,shift)>=countNeeded(shift)||overdue(state).length?'disabled':'','soft')+button('cancelShift',shift.id,t('owner.cancelShift'),'','soft'):'');
        return card(shift,state,tools)+`<div class="shifts-assignments">${assignmentsFor(state,shift).map(row=>assignmentMarkup(row,state)).join('')}</div>`;
      }):empty(t('owner.empty'))}</section>`;
    }
    function myMarkup(state) {
      const status=view.assignmentStatus||'All',quick=['All','AwaitingDepositProof','Confirmed','InProgress','Completed'];
      const rows=state.assignments.filter(row=>row.worker===member()&&(status!=='All'?row.status===status:view.filter==='History'?!OPEN.includes(row.status):OPEN.includes(row.status)));
      const posts=getShifts().filter(row=>row.kind==='daywork'&&owned(row)&&!closed(row));
      const statuses=['AwaitingDepositConfirmation','PendingApproval','NoShow','Rejected','Expired','WorkerCancelled','BusinessCancelled'];
      return `<section class="shifts-section"><h3>${esc(t('my.title'))}</h3>${filterButtons([['Active',t('my.tabs.Active')],['History',t('my.tabs.History')]],'filter')}<div class="shifts-filters" role="group" aria-label="${esc(t('navigation.selectStatus'))}">${quick.map(value=>button('assignmentStatus',value,t('my.filters.'+value),`aria-pressed="${status===value}"`,status===value?'primary':'soft')).join('')}</div><label class="shifts-payment-filter">${esc(t('navigation.moreFilters'))}<select data-shifts-assignment-status><option value="All">${esc(t('navigation.selectStatus'))}</option>${statuses.map(value=>`<option value="${value}" ${status===value?'selected':''}>${esc(t('status.'+value))}</option>`).join('')}</select></label>${rows.length?paged(rows,row=>assignmentMarkup(row,state)):empty(t('my.empty'))}</section>${posts.length?`<section class="shifts-section"><h3>${esc(t('availablePost'))}</h3>${posts.map(row=>card(row,state,button('edit',row.id,t('availability.edit'),'','soft'))).join('')}</section>`:''}`;
    }
    function paymentMarkup(state) {
      const rows=state.settlements.filter(visibleSettlement).filter(row=>view.paymentRole==='All'||(view.paymentRole==='Payer'?isPayer(row):isPayee(row))).filter(row=>view.paymentFilter==='All'||view.paymentFilter==='NeedsAction'&&(row.status==='AwaitingProof'&&isPayer(row)||row.status==='AwaitingReceipt'&&isPayee(row))||view.paymentFilter==='Overdue'&&row.status==='AwaitingProof'&&row.type!=='Deposit'&&+new Date(row.proofDueAt)<now()||row.status===view.paymentFilter);
      return `<section class="panel shifts-section"><h3>${esc(t('payments.title'))}</h3><p class="meta">${esc(t('payments.subtitle'))}</p>${filterButtons(['All','Payer','Payee'].map(value=>[value,t('payments.roles.'+value)]),'paymentRole')}<label class="shifts-payment-filter">${esc(t('payments.statusFilter'))}<select data-shifts-payment-filter>${['All','NeedsAction','Overdue','AwaitingProof','AwaitingReceipt','Disputed','Received','Cancelled'].map(value=>`<option value="${value}" ${view.paymentFilter===value?'selected':''}>${esc(t(value==='Cancelled'?'settlementStatus.Cancelled':'payments.filters.'+value))}</option>`).join('')}</select></label>${rows.length?paged(rows,row=>{const shift=shiftById(row.shiftId);return `<button type="button" class="shifts-payment-row" data-shifts-action="settlement" data-shifts-id="${esc(row.id)}"><span><strong>${esc(shift?.title||shift?.role||'')}</strong><span class="meta">${esc(isPayer(row)?row.payee:row.payer)} · ${esc(t('payments.roles.'+(isPayer(row)?'Payer':'Payee')))}</span><span class="shifts-status">${esc(t('settlementTypes.'+row.type))} · ${esc(t('settlementStatus.'+row.status))}</span><span class="meta">${esc(t('settlement.dueBy',{when:when(row.proofDueAt)}))}</span>${row.status==='AwaitingProof'&&row.type!=='Deposit'&&+new Date(row.proofDueAt)<now()?`<span class="shifts-error">${esc(t('payments.overdue'))}</span>`:''}</span><b>${esc(money(row.amount))}</b></button>`;}):empty(t('payments.none'))}</section>`;
    }
    function reliabilityMarkup(state) {
      const owner=role()==='owner',mine=state.assignments.filter(row=>owner?row.owner===member():row.worker===member());
      const figures=owner?[[getShifts().filter(row=>owned(row)&&row.kind==='dayhire').length,t('reliability.business.shiftsPosted')],[mine.filter(row=>row.status==='BusinessCancelled'&&row.isLateCancellation).length,t('reliability.business.lateCancellations')],[overdue(state).length,t('reliability.business.latePayments')]]:[[mine.filter(row=>row.status==='Completed').length,t('reliability.worker.completed')],[mine.filter(row=>row.status==='NoShow').length,t('reliability.worker.noShows')],[mine.filter(row=>row.status==='WorkerCancelled'&&row.isLateCancellation).length,t('reliability.worker.lateCancellations')]];
      return `<section class="panel shifts-section shifts-reliability"><h3>${esc(t('reliability.'+(owner?'business':'worker')+'.title'))}</h3><div>${figures.map(([count,label])=>`<span><strong>${count}</strong><small>${esc(label)}</small></span>`).join('')}</div><p class="meta">${esc(t('reliability.'+(owner?'business':'worker')+'.note'))}</p></section>`;
    }
    function publishContext(extra={}) {adapter.onState?.({shiftTab:view.tab,shiftId:view.shiftId,assignmentId:view.assignmentId,settlementId:view.settlementId,...extra});}
    function render() {
      if(destroyed)return;
      if(lastScope!==scope()){lastScope=scope();view={tab:role()==='owner'?'my-shifts':'browse',filter:'Active',paymentRole:'All',paymentFilter:'All',page:1};dialog=null;if(document.querySelector('.shifts-dialog'))adapter.closeDialog?.();}
      const container=document.getElementById('dayworkView');if(!container)return;
      let root=document.getElementById('communityShiftsWorkflow');
      if(!root){root=document.createElement('div');root.id='communityShiftsWorkflow';container.querySelector('#shiftTemplates')?.after(root);if(!root.isConnected)container.append(root);}
      // Retain PO intro and short forms; workflow replaces only their old flat listing and filters.
      [...container.children].forEach(child=>{if(child!==root&&!child.classList.contains('feature-intro')&&child.id!=='shiftTemplates')child.dataset.shiftsReplaced='true';});
      document.querySelectorAll('#shiftTemplates [data-template]').forEach(button=>{button.hidden=button.dataset.template!==(role()==='owner'?'dayhire':'daywork');});
      const state=read();if(sweep(state)){try{persist(state);}catch{errorMessage=t('errors.generic');}}
      const tabs=role()==='owner'?['my-shifts','payments']:['browse','my-shifts','payments'];if(!tabs.includes(view.tab))view.tab=tabs[0];
      const pending=overdue(state),blocked=pending.length?`<div class="shifts-overdue" role="status"><p>${esc(t('overdue.message',{count:pending.length,amount:money(pending.reduce((sum,row)=>sum+row.amount,0))}))}</p>${button('payOverdue','',t('overdue.payNow'),'','soft')}</div>`:'';
      document.getElementById('dayworkView')?.classList.toggle('shifts-owner-view',role()==='owner');
      root.innerHTML=`${blocked}<div class="shifts-tabs" role="tablist" aria-label="${esc(t('navigation.label'))}">${tabs.map(tab=>`<button type="button" role="tab" id="shift-tab-${tab}" data-shifts-tab="${tab}" aria-controls="shift-panel-${tab}" aria-selected="${tab===view.tab}" tabindex="${tab===view.tab?0:-1}">${esc(t('navigation.'+tab))}</button>`).join('')}</div>${errorMessage?`<p class="shifts-error" role="alert">${esc(errorMessage)}</p>`:''}<div class="shifts-workspace"><div role="tabpanel" id="shift-panel-${view.tab}" aria-labelledby="shift-tab-${view.tab}" class="shifts-stack">${view.tab==='payments'?paymentMarkup(state):role()==='owner'?ownerMarkup(state):view.tab==='browse'?browseMarkup(state):myMarkup(state)}</div><aside class="shifts-stack">${view.tab!=='browse'?reliabilityMarkup(state):''}${policyMarkup()}${button('setup','',t('setup.'+(role()==='owner'?'businessZelle':'staffZelle')+'.cta'),'','soft')}</aside></div>`;
    }
    function modal(title,body,footer='') {
      adapter.openDialog?.(`<div class="overlay" data-shifts-overlay><section class="dialog shifts-dialog" role="dialog" aria-modal="true" aria-labelledby="shiftsDialogTitle"><div class="dialog-head"><h2 id="shiftsDialogTitle">${esc(title)}</h2>${button('close','',t('close'),'','soft')}</div><div class="dialog-body">${body}<p class="shifts-error" data-shifts-dialog-error role="alert"></p></div>${footer?`<div class="dialog-footer">${footer}</div>`:''}</section></div>`);
      document.querySelector('.shifts-dialog input,.shifts-dialog textarea,.shifts-dialog button')?.focus();
    }
    function openSetup() {
      const state=read(),account=zelle(state,member(),role())||{},key=role()==='owner'?'businessZelle':'staffZelle';dialog={type:'setup'};
      modal(t('setup.'+key+'.title'),`<p>${esc(t('setup.'+key+'.body'))}</p><form id="shiftsZelleForm" class="shifts-form"><label>${esc(t('accountName'))}<input name="accountName" value="${esc(account.accountName||'')}" maxlength="255"></label><label>${esc(t('accountInfo'))}<input name="accountInfo" required value="${esc(account.accountInfo||'')}" maxlength="255"></label><button class="btn primary" type="submit">${esc(t('save'))}</button></form>`);
    }
    function openClaim(id,invitationId) {
      const shift=shiftById(id),state=read();if(!shift||shift.kind!=='dayhire'||closed(shift))return unavailable();
      if(role()!=='staff'||owned(shift))return openShift(id);
      if(!hasProfile()){modal(t('setup.staffProfile.title'),`<p>${esc(t('setup.staffProfile.body'))}</p>`,button('profile','',t('setup.staffProfile.cta'),'','primary'));return;}
      if(!hasZelle(zelle(state,member(),'staff'))){openSetup();return;}
      if(!hasZelle(zelle(state,shift.owner,'owner',shift))){tell(t('claim.salonZelleMissing'));return;}
      dialog={type:'claim',id,invitationId};
      modal(shift.title||shift.role,`<p class="meta">${esc(shift.city)} · ${esc(when(starts(shift)))}</p><div class="shifts-summary"><span>${esc(t('pay'))}<strong>${esc(money(pay(shift)))}</strong></span><span>${esc(t('deposit'))}<strong>${esc(money(Math.max(1,Math.round(pay(shift)*POLICY.depositPercent/100))))}</strong></span></div><p class="quiet">${esc(t('honestNote'))}</p>${policyMarkup()}<label class="shifts-agree"><input type="checkbox" data-shifts-agree> ${esc(t('claim.agree'))}</label>`,button('confirmClaim',id,t('claim.'+(mode(shift)==='Instant'?'instantConfirm':'applyConfirm')),'disabled','primary'));
    }
    function unavailable() {modal(t('my.notificationTarget'),empty(t('notification.unavailable')));return false;}
    function openShift(id) {
      const shift=shiftById(id),state=read();if(!shift)return unavailable();view.shiftId=shift.id;view.assignmentId=null;view.settlementId=null;
      const mine=role()==='staff'&&state.assignments.find(row=>row.shiftId===id&&row.worker===member()&&OPEN.includes(row.status));
      let tools='';
      if(owned(shift))tools=button('edit',id,t('availability.edit'),'','soft');
      else if(shift.kind==='dayhire'&&role()==='staff'&&!closed(shift)&&starts(shift)>now())tools=mine?button('openAssignment',mine.id,t('my.title')):pay(shift)>0?button('claim',id,t('claim.'+(mode(shift)==='Instant'?'instantCta':'applyCta')),overdue(state).length||occupied(state,shift)>=countNeeded(shift)?'disabled':'','primary'):button('contact',id,t('contact'),'','soft');
      else if(shift.kind==='daywork')tools=button('contact',id,t('contact'),'','soft');
      if(owned(shift)&&role()==='owner'&&shift.kind==='dayhire'&&!closed(shift)&&starts(shift)>now())tools+=button('workers',id,t('owner.findWorkers'),overdue(state).length?'disabled':'','soft')+button('cancelShift',id,t('owner.cancelShift'),'','soft');
      dialog={type:'shift',id};publishContext();
      modal(shift.title||shift.role,card(shift,state,tools)+(owned(shift)&&role()==='owner'?assignmentsFor(state,shift).map(row=>assignmentMarkup(row,state)).join(''):mine?assignmentMarkup(mine,state):'')+(shift.kind==='dayhire'?policyMarkup():''));return true;
    }
    function openAssignment(id) {
      const state=read(),assignment=state.assignments.find(row=>row.id===id),shift=assignment&&shiftById(assignment.shiftId);
      if(!assignment||!shift||(role()==='staff'?assignment.worker!==member():!owned(shift)))return unavailable();
      view.tab='my-shifts';view.shiftId=shift.id;view.assignmentId=id;view.settlementId=null;view.filter=role()==='owner'?(closed(shift)?'Cancelled':ends(shift)<now()?'Past':'Active'):OPEN.includes(assignment.status)?'Active':'History';dialog={type:'assignment',id};render();publishContext();modal(t('my.title'),assignmentMarkup(assignment,state)+policyMarkup(policy(assignment)));return true;
    }
    function openSettlement(id) {
      const state=read(),settlement=state.settlements.find(row=>row.id===id);if(!visibleSettlement(settlement))return unavailable();
      const shift=shiftById(settlement.shiftId),assignment=state.assignments.find(row=>row.id===settlement.assignmentId);if(!shift||!assignment)return unavailable();
      view.tab='payments';view.shiftId=shift.id;view.assignmentId=assignment.id;view.settlementId=id;dialog={type:'settlement',id};render();publishContext();
      const account=settlement.payeeZelle||{},canProof=isPayer(settlement)&&settlement.status==='AwaitingProof';
      const breakdown=Object.entries(settlement.breakdown||{}).filter(([,amount])=>amount);
      const proof=(settlement.proofImageUrls||[]).filter(url=>/^data:image\/(jpeg|png|webp);base64,[a-z0-9+/=]+$/i.test(url));
      const canDispute=isPayee(settlement)&&['AwaitingReceipt','Received'].includes(settlement.status)&&(!settlement.receivedAt||now()<=+new Date(settlement.receivedAt)+policy(assignment).disputeWindowHours*HOUR)&&!(settlement.status==='Received'&&settlement.type==='Deposit'&&now()>=starts(shift));
      const body=`<p class="meta">${esc(shift.title||shift.role)} · ${esc(isPayer(settlement)?settlement.payee:settlement.payer)}</p><p class="shifts-payment-amount">${esc(money(settlement.amount))}</p><p class="shifts-status">${esc(t('settlementTypes.'+settlement.type))} · ${esc(t('settlementStatus.'+settlement.status))}</p><p class="meta">${esc(t('settlement.dueBy',{when:when(settlement.proofDueAt)}))}</p>${settlement.autoConfirmAt&&settlement.status==='AwaitingReceipt'?`<p class="meta">${esc(t('settlement.autoConfirm',{when:when(settlement.autoConfirmAt)}))}</p>`:''}${breakdown.length>1?`<dl class="shifts-breakdown">${breakdown.map(([key,amount])=>`<div><dt>${esc(t('breakdown.'+key))}</dt><dd>${esc(money(key==='alreadyPaid'?-amount:amount))}</dd></div>`).join('')}</dl>`:''}${canProof?`<div class="shifts-zelle"><h3>${esc(t('zelle.title'))}</h3>${/^(https?:|data:image\/)/i.test(account.imageUrl||'')?`<img class="shifts-zelle-qr" src="${esc(account.imageUrl)}" alt="${esc(t('zelle.qrAlt'))}" width="160" height="160">`:`<p class="meta">${esc(t('zelle.noQr'))}</p>`}<p class="meta">${esc(t('zelle.sendTo'))}</p><strong>${esc(account.accountName||settlement.payee)}</strong><p class="shifts-account">${esc(account.accountInfo||'')}</p>${button('copyZelle',id,t('zelle.copy'),'','soft')}</div><form id="shiftsProofForm" class="shifts-form" data-settlement-id="${esc(id)}"><label>${esc(t('zelle.uploadBill'))}<input type="file" name="images" accept="image/jpeg,image/png,image/webp" multiple required></label><div class="shifts-proof-preview" data-shifts-proof-preview></div><button type="submit" class="btn primary">${esc(t('zelle.iSent'))}</button></form>`:''}${proof.length?`<h3>${esc(t('settlement.bill'))}</h3><div class="shifts-proof-preview">${proof.map(url=>`<img src="${esc(url)}" alt="${esc(t('proof.imageAlt'))}">`).join('')}</div>`:''}${settlement.dispute?`<p class="shifts-status">${esc(t('settlement.disputeOpen'))}</p>`:''}`;
      modal(t('settlement.title'),body,(canDispute?button('disputeSettlement',id,t('settlement.notReceived'),'','soft'):'')+(isPayee(settlement)&&settlement.status==='AwaitingReceipt'?button('receive',id,t('settlement.received'),'','primary'):''));return true;
    }
    function workersDialog(id,radius=25,page=1) {
      const shift=shiftById(id),state=read();if(role()!=='owner'||!owned(shift))return unavailable();
      const allWorkers=availableWorkers(state,shift,radius),pages=Math.max(1,Math.ceil(allWorkers.length/PAGE_SIZE));page=Math.max(1,Math.min(pages,page));dialog={type:'workers',id,radius,page};
      const workers=allWorkers.slice((page-1)*PAGE_SIZE,page*PAGE_SIZE),invitations=state.invitations.filter(row=>row.shiftId===id);
      const stats=worker=>{const rows=state.assignments.filter(row=>row.worker===worker);return t('owner.workerStats',{completed:rows.filter(row=>row.status==='Completed').length,noShows:rows.filter(row=>row.status==='NoShow').length,late:rows.filter(row=>row.status==='WorkerCancelled'&&row.isLateCancellation).length});};
      const band=distance=>distance<1?'UnderOneMile':distance<3?'OneToThreeMiles':distance<5?'ThreeToFiveMiles':distance<10?'FiveToTenMiles':'TenToTwentyFiveMiles';
      const workerCards=workers.map(worker=>{
        const invited=invitations.some(row=>row.worker===worker.owner&&row.status==='Pending');
        const applied=assignmentsFor(state,shift).some(row=>row.worker===worker.owner&&OPEN.includes(row.status));
        const photo=/^(https?:|data:image\/)/i.test(worker.photoUrl)?`<img src="${esc(worker.photoUrl)}" alt="" width="36" height="36">`:'';
        const distance=Number.isFinite(worker.distance)?' · '+esc(t('availableWorkers.distance.'+band(worker.distance))):'';
        const booked=applied?`<p class="shifts-status">${esc(t('availableWorkers.alreadyApplied'))}</p>`:'';
        const invite=button('invite',id,t(invited?'availableWorkers.invited':'availableWorkers.invite'),`data-shifts-worker="${esc(worker.owner)}" ${invited||applied||overdue(state).length?'disabled':''}`,'soft');
        return `<article class="shifts-inner-card"><div class="shifts-worker-heading">${photo}<strong>${esc(worker.owner)}</strong></div><p class="meta">${esc(worker.skills)}${distance}</p><p class="meta">${esc(stats(worker.owner))}</p>${booked}${invite}</article>`;
      }).join('');
      const paging=pages>1?`<nav class="shifts-pagination">${button('workersPage',page-1,t('availableWorkers.previous'),page<=1?'disabled':'','soft')}<span>${esc(t('availableWorkers.page',{page,total:pages}))}</span>${button('workersPage',page+1,t('availableWorkers.next'),page>=pages?'disabled':'','soft')}</nav>`:'';
      const invitationCards=invitations.map(row=>`<div class="shifts-inner-card"><strong>${esc(row.worker)}</strong><p class="meta">${esc(t('invitations.status.'+row.status))}</p>${row.status==='Pending'?button('withdrawInvitation',row.id,t('invitations.withdraw'),'','soft'):''}</div>`).join('');
      const invitationList=invitations.length?`<h3>${esc(t('invitations.ownerTitle'))}</h3>${invitationCards}`:'';
      const radiusOptions=[5,10,25].map(value=>`<option value="${value}" ${value===radius?'selected':''}>${esc(t('distance',{miles:value}))}</option>`).join('');
      const blocking=overdue(state).length?`<p class="shifts-error">${esc(t('availableWorkers.blocked'))}</p>`:'';
      modal(t('availableWorkers.title'),`<p class="meta">${esc(t('availableWorkers.subtitle'))}</p><label class="shifts-form">${esc(t('availableWorkers.radius'))}<select data-shifts-radius>${radiusOptions}</select></label>${blocking}${workers.length?workerCards:empty(t('availableWorkers.empty'))}${paging}${invitationList}`);
    }
    function cancelDialog(action,id) {
      const state=read();let text='',p=POLICY;
      if(action==='cancelAssignment') {
        const assignment=state.assignments.find(row=>row.id===id);if(!assignment||assignment.worker!==member()||role()!=='staff')return unavailable();
        const shift=shiftById(assignment.shiftId);p=policy(assignment);const deposit=deposits(state,assignment),paid=['Received','AwaitingReceipt'].includes(deposit?.status),late=assignment.status==='Confirmed'&&starts(shift)-now()<p.freeCancellationHours*HOUR;
        const refund=paid?round(assignment.depositAmount*(late?(100-p.workerLateCancelForfeitPercent)/100:1)):0;
        text=!paid?t('cancel.noDeposit'):late?t('cancel.late',{hours:Math.max(0,round((starts(shift)-now())/HOUR)),forfeit:money(assignment.depositAmount-refund),refund:money(refund)}):t('cancel.free',{refund:money(refund)});
      } else {
        const shift=shiftById(id);if(!owned(shift)||role()!=='owner')return unavailable();
        const rows=assignmentsFor(state,shift).filter(row=>row.status==='Confirmed'),late=starts(shift)-now()<p.freeCancellationHours*HOUR;
        const total=rows.reduce((sum,row)=>sum+round(row.payAmount*policy(row).businessLateCancelPayPercent/100),0);
        text=late&&rows.length?t('owner.cancelLate',{amount:money(total/rows.length),count:rows.length,total:money(total)}):t('owner.cancelFree');
        const refunds=assignmentsFor(state,shift).filter(row=>['Received','AwaitingReceipt'].includes(deposits(state,row)?.status)).length;if(refunds)text+=' '+t('owner.cancelRefunds',{count:refunds});
      }
      dialog={type:'cancel',action,id};modal(t('cancel.title'),`<p>${esc(text)}</p>${policyMarkup(p)}`,button('close','',t('cancel.keep'),'','soft')+button('confirmCancel',id,t('cancel.confirm'),'','primary'));
    }
    function disputeDialog(action,id) {
      const title=action==='disputeSettlement'?t('settlement.notReceivedTitle'):action==='reportIssue'?t('owner.issueTitle'):t('my.disputeTitle');
      dialog={type:'dispute',action,id};modal(title,`<p class="meta">${esc(action==='disputeSettlement'?t('settlement.notReceivedBody'):action==='reportIssue'?t('owner.issueBody'):t('my.disputeBody'))}</p><form id="shiftsDisputeForm" class="shifts-form"><label>${esc(t('dispute.reasonLabel'))}<textarea name="reason" required maxlength="500" placeholder="${esc(t('dispute.reasonPlaceholder'))}"></textarea></label><label>${esc(t('dispute.evidence'))}<input type="file" name="images" accept="image/jpeg,image/png,image/webp" multiple></label><button type="submit" class="btn primary">${esc(t('dispute.submit'))}</button></form>`);
    }
    async function imagesFrom(input) {
      const files=[...(input?.files||[])];if(files.length>3)throw new Error(error('proof_images_invalid'));
      if(files.some(file=>!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>10*1024*1024))throw new Error(t('proof.invalidFile'));
      return Promise.all(files.map(file=>new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=()=>reject(new Error(t('proof.uploadFailed')));reader.readAsDataURL(file);})));
    }
    function proofPreview(form) {
      if(!form)return;
      let preview=form.querySelector('[data-shifts-proof-preview]');
      if(!preview){preview=document.createElement('div');preview.className='shifts-proof-preview';preview.dataset.shiftsProofPreview='true';form.elements.images?.after(preview);}
      const images=form._shiftsImages||[];
      preview.innerHTML=images.map((url,index)=>`<div><img src="${esc(url)}" alt="${esc(t('proof.imageAlt'))}">${button('removeProof',index,t('proof.remove'),`data-shifts-form="${esc(form.id)}"`,'soft')}</div>`).join('');
      if(form.id==='shiftsProofForm')form.elements.images.required=images.length===0;
    }
    async function addProofImages(input) {
      const form=input.closest('form'),currentScope=scope();if(!form||form.dataset.uploading)return;
      const submit=form.querySelector('[type="submit"]');form.dataset.uploading='true';if(submit)submit.disabled=true;
      try {
        const images=await imagesFrom(input);if(!form.isConnected||currentScope!==scope())return;
        const all=[...(form._shiftsImages||[]),...images];form._shiftsImages=all.slice(0,3);input.value='';proofPreview(form);
        if(all.length>3)tell(t('proof.tooManyDropped',{max:3}));
      } catch(caught){const alert=document.querySelector('[data-shifts-dialog-error]');if(alert)alert.textContent=caught.message||t('proof.uploadFailed');input.value='';}
      finally {delete form.dataset.uploading;if(submit&&form.isConnected)submit.disabled=false;}
    }
    function onDialogClosed() {const hadContext=dialog||view.shiftId||view.assignmentId||view.settlementId;dialog=null;view.shiftId=null;view.assignmentId=null;view.settlementId=null;if(hadContext)publishContext();}
    function closeDialog() {onDialogClosed();adapter.closeDialog?.();}
    async function requestLocation(id) {
      const requestedScope=scope();
      if(!navigator.geolocation){geoProblem(id,'unavailable');return;}
      tell(t('checkIn.locating'));
      navigator.geolocation.getCurrentPosition(position=>{
        if(destroyed||requestedScope!==scope())return;
        const location={latitude:position.coords.latitude,longitude:position.coords.longitude};
        if(!id){act('availability','',{...location,locationSource:'Device'});return;}
        const state=read(),assignment=state.assignments.find(row=>row.id===id),shift=assignment&&shiftById(assignment.shiftId),distance=distanceMeters(location,shift);
        if(!Number.isFinite(distance)){geoProblem(id,'unavailable');return;}
        if(distance>policy(assignment).checkInRadiusMeters){geoProblem(id,'outOfRadius',{distance:Math.round(distance),radius:policy(assignment).checkInRadiusMeters});return;}
        if(act('checkIn',id,location)){tell(t('checkIn.success'));openAssignment(id);}
      },problem=>{if(!destroyed&&requestedScope===scope())geoProblem(id,problem.code===1?'denied':'unavailable');},{enableHighAccuracy:true,timeout:15000,maximumAge:0});
    }
    function geoProblem(id,problem,values={}) {
      if(!id){tell(t('checkIn.'+problem,values));return;}
      dialog={type:'checkIn',id};modal(t('checkIn.cta'),`<p role="alert">${esc(t('checkIn.'+problem,values))}</p>`,button('requestPresence',id,t('checkIn.askSalon'),'','primary'));
    }
    function editShift(id) {
      const shift=shiftById(id);if(!owned(shift)||(shift.kind==='dayhire'&&role()!=='owner')||(shift.kind==='daywork'&&role()!=='staff'))return false;
      const state=read();if(shift.kind==='dayhire'&&(closed(shift)||starts(shift)<=now()||assignmentsFor(state,shift).length)){tell(error('invalid_state'));return false;}
      const form=adapter.openTemplate?.(shift.kind,clone({...shift,editingId:shift.id}));if(form)enhance(form,shift);return true;
    }
    function navigate(context={}) {
      if(typeof context==='string')context={shiftTab:context};
      if(context.shiftTab)view.tab=context.shiftTab;
      view.page=1;view.filter='Active';render();
      if(context.settlementId)return openSettlement(context.settlementId);
      if(context.assignmentId)return openAssignment(context.assignmentId);
      if(context.invitationId){const invitation=read().invitations.find(row=>row.id===context.invitationId&&row.worker===member()&&role()==='staff');return invitation?openClaim(invitation.shiftId,invitation.id):unavailable();}
      if(context.shiftId)return openShift(context.shiftId);
      publishContext();return true;
    }
    function enhance(form,prefill={}) {
      if(!form||!['dayhire','daywork'].includes(form.dataset.kind))return false;
      form.dataset.shiftsForm='true';form.dataset.shiftsEditingId=owned(prefill)?prefill.id||'':'';
      if(form.querySelector('[data-shifts-options]'))return true;
      if(form.dataset.kind==='daywork')return true;
      const matches=String(prefill.hours||'').match(/\d{1,2}:\d{2}/g)||[];
      const element=document.createElement('details');element.className='shifts-form-options';element.dataset.shiftsOptions='true';
      element.innerHTML=`<summary>${esc(t('post.acceptMode'))}</summary><div class="shifts-form-grid"><label>${esc(t('post.type'))}<select name="shiftType">${['Party','BusyDay','Urgent'].map(value=>`<option value="${value}" ${prefill.shiftType===value?'selected':''}>${esc(t('types.'+value))}</option>`).join('')}</select></label><label>${esc(t('post.workers'))}<input name="workersNeeded" type="number" min="1" max="200" step="1" value="${countNeeded(prefill)}"></label><label>${esc(t('post.start'))}<input name="startTime" type="time" value="${esc(prefill.startTime||matches[0]||'')}"></label><label>${esc(t('post.end'))}<input name="endTime" type="time" value="${esc(prefill.endTime||matches[1]||'')}"></label><label class="shifts-span">${esc(t('post.acceptMode'))}<select name="acceptMode">${['Approval','Instant'].map(value=>`<option value="${value}" ${mode(prefill)===value?'selected':''}>${esc(t('acceptModes.'+value))}</option>`).join('')}</select></label></div>`;
      (form.querySelector('.dialog-body')||form).append(element);return true;
    }
    function collect(form) {
      if(!form?.dataset.shiftsForm)return {};
      const options=form.querySelector('[data-shifts-options]'),values={};
      if(form.dataset.shiftsEditingId)values.editingId=form.dataset.shiftsEditingId;
      if(options) {
        ['shiftType','acceptMode','startTime','endTime'].forEach(name=>{values[name]=form.elements[name]?.value||'';});
        values.workersNeeded=Number(form.elements.workersNeeded?.value)||1;
        if(values.startTime&&values.endTime)values.hours=values.startTime+'–'+values.endTime;
      }
      return values;
    }
    function beforeSave(values,form) {
      const next={...values,...collect(form)},kind=form?.dataset.kind||values.kind;
      if(!['dayhire','daywork'].includes(kind))return next;
      try {
        requireRole(kind==='dayhire'?'owner':'staff');
        const state=read(),requestedId=next.editingId||next.id,existing=requestedId&&shiftById(requestedId);
        if((next.editingId&&!existing)||(existing&&(!owned(existing)||existing.kind!==kind)))fail('not_allowed');
        if(kind==='dayhire') {
          ensureUnblocked(state);
          if(existing&&(closed(existing)||assignmentsFor(state,existing).length||starts(existing)<=now()))fail('invalid_state');
          const shift={...next,kind};
          if(!Number.isFinite(starts(shift))||!Number.isFinite(ends(shift))||starts(shift)<=now()||starts(shift)>now()+4*24*HOUR||ends(shift)-starts(shift)>16*HOUR)fail('schedule_invalid');
          if(next.workersNeeded&&(!Number.isInteger(next.workersNeeded)||next.workersNeeded<1||next.workersNeeded>200))fail('workers_invalid');
          if(next.pay&&(!Number.isFinite(pay(shift))||pay(shift)<=0||pay(shift)>10000))fail('pay_invalid');
          if(!hasZelle(zelle(state,member(),'owner'))){openSetup();return null;}
        }
        if(existing)next.id=existing.id;
        delete next.editingId;
        return next;
      } catch(caught){tell(caught.message||t('errors.generic'));return null;}
    }
    function afterSave(row) {
      view.tab=role()==='owner'?'my-shifts':'browse';view.page=1;render();publishContext();
      return true;
    }
    function refreshDialog() {
      if(!dialog)return;
      const current={...dialog};
      if(current.type==='settlement')openSettlement(current.id);
      else if(current.type==='assignment')openAssignment(current.id);
      else if(current.type==='shift')openShift(current.id);
      else if(current.type==='workers')workersDialog(current.id,current.radius,current.page);
    }
    function onClick(event) {
      if(event.target.matches('[data-shifts-overlay]')){event.preventDefault();event.stopImmediatePropagation();closeDialog();return;}
      const tab=event.target.closest('[data-shifts-tab]');
      if(tab){event.preventDefault();event.stopImmediatePropagation();view.tab=tab.dataset.shiftsTab;view.filter='Active';view.page=1;render();publishContext();return;}
      const buttonNode=event.target.closest('[data-shifts-action]');if(!buttonNode)return;
      event.preventDefault();event.stopImmediatePropagation();if(buttonNode.disabled)return;
      const action=buttonNode.dataset.shiftsAction,id=buttonNode.dataset.shiftsId;
      if(action==='close'){closeDialog();return;}
      if(action==='details'){openShift(id);return;}
      if(action==='claim'){openClaim(id);return;}
      if(action==='acceptInvitation'){const invitation=read().invitations.find(row=>row.id===id&&row.worker===member());if(invitation)openClaim(invitation.shiftId,id);return;}
      if(action==='confirmClaim') {const agreed=!!document.querySelector('[data-shifts-agree]')?.checked,result=act('claim',id,{agreed,invitationId:dialog?.invitationId});if(result)openSettlement(result.settlementId);return;}
      if(action==='openAssignment'){openAssignment(id);return;}
      if(action==='settlement'){openSettlement(id);return;}
      if(action==='setup'){openSetup();return;}
      if(action==='edit'){editShift(id);return;}
      if(action==='profile'){closeDialog();adapter.onState?.({action:'profile',shiftTab:view.tab});return;}
      if(action==='post'){if(!hasZelle(zelle(read(),member(),'owner')))openSetup();else{const form=adapter.openTemplate?.('dayhire');if(form)enhance(form);}return;}
      if(action==='contact'){const shift=shiftById(id);if(shift)adapter.openChat?.({recipient:shift.owner,sourceId:shift.id,reference:shift.title||shift.role});return;}
      if(action==='workers'){workersDialog(id);return;}
      if(action==='location'){requestLocation();return;}
      if(action==='checkIn'){requestLocation(id);return;}
      if(['filter','paymentRole','assignmentStatus'].includes(action)){view[action]=id;if(action==='filter')view.assignmentStatus='All';view.page=1;render();return;}
      if(action==='page'){view.page=Number(id)||1;render();return;}
      if(action==='workersPage'){workersDialog(dialog?.id,dialog?.radius,Number(id)||1);return;}
      if(action==='day'){const entry=availability(read());act('availability','',{availableDays:entry.availableDays.includes(id)?entry.availableDays.filter(day=>day!==id):[...entry.availableDays,id]});return;}
      if(action==='payOverdue'){const first=overdue(read())[0];if(first)openSettlement(first.id);return;}
      if(action==='cancelAssignment'||action==='cancelShift'){cancelDialog(action,id);return;}
      if(action==='confirmCancel'){const current=dialog;if(current?.type==='cancel'&&act(current.action,current.id)){tell(t(current.action==='cancelShift'?'owner.cancelled':'cancel.done'));closeDialog();}return;}
      if(['disputeOutcome','reportIssue','disputeSettlement'].includes(action)){disputeDialog(action,id);return;}
      if(action==='copyZelle'){const settlement=read().settlements.find(row=>row.id===id);if(visibleSettlement(settlement))navigator.clipboard?.writeText(settlement.payeeZelle?.accountInfo||'').then(()=>tell(t('zelle.copied')),()=>tell(t('zelle.copyFailed')));return;}
      if(action==='removeProof'){const form=document.getElementById(buttonNode.dataset.shiftsForm);if(form&&!form.dataset.uploading){form._shiftsImages=(form._shiftsImages||[]).filter((_,index)=>index!==Number(id));proofPreview(form);}return;}
      if(act(action,id,{worker:buttonNode.dataset.shiftsWorker})) {
        const success={invite:'availableWorkers.inviteSent',declineInvitation:'invitations.declined',withdrawInvitation:'invitations.withdrawn',receive:'settlement.confirmed',requestPresence:'checkIn.requested',complete:'owner.saved',approve:'owner.saved',reject:'owner.saved'}[action];if(success)tell(t(success));
        if(action==='requestPresence')openAssignment(id);else refreshDialog();
      }
    }
    function onChange(event) {
      const target=event.target;
      if(target.matches('[data-shifts-availability]')){event.stopImmediatePropagation();act('availability','',{isAvailable:target.checked});}
      if(target.matches('[data-shifts-distance]')){event.stopImmediatePropagation();act('availability','',{maxDistanceMiles:Number(target.value)});}
      if(target.matches('[data-shifts-payment-filter]')){view.paymentFilter=target.value;view.page=1;render();}
      if(target.matches('[data-shifts-assignment-status]')){view.assignmentStatus=target.value;view.page=1;render();}
      if(target.matches('[data-shifts-agree]')){const confirm=document.querySelector('[data-shifts-action="confirmClaim"]');if(confirm)confirm.disabled=!target.checked;}
      if(target.matches('[data-shifts-radius]'))workersDialog(dialog?.id,Number(target.value));
      if(target.matches('#shiftsProofForm input[name="images"],#shiftsDisputeForm input[name="images"]')){event.stopImmediatePropagation();void addProofImages(target);}
    }
    async function onSubmit(event) {
      const form=event.target;if(!['shiftsZelleForm','shiftsProofForm','shiftsDisputeForm'].includes(form.id))return;
      event.preventDefault();event.stopImmediatePropagation();if(form.dataset.busy||form.dataset.uploading)return;form.dataset.busy='true';
      const submit=form.querySelector('[type="submit"]');submit.disabled=true;const current=dialog&&{...dialog},currentScope=scope();
      try {
        if(form.id==='shiftsZelleForm') {if(act('zelle','',{accountName:form.elements.accountName.value,accountInfo:form.elements.accountInfo.value})){tell(t('owner.saved'));closeDialog();}}
        else {
          const images=form._shiftsImages?form._shiftsImages.slice():await imagesFrom(form.elements.images);if(currentScope!==scope()||!form.isConnected)return;
          const action=form.id==='shiftsProofForm'?'proof':current?.action,id=form.id==='shiftsProofForm'?form.dataset.settlementId:current?.id;
          if(act(action,id,{images,reason:form.elements.reason?.value})) {tell(t(action==='proof'?'zelle.sent':'settlement.reported'));if(action==='proof')openSettlement(id);else closeDialog();}
        }
      } catch(caught){const alert=document.querySelector('[data-shifts-dialog-error]');if(alert)alert.textContent=caught.message||t('errors.generic');}
      finally {delete form.dataset.busy;if(form.isConnected)submit.disabled=false;}
    }
    function onKeydown(event) {
      if(event.key==='Escape'&&document.querySelector('.shifts-dialog')){event.preventDefault();event.stopImmediatePropagation();closeDialog();return;}
      if(event.key==='Tab'&&document.querySelector('.shifts-dialog')) {
        const dialogNode=document.querySelector('.shifts-dialog'),focusable=[...dialogNode.querySelectorAll('button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),a[href]')].filter(node=>!node.hidden),first=focusable[0],last=focusable.at(-1);
        if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}
        else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}
      }
      const tab=event.target.closest('[data-shifts-tab]');if(!tab||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
      event.preventDefault();event.stopImmediatePropagation();const tabs=[...document.querySelectorAll('[data-shifts-tab]')],index=tabs.indexOf(tab),next=event.key==='Home'?0:event.key==='End'?tabs.length-1:(index+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;
      tabs[next].click();document.querySelector('[data-shifts-tab="'+view.tab+'"]')?.focus();
    }
    function onStorage(event) {if(event.key===STORAGE_KEY){render();refreshDialog();}}
    const languageObserver=new MutationObserver(()=>{render();refreshDialog();});languageObserver.observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
    const refreshTimer=window.setInterval(()=>{if(!document.getElementById('dayworkView')?.classList.contains('hide'))render();if(dialog&&document.querySelector('.shifts-dialog')&&!document.querySelector('.shifts-dialog form')&&!['claim','dispute','setup','cancel','checkIn'].includes(dialog.type))refreshDialog();},30000);
    document.addEventListener('click',onClick,true);document.addEventListener('change',onChange,true);document.addEventListener('submit',onSubmit,true);document.addEventListener('keydown',onKeydown,true);window.addEventListener('storage',onStorage);
    const api={render,enhance,enhanceForm:enhance,collect,beforeSave,afterSave,openShift,navigate,act,openSettlement,openAssignment,onDialogClosed,reset(){view={tab:role()==='owner'?'my-shifts':'browse',filter:'Active',paymentRole:'All',paymentFilter:'All',page:1};errorMessage='';closeDialog();seedDemo();render();},destroy(){destroyed=true;languageObserver.disconnect();window.clearInterval(refreshTimer);document.removeEventListener('click',onClick,true);document.removeEventListener('change',onChange,true);document.removeEventListener('submit',onSubmit,true);document.removeEventListener('keydown',onKeydown,true);window.removeEventListener('storage',onStorage);}};
    mounted=api;seedDemo();render();return api;
  }
  window.NEXORA_COMMUNITY_SHIFTS={mount,STORAGE_KEY};
})();
