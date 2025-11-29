export type HtmlType =
  | {
      filename: string;
      values: {
        verificationCode: string;
      };
    }
  | {
      filename: string;
      values: {
        redirectUrl: string;
      };
    };
