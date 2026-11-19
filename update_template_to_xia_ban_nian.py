#!/usr/bin/env python3.13
# -*- coding: utf-8 -*-
"""
115下半年考核題目範本修正腳本
根據副總指示與題目問題分析，將「115年終（上半年）」範本修正為「115下半年」適用版本

主要修正：
  1. 所有工作表標題: 2025年度 年終 → 115年度 下半年
  2. 行政部內共評/主管複評行政: 專業知識題 新增行為錨點
  3. 全員: 「是否願意和受評者一起工作?」→ 改為協作行為題
  4. 副理/經理: 移除「印象中」前綴，改為行為導向
  5. 副理/經理: 新增「公司流程執行熟悉度」15分（副總指示）
  6. 現場/組長/班長: 完成度百分比題 → 改為事件基礎評分
  7. 各主管工作表: 移除「印象中」前綴
"""

import shutil
import openpyxl

SRC = '/home/user/website/115年終考核題目_修改題目對照.xlsm'
DST = '/home/user/website/115下半年考核題目.xlsm'

# =============================================================================
# 新版題目文字常數
# =============================================================================

# 專業知識 — 10分版行為錨點
KNOWLEDGE_10 = (
    "10分：能獨立完成所有職責範疇內的工作，不需說明或協助，且能指導他人\n"
    "7-9分：能完成大部分職責，偶有疑問但能自行查詢辦法解決\n"
    "4-6分：需定期確認或提醒方能完成工作\n"
    "0-3分：常需重複說明，無法自行查詢辦法"
)

# 專業知識 — 20分版行為錨點
KNOWLEDGE_20 = (
    "17-20分：專業知識全面，能獨立處理所有業務並指導他人\n"
    "13-16分：專業知識足夠，大多能獨立完成，偶有盲點\n"
    "8-12分：基本知識具備，複雜狀況需請示\n"
    "4-7分：基礎知識薄弱，多數工作需指導\n"
    "0-3分：專業知識嚴重不足，無法獨立執行基本工作"
)

# 協作行為題（取代「是否願意工作」）— 20分版
COOP_20_Q  = "當你與受評者協作時，他/她是否能準時、完整地提供所需配合？"
COOP_20_C  = (
    "15-20分：主動配合，從不需催促，協作流程順暢\n"
    "8-14分：大多配合，偶需提醒但不影響進度\n"
    "2-7分：需多次提醒，偶有協作困難\n"
    "0-1分：配合度低，造成作業困難或流程中斷"
)

# 協作行為題 — 10分版（現場/主管）
COOP_10_Q  = "當你與受評者協同作業時，他/她是否能確實配合、不增加你的負擔？"
COOP_10_C  = (
    "✓積極協作，主動配合，作業流暢 (8-10)\n"
    "✓配合度尚可，偶有需要提醒，不影響整體進度 (5-7)\n"
    "✓配合度不佳，需要多次提醒或造成作業困難 (2-4)\n"
    "✓拒絕配合或造成作業重大阻礙 (0-1)"
)

# 完成度題 — 事件基礎評分（取代百分比）
COMPLETE_EVENT_B = "本期所有指派工作項目的完成情形："
COMPLETE_EVENT_C = (
    "10分：全數完成，無遺漏，品質符合標準\n"
    "8-9分：完成90%以上，未完成部分主動說明\n"
    "6-7分：完成70-89%，需主管追催才完成剩餘部分\n"
    "4-5分：完成50-69%，經常遺漏或等待指示\n"
    "0-3分：完成率低於50%，嚴重影響作業進度"
)

# 副理/經理 指導部屬（移除「印象中」→ 行為導向）
MGR_GUIDE_B = "受評者在部屬需要協助時，是否能提供具體有效的支援？"
MGR_GUIDE_C = (
    "10分：主動識別部屬能力落差，安排培訓，有可查核紀錄（如訓練計畫、交接文件）\n"
    "7-9分：部屬請求時能有效協助，培育態度積極\n"
    "4-6分：部屬請求時協助，但缺乏主動培育行為\n"
    "1-3分：部屬提出需求但回應不足\n"
    "0分：未提供任何指導支援"
)

