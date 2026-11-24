export interface ICounts {
  views: number;
  site: number;
  calls: number;
  routes: number;
}

export interface IDay extends ICounts {
  date: string;
}

export interface IMetric extends IDay {
  branch_id: number;
}

export interface IScore {
  rating: number | null;
  reviews: number;
}

export interface IGroupedDay extends ICounts, IScore {
  branch_id: number | null;
  date: string | null;
}
