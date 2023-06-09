import { SendVerificationRequestParams } from "next-auth/providers"
import { resend } from "./resend"
import { VerificationEmail } from "./verificationEmail"
export const sendVerificationRequest = async (
  params: SendVerificationRequestParams
) => {
  try {
    await resend.emails.send({
      from: "io@kaiwa.jcde.xyz",
      to: params.identifier,
      subject: "Verify your email",
      react: VerificationEmail({ url: params.url }),
    })
  } catch (error) {
    console.log({ error })
  }
}
