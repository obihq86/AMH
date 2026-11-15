# Codebase Map (Ansari Medical Hall - Patient Manager)
> **AI Agent Instruction:** Always read this map first to locate exact line ranges, then use `read_file` with `start_line` and `end_line` instead of reading entire files.

_Last Updated: 11/16/2026, 2:03:48 AM_ | _Total Files: 17_

---

### `Ansari Medical Hall - Patient Manager_V8.0.tsx` (16490 lines)
- **Imports:** `L1 - L8`
- **initializeApp()** _(Arrow Fn/Component)_: `L85 - L85`
- **getAuth()** _(Arrow Fn/Component)_: `L86 - L88`
- **signInWithCustomToken()** _(Arrow Fn/Component)_: `L89 - L89`
- **onAuthStateChanged()** _(Arrow Fn/Component)_: `L90 - L90`
- **signInWithPopup()** _(Arrow Fn/Component)_: `L92 - L92`
- **doc()** _(Arrow Fn/Component)_: `L93 - L94`
- **getDoc()** _(Arrow Fn/Component)_: `L95 - L95`
- **onSnapshot()** _(Arrow Fn/Component)_: `L96 - L96`
- **normalizeNumericPin()** _(Arrow Fn/Component)_: `L970 - L984`
- **appStatusLabel()** _(Arrow Fn/Component)_: `L998 - L1003`
- **applicationSerialOf()** _(Arrow Fn/Component)_: `L1005 - L1009`
- **isVacantApplication()** _(Arrow Fn/Component)_: `L1011 - L1028`
- **persistActiveUserId()** _(Arrow Fn/Component)_: `L1030 - L1036`
- **resolveUrlSessionUser()** _(Arrow Fn/Component)_: `L1040 - L1049`
- **formatCompactAge()** _(Arrow Fn/Component)_: `L1083 - L1090`
- **splitDoctorTitle()** _(Arrow Fn/Component)_: `L1092 - L1095`
- **normalizeWhatsappTemplate()** _(Arrow Fn/Component)_: `L1097 - L1101`
- **toLatinDigits()** _(Arrow Fn/Component)_: `L1122 - L1125`
- **EnterIcon()** _(Arrow Fn/Component)_: `L1130 - L1130`
- **AbsentIcon()** _(Arrow Fn/Component)_: `L1135 - L1135`
- **CancelIcon()** _(Arrow Fn/Component)_: `L1140 - L1140`
- **ResetIcon()** _(Arrow Fn/Component)_: `L1145 - L1145`
- **DoneIcon()** _(Arrow Fn/Component)_: `L1150 - L1150`
- **DeleteIcon()** _(Arrow Fn/Component)_: `L1155 - L1155`
- **EditIcon()** _(Arrow Fn/Component)_: `L1160 - L1160`
- **SmsIcon()** _(Arrow Fn/Component)_: `L1164 - L1164`
- **getStatusCardClasses()** _(Arrow Fn/Component)_: `L1185 - L1202`
- **amhClampMenuIntoViewport()** _(Arrow Fn/Component)_: `L1471 - L1505`
- **AmhClampedMenu()** _(Arrow Fn/Component)_: `L1507 - L1513`
- **getAnnotationCaptureCssText()** _(Function/Component)_: `L1532 - L1554`
- **getAnnotationArrowHead()** _(Function/Component)_: `L1556 - L1564`
- **drawAnnotationShapeOnCanvas()** _(Function/Component)_: `L1566 - L1619`
- **AnnotationShapeSvg()** _(Function/Component)_: `L1621 - L1671`
- **calculateAgeFromDob()** _(Function/Component)_: `L1673 - L1696`
- **formatAgeResult()** _(Function/Component)_: `L1698 - L1713`
- **getRealtimeAdjustedAge()** _(Function/Component)_: `L1715 - L1778`
- **parseBengaliDigits()** _(Function/Component)_: `L1780 - L1784`
- **normalizeBangladeshPhone()** _(Function/Component)_: `L1786 - L1799`
- **safeCopyToClipboard()** _(Function/Component)_: `L1801 - L1824`
- **normalizeRoomKey()** _(Function/Component)_: `L1843 - L1852`
- **encodeMqttLength()** _(Function/Component)_: `L1854 - L1863`
- **encodeMqttString()** _(Function/Component)_: `L1865 - L1868`
- **createNativeMqttConnection()** _(Function/Component)_: `L1870 - L2047`
- **publishWithChunking()** _(Function/Component)_: `L2051 - L2084`
- **createChunkAssembler()** _(Function/Component)_: `L2086 - L2143`
- **generateCardCanvas()** _(Function/Component)_: `L2146 - L2293`
- **App()** _(Function/Component)_: `L2295 - L2314`
- **onThemeKey()** _(Arrow Fn/Component)_: `L2332 - L2341`
- **openTvVariant()** _(Arrow Fn/Component)_: `L2491 - L2491`
- **defaultTvBoardConfig()** _(Arrow Fn/Component)_: `L2503 - L2513`
- **clampCount()** _(Arrow Fn/Component)_: `L2514 - L2514`
- **clampPct()** _(Arrow Fn/Component)_: `L2516 - L2516`
- **updateTvBoard()** _(Arrow Fn/Component)_: `L2550 - L2550`
- **updateTvBoardNested()** _(Arrow Fn/Component)_: `L2551 - L2551`
- **setTvElStyle()** _(Arrow Fn/Component)_: `L2552 - L2560`
- **persistTvEditedAt()** _(Arrow Fn/Component)_: `L2569 - L2569`
- **collectTvConfig()** _(Arrow Fn/Component)_: `L2574 - L2590`
- **tvChainSet()** _(Arrow Fn/Component)_: `L2638 - L2638`
- **tvDesignSet()** _(Arrow Fn/Component)_: `L2641 - L2641`
- **setTvCardUiFor()** _(Arrow Fn/Component)_: `L2648 - L2648`
- **tvCardUiGet()** _(Arrow Fn/Component)_: `L2649 - L2649`
- **tvPreviewBoard()** _(Arrow Fn/Component)_: `L2652 - L2661`
- **resetAllTvConfig()** _(Arrow Fn/Component)_: `L2674 - L2687`
- **resetTvGlobals()** _(Arrow Fn/Component)_: `L2689 - L2702`
- **getTvElementCss()** _(Arrow Fn/Component)_: `L2729 - L2746`
- **tvDesignParts()** _(Arrow Fn/Component)_: `L2768 - L2788`
- **tvDesignCombine()** _(Arrow Fn/Component)_: `L2790 - L2809`
- **tvDesignDecl()** _(Arrow Fn/Component)_: `L2810 - L2826`
- **setTvPanelDesign()** _(Arrow Fn/Component)_: `L2827 - L2835`
- **toggleTvDesignPreset()** _(Arrow Fn/Component)_: `L2837 - L2849`
- **saveTvTextPreset()** _(Arrow Fn/Component)_: `L2857 - L2866`
- **applyTvTextPreset()** _(Arrow Fn/Component)_: `L2867 - L2878`
- **saveTvDesignPreset()** _(Arrow Fn/Component)_: `L2879 - L2889`
- **applyTvDesignPreset()** _(Arrow Fn/Component)_: `L2890 - L2901`
- **tvPicFromFile()** _(Arrow Fn/Component)_: `L2903 - L2924`
- **getTvBoardStyle()** _(Arrow Fn/Component)_: `L2926 - L2940`
- **tvChip()** _(Arrow Fn/Component)_: `L2945 - L2954`
- **tvSeg()** _(Arrow Fn/Component)_: `L2957 - L2957`
- **tvFieldLabel()** _(Arrow Fn/Component)_: `L2958 - L2961`
- **tvStepNum()** _(Arrow Fn/Component)_: `L2965 - L2965`
- **tvPanelHidden()** _(Arrow Fn/Component)_: `L2967 - L2973`
- **tvPanelPct()** _(Arrow Fn/Component)_: `L2974 - L2975`
- **tvGroupFlex()** _(Arrow Fn/Component)_: `L2976 - L2976`
- **tvQueueEmpty()** _(Arrow Fn/Component)_: `L2978 - L2982`
- **renderTvWelcome()** _(Arrow Fn/Component)_: `L2988 - L2990`
- **playTvCallBeep()** _(Arrow Fn/Component)_: `L3004 - L3010`
- **tvSpeakMsg()** _(Arrow Fn/Component)_: `L3013 - L3035`
- **speakTvCall()** _(Arrow Fn/Component)_: `L3037 - L3041`
- **speakTvSample()** _(Arrow Fn/Component)_: `L3043 - L3056`
- **tvSampleBtn()** _(Arrow Fn/Component)_: `L3058 - L3059`
- **clearRotation()** _(Arrow Fn/Component)_: `L3182 - L3185`
- **keep()** _(Arrow Fn/Component)_: `L3229 - L3242`
- **runWithListAnchor()** _(Arrow Fn/Component)_: `L3248 - L3271`
- **updateHeight()** _(Arrow Fn/Component)_: `L3283 - L3288`
- **handleTouchStart()** _(Arrow Fn/Component)_: `L3943 - L3949`
- **handleTouchEnd()** _(Arrow Fn/Component)_: `L3951 - L3975`
- **handleMouseDown()** _(Arrow Fn/Component)_: `L3977 - L3983`
- **handleMouseUp()** _(Arrow Fn/Component)_: `L3985 - L4005`
- **defaultRegistrationPanelOpen()** _(Arrow Fn/Component)_: `L4085 - L4103`
- **handleKeyDown()** _(Arrow Fn/Component)_: `L4170 - L4263`
- **handleKeyUp()** _(Arrow Fn/Component)_: `L4265 - L4269`
- **syncClock()** _(Arrow Fn/Component)_: `L5527 - L5527`
- **keepIfFuture()** _(Arrow Fn/Component)_: `L5544 - L5553`
- **applyTvConfigParsed()** _(Arrow Fn/Component)_: `L5611 - L5637`
- **publishTvSetToPeers()** _(Arrow Fn/Component)_: `L5641 - L5649`
- **runSyncTransport()** _(Arrow Fn/Component)_: `L6166 - L6205`
- **onHide()** _(Arrow Fn/Component)_: `L6225 - L6225`
- **handleStorageChange()** _(Arrow Fn/Component)_: `L6274 - L6280`
- **hasLocalDataToShare()** _(Arrow Fn/Component)_: `L6308 - L6316`
- **updateConnectedCount()** _(Arrow Fn/Component)_: `L6324 - L6329`
- **pollClinicState()** _(Arrow Fn/Component)_: `L6469 - L6489`
- **updateDatePatientsList()** _(Arrow Fn/Component)_: `L6542 - L6550`
- **undoLastQueueAction()** _(Arrow Fn/Component)_: `L6553 - L6570`
- **updateTeamList()** _(Arrow Fn/Component)_: `L6572 - L6575`
- **handleDeviceLogin()** _(Arrow Fn/Component)_: `L6603 - L6637`
- **handleLogout()** _(Arrow Fn/Component)_: `L6640 - L6653`
- **recheck()** _(Arrow Fn/Component)_: `L6658 - L6667`
- **onVis()** _(Arrow Fn/Component)_: `L6669 - L6669`
- **onPrompt()** _(Arrow Fn/Component)_: `L6676 - L6676`
- **onInstalled()** _(Arrow Fn/Component)_: `L6677 - L6677`
- **onMessage()** _(Arrow Fn/Component)_: `L6690 - L6692`
- **handleInstallPwa()** _(Arrow Fn/Component)_: `L6697 - L6705`
- **handleGuestLogin()** _(Arrow Fn/Component)_: `L6707 - L6720`
- **handleTvModeLogin()** _(Arrow Fn/Component)_: `L6723 - L6731`
- **executeAdminAction()** _(Arrow Fn/Component)_: `L6733 - L6764`
- **triggerAdminAction()** _(Arrow Fn/Component)_: `L6766 - L6780`
- **handleConfirmAdminAuth()** _(Arrow Fn/Component)_: `L6782 - L6799`
- **handleRestoreDeletedData()** _(Arrow Fn/Component)_: `L6801 - L6813`
- **nextSequential()** _(Arrow Fn/Component)_: `L6933 - L6938`
- **parityLabel()** _(Arrow Fn/Component)_: `L6971 - L6975`
- **shortParity()** _(Arrow Fn/Component)_: `L6986 - L6990`
- **Section: গেস্ট সিরিয়াল আবেদন: আবেদনের মুহূর্তে টোকেন বুকিং** _(Section)_: `L6996 - L6996`
- **rank()** _(Arrow Fn/Component)_: `L7028 - L7037`
- **showGuestFormError()** _(Arrow Fn/Component)_: `L7045 - L7048`
- **broadcastApplications()** _(Arrow Fn/Component)_: `L7050 - L7056`
- **submitGuestApplication()** _(Arrow Fn/Component)_: `L7059 - L7120`
- **approveGuestApplication()** _(Arrow Fn/Component)_: `L7122 - L7219`
- **rejectGuestApplication()** _(Arrow Fn/Component)_: `L7221 - L7240`
- **dismissGuestApplication()** _(Arrow Fn/Component)_: `L7242 - L7251`
- **handleRegisterPatient()** _(Arrow Fn/Component)_: `L7252 - L7362`
- **notifyNewCallSound()** _(Arrow Fn/Component)_: `L7366 - L7372`
- **handleCallNextPatient()** _(Arrow Fn/Component)_: `L7374 - L7394`
- **handleCompleteAndCallNext()** _(Arrow Fn/Component)_: `L7396 - L7426`
- **handleUpdateStatus()** _(Arrow Fn/Component)_: `L7428 - L7443`
- **toggleInChamber()** _(Arrow Fn/Component)_: `L7447 - L7466`
- **Section: কিউ মাল্টি-মার্কিং** _(Section)_: `L7468 - L7468`
- **handleUpdateStatusBulk()** _(Arrow Fn/Component)_: `L7481 - L7510`
- **runQueueStatusAction()** _(Arrow Fn/Component)_: `L7513 - L7522`
- **handleDeleteClick()** _(Arrow Fn/Component)_: `L7525 - L7529`
- **renderQueueListPanel()** _(Arrow Fn/Component)_: `L7615 - L7641`
- **renderQueueViewList()** _(Arrow Fn/Component)_: `L7644 - L7809`
- **tvCalledSize()** _(Arrow Fn/Component)_: `L7879 - L7890`
- **onResize()** _(Arrow Fn/Component)_: `L7972 - L7972`
- **handleCopyShareLink()** _(Arrow Fn/Component)_: `L8011 - L8020`
- **handleDobChange()** _(Arrow Fn/Component)_: `L8022 - L8033`
- **handleCreatePatientIdRecord()** _(Arrow Fn/Component)_: `L8035 - L8084`
- **handleAddSerialWithDate()** _(Arrow Fn/Component)_: `L8095 - L8129`
- **handleBookSerialForRecord()** _(Arrow Fn/Component)_: `L8131 - L8136`
- **handleUnlockAdminPanel()** _(Arrow Fn/Component)_: `L8138 - L8150`
- **handleOpenEditQueuePatient()** _(Arrow Fn/Component)_: `L8152 - L8166`
- **handleConfirmDeleteQueuePatient()** _(Arrow Fn/Component)_: `L8168 - L8201`
- **handleRestoreDeletedRecord()** _(Arrow Fn/Component)_: `L8204 - L8241`
- **handleConfirmDeletePatientIdRecord()** _(Arrow Fn/Component)_: `L8242 - L8281`
- **isTypingTarget()** _(Arrow Fn/Component)_: `L8322 - L8326`
- **handleQueueKeyboard()** _(Arrow Fn/Component)_: `L8328 - L8379`
- **handleSaveEditedQueuePatient()** _(Arrow Fn/Component)_: `L8407 - L8509`
- **handleQuickAddSerialFromId()** _(Arrow Fn/Component)_: `L8511 - L8514`
- **handleOpenEditPatientId()** _(Arrow Fn/Component)_: `L8521 - L8533`
- **handleEditPidDobChange()** _(Arrow Fn/Component)_: `L8535 - L8546`
- **handleSaveEditedPatientId()** _(Arrow Fn/Component)_: `L8548 - L8632`
- **handleTriggerReportsImport()** _(Arrow Fn/Component)_: `L8634 - L8639`
- **handleExportDayQueueCsv()** _(Arrow Fn/Component)_: `L8641 - L8683`
- **handleExportAllQueueCsv()** _(Arrow Fn/Component)_: `L8685 - L8733`
- **handleExportFullClinicJson()** _(Arrow Fn/Component)_: `L8735 - L8766`
- **Section: =** _(Section)_: `L8768 - L8768`
- **Section: =** _(Section)_: `L8770 - L8770`
- **loadCloudDriveConfig()** _(Arrow Fn/Component)_: `L8935 - L8959`
- **extractDriveFolderId()** _(Arrow Fn/Component)_: `L9081 - L9088`
- **uploadToGoogleDriveRestApi()** _(Arrow Fn/Component)_: `L9198 - L9246`
- **handleRestoreFromGDriveLog()** _(Arrow Fn/Component)_: `L9449 - L9474`
- **amhImportNormText()** _(Arrow Fn/Component)_: `L9478 - L9485`
- **amhImportEntryExists()** _(Arrow Fn/Component)_: `L9486 - L9495`
- **amhImportDirExists()** _(Arrow Fn/Component)_: `L9496 - L9515`
- **handleProcessReportsImportFile()** _(Arrow Fn/Component)_: `L9517 - L9536`
- **handleTriggerPatientIdImport()** _(Arrow Fn/Component)_: `L9663 - L9668`
- **handleExportPatientIdsCsv()** _(Arrow Fn/Component)_: `L9670 - L9708`
- **handleExportPatientIdsJson()** _(Arrow Fn/Component)_: `L9710 - L9734`
- **handleProcessImportedFile()** _(Arrow Fn/Component)_: `L9736 - L16490`

