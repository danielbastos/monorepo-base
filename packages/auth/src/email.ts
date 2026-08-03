import nodemailer, { type Transporter } from "nodemailer";

export interface EmailMessage {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export interface EmailSender {
  send(message: EmailMessage): Promise<void>;
}

export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user?: string;
  password?: string;
  from: string;
}

export function createSmtpEmailSender(config: SmtpConfig): EmailSender {
  const transporter: Transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth:
      config.user && config.password
        ? { user: config.user, pass: config.password }
        : undefined,
  });

  return {
    async send(message) {
      await transporter.sendMail({
        from: config.from,
        ...message,
      });
    },
  };
}

export function sendInBackground(
  sender: EmailSender,
  message: EmailMessage,
  onError: (error: unknown) => void,
) {
  void sender.send(message).catch(onError);
}
