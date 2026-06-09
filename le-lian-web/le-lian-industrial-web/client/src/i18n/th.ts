const th = {
  nav: {
    dashboard: 'แดชบอร์ด', courses: 'คลังคอร์ส', myCourses: 'คอร์สของฉัน',
    review: 'แผงตรวจสอบ', admin: 'ระบบจัดการ', annualPlan: 'แผนประจำปี',
    competency: 'การวิเคราะห์สมรรถนะ', freeCourses: 'คอร์สฟรี', achievements: 'ความสำเร็จ', logout: 'ออกจากระบบ',
    career: 'การวางแผนอาชีพ', aiAssistant: 'ผู้ช่วย AI', notifications: 'การแจ้งเตือน',
    reports: 'รายงาน', feeAgreement: 'ข้อตกลงค่าธรรมเนียม', dispatch: 'มอบหมายคอร์ส',
    currentUser: 'เข้าสู่ระบบในฐานะ',
  },
  lang: { zh: '繁體中文', en: 'English', th: 'ภาษาไทย', id: 'Bahasa Indonesia', vi: 'Tiếng Việt' },
  common: {
    submit: 'ส่ง', cancel: 'ยกเลิก', approve: 'อนุมัติ', reject: 'ปฏิเสธ',
    save: 'บันทึก', export: 'ส่งออก', search: 'ค้นหา', filter: 'กรอง',
    loading: 'กำลังโหลด...', success: 'สำเร็จ', error: 'เกิดข้อผิดพลาด',
    all: 'ทั้งหมด', confirm: 'ยืนยัน', close: 'ปิด', add: 'เพิ่ม', edit: 'แก้ไข', delete: 'ลบ'
  },
  training: {
    title: 'Le Lian Industrial | ระบบฝึกอบรม',
    enroll: 'ลงทะเบียน', watchVideo: 'ดูวิดีโอ', submitReport: 'ส่งรายงาน',
    takeQuiz: 'ทำแบบทดสอบ', certificate: 'ใบรับรอง', pending: 'รอการตรวจสอบ',
    approved: 'อนุมัติแล้ว', rejected: 'ถูกปฏิเสธ', completed: 'เสร็จสิ้น',
    inProgress: 'กำลังดำเนินการ', mandatory: 'บังคับ', optional: 'ไม่บังคับ',
    hours: 'ชั่วโมง', score: 'คะแนน', progress: 'ความคืบหน้า', deadline: 'กำหนดเวลา'
  },
  competency: {
    title: 'การวิเคราะห์ช่องว่างสมรรถนะ', radar: 'แผนภูมิเรดาร์สมรรถนะ', gap: 'การวิเคราะห์ช่องว่าง',
    selfEval: 'การประเมินตนเอง', managerEval: 'การประเมินของผู้จัดการ', standard: 'มาตรฐาน',
    recommend: 'คอร์สที่แนะนำ', rotation: 'การวิเคราะห์การหมุนเวียนงาน',
    technical: 'ทักษะทางเทคนิค', communication: 'การสื่อสาร', leadership: 'ภาวะผู้นำ',
    problemSolving: 'การแก้ปัญหา', teamwork: 'การทำงานเป็นทีม', safety: 'ความตระหนักด้านความปลอดภัย',
    submitSelf: 'ส่งการประเมินตนเอง', career: 'การวางแผนอาชีพ', icap: 'กรอบ iCAP'
  },
  ttqs: {
    annualPlan: 'แผนการฝึกอบรมประจำปี', courseMap: 'แผนที่คอร์ส', signIn: 'แผ่นลงชื่อ',
    satisfaction: 'แบบสำรวจความพึงพอใจ', report: 'รายงานการฝึกอบรม', certificate: 'ใบรับรอง',
    audit: 'บันทึกการตรวจสอบ', exportPlan: 'ส่งออกแผนประจำปี', exportTTQS: 'ส่งออกแบบฟอร์ม TTQS',
    exportRecord: 'ส่งออกบันทึกคอร์ส', exportSignIn: 'ส่งออกแผ่นลงชื่อ',
    planStatus: 'สถานะแผน', draft: 'ร่าง', submitted: 'ส่งแล้ว', approved: 'อนุมัติแล้ว'
  },
  freeCourses: {
    title: 'คอร์สการผลิตฟรี', autoFetch: 'ดึงคอร์สล่าสุดอัตโนมัติ',
    addToLibrary: 'เพิ่มในคลัง', generateQuiz: 'สร้างแบบทดสอบอัตโนมัติ',
    lastUpdated: 'อัปเดตล่าสุด', source: 'แหล่งที่มา', category: 'หมวดหมู่'
  },
  chat: {
    title: 'ผู้ช่วย AI', placeholder: 'พิมพ์คำถาม...', send: 'ส่ง',
    quickQ: ['ค้นหาคอร์ส', 'ใบรับรอง', 'แผนประจำปี', 'สมรรถนะ', 'กฎ TTQS']
  }
};
export default th;