### `api/auth.js` (52 lines)
- **Imports:** `L1 - L1`
- **handler()** _(Function/Component)_: `L14 - L51`

### `api/clinic-state.js` (62 lines)
- **Imports:** `L1 - L1`
- **validRoomId()** _(Function/Component)_: `L8 - L10`
- **handler()** _(Function/Component)_: `L12 - L61`

### `index.html` (42 lines)
- _Config/Constants/Entry file:_ `L1 - L42`

### `preview-live-proxy.mjs` (162 lines)
- **Imports:** `L1 - L10`
- **safeEqual()** _(Function/Component)_: `L28 - L32`
- **clientKey()** _(Function/Component)_: `L33 - L35`
- **isRateLimited()** _(Function/Component)_: `L36 - L44`
- **recordFailure()** _(Function/Component)_: `L45 - L52`
- **hasBasicAuth()** _(Function/Component)_: `L53 - L57`
- **hasAuthCookie()** _(Function/Component)_: `L58 - L69`
- **deny()** _(Function/Component)_: `L70 - L78`

### `preview-tunnel-server.mjs` (167 lines)
- **Imports:** `L1 - L10`
- **safeEqual()** _(Function/Component)_: `L42 - L46`
- **clientKey()** _(Function/Component)_: `L52 - L54`
- **isRateLimited()** _(Function/Component)_: `L55 - L63`
- **recordFailure()** _(Function/Component)_: `L64 - L71`
- **isAuthorized()** _(Function/Component)_: `L73 - L78`
- **deny()** _(Function/Component)_: `L80 - L88`