# 公司流程熟悉度 — 新增 section（副總指示）
PROCESS_HEADER = (
    "【新增 — 副總指示】公司流程執行與帶領能力（15分）\n"
    "★ 僅適用副課長以上及業務課組長（共9人）\n"
    "★ 另行計算後加入最終分，不納入上方100分總分"
)
PROCESS_1_B = "①本人流程執行落實（5分）\n評核問題：這位主管自己是否按照公司規定的流程作業？"
PROCESS_1_C = (
    "5分：文件退件率符合標準，追蹤事項均如期結案，無逾期懸置\n"
    "3-4分：偶有退件或逾期，但主動說明原因並即時處理\n"
    "0-2分：退件率超標或有逾期懸置，未主動處理需他人催促\n"
    "（可參考退件紀錄及追蹤結案率）"
)
PROCESS_2_B = "②帶領部屬按流程執行的能力（5分）\n評核問題：這位主管有沒有讓部屬也做到公司規定的標準？"
PROCESS_2_C = (
    "5分：部屬考核如期完成、文件提交品質穩定、部門整體退件率在標準內\n"
    "3-4分：部分部屬有落差，主管有介入輔導但成效有限\n"
    "0-2分：部門整體流程執行混亂，主管未有效介入或改善\n"
    "（可參考部門整體退件率及部屬執行紀錄）"
)
PROCESS_3_B = "③指導部屬理解並內化公司流程（5分）\n評核問題：這位主管有沒有讓部屬理解為什麼要這樣做，而不只是被動執行？"
PROCESS_3_C = (
    "5分：部屬能自主完成標準流程，不需主管逐次提醒，且有主動提出改善建議的紀錄\n"
    "3-4分：部屬需要提醒但能配合，主管有定期在班前或會議中說明流程要求\n"
    "0-2分：部屬對流程理解薄弱，主管未有系統性說明或指導行為\n"
    "（主觀評分，評分者依日常觀察填寫）"
)
PROCESS_NOTE = "⚠ 三項合計未達10分，須在人評會前向副總說明"


# =============================================================================
def set_cell(ws, row, col, value):
    ws.cell(row=row, column=col).value = value


def update_title(ws, old_prefix, new_prefix):
    for row in ws.iter_rows(min_row=1, max_row=4):
        for cell in row:
            if cell.value and old_prefix in str(cell.value):
                cell.value = cell.value.replace(old_prefix, new_prefix)


