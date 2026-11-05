import { useEffect, useMemo, useState } from 'react';
import { api } from '@appdeploy/client';
import * as XLSX from 'xlsx';
import { planCategories, planSeed } from './planData';
import {
  CalendarDays,
  CheckCircle2,
  FileSpreadsheet,
  FileText,
  Home,
  Landmark,
  Pencil,
  Save,
  Search,
  TrendingDown,
  WalletCards,
  X,
  Clock3,
  Upload,
  Download,
} from 'lucide-react';

type BudgetRow = {
  id: number;
  item: string;
  code: string;
  qty: number;
  unitPrice: number;
  budget: number;
  approved: number;
  unit: string;
  inventoryNo: string;
  receivedDate: string;
  requestAmount: number;
  method: string;
  buyer: string;
  contractNo: string;
  contractDate: string;
  vendor: string;
  contractAmount: number;
  dueDate: string;
  deliveredDate: string;
  acceptedDate: string;
  paidDate: string;
  status: string;
  note: string;
};

type PlanRow = {
  id: number;
  item: string;
  category: string;
  unit: string;
  qty: number;
  budget: number;
  inventoryNo: string;
  receivedDate: string;
  status: string;
};

type UcRow = {
  id: number;
  item: string;
  unit: string;
  budget: number;
  inventoryNo: string;
  receivedDate: string;
  buyer: string;
  orderNo: string;
  orderDate: string;
  vendor: string;
  purchaseAmount: number;
  acceptedDate: string;
  paidDate: string;
  stage: number | null;
  cancelled: boolean;
  note: string;
};

const makeBudgetRow = (id: number, item: string, code: string, unitPrice: number, qty: number, budget: number, approved: number, unit: string, inventoryNo = '', receivedDate = ''): BudgetRow => ({
  id,
  item,
  code,
  qty,
  unitPrice,
  budget,
  approved,
  unit,
  inventoryNo,
  receivedDate,
  requestAmount: 0,
  method: '',
  buyer: '',
  contractNo: '',
  contractDate: '',
  vendor: '',
  contractAmount: 0,
  dueDate: '',
  deliveredDate: '',
  acceptedDate: '',
  paidDate: '',
  status: inventoryNo ? 'รับ Inventory แล้ว' : 'ยังไม่เริ่ม',
  note: '',
});

const budgetSeed: BudgetRow[] = [
  makeBudgetRow(1, 'กล้องส่องตรวจท่อทางเดินน้ำดีและตับอ่อนชนิดวีดิทัศน์แบบคมชัดสูง', 'ES-25', 1400000, 2, 2800000, 2772000, 'ส่องกล้อง ผ่าตัด', '69-04758', '31/08/69'),
  makeBudgetRow(2, 'กล้องจุลทรรศน์สำหรับงานทันตกรรม พร้อมชุดถ่ายทอดภาพ', 'MC-12', 2000000, 1, 2000000, 1940000, 'ทันตกรรม', '69-04688', '19/08/69'),
  makeBudgetRow(3, 'เครื่องช่วยนวดหัวใจและฟื้นคืนชีพผู้ป่วยอัตโนมัติ', 'ME-3', 1000000, 1, 1000000, 950000, 'อายุรกรรมชาย 1', '69-04695', '17/08/69'),
  makeBudgetRow(4, 'เครื่องตรวจอวัยวะภายในด้วยคลื่นเสียงความคมชัดสูงชนิดสีระดับสูง 5 หัวตรวจ', 'US-3', 4200000, 1, 4200000, 4158000, 'รังสีวิทยา', '69-05298', '17/09/69'),
  makeBudgetRow(5, 'เครื่องจี้ห้ามเลือด เลาะเนื้อเยื่อ และเชื่อมปิดหลอดเลือดด้วยระบบไฟฟ้า', 'CE-15', 1600000, 1, 1600000, 1584000, 'ห้องผ่าตัด', '69-04759', '24/08/69'),
  makeBudgetRow(6, 'เครื่องล้างเครื่องมืออัตโนมัติขนาดไม่น้อยกว่า 650 ลิตร', 'CSSD-10', 2300000, 1, 2300000, 2277000, 'ศูนย์จ่ายกลาง', '69-04646', '17/08/69'),
  makeBudgetRow(7, 'ยูนิตทำฟันสำหรับผู้สูงอายุและผู้ป่วยที่มีความต้องการพิเศษ', 'DE-41', 1400000, 1, 1400000, 1386000, 'ทันตกรรม', '69-04699', '20/08/69'),
  makeBudgetRow(8, 'กล้องส่องตรวจลำไส้ใหญ่ชนิดวีดิทัศน์แบบคมชัดสูง', 'ES-24', 1400000, 1, 1400000, 1386000, 'ส่องกล้อง', '69-04964', '08/09/69'),
  makeBudgetRow(9, 'เครื่องรับสัญญาณภาพเอกซเรย์เป็นดิจิตอลชนิดชุดรับภาพแฟลตพาแนลไร้สาย', 'XR-3', 2500000, 1, 2500000, 2475000, 'รังสีวิทยา', '69-04744', '24/08/69'),
  makeBudgetRow(10, 'เตียงผ่าตัดทั่วไประบบไฟฟ้า พร้อมรีโมทคอนโทรล', 'OB-4', 1760000, 2, 3520000, 3484800, 'ผ่าตัด', '69-05132', '04/09/69'),
  makeBudgetRow(11, 'โคมไฟผ่าตัดใหญ่โคมคู่ ความสว่างไม่น้อยกว่า 130,000 ลักซ์ หลอดแอลอีดี', 'LO-4', 1450000, 2, 2900000, 2871000, 'ห้องผ่าตัด', '69-04760', '24/08/69'),
  makeBudgetRow(12, 'เครื่องดมยาสลบชนิดซับซ้อน', 'AE-3', 2200000, 1, 2200000, 2178000, 'วิสัญญีวิทยา', '69-04628', '13/08/69'),
  makeBudgetRow(13, 'เครื่องเอกซเรย์ฟลูโอโรสโคปเคลื่อนที่แบบซีอาร์มกำลังไม่น้อยกว่า 15 kW ชุดรับภาพชนิดแฟลตพาแนล', 'XR-19', 9200000, 1, 9200000, 9108000, 'ห้องผ่าตัด', '69-04762', '24/08/69'),
  makeBudgetRow(14, 'กล้องส่องตรวจและผ่าตัดภายในช่องท้องและลำไส้ใหญ่ พร้อมระบบวีดิทัศน์ชนิดภาพ 3 มิติ', 'ES-43', 5000000, 1, 5000000, 4950000, 'ห้องผ่าตัด', '69-04763', '24/08/69'),
  makeBudgetRow(15, 'ชุดเครื่องมือผ่าตัดกระดูกสันหลังผ่านกล้อง พร้อมระบบวีดิทัศน์', 'ES-55', 8500000, 1, 8500000, 8415000, 'ห้องผ่าตัด', '69-04764', '24/08/69'),
  makeBudgetRow(16, 'กล้องส่องตรวจกระเพาะอาหารและลำไส้เล็กส่วนต้นชนิดวีดิทัศน์แบบคมชัดสูง พร้อมชุดควบคุมสัญญาณภาพ', 'ES-40', 3700000, 1, 3700000, 3663000, 'ส่องกล้อง', '69-04962', '08/09/69'),
  makeBudgetRow(17, 'ชุดเครื่องมือผ่าตัดกระดูกเชิงกรานและเบ้าสะโพก', 'ORT-18', 2000000, 1, 2000000, 1940000, 'ผ่าตัด', '69-05362', '17/09/69'),
  makeBudgetRow(18, 'ชุดเครื่องมือผ่าตัดกระดูกพื้นฐาน', 'นอกบัญชี', 1000000, 1, 1000000, 950000, 'ผ่าตัด', '69-05364', '17/09/69'),
  makeBudgetRow(19, 'เครื่องช่วยหายใจชนิดควบคุมด้วยปริมาตรและความดัน ขนาดใหญ่', 'RS-5', 1200000, 2, 2400000, 2376000, 'ICUMED', '69-04651', '19/08/69'),
  makeBudgetRow(20, 'เตียงผ่าตัดผู้ป่วยโรคกระดูกสันหลังชนิดหมุนเตียงได้ 360 องศา', 'OB-9', 5000000, 1, 5000000, 4950000, 'ห้องผ่าตัด', '69-04766', '24/08/69'),
  makeBudgetRow(21, 'เครื่องเอกซเรย์หลอดเลือดชนิดสองระนาบ', 'XR-23', 38000000, 1, 38000000, 37620000, 'ผ่าตัด'),
  makeBudgetRow(22, 'เครื่องสลายนิ่วในระบบทางเดินปัสสาวะด้วยเลเซอร์ ขนาดไม่น้อยกว่า 20 วัตต์', 'URO-6', 4000000, 1, 4000000, 3960000, 'ห้องผ่าตัด', '69-04771', '24/08/69'),
  makeBudgetRow(23, 'เครื่องตรวจอวัยวะภายในด้วยคลื่นเสียงความคมชัดสูง 2 หัวตรวจ', 'US-2', 1800000, 1, 1800000, 1782000, 'ผ่าตัด'),
  makeBudgetRow(24, 'เครื่องตรวจการได้ยินด้วยคอมพิวเตอร์', 'ENT-4', 1000000, 1, 1000000, 990000, 'หูตาคอจมูก', '69-04863', '27/08/69'),
  makeBudgetRow(25, 'เครื่องช่วยหายใจสำหรับทารกแรกเกิดชนิดความถี่สูงแบบซับซ้อน', 'RS-9', 2000000, 1, 2000000, 1980000, 'NICU', '69-04626', '14/08/69'),
  makeBudgetRow(26, 'เครื่องเอกซเรย์ฟันทั้งปาก พร้อมกะโหลกศีรษะแบบ 3 มิติ', 'DE-47', 2800000, 1, 2800000, 2772000, 'ทันตกรรม', '69-04700', '20/08/69'),
  { ...makeBudgetRow(27, 'อาคารระบบบำบัดน้ำเสีย ขนาด 1,000 ลูกบาศก์เมตร/วัน เป็นอาคาร คสล.7 ชั้น (โครงสร้างต้านแผ่นดินไหว)', '', 33800000, 1, 33800000, 0, 'โรงพยาบาลอุตรดิตถ์'), status: 'งบประมาณต่อเนื่อง', note: 'ปีงบเดิม / งบประมาณต่อเนื่อง' },
  { ...makeBudgetRow(28, 'อาคารศูนย์สุขภาพชุมชนเมือง เป็นอาคาร คสล.4 ชั้น พื้นที่ใช้สอยประมาณ 2,793 ตารางเมตร (โครงสร้างต้านแผ่นดินไหว)', '', 17075000, 1, 17075000, 0, 'โรงพยาบาลอุตรดิตถ์'), status: 'งบประมาณต่อเนื่อง', note: 'ปีงบเดิม / งบประมาณต่อเนื่อง' },
];

