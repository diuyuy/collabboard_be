export type HtmlType =
  | {
      filename: string;
      values: {
        authCode: string;
      };
    }
  | {
      filename: string;
      values: {
        redirectUrl: string;
      };
    };
