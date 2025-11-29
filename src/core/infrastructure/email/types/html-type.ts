export type HtmlType =
  | {
      filename: string;
      values: {
        verifycationCode: string;
      };
    }
  | {
      filename: string;
      values: {
        redirectUrl: string;
      };
    };
