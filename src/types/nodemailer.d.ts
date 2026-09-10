declare module "nodemailer" {
  interface SendMailOptions {
    from?: string;
    to?: string | string[];
    cc?: string | string[];
    bcc?: string | string[];
    subject?: string;
    text?: string;
    html?: string;
    attachments?: Array<{
      filename?: string;
      content?: string | Buffer;
      path?: string;
      contentType?: string;
    }>;
  }

  interface Transporter {
    sendMail(options: SendMailOptions): Promise<{ messageId: string }>;
    verify(): Promise<boolean>;
  }

  interface Options {
    host?: string;
    port?: number;
    secure?: boolean;
    auth?: {
      user?: string;
      pass?: string;
    };
    tls?: {
      rejectUnauthorized?: boolean;
    };
  }

  function createTransport(options: Options): Transporter;
  function createTransport(transport?: Options): Transporter;
}