def process_all_sheets(wb):
    # --- 1. 標題更新（所有工作表）---
    for sname in wb.sheetnames:
        ws = wb[sname]
        update_title(ws, '2025年度 年終', '115年度 下半年')

    # --- 2. 行政部內共評 ---
    ws = wb['行政部內共評']
    # R8C: 専業知識 add anchors
    set_cell(ws, 8, 3, KNOWLEDGE_10)
    # R20B: 是否願意工作 → 協作行為
    set_cell(ws, 20, 2, COOP_20_Q)
    set_cell(ws, 20, 3, COOP_20_C)

    # --- 3. 主管複評行政 ---
    ws = wb['主管複評行政']
    # R8C: 専業知識 20分版行為錨點
    set_cell(ws, 8, 3, KNOWLEDGE_20)

    # --- 4. 副理 經理共評 ---
    ws = wb['副理 經理共評']
    # R11B: 移除「印象中」→ 行為導向指導題
    set_cell(ws, 11, 2, MGR_GUIDE_B)
    set_cell(ws, 11, 3, MGR_GUIDE_C)
    # 在 R23 ⚠超標後新增公司流程熟悉度 section
    # R23 is ⚠超標, so start new section at R25
    set_cell(ws, 25, 2, PROCESS_HEADER)
    set_cell(ws, 26, 2, PROCESS_1_B)
    set_cell(ws, 26, 3, PROCESS_1_C)
    set_cell(ws, 27, 2, PROCESS_2_B)
    set_cell(ws, 27, 3, PROCESS_2_C)
    set_cell(ws, 28, 2, PROCESS_3_B)
    set_cell(ws, 28, 3, PROCESS_3_C)
    set_cell(ws, 29, 2, PROCESS_NOTE)

    # --- 5. 組長初評班長 ---
    ws = wb['組長初評班長']
    # R13: 完成度% → 事件基礎
    set_cell(ws, 13, 2, COMPLETE_EVENT_B)
    set_cell(ws, 13, 3, COMPLETE_EVENT_C)
    # R14B: 移除「印象中」
    old_b = ws.cell(row=14, column=2).value
    if old_b and '印象中' in str(old_b):
        ws.cell(row=14, column=2).value = old_b.replace('※印象中你對受評者', '你對受評者')
    # R16: 是否願意工作 → 協作行為（10分版）
    set_cell(ws, 16, 2, COOP_10_Q)
    set_cell(ws, 16, 3, COOP_10_C)

    # --- 6. 班長共評 ---
    ws = wb['班長共評']
    # R13: 完成度% → 事件基礎
    set_cell(ws, 13, 2, COMPLETE_EVENT_B)
    set_cell(ws, 13, 3, COMPLETE_EVENT_C)
    # R14B: 移除「印象中」
    old_b = ws.cell(row=14, column=2).value
    if old_b and '印象中' in str(old_b):
        ws.cell(row=14, column=2).value = old_b.replace('※印象中你對受評者', '你對受評者')
    # R16: 是否願意工作 → 協作行為（10分版）
    set_cell(ws, 16, 2, COOP_10_Q)
    set_cell(ws, 16, 3, COOP_10_C)

    # --- 7. 課級初評組長 ---
    ws = wb['課級初評組長']
    # R15B: 移除「印象中」
    old_b = ws.cell(row=15, column=2).value
    if old_b and '印象中' in str(old_b):
        ws.cell(row=15, column=2).value = old_b.replace('※印象中你對受評者', '你對受評者')
    # R17: 是否願意工作 → 協作行為（10分版）
    set_cell(ws, 17, 2, COOP_10_Q)
    set_cell(ws, 17, 3, COOP_10_C)

    # --- 8. 組長共評 ---
    ws = wb['組長共評']
    # R15B: 移除「印象中」
    old_b = ws.cell(row=15, column=2).value
    if old_b and '印象中' in str(old_b):
        ws.cell(row=15, column=2).value = old_b.replace('※印象中你對受評者', '你對受評者')
    # R17: 是否願意工作 → 協作行為（10分版）
    set_cell(ws, 17, 2, COOP_10_Q)
    set_cell(ws, 17, 3, COOP_10_C)

    # --- 9. 課級複評班長 ---
    ws = wb['課級複評班長']
    # R13: 完成度% → 事件基礎
    set_cell(ws, 13, 2, COMPLETE_EVENT_B)
    set_cell(ws, 13, 3, COMPLETE_EVENT_C)
    # R14B: 移除「印象中」
    old_b = ws.cell(row=14, column=2).value
    if old_b and '印象中' in str(old_b):
        ws.cell(row=14, column=2).value = old_b.replace('※印象中你對受評者', '你對受評者')
    # R16: 是否願意工作 → 協作行為（10分版）
    set_cell(ws, 16, 2, COOP_10_Q)
    set_cell(ws, 16, 3, COOP_10_C)

    # --- 10. 課級共評 ---
    ws = wb['課級共評']
    # R11B: 移除「印象中」（主管交辦任務完成率）
    old_b = ws.cell(row=11, column=2).value
    if old_b and '印象中' in str(old_b):
        ws.cell(row=11, column=2).value = old_b.replace('※印象中你', '你')
    # R15B: 移除「印象中」（指導部屬）
    old_b = ws.cell(row=15, column=2).value
    if old_b and '印象中' in str(old_b):
        ws.cell(row=15, column=2).value = old_b.replace('※印象中你對受評者', '你對受評者')

    # --- 11. 部級初評課級 ---
    ws = wb['部級初評課級']
    # R11B: 移除「印象中」
    old_b = ws.cell(row=11, column=2).value
    if old_b and '印象中' in str(old_b):
        ws.cell(row=11, column=2).value = old_b.replace('※印象中你', '你')
    # R15B: 移除「印象中」
    old_b = ws.cell(row=15, column=2).value
    if old_b and '印象中' in str(old_b):
        ws.cell(row=15, column=2).value = old_b.replace('※印象中你對受評者', '你對受評者')

    # --- 12. 總經理複評課級 ---
    ws = wb['總經理複評課級']
    # R11B: 移除「印象中」
    old_b = ws.cell(row=11, column=2).value
    if old_b and '印象中' in str(old_b):
        ws.cell(row=11, column=2).value = old_b.replace('※印象中你', '你')
    # R15B: 移除「印象中」
    old_b = ws.cell(row=15, column=2).value
    if old_b and '印象中' in str(old_b):
        ws.cell(row=15, column=2).value = old_b.replace('※印象中你對受評者', '你對受評者')

    # --- 13. 現場組長初評&主管複評 ---
    ws = wb['現場組長初評&主管複評']
    # R11: 完成度% → 事件基礎
    set_cell(ws, 11, 2, COMPLETE_EVENT_B)
    set_cell(ws, 11, 3, COMPLETE_EVENT_C)
    # R19: 是否願意工作 → 協作行為（10分版）
    set_cell(ws, 19, 2, COOP_10_Q)
    set_cell(ws, 19, 3, COOP_10_C)


def main():
    print(f'載入原始範本：{SRC}')
    wb = openpyxl.load_workbook(SRC, keep_vba=True)
    print(f'  工作表：{wb.sheetnames}')

    print('\n套用修正...')
    process_all_sheets(wb)

    print(f'\n儲存至：{DST}')
    wb.save(DST)
    print('完成！')

    # 驗證：讀回確認標題已更新
    wb2 = openpyxl.load_workbook(DST, data_only=True)
    ws_check = wb2['行政部內共評']
    print(f'\n驗證 行政部內共評 R2: {ws_check.cell(2,1).value}')
    print(f'驗證 R8C (知識錨點開頭): {str(ws_check.cell(8,3).value)[:40]}')
    print(f'驗證 R20B (協作題): {str(ws_check.cell(20,2).value)[:40]}')
    ws_mgr = wb2['副理 經理共評']
    print(f'\n驗證 副理經理 R2: {ws_mgr.cell(2,1).value}')
    print(f'驗證 R11B (指導部屬): {str(ws_mgr.cell(11,2).value)[:40]}')
    print(f'驗證 R25B (流程section): {str(ws_mgr.cell(25,2).value)[:40]}')
    wb2.close()


if __name__ == '__main__':
    main()
