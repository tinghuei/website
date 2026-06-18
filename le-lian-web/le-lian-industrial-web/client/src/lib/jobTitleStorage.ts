// 職稱類別資料存取（管理員／人資可於後台編輯各職稱所屬類別）
// 供「系統管理」後台的「職稱類別管理」分頁使用，獨立存於 localStorage，
// 不影響 orgChartData.ts 既有的組織圖資料。

export interface JobTitleCategory {
  id: string;
  title: string;
  category: string;
}

export const JOB_TITLE_CATEGORY_OPTIONS = ['高階主管', '管理職', '專業職', '技術/作業職', '其他'];

export const LS_JOB_TITLES_KEY = 'job_title_categories_v1';

export function getInitialJobTitles(): JobTitleCategory[] {
  return [
    { id: 'jt1', title: '董事長', category: '高階主管' },
    { id: 'jt2', title: '副董事長', category: '高階主管' },
    { id: 'jt3', title: '總經理', category: '高階主管' },
    { id: 'jt4', title: '執行副總', category: '高階主管' },
    { id: 'jt5', title: '經理', category: '管理職' },
    { id: 'jt6', title: '副理', category: '管理職' },
    { id: 'jt7', title: '課長', category: '管理職' },
    { id: 'jt8', title: '副課長', category: '管理職' },
    { id: 'jt9', title: '組長', category: '管理職' },
    { id: 'jt10', title: '副組長', category: '管理職' },
    { id: 'jt11', title: '代理組長', category: '管理職' },
    { id: 'jt12', title: '班長', category: '管理職' },
    { id: 'jt13', title: '工程師', category: '專業職' },
    { id: 'jt14', title: '專員', category: '專業職' },
    { id: 'jt15', title: '助理專員', category: '專業職' },
    { id: 'jt16', title: '秘書', category: '專業職' },
    { id: 'jt17', title: '助理', category: '技術/作業職' },
    { id: 'jt18', title: '技術員', category: '技術/作業職' },
    { id: 'jt19', title: '堆高機員', category: '技術/作業職' },
    { id: 'jt20', title: '作業員', category: '技術/作業職' },
    { id: 'jt21', title: '司機', category: '技術/作業職' },
    { id: 'jt22', title: '清潔員', category: '技術/作業職' },
  ];
}

export function loadJobTitles(): JobTitleCategory[] {
  try {
    const raw = localStorage.getItem(LS_JOB_TITLES_KEY);
    return raw ? JSON.parse(raw) : getInitialJobTitles();
  } catch {
    return getInitialJobTitles();
  }
}

export function saveJobTitles(list: JobTitleCategory[]) {
  localStorage.setItem(LS_JOB_TITLES_KEY, JSON.stringify(list));
}