const ucSeed: UcRow[] = [
  { id: 1, item: 'อุปกรณ์ประคองศีรษะและคอ', unit: 'ER', budget: 24000, inventoryNo: '69-02875', receivedDate: '21 เม.ย. 69', buyer: 'นัชชา', orderNo: 'K6900309', orderDate: '27 พ.ค. 69', vendor: '', purchaseAmount: 24000, acceptedDate: '23 มิ.ย. 69', paidDate: '8 ก.ค. 69', stage: 5, cancelled: false, note: '' },
  { id: 2, item: 'โทรทัศน์ แอล อี ดี (LED TV) แบบ Smart TV ระดับความละเอียดจอภาพ 3840 x 2160 พิกเซล ขนาด 50 นิ้ว', unit: 'RICU', budget: 19000, inventoryNo: '', receivedDate: '', buyer: '', orderNo: '', orderDate: '', vendor: '', purchaseAmount: 0, acceptedDate: '', paidDate: '', stage: null, cancelled: true, note: 'ยกเลิกรายการเดิม / รอปรับแผน' },
  { id: 3, item: 'เครื่องพยุงการทำงานของหัวใจและหลอดเลือด', unit: 'ICU Trauma', budget: 6800000, inventoryNo: '69-02891', receivedDate: '17 เม.ย. 69', buyer: 'พัทธรินทร์', orderNo: '521/2569', orderDate: '24 มิ.ย. 69', vendor: '', purchaseAmount: 6800000, acceptedDate: '24 ส.ค. 69', paidDate: '', stage: 4, cancelled: false, note: '' },
  { id: 4, item: 'เครื่องวัดความดันโลหิตพร้อมวัดความอิ่มตัวของออกซิเจนในเลือด', unit: 'ศํลยกรรมหญิง 1', budget: 44105.79, inventoryNo: '69-02998', receivedDate: '28 เม.ย. 69', buyer: 'นัชชา', orderNo: 'K6900325', orderDate: '10 มิ.ย. 69', vendor: '', purchaseAmount: 44105, acceptedDate: '22 มิ.ย. 69', paidDate: '8 ก.ค. 69', stage: 5, cancelled: false, note: '' },
  { id: 5, item: 'เครื่องตรวจคลื่นไฟฟ้าหัวใจอัตโนมัติพร้อมระบบประมวลผลชนิดสามารถจัดเก็บภาพในระบบเครือข่าย', unit: 'ศัลยกรรมประสาท', budget: 260000, inventoryNo: '69-02975', receivedDate: '6 พ.ค. 69', buyer: 'วรายุ', orderNo: '491/2569', orderDate: '25 พ.ค. 69', vendor: '', purchaseAmount: 260000, acceptedDate: '8 ก.ค. 69', paidDate: '16 ก.ค. 69', stage: 5, cancelled: false, note: '' },
  { id: 6, item: 'ระบบจัดเก็บบันทึกข้อมูลการส่องกล้อง', unit: 'ห้องผ่าตัด', budget: 500000, inventoryNo: '69-03160', receivedDate: '12 พ.ค. 69', buyer: 'หนึ่งฤทัย', orderNo: 'K6900357', orderDate: '20 ก.ค. 69', vendor: '', purchaseAmount: 495000, acceptedDate: '', paidDate: '', stage: 3, cancelled: false, note: '' },
  { id: 7, item: 'กล้องจุลทรรศน์ชนิด 2 ตา', unit: 'งานโลหิตวิทยา', budget: 65000, inventoryNo: '69-02879', receivedDate: '17 เม.ย. 69', buyer: 'พศกร', orderNo: 'K6900272', orderDate: '1 พ.ค. 69', vendor: '', purchaseAmount: 65000, acceptedDate: '22 พ.ค. 69', paidDate: '11 มิ.ย. 69', stage: 5, cancelled: false, note: '' },
  { id: 8, item: 'ชุด Suction Regulator with Full Package Set(Pipline)', unit: 'ICU Neuro', budget: 12500, inventoryNo: '69-02832', receivedDate: '16 เม.ย. 69', buyer: 'วรายุ', orderNo: 'K6900274', orderDate: '1 พ.ค. 69', vendor: '', purchaseAmount: 12500, acceptedDate: '25 พ.ค. 69', paidDate: '12 มิ.ย. 69', stage: 5, cancelled: false, note: '' },
  { id: 9, item: 'เครื่องส่องกล่องเสียงแบบไฟเบอร์ออปติค', unit: 'ER', budget: 75000, inventoryNo: '69-02870', receivedDate: '27 เม.ย. 69', buyer: 'กรกนก', orderNo: 'K69000291', orderDate: '15 พ.ค. 69', vendor: '', purchaseAmount: 75000, acceptedDate: '10 มิ.ย. 69', paidDate: '21 มิ.ย. 69', stage: 5, cancelled: false, note: '' },
  { id: 10, item: 'เครื่องกระตุกไฟฟ้าหัวใจชนิดไบเฟสิค พร้อมภาควัดออกซิเจนในเลือด', unit: 'ศัลยกรรมชาย 1', budget: 300000, inventoryNo: '69-03030', receivedDate: '5 พ.ค. 69', buyer: 'นัชชา', orderNo: '520/2569', orderDate: '22 มิ.ย. 69', vendor: '', purchaseAmount: 300000, acceptedDate: '22 ก.ค. 69', paidDate: '13 ส.ค. 69', stage: 5, cancelled: false, note: '' },
  { id: 11, item: 'ชุดสว่านเจาะและเลื่อยตัดกระดูกมาตรฐาน', unit: 'ห้องผ่าตัด', budget: 750000, inventoryNo: '69-02835', receivedDate: '16 เม.ย. 69', buyer: 'พิมพ์พรรณ', orderNo: '548/2569', orderDate: '8 ก.ค. 69', vendor: '', purchaseAmount: 748000, acceptedDate: '20 ส.ค. 69', paidDate: '26 ส.ค. 69', stage: 5, cancelled: false, note: '' },
  { id: 12, item: 'Suction vacuum Low pressure low flow', unit: 'ICU Trauma', budget: 90000, inventoryNo: '69-02861', receivedDate: '17 เม.ย. 69', buyer: 'รัตนาภรณ์', orderNo: 'K69000269', orderDate: '1 พ.ค. 69', vendor: '', purchaseAmount: 90000, acceptedDate: '19 พ.ค. 69', paidDate: '4 มิ.ย. 69', stage: 5, cancelled: false, note: '' },
  { id: 13, item: 'เครื่องอัลตราซาวด์แบบไร้สาย', unit: 'หอผู้ป่วยศัลยกรรมหญิง 1', budget: 99000, inventoryNo: '69-03044', receivedDate: '7 พ.ค. 69', buyer: 'รัตนาภรณ์', orderNo: 'K6900316', orderDate: '5 มิ.ย. 69', vendor: '', purchaseAmount: 99000, acceptedDate: '15 ก.ค. 69', paidDate: '', stage: 4, cancelled: false, note: '' },
  { id: 14, item: 'เตียงตรวจภายใน', unit: 'หลังคลอด', budget: 19500, inventoryNo: '', receivedDate: '', buyer: '', orderNo: '', orderDate: '', vendor: '', purchaseAmount: 0, acceptedDate: '', paidDate: '', stage: null, cancelled: true, note: 'แก้แผน' },
  { id: 15, item: 'โคมไฟช่วยทำหัตถการ', unit: 'หอผู้ป่วยแยกโรค', budget: 25000, inventoryNo: '69-03156', receivedDate: '11 พ.ค. 69', buyer: 'กรกนก', orderNo: 'K6900305', orderDate: '22 พ.ค. 69', vendor: '', purchaseAmount: 25000, acceptedDate: '9 มิ.ย. 69', paidDate: '4 ก.ค. 69', stage: 5, cancelled: false, note: '' },
  { id: 16, item: 'ตู้แช่แข็งเก็บพลาสมาอุณหภูมิ -40 องศาเซลเซียส ไม่น้อยกว่า 150 ถุง', unit: 'เทคนิคการแพทย์', budget: 140000, inventoryNo: '69-02887', receivedDate: '17 เม.ย. 69', buyer: 'กรกนก', orderNo: '480/2569', orderDate: '14 พ.ค. 69', vendor: '', purchaseAmount: 135000, acceptedDate: '19 ส.ค. 69', paidDate: '25 ส.ค. 69', stage: 5, cancelled: false, note: '' },
  { id: 17, item: 'ชุดควบคุมและปรับแรงดูดของเหลวในทรวงอกชนิดทรงกระบอก', unit: 'RICU / นัชชา', budget: 58800, inventoryNo: '69-02859', receivedDate: '16 เม.ย. 69', buyer: 'นัชชา', orderNo: 'K6900279', orderDate: '6 มิ.ย. 69', vendor: '', purchaseAmount: 58800, acceptedDate: '25 พ.ค. 69', paidDate: '22 มิ.ย. 69', stage: 5, cancelled: false, note: 'ส่งซื้อ 3 เครื่องแล้ว; มีรายการรวมซื้อ/ยกเลิกซ้ำในต้นฉบับ' },
  { id: 18, item: 'เครื่องตรวจการได้ยิน', unit: 'หลังคลอด', budget: 350000, inventoryNo: '69-03545', receivedDate: '8 มิ.ย. 69', buyer: '', orderNo: '536/2569', orderDate: '2 ก.ค. 69', vendor: '', purchaseAmount: 350000, acceptedDate: '18 ส.ค. 69', paidDate: '', stage: 4, cancelled: false, note: '' },
  { id: 19, item: 'ตู้ตรวจการได้ยิน ขนาดไม่น้อยกว่า 2 เมตร', unit: 'กลุ่มงานผู้ป่วยนอก', budget: 300000, inventoryNo: '69-03395', receivedDate: '8 มิ.ย. 69', buyer: '', orderNo: '561/2569', orderDate: '14 ก.ค. 69', vendor: '', purchaseAmount: 300000, acceptedDate: '14 ก.ค. 69', paidDate: '26 ก.ย. 69', stage: 5, cancelled: false, note: 'ส่งมอบ 14 ก.ค. 69 / ส่งเบิกจ่าย 26 ก.ย. 69' },
  { id: 20, item: 'เครื่องทดสอบการได้ยิน (Audiometry)', unit: 'กลุ่มงานผู้ป่วยนอก', budget: 650000, inventoryNo: '69-03465', receivedDate: '8 มิ.ย. 69', buyer: '', orderNo: '618/2569', orderDate: '26 ส.ค. 69', vendor: '', purchaseAmount: 640000, acceptedDate: '', paidDate: '', stage: 3, cancelled: false, note: '' },
  { id: 21, item: 'ชุดไฟส่องผ่าตัดแบบครอบศีรษะ', unit: 'ห้องผ่าตัด', budget: 400000, inventoryNo: '69-02836', receivedDate: '16 เม.ย. 69', buyer: 'กรกนก', orderNo: 'K6900295', orderDate: '15 พ.ค. 69', vendor: '', purchaseAmount: 400000, acceptedDate: '18 พ.ค. 69', paidDate: '3 มิ.ย. 69', stage: 5, cancelled: false, note: '' },
  { id: 22, item: 'เครื่องนึ่งฆ่าเชื้อจุลินทรีย์ด้วยไอน้ำระบบอัตโนมัติ (Steam Sterilizers) / A881 / ขนาด 100 ลิตร', unit: 'เทคนิคการแพทย์', budget: 380000, inventoryNo: '69-02884', receivedDate: '17 เม.ย. 69', buyer: 'กรกนก', orderNo: '484/2569', orderDate: '18 พ.ค. 69', vendor: '', purchaseAmount: 365000, acceptedDate: '17 ก.ค. 69', paidDate: '6 ส.ค. 69', stage: 5, cancelled: false, note: '' },
  { id: 23, item: 'กล้องส่องตรวจท่อทางเดินน้ำดีและตับอ่อนชนิดวีดิทัศน์แบบคมชัดสูง', unit: 'ห้องผ่าตัด', budget: 1400000, inventoryNo: '69-02837', receivedDate: '16 เม.ย. 69', buyer: '', orderNo: '583/2569', orderDate: '23 ก.ค. 69', vendor: '', purchaseAmount: 1399000, acceptedDate: '', paidDate: '', stage: 3, cancelled: false, note: '' },
  { id: 24, item: 'เครื่องรีดขยายผิวหนัง', unit: 'ห้องผ่าตัด', budget: 250000, inventoryNo: '69-02828', receivedDate: '16 เม.ย. 69', buyer: 'พศกร', orderNo: '479/2569', orderDate: '12 พ.ค. 69', vendor: '', purchaseAmount: 250000, acceptedDate: '24 มิ.ย. 69', paidDate: '8 ส.ค. 69', stage: 5, cancelled: false, note: '' },
  { id: 25, item: 'เครื่องส่องตรวจหู Otoscope', unit: 'ห้องผ่าตัด', budget: 12850, inventoryNo: '69-02867', receivedDate: '17 เม.ย. 69', buyer: 'หนึ่งฤทัย', orderNo: 'K6900278', orderDate: '6 พ.ค. 69', vendor: '', purchaseAmount: 12000, acceptedDate: '22 พ.ค. 69', paidDate: '', stage: 4, cancelled: false, note: '' },
  { id: 26, item: 'เครื่องไมโครมอเตอร์สำหรับงานแล็ป', unit: 'ทันตกรรม', budget: 16600, inventoryNo: '69-03059', receivedDate: '30 เม.ย. 69', buyer: 'รัตนาภรณ์', orderNo: 'K6900303', orderDate: '2 ก.ค. 69', vendor: '', purchaseAmount: 16600, acceptedDate: '', paidDate: '', stage: 3, cancelled: false, note: '' },
  { id: 27, item: 'เครื่องล้างเครื่องมืออัลตราโซนิก ชนิด 2 หลุมล้าง ขนาดความจุไม่น้อยกว่า 50 ลิตร', unit: 'ห้องผ่าตัด', budget: 375000, inventoryNo: '69-03157', receivedDate: '12 พ.ค. 69', buyer: '', orderNo: '541/2569', orderDate: '6 กค. 69', vendor: '', purchaseAmount: 375000, acceptedDate: '', paidDate: '', stage: 3, cancelled: false, note: '' },
  { id: 28, item: 'เครื่องวัดความดันโลหิตแบบอัตโนมัติ', unit: 'อายุรกรมหญิง', budget: 26000, inventoryNo: '69-3021', receivedDate: '29 เม.ย. 69', buyer: 'วรายุ', orderNo: 'K6900294', orderDate: '15 พ.ค. 69', vendor: '', purchaseAmount: 26000, acceptedDate: '9 มิ.ย. 69', paidDate: '3 ก.ค. 69', stage: 5, cancelled: false, note: '' },
  { id: 29, item: 'ตู้เย็นแช่เวชภัณฑ์ยา', unit: 'หอแยกโรค', budget: 14550, inventoryNo: '69-03154', receivedDate: '11 พ.ค. 69', buyer: 'วรายุ', orderNo: 'K6900308', orderDate: '25 พ.ค. 69', vendor: '', purchaseAmount: 14550, acceptedDate: '22 มิ.ย. 69', paidDate: '17 ก.ค. 69', stage: 5, cancelled: false, note: '' },
  { id: 30, item: 'เครื่องทำน้ำร้อน-เย็น', unit: 'อายุรกรรมชาย 1', budget: 15980, inventoryNo: '69-02971', receivedDate: '6 พ.ค. 69', buyer: 'พศกร', orderNo: 'K6900313', orderDate: '28 พ.ค. 69', vendor: '', purchaseAmount: 7990, acceptedDate: '8 มิ.ย. 69', paidDate: '22 มิ.ย. 69', stage: 5, cancelled: false, note: 'มีรายการห้องคลอดยกเลิก/ปรับแผนในต้นฉบับ' },
  { id: 31, item: 'เก้าอี้แถวเลคเชอร์ 3 ที่นั่ง', unit: 'บริหารทั่วไป', budget: 42000, inventoryNo: '69-02801', receivedDate: '17 เม.ย. 69', buyer: 'รัตนาภรณ์', orderNo: 'K6900271', orderDate: '30 เม.ย. 69', vendor: '', purchaseAmount: 42000, acceptedDate: '15 พ.ค. 69', paidDate: '4 มิ.ย. 69', stage: 5, cancelled: false, note: '' },
  { id: 32, item: 'พัดลมโคจร', unit: 'อายุรกรรมชาย 1', budget: 126750, inventoryNo: '69-3015', receivedDate: '28 เม.ย. 69', buyer: 'รัตนาภรณ์', orderNo: 'K6900306', orderDate: '25 พ.ค. 69', vendor: '', purchaseAmount: 125790, acceptedDate: '15 มิ.ย. 69', paidDate: '20 ก.ค. 69', stage: 5, cancelled: false, note: '' },
  { id: 33, item: 'เก้าอี้โซฟาปรับนอนสำหรับฟอกไต', unit: 'หน่วยไตเทียม', budget: 18000, inventoryNo: '69-03210', receivedDate: '20 พ.ค. 69', buyer: '', orderNo: 'K69003334', orderDate: '24 มิ.ย. 69', vendor: '', purchaseAmount: 18000, acceptedDate: '26 มิ.ย. 69', paidDate: '20 ก.ค. 69', stage: 5, cancelled: false, note: '' },
  { id: 34, item: 'ที่นอนลดแผลกดทับ (Anti-bedsoren Mattresses) SAWAKY รุ่น AHSB 3102 ขนาด 87 x 200 x 5.5 เซนติเมตร', unit: 'หอผู้ป่วยศัลยกรรมอุบัติเหตุ', budget: 420000, inventoryNo: '69-02812', receivedDate: '22 เม.ย. 69', buyer: 'กรกนก', orderNo: '', orderDate: '', vendor: '', purchaseAmount: 0, acceptedDate: '', paidDate: '', stage: 1, cancelled: false, note: 'ปรับชื่อแผน' },
];