### `server/clinic-server.js` (137 lines)
- **Imports:** `L1 - L1`
- **requiredEnv()** _(Function/Component)_: `L6 - L10`
- **getServerConfig()** _(Function/Component)_: `L12 - L17`
- **getAuthConfig()** _(Function/Component)_: `L19 - L25`
- **signature()** _(Function/Component)_: `L27 - L29`
- **safeEqual()** _(Function/Component)_: `L31 - L35`
- **verifyPin()** _(Function/Component)_: `L37 - L44`
- **parseCookies()** _(Function/Component)_: `L46 - L52`
- **createSession()** _(Function/Component)_: `L54 - L59`
- **hasValidSession()** _(Function/Component)_: `L61 - L72`
- **sessionCookie()** _(Function/Component)_: `L74 - L76`
- **ipHash()** _(Function/Component)_: `L78 - L88`
- **callSupabase()** _(Function/Component)_: `L90 - L106`
- **checkLoginLimit()** _(Function/Component)_: `L108 - L116`
- **recordLoginAttempt()** _(Function/Component)_: `L118 - L123`
- **sendJson()** _(Function/Component)_: `L125 - L130`
- **getRequestBody()** _(Function/Component)_: `L132 - L136`

### `src/components/SpotlightCard.tsx` (168 lines)
- **Imports:** `L1 - L1`
- **isMobileOrTouchViewport()** _(Function/Component)_: `L9 - L16`
- **ensureInitialMobilePointer()** _(Function/Component)_: `L18 - L26`
- **scheduleGlobalSpotlightTick()** _(Function/Component)_: `L28 - L55`
- **attachGlobalSpotlightListeners()** _(Function/Component)_: `L57 - L112`
- **QueueSpotlightCard()** _(Function/Component)_: `L114 - L135`
- **SpotlightCard()** _(Function/Component)_: `L137 - L167`

