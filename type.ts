export interface SSponAlertParse {
  state: "complete" | "pending" | "playing" | "skip";
  offset: number;
  date: number;
}

export interface SSponAlertRecommendParse {
  state: "complete" | "pending" | "playing" | "skip";
  offset: number;
  date: number;
}