const stageMeta = [
  { n: 1, label: 'รับเรื่อง/จัดทำแผนแล้ว', className: 'stage1' },
  { n: 2, label: 'อนุมัติจัดซื้อ/จัดจ้างแล้ว', className: 'stage2' },
  { n: 3, label: 'ออก PO / ใบสั่งซื้อ / สัญญาแล้ว', className: 'stage3' },
  { n: 4, label: 'ส่งมอบและตรวจรับแล้ว', className: 'stage4' },
  { n: 5, label: 'เบิกจ่ายแล้ว / เสร็จสิ้น', className: 'stage5' },
];

const money = (n: number) => new Intl.NumberFormat('th-TH', { maximumFractionDigits: 0 }).format(n || 0);

type ModuleName = 'budget' | 'uc' | 'plan';

function moduleFromHash(hash: string): ModuleName | null {
  const value = hash.replace(/^#/, '');
  return value === 'budget' || value === 'uc' || value === 'plan' ? value : null;
}

function App() {
  const [module, setModule] = useState<ModuleName>(() => moduleFromHash(window.location.hash) ?? 'uc');

  useEffect(() => {
    const onHashChange = () => setModule(moduleFromHash(window.location.hash) ?? 'uc');
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);
  const [budgetRows, setBudgetRows] = useState<BudgetRow[]>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('budget70RowsOfficial28') || 'null') as BudgetRow[] | null;
      if (!saved) return budgetSeed;
      return budgetSeed.map(base => {
        const old = saved.find(row => row.id === base.id);
        if (!old) return base;
        return {
          ...base,
          buyer: old.buyer || '',
          method: old.method || '',
          contractNo: old.contractNo || '',
          contractDate: old.contractDate || '',
          vendor: old.vendor || '',
          contractAmount: old.contractAmount || 0,
          dueDate: old.dueDate || '',
          deliveredDate: old.deliveredDate || '',
          acceptedDate: old.acceptedDate || '',
          paidDate: old.paidDate || '',
          note: base.note || old.note || '',
        };
      });
    } catch {
      return budgetSeed;
    }
  });
  const [planRows, setPlanRows] = useState<PlanRow[]>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('plan69RowsEditable') || 'null') as PlanRow[] | null;
      if (!saved) return planSeed;
      return planSeed.map(base => ({ ...base, ...(saved.find(row => row.id === base.id && row.category === base.category) || {}), item: base.item, category: base.category }));
    } catch {
      return planSeed;
    }
  });
  const [ucRows, setUcRows] = useState<UcRow[]>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('uc69Rows34Real') || 'null') as UcRow[] | null;
      if (!saved) return ucSeed;
      return ucSeed.map(base => { const old = saved.find(row => row.id === base.id); const merged = { ...base, ...(old || {}), item: base.item }; return base.id === 19 ? { ...merged, acceptedDate: base.acceptedDate, paidDate: base.paidDate, stage: base.stage, cancelled: base.cancelled, note: base.note } : merged; });
    } catch {
      return ucSeed;
    }
  });
  const [budgetQuery, setBudgetQuery] = useState('');
  const [ucQuery, setUcQuery] = useState('');
  const [planQuery, setPlanQuery] = useState('');
  const [planUnitFilter, setPlanUnitFilter] = useState('ทุกหน่วยงาน');
  const [planReceiptFilter, setPlanReceiptFilter] = useState('ทั้งหมด');
  const [planDetail, setPlanDetail] = useState<PlanRow | null>(null);
  const [planDraft, setPlanDraft] = useState<PlanRow | null>(null);
  const [planView, setPlanView] = useState<'years' | 'list'>('years');
  const [planCategory, setPlanCategory] = useState('ครุภัณฑ์การแพทย์เกินแสน');
  const [ucStageFilter, setUcStageFilter] = useState('ทั้งหมด');
  const [page, setPage] = useState(1);
  const [budgetDraft, setBudgetDraft] = useState<BudgetRow | null>(null);
  const [ucDraft, setUcDraft] = useState<UcRow | null>(null);
  const [orderFile, setOrderFile] = useState<{ name: string; url: string } | null>(null);
  const [fileBusy, setFileBusy] = useState(false);
  const [fileMessage, setFileMessage] = useState('');
  const pageSize = 10;

  const openUc = async (row: UcRow) => {
    setUcDraft({ ...row });
    setOrderFile(null);
    setFileMessage('');
    try {
      const response = await api.get(`/api/uc/${row.id}/order-file`);
      if (response.data?.file) setOrderFile(response.data.file);
    } catch {
      setFileMessage('ยังไม่มีไฟล์ใบสั่งซื้อ/สั่งจ้าง');
    }
  };

  const uploadOrderFile = async (file: File) => {
    if (!ucDraft) return;
    if (file.size > 10 * 1024 * 1024) {
      setFileMessage('ไฟล์ต้องมีขนาดไม่เกิน 10 MB');
      return;
    }
    setFileBusy(true);
    setFileMessage('กำลังอัปโหลด...');
    try {
      const content = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result).split(',')[1] || '');
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });
      const response = await api.post(`/api/uc/${ucDraft.id}/order-file`, { name: file.name, contentType: file.type || 'application/octet-stream', content });
      setOrderFile(response.data.file);
      setFileMessage('แนบไฟล์เรียบร้อย');
    } catch {
      setFileMessage('อัปโหลดไม่สำเร็จ กรุณาลองใหม่');
    } finally {
      setFileBusy(false);
    }
  };

  useEffect(() => localStorage.setItem('budget70RowsOfficial28', JSON.stringify(budgetRows)), [budgetRows]);
  useEffect(() => localStorage.setItem('plan69RowsEditable', JSON.stringify(planRows)), [planRows]);
  useEffect(() => localStorage.setItem('uc69Rows34Real', JSON.stringify(ucRows)), [ucRows]);

  const budgetFiltered = useMemo(() => {
    const q = budgetQuery.trim().toLowerCase();
    return budgetRows.filter(r => !q || [r.item, r.code, r.unit, r.inventoryNo, r.buyer, r.contractNo, r.vendor].join(' ').toLowerCase().includes(q));
  }, [budgetRows, budgetQuery]);

  const planUnits = useMemo(() => Array.from(new Set(planRows.filter(r => r.category === planCategory && r.unit).map(r => r.unit))).sort((a, b) => a.localeCompare(b, 'th')), [planRows, planCategory]);
  const planFiltered = useMemo(() => {
    const q = planQuery.trim().toLowerCase();
    return planRows.filter(r => r.category === planCategory && (planUnitFilter === 'ทุกหน่วยงาน' || r.unit === planUnitFilter) && (planReceiptFilter === 'ทั้งหมด' || (planReceiptFilter === 'รับแล้ว' ? Boolean(r.inventoryNo) : !r.inventoryNo)) && (!q || [r.item, r.unit, r.inventoryNo].join(' ').toLowerCase().includes(q)));
  }, [planRows, planQuery, planCategory, planUnitFilter, planReceiptFilter]);

  const planTotals = useMemo(() => ({
    count: planRows.length,
    budget: planRows.reduce((sum, r) => sum + r.budget, 0),
    received: planRows.filter(r => r.inventoryNo).length,
  }), [planRows]);

  const ucFiltered = useMemo(() => {
    const q = ucQuery.trim().toLowerCase();
    return ucRows.filter(r => {
      const hit = !q || [r.item, r.unit, r.inventoryNo, r.buyer, r.orderNo, r.vendor, r.note].join(' ').toLowerCase().includes(q);
      const statusHit = ucStageFilter === 'ทั้งหมด' || (ucStageFilter === 'ยกเลิก/เปลี่ยนรายการ' ? r.cancelled : String(r.stage || '') === ucStageFilter);
      return hit && statusHit;
    });
  }, [ucRows, ucQuery, ucStageFilter]);

  const pageCount = Math.max(1, Math.ceil(ucFiltered.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const ucPageRows = ucFiltered.slice((safePage - 1) * pageSize, safePage * pageSize);

  useEffect(() => setPage(1), [ucQuery, ucStageFilter]);

  const budgetTotals = useMemo(() => {
    const total = budgetRows.reduce((sum, r) => sum + (r.approved || r.budget), 0);
    const signed = budgetRows.filter(r => r.contractDate && r.contractAmount > 0);
    const contracted = signed.reduce((sum, r) => sum + r.contractAmount, 0);
    const saved = signed.reduce((sum, r) => sum + Math.max(0, (r.approved || r.budget) - r.contractAmount), 0);
    return { total, signed: signed.length, contracted, saved };
  }, [budgetRows]);

  const ucTotals = useMemo(() => {
    const active = ucRows.filter(r => !r.cancelled);
    const completed = active.filter(r => r.stage === 5).length;
    const stageCounts = stageMeta.map(s => active.filter(r => r.stage === s.n).length);
    const budget = active.reduce((sum, r) => sum + r.budget, 0);
    const purchase = active.reduce((sum, r) => sum + r.purchaseAmount, 0);
    const saved = active.reduce((sum, r) => sum + (r.budget && r.purchaseAmount ? Math.max(0, r.budget - r.purchaseAmount) : 0), 0);
    return { active: active.length, completed, stageCounts, budget, purchase, saved, cancelled: ucRows.filter(r => r.cancelled).length };
  }, [ucRows]);

  const exportHtmlExcel = (filename: string, headers: string[], data: Array<Array<string | number>>) => {
    const esc = (v: string | number) => String(v ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
    const body = data.map(row => `<tr>${row.map(v => `<td>${esc(v)}</td>`).join('')}</tr>`).join('');
    const html = `<!doctype html><html><head><meta charset='utf-8'></head><body><table border='1'><thead><tr>${headers.map(h => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${body}</tbody></table></body></html>`;
    const blob = new Blob(['\ufeff', html], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const exportPlanExcel = () => {
    const workbook = XLSX.utils.book_new();
    planCategories.forEach(category => {
      const rows = planSeed.filter(row => row.category === category);
      const sheet = XLSX.utils.aoa_to_sheet([
        ['ลำดับ', 'รายการ', 'หน่วยงาน', 'จำนวน', 'งบประมาณ (บาท)', 'เลขรับ Inventory', 'สถานะ'],
        ...rows.map(row => [row.id, row.item, row.unit, row.qty, row.budget, row.inventoryNo, row.status]),
      ]);
      XLSX.utils.book_append_sheet(workbook, sheet, category.slice(0, 31));
    });
    XLSX.writeFile(workbook, 'แผนเงินบำรุง_2569_รวมทุกหมวด.xlsx');
  };

  const exportUc = () => exportHtmlExcel(
    'งบค่าเสื่อม_UC_2569_โรงพยาบาลอุตรดิตถ์.xls',
    ['ลำดับ', 'รายการ', 'หน่วยงาน', 'วงเงิน', 'Inventory', 'วันที่รับ', 'เจ้าหน้าที่จัดซื้อ', 'PO/ใบสั่งซื้อ/สัญญา', 'วันที่', 'ผู้ค้า', 'ราคาซื้อจริง', 'วันที่ตรวจรับ', 'วันที่เบิกจ่าย', 'ขั้นตอน', 'สถานะ', 'หมายเหตุ'],
    ucRows.map(r => [r.id, r.item, r.unit, r.budget || '', r.inventoryNo, r.receivedDate, r.buyer, r.orderNo, r.orderDate, r.vendor, r.purchaseAmount || '', r.acceptedDate, r.paidDate, r.stage || '', r.cancelled ? 'ยกเลิก/เปลี่ยนรายการ' : r.stage ? stageMeta[r.stage - 1].label : 'รออัปเดต', r.note])
  );

  const saveUc = () => {
    if (!ucDraft) return;
    setUcRows(prev => prev.map(r => r.id === ucDraft.id ? ucDraft : r));
    setUcDraft(null);
  };

  const saveBudget = () => {
    if (!budgetDraft) return;
    setBudgetRows(prev => prev.map(r => r.id === budgetDraft.id ? budgetDraft : r));
    setBudgetDraft(null);
  };

  const openPlan = (row: PlanRow) => {
    setPlanDetail(null);
    setPlanDraft({ ...row });
  };

  const savePlan = () => {
    if (!planDraft) return;
    const next = { ...planDraft, status: planDraft.inventoryNo ? 'รับแล้ว' : 'ยังไม่ได้รับ' };
    setPlanRows(prev => prev.map(r => r.id === next.id && r.category === next.category ? next : r));
    setPlanDraft(null);
  };

  return (
    <div className="shell">
      <div className="module-return">
        <a href="https://uttaradit-procurement-hub.manoosaki65.chatgpt.site">
          <Home size={18} aria-hidden="true" />
          <span>กลับหน้าโฮมเพจ</span>
        </a>
      </div>

      {module === 'plan' ? (
        <main>
          <header><div><h1>แผนเงินบำรุง</h1><p>{planView === 'years' ? 'เลือกปีงบประมาณที่ต้องการดู' : `ปี 2569 • ${planCategory}`}</p></div><div className="dateBox"><b>แผนเงินบำรุง</b><br /><small>{planView === 'years' ? 'แยกตามปีงบประมาณ' : 'ปีงบประมาณ 2569'}</small></div></header>
          {planView === 'years' ? <section className="planTileGrid"><button className="planTile yearTile" onClick={() => { setPlanCategory('ครุภัณฑ์การแพทย์เกินแสน'); setPlanView('list'); }}><CalendarDays /><div><b>ปี 2569</b><span>แผนจัดซื้อครุภัณฑ์</span><small>กดเพื่อดูรายการตามหมวด</small></div></button><div className="planTile futureTile"><CalendarDays /><div><b>ปี 2570</b><span>เตรียมเพิ่มเดือนหน้า</span><small>ยังไม่มีข้อมูล</small></div></div></section> : <><button className="backPlan" onClick={() => { setPlanView('years'); setPlanQuery(''); }}>← กลับไปเลือกปี</button><section className="cards ucCards"><div className="card"><FileText /><div><span>รายการทั้งหมด</span><b>{planTotals.count}</b><small>ทุกรายการตามแผนปี 69</small></div></div><div className="card green"><WalletCards /><div><span>วงเงินรวม</span><b>{money(planTotals.budget)}</b><small>บาท</small></div></div><div className="card orange"><Clock3 /><div><span>มีเลขรับ Inventory</span><b>{planTotals.received}</b><small>รายการ</small></div></div><div className="card blue"><CheckCircle2 /><div><span>หมวดแผน</span><b>{planCategories.length}</b><small>หมวด</small></div></div></section><nav className="planTabs" aria-label="หมวดแผนเงินบำรุง">{planCategories.map(category => <button key={category} className={planCategory === category ? 'active' : ''} onClick={() => { setPlanCategory(category); setPlanQuery(''); setPlanUnitFilter('ทุกหน่วยงาน'); setPlanReceiptFilter('ทั้งหมด'); }}>{category}<small>{planSeed.filter(r => r.category === category).length} รายการ</small></button>)}</nav><section className="ucToolbar budgetToolbar planFilterBar"><div className="searchBox"><Search size={18} /><input aria-label="ค้นหาแผนเงินบำรุง" placeholder="ค้นหารายการ / หน่วยงาน / เลขรับ Inventory" value={planQuery} onChange={e => setPlanQuery(e.target.value)} /></div><select aria-label="กรองหน่วยงาน" value={planUnitFilter} onChange={e => setPlanUnitFilter(e.target.value)}><option>ทุกหน่วยงาน</option>{planUnits.map(unit => <option key={unit}>{unit}</option>)}</select><select aria-label="กรองการรับ Inventory" value={planReceiptFilter} onChange={e => setPlanReceiptFilter(e.target.value)}><option>ทั้งหมด</option><option>ยังไม่ได้รับ</option><option>รับแล้ว</option></select><button className="export" onClick={exportPlanExcel}><FileSpreadsheet size={16} /> Export Excel ทุกหมวด</button></section><section className="planQuickSummary"><b>{planFiltered.length} รายการ</b><span>รับแล้ว {planFiltered.filter(r => r.inventoryNo).length}</span><span>ยังไม่ได้รับ {planFiltered.filter(r => !r.inventoryNo).length}</span></section><section className="tableWrap planTableWrap"><table className="planTable"><thead><tr><th>ลำดับ</th><th>รายการ</th><th>จำนวน</th><th>วงเงิน (บาท)</th><th>เลขรับ Inventory</th><th>วันที่รับ</th><th>หน่วยงาน</th><th>สถานะรับ</th><th>รายละเอียด</th></tr></thead><tbody>{planFiltered.map((r, index) => <tr key={`${r.category}-${r.id}-${index}`} onClick={() => openPlan(r)} className="editablePlanRow"><td>{r.id}</td><td className="itemCell"><b>{r.item}</b></td><td className="num">{r.qty}</td><td className="num">{r.budget ? money(r.budget) : '-'}</td><td className="inventoryCell"><b>{r.inventoryNo || '-'}</b></td><td>{r.receivedDate || '-'}</td><td>{r.unit || '-'}</td><td><button className={`status statusButton ${r.inventoryNo ? 'received' : 'waiting'}`} onClick={e => { e.stopPropagation(); openPlan(r); }}>{r.inventoryNo ? 'รับแล้ว' : 'ยังไม่ได้รับ'}</button></td><td><button className="export" onClick={e => { e.stopPropagation(); openPlan(r); }}>แก้ไข / รายละเอียด</button></td></tr>)}</tbody></table></section></>}
          {planDraft && <div className="modalBackdrop" onMouseDown={() => setPlanDraft(null)} role="presentation"><section className="editor modalCard" role="dialog" aria-modal="true" onMouseDown={e => e.stopPropagation()}><div className="editorHead"><div><h3>แก้ไขรายการที่ {planDraft.id}</h3><p>{planDraft.item}</p></div><button className="iconBtn" aria-label="ปิดแก้ไข" onClick={() => setPlanDraft(null)}><X size={18} /></button></div><div className="formGrid ucForm"><label><span>เลขรับ Inventory</span><input autoFocus value={planDraft.inventoryNo} onChange={e => setPlanDraft({ ...planDraft, inventoryNo: e.target.value })} placeholder="เช่น 69-03470" /></label><label><span>วันที่รับ</span><input value={planDraft.receivedDate} onChange={e => setPlanDraft({ ...planDraft, receivedDate: e.target.value })} placeholder="เช่น 1 ก.ค. 69" /></label><label><span>หน่วยงาน</span><input value={planDraft.unit} onChange={e => setPlanDraft({ ...planDraft, unit: e.target.value })} /></label><div className="field"><span>จำนวน</span><b>{planDraft.qty}</b></div><div className="field"><span>วงเงิน</span><b>{planDraft.budget ? `${money(planDraft.budget)} บาท` : '-'}</b></div><div className="field"><span>สถานะหลังบันทึก</span><b>{planDraft.inventoryNo ? 'รับแล้ว' : 'ยังไม่ได้รับ'}</b></div></div><div className="editorActions"><button className="secondary" onClick={() => setPlanDraft(null)}>ยกเลิก</button><button className="primary" onClick={savePlan}>บันทึกข้อมูล</button></div></section></div>}
        </main>
      ) : module === 'uc' ? (
        <main>
          <header>
            <div><h1>งบค่าเสื่อม (UC) ปี 2569</h1><p>ติดตามรายการจริงด้วยสถานะ 5 ขั้นตอน ตั้งแต่รับเรื่องถึงเบิกจ่ายเสร็จสิ้น</p></div>
            <div className="dateBox"><b>ข้อมูลจริง ปี 69</b><br /><small>34 รายการจากไฟล์ค่าเสื่อมต้นทาง</small></div>
          </header>

          <section className="cards ucCards">
            <div className="card"><FileText /><div><span>รายการทั้งหมด</span><b>{ucRows.length}</b><small>รายการจากไฟล์ปี 69</small></div></div>
            <div className="card blue"><CheckCircle2 /><div><span>เสร็จสิ้นขั้น 5</span><b>{ucTotals.completed}</b><small>จาก {ucTotals.active} รายการที่ใช้งาน</small></div></div>
            <div className="card orange"><TrendingDown /><div><span>เงินประหยัดที่คำนวณได้</span><b>{money(ucTotals.saved)}</b><small>เริ่มคำนวณเมื่อกรอกราคาซื้อจริง</small></div></div>
            <div className="card green"><WalletCards /><div><span>ยกเลิก/เปลี่ยนรายการ</span><b>{ucTotals.cancelled}</b><small>เก็บประวัติ ไม่ลบลำดับเดิม</small></div></div>
          </section>

          <section className="stageLegend">
            {stageMeta.map((s, i) => <div key={s.n} className={`legendItem ${s.className}`}><span>{s.n}</span><div><b>{s.label}</b><small>{ucTotals.stageCounts[i]} รายการอยู่ขั้นนี้</small></div></div>)}
          </section>

          <section className="ucToolbar">
            <div className="searchBox"><Search size={18} /><input aria-label="ค้นหารายการ UC" placeholder="ค้นหา เช่น โทรทัศน์ LED / ชื่อรายการ / Inventory / เจ้าหน้าที่ / ผู้ค้า" value={ucQuery} onChange={e => setUcQuery(e.target.value)} /></div>
            <select value={ucStageFilter} onChange={e => setUcStageFilter(e.target.value)}>
              <option>ทั้งหมด</option><option value="1">ขั้น 1</option><option value="2">ขั้น 2</option><option value="3">ขั้น 3</option><option value="4">ขั้น 4</option><option value="5">ขั้น 5</option><option>ยกเลิก/เปลี่ยนรายการ</option>
            </select>
            <button className="export" onClick={exportUc}><FileSpreadsheet size={16} /> Export Excel</button>
          </section>

          <section className="tableWrap ucTableWrap">
            <table className="ucTable">
              <thead><tr><th>ลำดับ</th><th>รายการ</th><th>หน่วยงาน</th><th>วงเงิน</th><th>Inventory / วันที่รับ</th><th>เจ้าหน้าที่จัดซื้อ</th><th>PO / ใบสั่งซื้อ / สัญญา</th><th>ราคาซื้อจริง</th><th>ขั้นตอน 1–5</th><th>สถานะ</th><th></th></tr></thead>
              <tbody>
                {ucPageRows.map(r => {
                  const saving = r.budget && r.purchaseAmount ? Math.max(0, r.budget - r.purchaseAmount) : 0;
                  return <tr key={r.id} onClick={() => openUc(r)} className={r.cancelled ? 'cancelledRow' : ''}>
                    <td>{r.id}</td>
                    <td className="itemCell"><b>{r.item}</b>{r.note && <small>{r.note}</small>}</td>
                    <td>{r.unit || '-'}</td>
                    <td className="num">{r.budget ? money(r.budget) : '-'}</td>
                    <td>{r.inventoryNo || '-'}<small>{r.receivedDate || '-'}</small></td>
                    <td>{r.buyer || '-'}</td>
                    <td>{r.orderNo || '-'}<small>{r.orderDate || '-'}</small></td>
                    <td className="num">{r.purchaseAmount ? money(r.purchaseAmount) : '-'}{saving > 0 && <small className="saveText">ประหยัด {money(saving)}</small>}</td>
                    <td><div className="steps" aria-label={r.stage ? `ขั้นปัจจุบัน ${r.stage}` : 'ยังไม่มีขั้นตอน'}>{stageMeta.map(s => <span key={s.n} className={`stepDot ${r.stage === s.n && !r.cancelled ? s.className : ''}`}>{s.n}</span>)}</div></td>
                    <td>{r.cancelled ? <span className="status cancelled">ยกเลิก/เปลี่ยนรายการ</span> : <span className="status neutral">{r.stage ? 'กำลังดำเนินการ' : 'รออัปเดต'}</span>}</td>
                    <td><button className="iconBtn" aria-label={`แก้ไขรายการ ${r.id}`} onClick={e => { e.stopPropagation(); openUc(r); }}><Pencil size={16} /></button></td>
                  </tr>;
                })}
              </tbody>
            </table>
          </section>

          <div className="pagination">
            <span>แสดง {ucFiltered.length ? (safePage - 1) * pageSize + 1 : 0}–{Math.min(safePage * pageSize, ucFiltered.length)} จาก {ucFiltered.length} รายการ</span>
            <div><button disabled={safePage === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>ก่อนหน้า</button>{Array.from({ length: pageCount }, (_, i) => i + 1).map(n => <button key={n} className={safePage === n ? 'selected' : ''} onClick={() => setPage(n)}>{n}</button>)}<button disabled={safePage === pageCount} onClick={() => setPage(p => Math.min(pageCount, p + 1))}>ถัดไป</button></div>
          </div>

          {ucDraft && <div className="modalBackdrop" onMouseDown={() => setUcDraft(null)} role="presentation"><section className="editor modalCard" role="dialog" aria-modal="true" aria-labelledby="uc-editor-title" onMouseDown={e => e.stopPropagation()}>
            <div className="editorHead"><div><h3 id="uc-editor-title">รายการที่ {ucDraft.id}</h3><p>{ucDraft.item}</p></div><div><button className="primary" onClick={saveUc}><Save size={16} /> บันทึก</button><button className="iconBtn" onClick={() => setUcDraft(null)}><X size={18} /></button></div></div>
            <div className="stagePicker"><b>อัปเดตขั้นตอน</b><div>{stageMeta.map(s => <button key={s.n} className={`stagePick ${ucDraft.stage === s.n ? s.className : ''}`} onClick={() => setUcDraft({ ...ucDraft, stage: s.n, cancelled: false })}><span>{s.n}</span>{s.label}</button>)}</div></div>
            <div className="formGrid ucForm">
              <label className="field"><span>เลข Inventory</span><input value={ucDraft.inventoryNo} onChange={e => setUcDraft({ ...ucDraft, inventoryNo: e.target.value })} /></label>
              <label className="field"><span>วันที่รับ</span><input value={ucDraft.receivedDate} onChange={e => setUcDraft({ ...ucDraft, receivedDate: e.target.value })} /></label>
              <label className="field"><span>หน่วยงาน</span><input value={ucDraft.unit} onChange={e => setUcDraft({ ...ucDraft, unit: e.target.value })} /></label>
              <label className="field"><span>วงเงิน</span><input type="number" value={ucDraft.budget || ''} onChange={e => setUcDraft({ ...ucDraft, budget: Number(e.target.value) })} /></label>
              <label className="field"><span>เจ้าหน้าที่จัดซื้อ</span><input value={ucDraft.buyer} onChange={e => setUcDraft({ ...ucDraft, buyer: e.target.value })} /></label>
              <label className="field"><span>PO / ใบสั่งซื้อ / สัญญา</span><input value={ucDraft.orderNo} onChange={e => setUcDraft({ ...ucDraft, orderNo: e.target.value })} /></label>
              <label className="field"><span>วันที่ออก PO / สัญญา</span><input value={ucDraft.orderDate} onChange={e => setUcDraft({ ...ucDraft, orderDate: e.target.value })} /></label>
              <label className="field"><span>ผู้ค้า / บริษัท</span><input value={ucDraft.vendor} onChange={e => setUcDraft({ ...ucDraft, vendor: e.target.value })} /></label>
              <label className="field"><span>ราคาซื้อจริง</span><input type="number" value={ucDraft.purchaseAmount || ''} onChange={e => setUcDraft({ ...ucDraft, purchaseAmount: Number(e.target.value) })} /></label>
              <label className="field"><span>วันที่ตรวจรับ</span><input value={ucDraft.acceptedDate} onChange={e => setUcDraft({ ...ucDraft, acceptedDate: e.target.value })} /></label>
              <label className="field"><span>วันที่เบิกจ่าย</span><input value={ucDraft.paidDate} onChange={e => setUcDraft({ ...ucDraft, paidDate: e.target.value })} /></label>
              <label className="field"><span>หมายเหตุ</span><input value={ucDraft.note} onChange={e => setUcDraft({ ...ucDraft, note: e.target.value })} /></label>
            </div>
            <section className="orderFileBox">
              <div><b>ใบสั่งซื้อ / ใบสั่งจ้าง</b><small>แนบไฟล์ PDF หรือเอกสารจากระบบ สูงสุด 10 MB</small></div>
              <div className="orderFileActions">
                <label className={`uploadBtn ${fileBusy ? 'disabled' : ''}`}><Upload size={16} /> {orderFile ? 'เปลี่ยนไฟล์' : 'แนบไฟล์'}<input type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,image/*" disabled={fileBusy} onChange={e => { const file = e.target.files?.[0]; if (file) uploadOrderFile(file); e.currentTarget.value = ''; }} /></label>
                {orderFile && <a className="downloadBtn" href={orderFile.url} target="_blank" rel="noreferrer"><Download size={16} /> ดาวน์โหลด {orderFile.name}</a>}
              </div>
              {fileMessage && <small className="fileMessage">{fileMessage}</small>}
            </section>
            <label className="cancelCheck"><input type="checkbox" checked={ucDraft.cancelled} onChange={e => setUcDraft({ ...ucDraft, cancelled: e.target.checked, stage: e.target.checked ? null : ucDraft.stage })} /> ยกเลิก / เปลี่ยนรายการ (เก็บลำดับเดิมไว้)</label>
          </section></div>}
        </main>
      ) : (
        <main>
          <header><div><h1>เงินงบประมาณ ปี 2570</h1><p>ติดตามการจัดซื้อจัดจ้าง • การลงนามสัญญา • การส่งมอบ • การประหยัดงบประมาณ</p></div><div className="dateBox">เป้าหมาย Q1<br /><b>ภายใน 31 ธ.ค. 2569</b></div></header>
          <section className="cards"><div className="card"><FileText /><div><span>รายการทั้งหมด</span><b>{budgetRows.length}</b><small>รายการ</small></div></div><div className="card green"><WalletCards /><div><span>วงเงินรวม</span><b>{money(budgetTotals.total)}</b><small>บาท</small></div></div><div className="card blue"><CheckCircle2 /><div><span>ลงนามแล้ว</span><b>{budgetTotals.signed}</b><small>รายการ</small></div></div><div className="card cyan"><Landmark /><div><span>วงเงินจัดซื้อจัดจ้าง</span><b>{money(budgetTotals.contracted)}</b><small>บาท</small></div></div><div className="card orange"><TrendingDown /><div><span>ประหยัด</span><b>{money(budgetTotals.saved)}</b><small>บาท</small></div></div></section>
          <section className="ucToolbar budgetToolbar"><div className="searchBox"><Search size={18} /><input placeholder="ค้นหารายการ / Inventory / เจ้าหน้าที่ / สัญญา / บริษัท" value={budgetQuery} onChange={e => setBudgetQuery(e.target.value)} /></div><button className="export" onClick={() => exportHtmlExcel('งบประมาณ_2570_โรงพยาบาลอุตรดิตถ์.xls', ['ลำดับ', 'รายการ', 'หน่วยงาน', 'วงเงิน', 'Inventory', 'วันที่รับ', 'เจ้าหน้าที่', 'สัญญา', 'วันที่ลงนาม', 'คู่สัญญา', 'วงเงินจริง'], budgetRows.map(r => [r.id, r.item, r.unit, r.approved || r.budget, r.inventoryNo, r.receivedDate, r.buyer, r.contractNo, r.contractDate, r.vendor, r.contractAmount || '']))}><FileSpreadsheet size={16} /> Export Excel</button></section>
          <section className="tableWrap"><table><thead><tr><th>ลำดับ</th><th>รายการ</th><th>หน่วยงาน</th><th>วงเงิน</th><th>Inventory / วันที่รับ</th><th>เจ้าหน้าที่</th><th>สัญญา / วันที่</th><th>คู่สัญญา</th><th>วงเงินจริง</th><th>สถานะ</th><th></th></tr></thead><tbody>{budgetFiltered.map(r => <tr key={r.id} onClick={() => setBudgetDraft({ ...r })}><td>{r.id}</td><td className="itemCell"><b>{r.item}</b><small>{r.code}</small></td><td>{r.unit}</td><td className="num">{money(r.approved || r.budget)}</td><td>{r.inventoryNo || '-'}<small>{r.receivedDate || '-'}</small></td><td>{r.buyer || '-'}</td><td>{r.contractNo || '-'}<small>{r.contractDate || '-'}</small></td><td>{r.vendor || '-'}</td><td className="num">{r.contractAmount ? money(r.contractAmount) : '-'}</td><td><span className="status neutral">{r.status}</span></td><td><button className="iconBtn" onClick={e => { e.stopPropagation(); setBudgetDraft({ ...r }); }}><Pencil size={16} /></button></td></tr>)}</tbody></table></section>
          {budgetDraft && <div className="modalBackdrop" onMouseDown={() => setBudgetDraft(null)} role="presentation"><section className="editor modalCard" role="dialog" aria-modal="true" onMouseDown={e => e.stopPropagation()}><div className="editorHead"><div><h3>รายละเอียดรายการที่ {budgetDraft.id}</h3><p>{budgetDraft.item}</p></div><div><button className="primary" onClick={saveBudget}><Save size={16} /> บันทึก</button><button className="iconBtn" onClick={() => setBudgetDraft(null)}><X size={18} /></button></div></div><div className="formGrid ucForm"><label className="field"><span>Inventory</span><input value={budgetDraft.inventoryNo} onChange={e => setBudgetDraft({ ...budgetDraft, inventoryNo: e.target.value })} /></label><label className="field"><span>วันที่รับ</span><input value={budgetDraft.receivedDate} onChange={e => setBudgetDraft({ ...budgetDraft, receivedDate: e.target.value })} /></label><label className="field"><span>เจ้าหน้าที่จัดซื้อ</span><input value={budgetDraft.buyer} onChange={e => setBudgetDraft({ ...budgetDraft, buyer: e.target.value })} /></label><label className="field"><span>เลขที่สัญญา</span><input value={budgetDraft.contractNo} onChange={e => setBudgetDraft({ ...budgetDraft, contractNo: e.target.value })} /></label><label className="field"><span>วันที่ลงนาม</span><input value={budgetDraft.contractDate} onChange={e => setBudgetDraft({ ...budgetDraft, contractDate: e.target.value })} /></label><label className="field"><span>คู่สัญญา</span><input value={budgetDraft.vendor} onChange={e => setBudgetDraft({ ...budgetDraft, vendor: e.target.value })} /></label><label className="field"><span>วงเงินจัดซื้อจัดจ้าง</span><input type="number" value={budgetDraft.contractAmount || ''} onChange={e => setBudgetDraft({ ...budgetDraft, contractAmount: Number(e.target.value) })} /></label><label className="field"><span>สถานะ</span><input value={budgetDraft.status} onChange={e => setBudgetDraft({ ...budgetDraft, status: e.target.value })} /></label></div></section></div>}
        </main>
      )}
    </div>
  );
}

export default App;