### `src/hooks/usePatientVoiceCall.js` (63 lines)
- **Imports:** `L1 - L1`
- **usePatientVoiceCall()** _(Arrow Fn/Component)_: `L3 - L62`

### `src/lib/clinicApi.ts` (43 lines)
- **ClinicSnapshot** _(Type/Interface)_: `L1 - L4`
- **requestJson()** _(Function/Component)_: `L6 - L21`
- **readClinicSnapshot()** _(Function/Component)_: `L23 - L30`
- **readClinicState()** _(Function/Component)_: `L32 - L35`
- **writeClinicState()** _(Function/Component)_: `L37 - L42`

### `src/lib/format.ts` (58 lines)
- **formatDateToDDMMYYYY()** _(Function/Component)_: `L2 - L23`
- **toBengaliDigits()** _(Function/Component)_: `L25 - L29`
- **formatBengaliFullDate()** _(Function/Component)_: `L32 - L49`
- **formatBengaliHeaderDate()** _(Function/Component)_: `L52 - L57`

### `src/lib/theme.ts` (42 lines)
- _Config/Constants/Entry file:_ `L1 - L42`

### `src/main.tsx` (11 lines)
- **Imports:** `L1 - L4`
- _Config/Constants/Entry file:_ `L1 - L11`

### `src/SupabaseGate.tsx` (214 lines)
- **Imports:** `L1 - L4`
- **getRoomId()** _(Function/Component)_: `L8 - L14`
- **getLocalPayload()** _(Function/Component)_: `L16 - L52`
- **Panel()** _(Function/Component)_: `L54 - L63`
- **SupabaseGate()** _(Function/Component)_: `L65 - L213`

### `supabase/functions/speak-name/index.ts` (71 lines)
- **Imports:** `L1 - L6`
- _Config/Constants/Entry file:_ `L1 - L71`

### `tmp-shot.mjs` (1 lines)
- _Config/Constants/Entry file:_ `L1 - L1`

### `vite.config.tv.ts` (36 lines)
- **Imports:** `L1 - L4`
- _Config/Constants/Entry file:_ `L1 - L36`

